const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const predictionService = require('../services/predictionService');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Admin
const createProject = async (req, res) => {
  try {
    const {
      name, description, type, complexity, budget,
      expectedDeadline, teamSize, githubRepo, githubOwner, teamMembers,
    } = req.body;

    // Run AI prediction based on historical data
    const prediction = await predictionService.predict({
      type, complexity, teamSize, budget,
      expectedDeadline: new Date(expectedDeadline),
    });

    const project = await Project.create({
      name, description, type, complexity, budget,
      expectedDeadline: new Date(expectedDeadline),
      teamSize,
      githubRepo: githubRepo || '',
      githubOwner: githubOwner || '',
      admin: req.user._id,
      teamMembers: teamMembers || [],
      predictedCost: prediction.predictedCost,
      predictedTimeline: prediction.predictedTimeline,
      costRisk: prediction.costRisk,
      timeRisk: prediction.timeRisk,
      riskLevel: prediction.riskLevel,
    });

    // Add project to team members' assigned projects
    if (teamMembers && teamMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: teamMembers } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    // ── AI TASK GENERATION ──────────────────────────────────────────────
    const taskTemplates = predictionService.generateTasks({
      type,
      complexity,
      teamMembers: teamMembers || [],
      expectedDeadline: new Date(expectedDeadline),
      predictedTimeline: prediction.predictedTimeline,
      projectId: project._id,
      adminId: req.user._id,
    });

    const createdTasks = await Task.insertMany(taskTemplates);

    // Update project task count
    await Project.findByIdAndUpdate(project._id, {
      totalTasks: createdTasks.length,
      status: 'in-progress',
    });
    // ────────────────────────────────────────────────────────────────────

    const populated = await Project.findById(project._id)
      .populate('admin', 'name email')
      .populate('teamMembers', 'name email githubUsername');

    res.status(201).json({
      ...populated.toObject(),
      aiTasksGenerated: createdTasks.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (admin sees all, employee sees assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query = { teamMembers: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('admin', 'name email')
      .populate('teamMembers', 'name email githubUsername')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('teamMembers', 'name email githubUsername department');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check access
    if (
      req.user.role === 'employee' &&
      !project.teamMembers.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const updatable = [
      'name', 'description', 'status', 'budget', 'expectedDeadline',
      'githubRepo', 'githubOwner', 'teamMembers', 'completionPercentage',
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    // Recalculate completion from tasks
    const tasks = await Task.find({ project: project._id });
    project.totalTasks = tasks.length;
    project.completedTasks = tasks.filter((t) => t.status === 'completed').length;
    if (tasks.length > 0) {
      project.completionPercentage = Math.round((project.completedTasks / project.totalTasks) * 100);
    }

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project stats for dashboard
// @route   GET /api/projects/stats
// @access  Admin
const getProjectStats = async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const onTrack = await Project.countDocuments({ status: 'on-track' });
    const delayed = await Project.countDocuments({ status: 'delayed' });
    const atRisk = await Project.countDocuments({ status: 'at-risk' });
    const completed = await Project.countDocuments({ status: 'completed' });
    const inProgress = await Project.countDocuments({ status: 'in-progress' });

    const projects = await Project.find().select('name budget predictedCost status riskLevel completionPercentage');

    res.json({ total, onTrack, delayed, atRisk, completed, inProgress, projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectStats };

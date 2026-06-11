const Task = require('../models/Task');
const Project = require('../models/Project');
const githubService = require('../services/githubService');

// @desc    Create a task
// @route   POST /api/tasks
// @access  Admin
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate, estimatedHours, tags } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title, description, project, assignedTo,
      assignedBy: req.user._id,
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      estimatedHours: estimatedHours || 0,
      tags: tags || [],
    });

    // Update project task count
    proj.totalTasks = (proj.totalTasks || 0) + 1;
    await proj.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email githubUsername')
      .populate('assignedBy', 'name email')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks (admin: all or by project; employee: assigned to them)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    }
    if (req.query.project) {
      query.project = req.query.project;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email githubUsername')
      .populate('assignedBy', 'name email')
      .populate('project', 'name githubRepo githubOwner')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email githubUsername')
      .populate('assignedBy', 'name email')
      .populate('project', 'name githubRepo githubOwner');

    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task (employee updates progress; admin updates all)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Employees can only update their own tasks
    if (
      req.user.role === 'employee' &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, progressNotes, actualHours, githubCommitHash } = req.body;

    if (status) task.status = status;
    if (progressNotes) task.progressNotes = progressNotes;
    if (actualHours !== undefined) task.actualHours = actualHours;

    // GitHub commit verification
    if (githubCommitHash && task.project.githubRepo) {
      try {
        const verified = await githubService.verifyCommit(
          task.project.githubOwner,
          task.project.githubRepo,
          githubCommitHash
        );
        task.githubCommitVerified = verified;
        task.githubCommitHash = githubCommitHash;
        if (verified) task.status = 'completed';
      } catch (e) {
        // Commit verification failed, continue without it
      }
    }

    if (task.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date();
    }

    await task.save();

    // Update project completion percentage
    const allTasks = await Task.find({ project: task.project._id });
    const completedCount = allTasks.filter((t) => t.status === 'completed').length;
    await Project.findByIdAndUpdate(task.project._id, {
      completedTasks: completedCount,
      totalTasks: allTasks.length,
      completionPercentage: Math.round((completedCount / allTasks.length) * 100),
    });

    const updated = await Task.findById(task._id)
      .populate('assignedTo', 'name email githubUsername')
      .populate('assignedBy', 'name email')
      .populate('project', 'name');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };

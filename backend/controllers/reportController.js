const WeeklyReport = require('../models/WeeklyReport');
const githubService = require('../services/githubService');
const User = require('../models/User');

// @desc    Submit weekly report
// @route   POST /api/reports
// @access  Employee
const submitReport = async (req, res) => {
  try {
    const {
      project, weekStartDate, weekEndDate,
      workCompleted, pendingTasks, timeSpent,
      challenges, nextWeekPlan, tasksCompleted,
    } = req.body;

    // Fetch GitHub activity for the week
    let githubActivity = { commits: 0, additions: 0, deletions: 0, pullRequests: 0 };
    if (req.user.githubUsername) {
      try {
        githubActivity = await githubService.getWeeklyActivity(
          req.user.githubUsername,
          new Date(weekStartDate),
          new Date(weekEndDate)
        );
      } catch (e) {
        // GitHub fetch failed, use defaults
      }
    }

    const report = await WeeklyReport.create({
      employee: req.user._id,
      project,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      workCompleted,
      githubActivity,
      pendingTasks: pendingTasks || '',
      timeSpent,
      challenges: challenges || '',
      nextWeekPlan: nextWeekPlan || '',
      tasksCompleted: tasksCompleted || [],
    });

    const populated = await WeeklyReport.findById(report._id)
      .populate('employee', 'name email githubUsername')
      .populate('project', 'name')
      .populate('tasksCompleted', 'title status');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reports (admin: all; employee: own)
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    }
    if (req.query.project) query.project = req.query.project;
    if (req.query.employee) query.employee = req.query.employee;

    const reports = await WeeklyReport.find(query)
      .populate('employee', 'name email githubUsername department')
      .populate('project', 'name')
      .populate('tasksCompleted', 'title status')
      .sort({ weekStartDate: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate('employee', 'name email githubUsername department')
      .populate('project', 'name')
      .populate('tasksCompleted', 'title status');

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin reviews/approves report
// @route   PUT /api/reports/:id/review
// @access  Admin
const reviewReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = req.body.status || 'reviewed';
    report.adminFeedback = req.body.adminFeedback || '';
    await report.save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee performance summary
// @route   GET /api/reports/performance/:employeeId
// @access  Admin
const getEmployeePerformance = async (req, res) => {
  try {
    const reports = await WeeklyReport.find({ employee: req.params.employeeId })
      .populate('project', 'name')
      .sort({ weekStartDate: -1 });

    const totalHours = reports.reduce((sum, r) => sum + r.timeSpent, 0);
    const totalCommits = reports.reduce((sum, r) => sum + r.githubActivity.commits, 0);
    const avgHoursPerWeek = reports.length > 0 ? (totalHours / reports.length).toFixed(1) : 0;

    res.json({
      reports,
      summary: {
        totalReports: reports.length,
        totalHours,
        totalCommits,
        avgHoursPerWeek,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitReport, getReports, getReportById, reviewReport, getEmployeePerformance };

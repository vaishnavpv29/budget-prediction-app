const githubService = require('../services/githubService');
const Project = require('../models/Project');

// @desc    Get repo info
// @route   GET /api/github/repo/:owner/:repo
// @access  Private
const getRepoInfo = async (req, res) => {
  try {
    const data = await githubService.getRepoInfo(req.params.owner, req.params.repo);
    if (!data) return res.status(404).json({ message: 'Repository not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contributor stats for a project's repo
// @route   GET /api/github/contributors/:projectId
// @access  Private
const getContributors = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.githubRepo || !project.githubOwner) {
      return res.status(400).json({ message: 'No GitHub repo configured for this project' });
    }

    const contributors = await githubService.getContributorStats(
      project.githubOwner,
      project.githubRepo
    );
    res.json(contributors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent commits for a project's repo
// @route   GET /api/github/commits/:projectId
// @access  Private
const getCommits = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.githubRepo || !project.githubOwner) {
      return res.status(400).json({ message: 'No GitHub repo configured for this project' });
    }

    const since = req.query.since ? new Date(req.query.since) : null;
    const until = req.query.until ? new Date(req.query.until) : null;

    const commits = await githubService.getRepoCommits(
      project.githubOwner,
      project.githubRepo,
      since,
      until
    );
    res.json(commits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly activity for a GitHub user
// @route   GET /api/github/activity/:username
// @access  Private
const getUserActivity = async (req, res) => {
  try {
    const weekStart = req.query.weekStart ? new Date(req.query.weekStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekEnd = req.query.weekEnd ? new Date(req.query.weekEnd) : new Date();

    const activity = await githubService.getWeeklyActivity(req.params.username, weekStart, weekEnd);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRepoInfo, getContributors, getCommits, getUserActivity };

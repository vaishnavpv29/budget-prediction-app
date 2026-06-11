const express = require('express');
const router = express.Router();
const { getRepoInfo, getContributors, getCommits, getUserActivity } = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

router.get('/repo/:owner/:repo', protect, getRepoInfo);
router.get('/contributors/:projectId', protect, getContributors);
router.get('/commits/:projectId', protect, getCommits);
router.get('/activity/:username', protect, getUserActivity);

module.exports = router;

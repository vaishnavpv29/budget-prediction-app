const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, getProjectStats,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, getProjectStats);
router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOnly, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

module.exports = router;

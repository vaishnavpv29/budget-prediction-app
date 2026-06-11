const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, getTasks)
  .post(protect, adminOnly, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getUsers);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;

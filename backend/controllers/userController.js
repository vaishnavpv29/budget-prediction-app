const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const query = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, githubUsername, department, skills, isActive } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;
    if (department) user.department = department;
    if (skills) user.skills = skills;
    if (isActive !== undefined) user.isActive = isActive;

    const updated = await user.save();
    res.json({ ...updated.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };

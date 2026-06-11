const HistoricalProject = require('../models/HistoricalProject');

// @desc    Upload historical project data
// @route   POST /api/historical
// @access  Admin
const uploadHistorical = async (req, res) => {
  try {
    const data = req.body; // Can be single object or array
    const records = Array.isArray(data) ? data : [data];

    const created = await HistoricalProject.insertMany(
      records.map((r) => ({ ...r, uploadedBy: req.user._id }))
    );

    res.status(201).json({ message: `${created.length} record(s) uploaded`, data: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all historical data
// @route   GET /api/historical
// @access  Admin
const getHistorical = async (req, res) => {
  try {
    const records = await HistoricalProject.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete historical record
// @route   DELETE /api/historical/:id
// @access  Admin
const deleteHistorical = async (req, res) => {
  try {
    await HistoricalProject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadHistorical, getHistorical, deleteHistorical };

const express = require('express');
const router = express.Router();
const { uploadHistorical, getHistorical, deleteHistorical } = require('../controllers/historicalController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getHistorical)
  .post(protect, adminOnly, uploadHistorical);

router.delete('/:id', protect, adminOnly, deleteHistorical);

module.exports = router;

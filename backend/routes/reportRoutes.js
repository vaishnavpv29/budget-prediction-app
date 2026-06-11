const express = require('express');
const router = express.Router();
const {
  submitReport, getReports, getReportById,
  reviewReport, getEmployeePerformance,
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/performance/:employeeId', protect, adminOnly, getEmployeePerformance);
router.route('/')
  .get(protect, getReports)
  .post(protect, submitReport);

router.route('/:id')
  .get(protect, getReportById);

router.put('/:id/review', protect, adminOnly, reviewReport);

module.exports = router;

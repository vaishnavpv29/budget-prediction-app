const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    workCompleted: { type: String, required: true },
    githubActivity: {
      commits: { type: Number, default: 0 },
      additions: { type: Number, default: 0 },
      deletions: { type: Number, default: 0 },
      pullRequests: { type: Number, default: 0 },
    },
    pendingTasks: { type: String, default: '' },
    timeSpent: { type: Number, required: true }, // in hours
    challenges: { type: String, default: '' },
    nextWeekPlan: { type: String, default: '' },
    tasksCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    status: { type: String, enum: ['submitted', 'reviewed', 'approved'], default: 'submitted' },
    adminFeedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);

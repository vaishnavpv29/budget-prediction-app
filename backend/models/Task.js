const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'overdue'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date },
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number, default: 0 },
    githubCommitVerified: { type: Boolean, default: false },
    githubCommitHash: { type: String, default: '' },
    progressNotes: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['web', 'mobile', 'desktop', 'api', 'ml', 'other'],
      required: true,
    },
    complexity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'on-track', 'delayed', 'at-risk', 'completed'],
      default: 'planning',
    },
    budget: { type: Number, required: true },
    expectedDeadline: { type: Date, required: true },
    startDate: { type: Date, default: Date.now },
    teamSize: { type: Number, required: true },
    githubRepo: { type: String, default: '' },
    githubOwner: { type: String, default: '' },

    // Prediction results
    predictedCost: { type: Number, default: 0 },
    predictedTimeline: { type: Number, default: 0 }, // in days
    costRisk: { type: Boolean, default: false },
    timeRisk: { type: Boolean, default: false },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },

    // Team
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Progress
    completionPercentage: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },

    // Historical data reference
    historicalDataUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HistoricalProject' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

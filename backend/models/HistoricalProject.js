const mongoose = require('mongoose');

const historicalProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    complexity: { type: String, required: true },
    teamSize: { type: Number, required: true },
    actualCost: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
    actualDuration: { type: Number, required: true }, // in days
    estimatedDuration: { type: Number, required: true }, // in days
    startDate: { type: Date },
    endDate: { type: Date },
    wasDelayed: { type: Boolean, default: false },
    wasOverBudget: { type: Boolean, default: false },
    delayDays: { type: Number, default: 0 },
    costOverrun: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HistoricalProject', historicalProjectSchema);

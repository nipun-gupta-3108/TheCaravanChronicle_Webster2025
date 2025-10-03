const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  generatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'generatedByModel' },
  generatedByModel: { type: String, enum: ['Admin','Staff'] },
  reportType: String,
  generatedAt: { type: Date, default: Date.now },
  resolvedComplaints: Number,
  pendingComplaints: Number,
  overdueComplaints: Number,
  reportCsvPath: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Report', ReportSchema);

// backend/models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: { type: String, enum: ['question', 'answer', 'comment'], required: true },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type',
  },
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, default: 'Reported by user' },
  createdAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Report', ReportSchema);
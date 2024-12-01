// /backend/models/Community.js

const mongoose = require("mongoose");

const AssessmentTaskSchema = new mongoose.Schema({
  label: { type: String, required: true },
  adminLabel: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'votes', 'postings', 'quizzes'
  contentType: { type: String }, // e.g., 'questions', 'answers' (if applicable)
  total: { type: Number, required: true }, // Total required for 100%
  weight: { type: Number, required: true }, // Weight towards total score
});

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rules: [
    {
      type: String,
      required: false,
    },
  ],
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  assessmentTasks: [AssessmentTaskSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Community", CommunitySchema);

// /backend/models/QuizAttempt.js

const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  score: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPossibleScore: {
    type: Number,
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      selectedOptionId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      ],
      isCorrect: {
        type: Boolean,
        default: false,
      },
    },
  ],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);

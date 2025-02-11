// /backend/models/Quiz.js

const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  instructions: { type: String, required: true, default: "" },
  questions: [
    {
      questionText: {
        type: String,
        required: true
      },
      explanation: {
        type: String,
        default: "",
      },
      allowMultipleCorrect: {
        type: Boolean,
        default: false
      },
      options: [
        {
          optionText: {
            type: String,
            required: true
          },
          isCorrect: {
            type: Boolean,
            default: false
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("Quiz", quizSchema);
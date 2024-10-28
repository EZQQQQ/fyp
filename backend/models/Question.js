// /backend/models/Question.js

const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    community: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    contentType: {
      type: Number, // 0: Text, 1: Image/Video, 2: Poll
      required: true,
    },
    content: {
      type: String,
    },
    pollOptions: [
      {
        type: String,
      },
    ],
    files: [
      {
        type: String, // Store filenames
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to Object
  }
);

// **Define virtual field for answers**
QuestionSchema.virtual("answers", {
  ref: "Answer", // The model to use
  localField: "_id", // Find answers where `localField`
  foreignField: "question_id", // is equal to `foreignField`
});

// **Define virtual field for comments**
QuestionSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "question_id",
});

module.exports = mongoose.model("Question", QuestionSchema);

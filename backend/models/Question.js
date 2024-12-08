// /backend/models/Question.js

const mongoose = require("mongoose");

const PollOptionSchema = new mongoose.Schema({
  option: {
    type: String,
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const QuestionSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
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
    pollOptions: [PollOptionSchema],
    votedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        optionIndex: Number,
      },
    ],
    files: [
      {
        type: String,
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
      required: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    upvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Define virtual field for answers
QuestionSchema.virtual("answers", {
  ref: "Answer", // The model to use
  localField: "_id", // Find answers where `localField`
  foreignField: "question_id", // is equal to `foreignField`
});

// Define virtual field for comments
QuestionSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "question_id",
});

// Create text index
QuestionSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Question", QuestionSchema);

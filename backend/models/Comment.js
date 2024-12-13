// /backend/models/Comment.js

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: function () {
        return !this.answer_id;
      },
    },
    answer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: function () {
        return !this.question_id;
      },
    },
    comment: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
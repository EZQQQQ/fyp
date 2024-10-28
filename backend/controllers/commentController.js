// /backend/controllers/commentController.js

const Comment = require("../models/Comment");
const Question = require("../models/Question");
const mongoose = require("mongoose");

// Add a comment to a question
const addComment = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { comment } = req.body;

    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Create new comment
    const newComment = new Comment({
      question_id: questionId,
      comment: comment.trim(),
      user: req.user._id, // From auth middleware
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      status: true,
      message: "Comment added successfully",
      data: savedComment,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({
      status: false,
      message: "Error adding comment",
      error: err.message,
    });
  }
};

// Get all comments for a question
const getCommentsByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Fetch comments
    const comments = await Comment.find({ question_id: questionId }).populate(
      "user",
      "name profilePicture"
    );

    res.status(200).json({
      status: true,
      data: comments,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching comments",
      error: err.message,
    });
  }
};

module.exports = {
  addComment,
  getCommentsByQuestionId,
};

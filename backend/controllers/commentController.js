// /backend/controllers/commentController.js

const Comment = require("../models/Comment");
const Question = require("../models/Question");
const Answer = require("../models/Answer");

// Add a comment to a question
const addCommentToQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { comment } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    const newComment = new Comment({
      question_id: questionId,
      comment: comment.trim(),
      user: req.user._id,
    });

    const savedComment = await newComment.save();

    // Increment the user's commentsCount
    await User.findByIdAndUpdate(req.user.id, { $inc: { commentsCount: 1 } });

    // Populate user info
    await savedComment.populate('user', 'username name');

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

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    const comments = await Comment.find({ question_id: questionId }).populate(
      "user",
      "username name profilePicture"
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

// Add a comment to an answer
const addCommentToAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { comment } = req.body;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: false,
        message: "Answer not found",
      });
    }

    const newComment = new Comment({
      answer_id: answerId,
      comment: comment.trim(),
      user: req.user._id,
    });

    const savedComment = await newComment.save();

    // Increment the user's commentsCount
    await User.findByIdAndUpdate(req.user.id, { $inc: { commentsCount: 1 } });

    // Populate user info
    await savedComment.populate('user', 'username name');

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

// Get all comments for an answer
const getCommentsByAnswerId = async (req, res) => {
  try {
    const { answerId } = req.params;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: false,
        message: "Answer not found",
      });
    }

    const comments = await Comment.find({ answer_id: answerId }).populate(
      "user",
      "username name profilePicture"
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
  addCommentToQuestion,
  getCommentsByQuestionId,
  addCommentToAnswer,
  getCommentsByAnswerId,
};
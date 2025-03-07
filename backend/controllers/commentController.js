// /backend/controllers/commentController.js

const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Add a comment to a question
const addCommentToQuestion = async (req, res) => {
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

    // Create a new comment
    const newComment = new Comment({
      question_id: questionId,
      comment: comment.trim(),
      user: req.user._id,
    });

    const savedComment = await newComment.save();

    // Increment the user's commentsCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { commentsCount: 1 } });

    // Populate user info
    await savedComment.populate("user", "username name");

    // --- Socket.IO Integration for Comment on Question ---
    // Build notification payload for a question comment
    const notificationData = {
      recipient: question.user, // Owner of the question receives the notification
      sender: req.user._id,
      community: question.community,
      type: "questionComment",
      content: comment.length > 100 ? comment.substring(0, 100) + "..." : comment,
      questionId: question._id,
      createdAt: new Date(),
      isRead: false,
    };

    // Persist the notification to the database
    // console.log("Persisting notification (question comment):", notificationData);
    const persistedNotification = await Notification.create(notificationData);
    // console.log("Persisted notification:", persistedNotification);

    // Emit the notification via Socket.IO
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const recipientSocket = userSockets.get(String(question.user));
    if (recipientSocket) {
      // console.log(`Emitting question comment notification to socket ${recipientSocket} for recipient ${question.user}`);
      io.to(recipientSocket).emit("newNotification", notificationData);
    }
    // else {
    // console.log(`No socket found for recipient ${question.user} in question comment notification`);
    // }

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

    // Retrieve comments for the question and populate user info
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

// Add a comment to an answer (with notification)
const addCommentToAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { comment } = req.body;

    // Check if the answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: false,
        message: "Answer not found",
      });
    }

    // Create a new comment for the answer
    const newComment = new Comment({
      answer_id: answerId,
      comment: comment.trim(),
      user: req.user._id,
    });

    const savedComment = await newComment.save();

    // Increment the user's commentsCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { commentsCount: 1 } });

    // Populate user info
    await savedComment.populate("user", "username name");

    // --- Socket.IO Integration for Comment on Answer ---
    // Do not notify if the answer owner is the same as the commenter.
    if (answer.user.toString() !== req.user._id.toString()) {

      const question = await Question.findById(answer.question_id);

      const notificationData = {
        recipient: answer.user, // The owner of the answer
        sender: req.user._id,
        community: question.community,
        type: "answerComment",
        content: comment.length > 100 ? comment.substring(0, 100) + "..." : comment,
        questionId: question._id,
        createdAt: new Date(),
        isRead: false,
      };

      // Persist the notification to the database
      // console.log("Persisting notification (answer comment):", notificationData);
      const persistedNotification = await Notification.create(notificationData);
      // console.log("Persisted notification:", persistedNotification);

      // Emit the notification via Socket.IO
      const io = req.app.get("io");
      const userSockets = req.app.get("userSockets");
      const recipientSocket = userSockets.get(String(answer.user));
      if (recipientSocket) {
        // console.log(`Emitting answer comment notification to socket ${recipientSocket} for recipient ${answer.user}`);
        io.to(recipientSocket).emit("newNotification", notificationData);
      }
      // else {
      // console.log(`No socket found for recipient ${answer.user} in answer comment notification`);
      // }
    }

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

    // Check if the answer exists
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        status: false,
        message: "Answer not found",
      });
    }

    // Retrieve comments for the answer and populate user info
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

/**
 * Delete a comment by ID.
 */
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log("Deleting comment with ID:", id);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid comment ID format.",
      });
    }

    // Find the comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        status: false,
        message: "Comment not found",
      });
    }

    // console.log("Found comment:", comment);

    // Only allow professors, admins, or the comment owner to delete
    if (
      req.user.role !== 'professor' &&
      req.user.role !== 'admin' &&
      comment.user.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to delete this comment",
      });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    // Decrement the user's commentsCount if it was the owner
    if (comment.user.toString() === userId.toString()) {
      await User.findByIdAndUpdate(userId, { $inc: { commentsCount: -1 } });
    }

    res.status(200).json({
      status: true,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({
      status: false,
      message: "Error deleting comment",
      error: err.message,
    });
  }
};

module.exports = {
  addCommentToQuestion,
  getCommentsByQuestionId,
  addCommentToAnswer,
  getCommentsByAnswerId,
  deleteComment,
};

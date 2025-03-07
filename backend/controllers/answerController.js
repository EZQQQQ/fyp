// /backend/controllers/answerController.js

const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Add an answer to a question
const addAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Create new answer
    const newAnswer = new Answer({
      question_id: questionId,
      answer: answer.trim(),
      user: req.user._id, // From auth middleware
      upvoters: [],
      downvoters: [],
      voteCount: 0,
    });

    const savedAnswer = await newAnswer.save();

    // Increment the user's answersCount
    await User.findByIdAndUpdate(req.user._id, { $inc: { answersCount: 1 } });

    // Re-query the answer to ensure 'user' is populated
    const populatedAnswer = await Answer.findById(savedAnswer._id).populate(
      "user",
      "name username profilePicture"
    );

    // Build a notification payload. 
    const notificationData = {
      recipient: question.user, // the question owner
      sender: req.user._id,      // the user who answered
      community: question.community,
      type: "questionAnswer",    // type for an answer to a question
      content: answer.length > 100 ? answer.substring(0, 100) + "..." : answer, // a snippet of the answer
      questionId: question._id,
      createdAt: new Date(),
      isRead: false,
    };

    // Persist the notification to the database
    // console.log("Persisting notification (answer):", notificationData);
    const persistedNotification = await Notification.create(notificationData);
    // console.log("Persisted notification:", persistedNotification);

    // Get io instance and userSockets map from the app
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    // console.log("Notification Data to emit:", notificationData)

    // Retrieve the socketId for the question owner (recipient)
    const recipientSocket = userSockets.get(String(question.user));
    if (recipientSocket) {
      // console.log(`Emitting notification to socket ${recipientSocket} for recipient ${question.user}`);
      io.to(recipientSocket).emit("newNotification", notificationData);
    }
    // else {
    // console.log(`No socket found for recipient ${question.user}`);
    // }

    res.status(201).json({
      status: true,
      message: "Answer added successfully",
      data: populatedAnswer,
    });
  } catch (err) {
    console.error("Error adding answer:", err);
    res.status(500).json({
      status: false,
      message: "Error adding answer",
      error: err.message,
    });
  }
};

// Get all answers for a question
const getAnswersByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id; // Extracting userId

    // Check if the question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Fetch answers
    const answers = await Answer.find({ question_id: questionId })
      .populate("user", "name profilePicture")
      .lean();

    // Add vote status to each answer
    const answersWithVoteStatus = answers.map((ans) => ({
      ...ans,
      userHasUpvoted: ans.upvoters.some(
        (voterId) => voterId.toString() === userId.toString()
      ),
      userHasDownvoted: ans.downvoters.some(
        (voterId) => voterId.toString() === userId.toString()
      ),
    }));

    res.status(200).json({
      status: true,
      data: answersWithVoteStatus,
    });
  } catch (err) {
    console.error("Error fetching answers:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching answers",
      error: err.message,
    });
  }
};

/**
 * Delete an answer by ID.
 */
const deleteAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    console.log("Deleting answer with ID:", questionId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid answer ID format.",
      });
    }

    // Find the answer
    const answer = await Answer.findById(questionId);
    if (!answer) {
      return res.status(404).json({
        status: false,
        message: "Answer not found",
      });
    }

    // console.log("Found answer:", answer);

    // Only allow professors, admins, or the answer owner to delete
    if (
      req.user.role !== 'professor' &&
      req.user.role !== 'admin' &&
      answer.user.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to delete this answer",
      });
    }

    // Delete all comments related to this answer
    await Comment.deleteMany({ answer_id: questionId });

    // Delete the answer itself
    await Answer.findByIdAndDelete(questionId);

    // Decrement the user's answersCount if it was the owner
    if (answer.user.toString() === userId.toString()) {
      await User.findByIdAndUpdate(userId, { $inc: { answersCount: -1 } });
    }

    res.status(200).json({
      status: true,
      message: "Answer and all related comments deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting answer:", err);
    res.status(500).json({
      status: false,
      message: "Error deleting answer",
      error: err.message,
    });
  }
};

module.exports = {
  addAnswer,
  getAnswersByQuestionId,
  deleteAnswer,
};

// /backend/controllers/answerController.js

const Answer = require("../models/Answer");
const Question = require("../models/Question");
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
      upvoters: [], // Initialize as empty array
      downvoters: [], // Initialize as empty array
      voteCount: 0, // Initialize vote count
    });

    const savedAnswer = await newAnswer.save();

    res.status(201).json({
      status: true,
      message: "Answer added successfully",
      data: savedAnswer,
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

module.exports = {
  addAnswer,
  getAnswersByQuestionId,
};

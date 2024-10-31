// /backend/controllers/questionController.js

const Question = require("../models/Question");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const createQuestion = async (req, res) => {
  try {
    const { community, title, contentType, content, pollOptions, tags } =
      req.body;

    const files = req.files ? req.files.map((file) => file.filename) : [];

    const question = new Question({
      community,
      title,
      contentType,
      content,
      pollOptions: pollOptions ? JSON.parse(pollOptions) : [],
      files,
      tags: tags ? JSON.parse(tags) : [],
      user: req.user.id,
      upvoters: [], // Initialize as empty array
      downvoters: [], // Initialize as empty array
      voteCount: 0, // Initialize vote count
      views: 0, // Initialize views count
    });

    await question.save();

    res.status(201).json({
      status: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (err) {
    console.error("Error creating question:", err);
    res.status(500).json({
      status: false,
      message: "Error creating question",
      error: err.message,
    });
  }
};

const getAllQuestions = async (req, res) => {
  try {
    const userId = req.user._id; // Extract userId from authenticated user

    const questions = await Question.find()
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 }) // Adjust as needed
      .lean(); // Convert to plain JavaScript objects

    // Add vote status to each question
    const questionsWithVoteStatus = questions.map((question) => ({
      ...question,
      userHasUpvoted: question.upvoters
        ? question.upvoters.some(
            (voterId) => voterId.toString() === userId.toString()
          )
        : false,
      userHasDownvoted: question.downvoters
        ? question.downvoters.some(
            (voterId) => voterId.toString() === userId.toString()
          )
        : false,
    }));

    res.status(200).json({
      status: true,
      data: questionsWithVoteStatus,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching questions",
      error: err.message,
    });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // Extracting userId from authenticated user

    const question = await Question.findById(id)
      .populate("user", "name profilePicture")
      .populate({
        path: "answers",
        populate: { path: "user", select: "name profilePicture" },
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "name profilePicture" },
      })
      .lean(); // Convert to plain JavaScript object

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

    // Add vote status
    question.userHasUpvoted = question.upvoters
      ? question.upvoters.some(
          (voterId) => voterId.toString() === userId.toString()
        )
      : false;
    question.userHasDownvoted = question.downvoters
      ? question.downvoters.some(
          (voterId) => voterId.toString() === userId.toString()
        )
      : false;

    // For each answer, add vote status
    question.answers = question.answers.map((ans) => ({
      ...ans,
      userHasUpvoted: ans.upvoters
        ? ans.upvoters.some(
            (voterId) => voterId.toString() === userId.toString()
          )
        : false,
      userHasDownvoted: ans.downvoters
        ? ans.downvoters.some(
            (voterId) => voterId.toString() === userId.toString()
          )
        : false,
    }));

    // Remove upvoters and downvoters arrays from the response if not needed
    delete question.upvoters;
    delete question.downvoters;
    question.answers = question.answers.map((ans) => {
      delete ans.upvoters;
      delete ans.downvoters;
      return ans;
    });

    res.status(200).json({
      status: true,
      data: question,
    });
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({
      status: false,
      message: "Error fetching question",
      error: err.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
};

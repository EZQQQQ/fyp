// /backend/controllers/questionController.js

const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Comment = require("../models/Comment");
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
      .populate("community", "name avatar")
      .sort({ createdAt: -1 });

    // Add vote status and counts to each question
    const questionsWithExtras = await Promise.all(
      questions.map(async (question) => {
        const userHasUpvoted = question.upvoters
          ? question.upvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
          : false;
        const userHasDownvoted = question.downvoters
          ? question.downvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
          : false;

        // Use 'question_id' in your queries
        const answersCount = await Answer.countDocuments({
          question_id: question._id,
        });
        const commentsCount = await Comment.countDocuments({
          question_id: question._id,
        });

        // Convert Mongoose document to plain object
        const questionObj = question.toObject();

        return {
          ...questionObj,
          userHasUpvoted,
          userHasDownvoted,
          answersCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({
      status: true,
      data: questionsWithExtras,
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
      .populate("community", "name avatar")
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

const getQuestionsByCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id; // Assuming you have user authentication

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Community ID format" });
    }

    const questions = await Question.find({ community: communityId })
      .populate("user", "name username profilePicture")
      .populate("community", "name avatar")
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects

    // Enrich questions with vote data and counts
    const questionsWithExtras = await Promise.all(
      questions.map(async (question) => {
        const userHasUpvoted = question.upvoters
          ? question.upvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
          : false;
        const userHasDownvoted = question.downvoters
          ? question.downvoters.some(
              (voterId) => voterId.toString() === userId.toString()
            )
          : false;

        const answersCount = await Answer.countDocuments({
          question_id: question._id,
        });
        const commentsCount = await Comment.countDocuments({
          question_id: question._id,
        });

        return {
          ...question,
          voteCount: question.upvoters.length - question.downvoters.length,
          userHasUpvoted,
          userHasDownvoted,
          answersCount,
          commentsCount,
        };
      })
    );

    res.status(200).json({ status: true, data: questionsWithExtras });
  } catch (error) {
    console.error("Error fetching questions by community:", error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  getQuestionsByCommunity,
};

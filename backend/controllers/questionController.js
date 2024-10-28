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
    const questions = await Question.find()
      .populate("user", "name")
      .sort({ createdAt: -1 }); // Adjust as needed

    res.status(200).json({
      status: true,
      data: questions,
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

    const question = await Question.findById(id)
      .populate("user", "name")
      .populate({
        path: "answers",
        populate: { path: "user", select: "name profilePicture" },
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "name profilePicture" },
      });

    if (!question) {
      return res.status(404).json({
        status: false,
        message: "Question not found",
      });
    }

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

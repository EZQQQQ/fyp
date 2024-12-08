// /backend/routers/Question.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const {
  validateQuestionFields,
  validateQuestionFiles,
  handleValidationResults,
} = require("../middlewares/validate");
const questionController = require("../controllers/questionController");
const { param } = require("express-validator");
const createUploadMiddleware = require("../middlewares/upload");
const pollController = require("../controllers/pollController");

// Initialize the upload middleware for community posts
const upload = createUploadMiddleware("communityPosts");

// Error handling middleware for Multer
const uploadFiles = (req, res, next) => {
  upload.array("files", 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ status: false, message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ status: false, message: err.message });
    }
    // Everything went fine.
    next();
  });
};

// @route POST /api/question/create
// @desc Create a new question
router.post(
  "/create",
  auth,
  uploadFiles,
  validateQuestionFields,
  validateQuestionFiles,
  questionController.createQuestion
);

// @route GET /api/question/
// @desc Get all questions
router.get("/", auth, questionController.getAllQuestions);

// @route GET /api/question/user-questions
// @desc Get user's questions
router.get("/user-questions", auth, questionController.getUserQuestions);

// @route GET /api/question/search
// @desc Search questions
router.get("/search", auth, questionController.searchQuestions);

// @route GET /api/question/:id
// @desc Get a specific question
router.get(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Invalid question ID"),
  handleValidationResults,
  questionController.getQuestionById
);

module.exports = router;

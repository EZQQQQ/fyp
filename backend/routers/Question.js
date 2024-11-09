// /backend/routers/Question.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateQuestion,
  handleValidationResults,
} = require("../middlewares/validate");
const questionController = require("../controllers/questionController");
const multer = require("multer");
const path = require("path");
const { param } = require("express-validator");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// @route POST /api/question/create
// @desc Create a new question
router.post(
  "/create",
  auth,
  upload.array("files", 10),
  validateQuestion,
  questionController.createQuestion
);

// @route GET /api/question/
// @desc Get all questions
router.get("/", auth, questionController.getAllQuestions);

// New Route: Get User's Questions
router.get(
  "/user-questions",
  auth, // Ensure the user is authenticated
  questionController.getUserQuestions
);

// Search Questions Route
// @route GET /api/question/search
// @desc Search questions with fuzzy matching
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

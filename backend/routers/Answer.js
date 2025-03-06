// /backend/routers/Answer.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateAddAnswer,
  validateGetAnswers,
} = require("../middlewares/validate");
const answerController = require("../controllers/answerController");

// POST /api/answer/:questionId - Add an answer to a question
router.post(
  "/:questionId",
  auth,
  validateAddAnswer,
  answerController.addAnswer
);

// GET /api/answer/:questionId - Get all answers for a question
router.get(
  "/:questionId",
  auth,
  validateGetAnswers,
  answerController.getAnswersByQuestionId
);

// @route DELETE /api/answer/:questionId
// @desc Delete an answer
router.delete("/:questionId", auth, answerController.deleteAnswer);

module.exports = router;

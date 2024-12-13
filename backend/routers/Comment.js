// /backend/routers/Comment.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateAddComment,
  validateGetComments,
} = require("../middlewares/validate");
const commentController = require("../controllers/commentController");

// POST /api/comment/question/:questionId - Add a comment to a question
router.post(
  "/question/:questionId",
  auth,
  validateAddComment,
  commentController.addCommentToQuestion
);

// GET /api/comment/question/:questionId - Get all comments for a question
router.get(
  "/question/:questionId",
  auth,
  validateGetComments,
  commentController.getCommentsByQuestionId
);

// POST /api/comment/answer/:answerId - Add a comment to an answer
router.post(
  "/answer/:answerId",
  auth,
  validateAddComment,
  commentController.addCommentToAnswer
);

// GET /api/comment/answer/:answerId - Get all comments for an answer
router.get(
  "/answer/:answerId",
  auth,
  validateGetComments,
  commentController.getCommentsByAnswerId
);

module.exports = router;
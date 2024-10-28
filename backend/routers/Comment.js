// /backend/routers/Comment.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateAddComment,
  validateGetComments,
} = require("../middlewares/validate");
const commentController = require("../controllers/commentController");

// POST /api/comment/:questionId - Add a comment to a question
router.post(
  "/:questionId",
  auth,
  validateAddComment,
  commentController.addComment
);

// GET /api/comment/:questionId - Get all comments for a question
router.get(
  "/:questionId",
  auth,
  validateGetComments,
  commentController.getCommentsByQuestionId
);

module.exports = router;

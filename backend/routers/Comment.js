// /backend/routers/Comment.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateAddComment,
  validateGetComments,
} = require("../middlewares/validate");
const commentController = require("../controllers/commentController");

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: API for managing comments
 */

/**
 * @swagger
 * /api/comment/question/{questionId}:
 *   post:
 *     summary: Add a comment to a question
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question to comment on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentText:
 *                 type: string
 *                 description: The content of the comment.
 *     responses:
 *       201:
 *         description: Comment successfully added.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/question/:questionId",
  auth,
  validateAddComment,
  commentController.addCommentToQuestion
);

/**
 * @swagger
 * /api/comment/question/{questionId}:
 *   get:
 *     summary: Get all comments for a question
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question.
 *     responses:
 *       200:
 *         description: Returns a list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   commentText:
 *                     type: string
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/question/:questionId",
  auth,
  validateGetComments,
  commentController.getCommentsByQuestionId
);

/**
 * @swagger
 * /api/comment/answer/{answerId}:
 *   post:
 *     summary: Add a comment to an answer
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the answer to comment on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentText:
 *                 type: string
 *                 description: The content of the comment.
 *     responses:
 *       201:
 *         description: Comment successfully added.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/answer/:answerId",
  auth,
  validateAddComment,
  commentController.addCommentToAnswer
);

/**
 * @swagger
 * /api/comment/answer/{answerId}:
 *   get:
 *     summary: Get all comments for an answer
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: answerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the answer.
 *     responses:
 *       200:
 *         description: Returns a list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   commentText:
 *                     type: string
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/answer/:answerId",
  auth,
  validateGetComments,
  commentController.getCommentsByAnswerId
);

/**
 * @swagger
 * /api/comment/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Comment not found.
 */
router.delete("/:id", auth, commentController.deleteComment);

module.exports = router;

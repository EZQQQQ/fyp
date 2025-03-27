// /backend/routers/Answer.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  validateAddAnswer,
  validateGetAnswers,
} = require("../middlewares/validate");
const answerController = require("../controllers/answerController");

/**
 * @swagger
 * tags:
 *   name: Answer
 *   description: API for managing answers
 */

/**
 * @swagger
 * /api/answer/{questionId}:
 *   post:
 *     summary: Add an answer to a question
 *     tags: [Answer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question to answer.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerText:
 *                 type: string
 *                 description: The content of the answer.
 *     responses:
 *       201:
 *         description: Answer successfully created.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.post(
  "/:questionId",
  auth,
  validateAddAnswer,
  answerController.addAnswer
);

/**
 * @swagger
 * /api/answer/{questionId}:
 *   get:
 *     summary: Get all answers for a question
 *     tags: [Answer]
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
 *         description: Returns a list of answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   answerText:
 *                     type: string
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get(
  "/:questionId",
  auth,
  validateGetAnswers,
  answerController.getAnswersByQuestionId
);

/**
 * @swagger
 * /api/answer/{questionId}:
 *   delete:
 *     summary: Delete an answer
 *     tags: [Answer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question whose answer is to be deleted.
 *     responses:
 *       200:
 *         description: Answer deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Answer not found.
 *       500:
 *         description: Server error.
 */
router.delete("/:questionId", auth, answerController.deleteAnswer);

module.exports = router;

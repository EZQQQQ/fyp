// /backend/routers/Vote.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const voteController = require("../controllers/voteController");

/**
 * @swagger
 * tags:
 *   name: Vote
 *   description: API for managing votes on questions and answers
 */

/**
 * @swagger
 * /api/vote/question/{id}/upvote:
 *   post:
 *     summary: Upvote a question
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question to upvote.
 *     responses:
 *       200:
 *         description: Question upvoted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/question/:id/upvote", auth, voteController.upvoteQuestion);

/**
 * @swagger
 * /api/vote/question/{id}/downvote:
 *   post:
 *     summary: Downvote a question
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question to downvote.
 *     responses:
 *       200:
 *         description: Question downvoted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/question/:id/downvote", auth, voteController.downvoteQuestion);

/**
 * @swagger
 * /api/vote/answer/{id}/upvote:
 *   post:
 *     summary: Upvote an answer
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the answer to upvote.
 *     responses:
 *       200:
 *         description: Answer upvoted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/answer/:id/upvote", auth, voteController.upvoteAnswer);

/**
 * @swagger
 * /api/vote/answer/{id}/downvote:
 *   post:
 *     summary: Downvote an answer
 *     tags: [Vote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the answer to downvote.
 *     responses:
 *       200:
 *         description: Answer downvoted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/answer/:id/downvote", auth, voteController.downvoteAnswer);

module.exports = router;

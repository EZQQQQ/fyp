// /backend/routers/Poll.js

const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const pollController = require("../controllers/pollController");
const handleValidationResults = require("../middlewares/validate").handleValidationResults;
const auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Poll
 *   description: API for managing polls
 */

/**
 * @swagger
 * /api/poll/{id}/pollResults:
 *   get:
 *     summary: Get a specific question's poll options and status
 *     tags: [Poll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the poll question.
 *     responses:
 *       200:
 *         description: Returns poll options and current status.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
    "/:id/pollResults",
    auth,
    param("id").isMongoId().withMessage("Invalid question ID"),
    handleValidationResults,
    pollController.getPollResults
);

/**
 * @swagger
 * /api/poll/vote:
 *   post:
 *     summary: Vote on a poll option
 *     tags: [Poll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pollId:
 *                 type: string
 *               option:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vote recorded successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/vote",
    auth,
    pollController.votePoll
);

/**
 * @swagger
 * /api/poll/close:
 *   post:
 *     summary: Close a poll
 *     tags: [Poll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pollId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Poll closed successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/close",
    auth,
    pollController.closePoll
);

/**
 * @swagger
 * /api/poll/toggle:
 *   post:
 *     summary: Toggle the state of a poll (open/closed)
 *     tags: [Poll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pollId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Poll state toggled successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
    "/toggle",
    auth,
    pollController.togglePollState
);

module.exports = router;

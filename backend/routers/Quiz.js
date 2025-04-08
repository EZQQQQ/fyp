// /backend/routers/Quiz.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize");
const quizController = require("../controllers/quizController");
const uploadMemory = require("../middlewares/uploadMemory");

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: API for managing quizzes
 */

/**
 * @swagger
 * /api/communities/{communityId}/quizzes:
 *   post:
 *     summary: Create a quiz for a community
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizTitle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/communities/:communityId/quizzes",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.createQuizForCommunity
);

/**
 * @swagger
 * /api/communities/{communityId}/quizzes/ai:
 *   post:
 *     summary: Create a quiz using AI by uploading a document and prompt inputs
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               prompt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz created using AI successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/communities/:communityId/quizzes/ai",
  auth,
  authorizeRoles("professor", "admin"),
  uploadMemory.single("document"),
  quizController.createQuizWithAI
);

/**
 * @swagger
 * /api/communities/quizzes/{communityId}/quizzes:
 *   get:
 *     summary: Get all quizzes in a given community with attempt status
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the community.
 *     responses:
 *       200:
 *         description: Returns a list of quizzes.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/quizzes/:communityId/quizzes",
  auth,
  quizController.getQuizzesByCommunity
);

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   get:
 *     summary: Get a single quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *     responses:
 *       200:
 *         description: Returns the quiz details.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Quiz not found.
 */
router.get(
  "/quizzes/:quizId",
  auth,
  quizController.getQuizById
);

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   put:
 *     summary: Update a quiz by quizId
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizTitle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.put(
  "/quizzes/:quizId",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.updateQuiz
);

/**
 * @swagger
 * /api/quizzes/{quizId}:
 *   delete:
 *     summary: Delete a quiz by quizId
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *     responses:
 *       200:
 *         description: Quiz deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.delete(
  "/quizzes/:quizId",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.deleteQuiz
);

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts/start:
 *   post:
 *     summary: Start a quiz attempt session
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *     responses:
 *       200:
 *         description: Quiz attempt started successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/quizzes/:quizId/attempts/start",
  auth,
  quizController.startQuizAttempt
);

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts/{attemptId}/end:
 *   post:
 *     summary: End a quiz attempt session
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *       - in: path
 *         name: attemptId
 *         schema:
 *           type: string
 *         required: true
 *         description: Attempt ID.
 *     responses:
 *       200:
 *         description: Quiz attempt ended successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/quizzes/:quizId/attempts/:attemptId/end",
  auth,
  quizController.endQuizAttempt
);

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *       - in: path
 *         name: attemptId
 *         schema:
 *           type: string
 *         required: true
 *         description: Attempt ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Quiz attempt submitted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/quizzes/:quizId/attempts/:attemptId/submit",
  auth,
  quizController.submitQuizAttempt
);

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts/{attemptId}:
 *   get:
 *     summary: Get quiz attempt details
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *       - in: path
 *         name: attemptId
 *         schema:
 *           type: string
 *         required: true
 *         description: Attempt ID.
 *     responses:
 *       200:
 *         description: Returns details of the quiz attempt.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Attempt not found.
 */
router.get(
  "/quizzes/:quizId/attempts/:attemptId",
  auth,
  quizController.getQuizAttempt
);

/**
 * @swagger
 * /api/quizzes/{quizId}/attempts:
 *   get:
 *     summary: Get the existing quiz attempt for a given quiz and user.
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID.
 *     responses:
 *       200:
 *         description: Returns the existing quiz attempt.
 *       404:
 *         description: No quiz attempt found.
 *       500:
 *         description: Server Error.
 */
router.get(
  "/quizzes/:quizId/attempts",
  auth,
  quizController.getQuizAttemptByQuiz
);

module.exports = router;

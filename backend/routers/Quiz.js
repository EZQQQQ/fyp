// /backend/routers/Quiz.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize");
const quizController = require("../controllers/quizController");
const uploadMemory = require("../middlewares/uploadMemory");

/**
 * CREATE a quiz for a community
 * POST /api/communities/:communityId/quizzes
 */
router.post(
  "/communities/:communityId/quizzes",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.createQuizForCommunity
);

/**
 * CREATE a quiz using AI by uploading a document and prompt inputs
 * POST /api/communities/:communityId/quizzes/ai
 */
router.post(
  "/communities/:communityId/quizzes/ai",
  auth,
  authorizeRoles("professor", "admin"),
  uploadMemory.single("document"),
  quizController.createQuizWithAI
);

/**
 * READ all quizzes in a given community with attempt status
 * GET /api/communities/:communityId/quizzes
 */
router.get(
  "/quizzes/:communityId/quizzes",
  auth,
  quizController.getQuizzesByCommunity
);

/**
 * READ a single quiz
 * GET /api/quizzes/:quizId
 */
router.get(
  "/quizzes/:quizId",
  auth,
  quizController.getQuizById
);

/**
 * UPDATE a quiz by quizId
 * PUT /api/quizzes/:quizId
 */
router.put(
  "/quizzes/:quizId",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.updateQuiz
);

/**
 * DELETE a quiz by quizId
 * DELETE /api/quizzes/:quizId
 */
router.delete(
  "/quizzes/:quizId",
  auth,
  authorizeRoles("professor", "admin"),
  quizController.deleteQuiz
);

/**
 * START a quiz attempt session
 * POST /api/quizzes/:quizId/attempts/start
 */
router.post(
  "/quizzes/:quizId/attempts/start",
  auth,
  quizController.startQuizAttempt
);

/**
 * END a quiz attempt session
 * POST /api/quizzes/:quizId/attempts/:attemptId/end
 */
router.post(
  "/quizzes/:quizId/attempts/:attemptId/end",
  auth,
  quizController.endQuizAttempt
);

/**
 * SUBMIT quiz answers
 * POST /api/quizzes/:quizId/attempts/:attemptId/submit
 */
router.post(
  "/quizzes/:quizId/attempts/:attemptId/submit",
  auth,
  quizController.submitQuizAttempt
);

/**
 * GET quiz attempt details
 * GET /api/quizzes/:quizId/attempts/:attemptId
 */
router.get(
  "/quizzes/:quizId/attempts/:attemptId",
  auth,
  quizController.getQuizAttempt
);

module.exports = router;

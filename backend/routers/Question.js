// /backend/routers/Question.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middlewares/auth");
const {
  validateQuestionFields,
  validateQuestionFiles,
  handleValidationResults,
} = require("../middlewares/validate");
const questionController = require("../controllers/questionController");
const { param } = require("express-validator");
const pollController = require("../controllers/pollController");
const upload = require("../middlewares/upload");

/**
 * @swagger
 * tags:
 *   name: Question
 *   description: API for managing questions
 */

const uploadFiles = (req, res, next) => {
  upload.array("files", 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }
    next();
  });
};

/**
 * @swagger
 * /api/question/create:
 *   post:
 *     summary: Create a new question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Question created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/create",
  auth,
  uploadFiles,
  validateQuestionFields,
  validateQuestionFiles,
  questionController.createQuestion
);

/**
 * @swagger
 * /api/question:
 *   get:
 *     summary: Get all questions
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of questions.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", auth, questionController.getAllQuestions);

/**
 * @swagger
 * /api/question/user-questions:
 *   get:
 *     summary: Get questions for the current user
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of user-specific questions.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/user-questions", auth, questionController.getUserQuestions);

/**
 * @swagger
 * /api/question/search:
 *   get:
 *     summary: Search questions
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query.
 *     responses:
 *       200:
 *         description: Returns search results.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/search", auth, questionController.searchQuestions);

/**
 * @swagger
 * /api/question/{id}:
 *   get:
 *     summary: Get a specific question by ID
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID.
 *     responses:
 *       200:
 *         description: Returns the question details.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Question not found.
 */
router.get(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Invalid question ID"),
  handleValidationResults,
  questionController.getQuestionById
);

/**
 * @swagger
 * /api/question/{id}:
 *   delete:
 *     summary: Delete a specific question
 *     tags: [Question]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID.
 *     responses:
 *       200:
 *         description: Question deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Question not found.
 */
router.delete(
  "/:id",
  auth,
  questionController.deleteQuestion
);

module.exports = router;

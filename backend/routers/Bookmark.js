// /backend/routers/Bookmark.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const bookmarkController = require("../controllers/bookmarkController");

/**
 * @swagger
 * tags:
 *   name: Bookmark
 *   description: API for managing bookmarks
 */

/**
 * @swagger
 * /api/bookmark/user/bookmark/{questionId}:
 *   put:
 *     summary: Toggle bookmark for a question
 *     tags: [Bookmark]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the question to bookmark.
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.put("/user/bookmark/:questionId", auth, bookmarkController.toggleBookmarkQuestion);

/**
 * @swagger
 * /api/bookmark/user/bookmark:
 *   get:
 *     summary: Fetch all bookmarked questions for the current user
 *     tags: [Bookmark]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/user/bookmark", auth, bookmarkController.getUserBookmarks);

module.exports = router;

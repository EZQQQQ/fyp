// /backend/routers/Bookmark.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const bookmarkController = require("../controllers/bookmarkController");

// Toggle bookmark
router.put("/user/bookmark/:questionId", auth, bookmarkController.toggleBookmarkQuestion);

// Fetch all bookmarked questions for current user
router.get("/user/bookmark", auth, bookmarkController.getUserBookmarks);

module.exports = router;
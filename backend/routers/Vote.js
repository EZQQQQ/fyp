// /backend/routers/Vote.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth"); // Ensure you have an auth middleware

const voteController = require("../controllers/voteController");

// Voting endpoints for Questions
router.post("/question/:id/upvote", auth, voteController.upvoteQuestion);
router.post("/question/:id/downvote", auth, voteController.downvoteQuestion);

// Voting endpoints for Answers
router.post("/answer/:id/upvote", auth, voteController.upvoteAnswer);
router.post("/answer/:id/downvote", auth, voteController.downvoteAnswer);

module.exports = router;

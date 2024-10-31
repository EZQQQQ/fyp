// /backend/routers/Vote.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth"); // Ensure you have an auth middleware
const VoteController = require("../controllers/VoteController");

// Voting endpoints for Questions
router.post("/question/:id/upvote", auth, VoteController.upvoteQuestion);
router.post("/question/:id/downvote", auth, VoteController.downvoteQuestion);

// Voting endpoints for Answers
router.post("/answer/:id/upvote", auth, VoteController.upvoteAnswer);
router.post("/answer/:id/downvote", auth, VoteController.downvoteAnswer);

module.exports = router;

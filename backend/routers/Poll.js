const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const pollController = require("../controllers/pollController");
const handleValidationResults = require("../middlewares/validate").handleValidationResults;
const auth = require("../middlewares/auth");

// @route GET /api/poll/:id/pollResults
// @desc Get a specific question's poll options and status
router.get(
    "/:id/pollResults",
    auth,
    param("id").isMongoId().withMessage("Invalid question ID"),
    handleValidationResults,
    pollController.getPollResults
);

// @route POST /api/poll/vote
// @desc Vote on a poll option
router.post(
    "/vote",
    auth,
    pollController.votePoll
);

// @route POST /api/poll/close
// @desc Close a poll
router.post(
    "/close",
    auth,
    pollController.closePoll
);

// @route POST /api/poll/toggle
// @desc Toggle the state of a poll (open/closed)
router.post(
    "/toggle",
    auth,
    pollController.togglePollState
);

module.exports = router;

// /backend/controllers/voteController.js

const Question = require("../models/Question");
const Answer = require("../models/Answer");

// Helper function to handle voting logic
const handleVote = async (model, targetId, userId, voteType) => {
  const voteField = voteType === "upvote" ? "upvoters" : "downvoters";
  const oppositeVoteField = voteType === "upvote" ? "downvoters" : "upvoters";
  const voteChange = voteType === "upvote" ? 1 : -1;

  // Find the document (Question or Answer)
  const document = await model.findById(targetId);
  if (!document) {
    throw new Error("Target not found");
  }

  // Check if user has already voted in this direction
  const hasVoted = document[voteField].includes(userId);
  const hasOppositeVoted = document[oppositeVoteField].includes(userId);

  if (hasVoted) {
    // User wants to retract their vote
    document[voteField] = document[voteField].filter(
      (id) => id.toString() !== userId.toString()
    );
    document.voteCount += voteType === "upvote" ? -1 : 1;
    await document.save();

    return {
      voteCount: document.voteCount,
      action: "retracted",
      userHasUpvoted: document.upvoters.includes(userId),
      userHasDownvoted: document.downvoters.includes(userId),
    };
  } else {
    if (hasOppositeVoted) {
      // User is switching their vote
      document[oppositeVoteField] = document[oppositeVoteField].filter(
        (id) => id.toString() !== userId.toString()
      );
      document.voteCount += voteType === "upvote" ? 2 : -2; // Removing opposite vote and adding current vote
    } else {
      // User is voting for the first time in this direction
      document.voteCount += voteChange;
    }

    // Add user to the appropriate vote array
    document[voteField].push(userId);

    await document.save();
    return {
      voteCount: document.voteCount,
      action: "voted",
      userHasUpvoted: document.upvoters.includes(userId),
      userHasDownvoted: document.downvoters.includes(userId),
    };
  }
};

// Upvote a question
const upvoteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id; // Assuming auth middleware sets req.user

    const { voteCount, action, userHasUpvoted, userHasDownvoted } =
      await handleVote(Question, questionId, userId, "upvote");

    res.status(200).json({
      status: true,
      message:
        action === "voted"
          ? "Question upvoted successfully"
          : "Upvote retracted successfully",
      data: { voteCount, userHasUpvoted, userHasDownvoted, action },
    });
  } catch (error) {
    console.error("Error upvoting question:", error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

// Downvote a question
const downvoteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    const { voteCount, action, userHasUpvoted, userHasDownvoted } =
      await handleVote(Question, questionId, userId, "downvote");

    res.status(200).json({
      status: true,
      message:
        action === "voted"
          ? "Question downvoted successfully"
          : "Downvote retracted successfully",
      data: { voteCount, userHasUpvoted, userHasDownvoted, action },
    });
  } catch (error) {
    console.error("Error downvoting question:", error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

// Upvote an answer
const upvoteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user._id;

    const { voteCount, action, userHasUpvoted, userHasDownvoted } =
      await handleVote(Answer, answerId, userId, "upvote");

    res.status(200).json({
      status: true,
      message:
        action === "voted"
          ? "Answer upvoted successfully"
          : "Upvote retracted successfully",
      data: { voteCount, userHasUpvoted, userHasDownvoted, action },
    });
  } catch (error) {
    console.error("Error upvoting answer:", error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

// Downvote an answer
const downvoteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user._id;

    const { voteCount, action, userHasUpvoted, userHasDownvoted } =
      await handleVote(Answer, answerId, userId, "downvote");

    res.status(200).json({
      status: true,
      message:
        action === "voted"
          ? "Answer downvoted successfully"
          : "Downvote retracted successfully",
      data: { voteCount, userHasUpvoted, userHasDownvoted, action },
    });
  } catch (error) {
    console.error("Error downvoting answer:", error.message);
    res.status(400).json({ status: false, message: error.message });
  }
};

module.exports = {
  upvoteQuestion,
  downvoteQuestion,
  upvoteAnswer,
  downvoteAnswer,
};

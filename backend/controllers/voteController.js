// /backend/controllers/VoteController.js

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

  // Check if user has already voted
  if (document[voteField].includes(userId)) {
    throw new Error(`User has already ${voteType}d this`);
  }

  // If user has voted oppositely, remove the opposite vote and adjust voteCount accordingly
  if (document[oppositeVoteField].includes(userId)) {
    document[oppositeVoteField] = document[oppositeVoteField].filter(
      (id) => id.toString() !== userId.toString()
    );
    document.voteCount += voteType === "upvote" ? 2 : -2; // Removing opposite vote and adding current vote
  } else {
    // Increment or decrement voteCount
    document.voteCount += voteChange;
  }

  // Add user to the appropriate vote array
  document[voteField].push(userId);

  await document.save();

  return document.voteCount;
};

// Upvote a question
const upvoteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id; // Assuming auth middleware sets req.user

    const voteCount = await handleVote(Question, questionId, userId, "upvote");

    res.status(200).json({
      status: true,
      message: "Question upvoted successfully",
      data: { voteCount },
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

    const voteCount = await handleVote(
      Question,
      questionId,
      userId,
      "downvote"
    );

    res.status(200).json({
      status: true,
      message: "Question downvoted successfully",
      data: { voteCount },
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

    const voteCount = await handleVote(Answer, answerId, userId, "upvote");

    res.status(200).json({
      status: true,
      message: "Answer upvoted successfully",
      data: { voteCount },
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

    const voteCount = await handleVote(Answer, answerId, userId, "downvote");

    res.status(200).json({
      status: true,
      message: "Answer downvoted successfully",
      data: { voteCount },
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

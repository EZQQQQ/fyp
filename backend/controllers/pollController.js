// /backend/controllers/pollController.js

const Question = require("../models/Question");
const mongoose = require("mongoose");

const getPollResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;
    const question = await Question.findById(id, "pollOptions isClosed user votedUsers")
      .populate("user", "_id username");

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Determine the option the user voted for
    let userVotedOptionIndex = null;
    if (userId) {
      const userVote = question.votedUsers.find((vote) => vote.userId.equals(userId));
      if (userVote) {
        userVotedOptionIndex = userVote.optionIndex;
      }
    }

    // Return the poll options and the poll status
    res.status(200).json({
      pollOptions: question.pollOptions,
      isClosed: question.isClosed,
      user: question.user,
      userVotedOptionIndex,
    });
  } catch (error) {
    next(error);
  }
};

const votePoll = async (req, res, next) => {
  try {
    const { questionId, optionIndex } = req.body;
    const userId = req.user._id; // Ensure auth middleware

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID." });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    if (question.isClosed) return res.status(400).json({ message: "Poll is closed." });

    if (optionIndex < 0 || optionIndex >= question.pollOptions.length) {
      return res.status(400).json({ message: "Invalid option index." });
    }

    // Check if the user has already voted
    const hasVoted = question.votedUsers.some((vote) => vote.userId.equals(userId));
    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Increment the votes for the selected option
    question.pollOptions[optionIndex].votes += 1;
    question.votedUsers.push({ userId, optionIndex });

    await question.save();

    return res.status(200).json({
      message: "Vote recorded successfully.",
      pollOptions: question.pollOptions,
      isClosed: question.isClosed,
    });
  } catch (error) {
    next(error);
  }
}

const closePoll = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID." });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    // Only poll creator can close it
    if (!question.user.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to close this poll." });
    }

    if (question.isClosed) {
      return res.status(400).json({ message: "Poll is already closed." });
    }

    question.isClosed = true;
    await question.save();

    return res.status(200).json({
      message: "Poll closed successfully.",
      pollOptions: question.pollOptions,
      isClosed: question.isClosed,
    });
  } catch (error) {
    next(error);
  }
}

const togglePollState = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid question ID." });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    // Only poll creator can toggle the state
    if (!question.user.equals(userId)) {
      return res.status(403).json({ message: "Not authorized to toggle poll state." });
    }

    question.isClosed = !question.isClosed;
    await question.save();

    return res.status(200).json({
      message: `Poll ${question.isClosed ? "closed" : "opened"} successfully.`,
      pollOptions: question.pollOptions,
      isClosed: question.isClosed,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPollResults,
  votePoll,
  closePoll,
  togglePollState,
};
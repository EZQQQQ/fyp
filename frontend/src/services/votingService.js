// /frontend/src/services/votingService.js

import axiosInstance from "../utils/axiosConfig";

/**
 * Handles voting actions (upvote/downvote) for questions and answers.
 * @param {string} type - The type of vote ("upvote" or "downvote").
 * @param {string} targetId - The ID of the question or answer.
 * @param {boolean} isQuestion - Flag indicating if the target is a question.
 * @returns {Promise<Object>} - The updated vote count and user's vote status.
 */
const handleVote = async (type, targetId, isQuestion = true) => {
  try {
    const endpoint = isQuestion
      ? `/question/${targetId}/${type}`
      : `/answer/${targetId}/${type}`;
    const response = await axiosInstance.post(endpoint);
    return response.data.data; // Contains voteCount, userHasUpvoted, userHasDownvoted
  } catch (error) {
    console.error(
      `Error during ${type} on ${isQuestion ? "question" : "answer"}:`,
      error.response?.data
    );
    throw error.response?.data?.message || "An error occurred while voting.";
  }
};

export default handleVote;

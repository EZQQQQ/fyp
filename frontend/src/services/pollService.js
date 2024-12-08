// frontend/src/services/pollService.js

import axiosInstance from "../utils/axiosConfig";

/**
 * Fetch poll results for a given question (poll).
 * @param {string} questionId - The ID of the question (poll).
 * @returns {Promise<Object>} - The poll data (pollOptions and isClosed).
 */
export async function fetchPollResults(questionId) {
  try {
    const response = await axiosInstance.get(`/poll/${questionId}/pollResults`);
    return response.data;
  } catch (error) {
    console.error("Error fetching poll results:", error.response?.data);
    throw error.response?.data?.message || "An error occurred while fetching poll results.";
  }
}

/**
 * Votes on a poll option for a given question.
 * @param {string} questionId - The ID of the question (poll).
 * @param {number} optionIndex - The index of the chosen poll option.
 * @returns {Promise<Object>} - The updated poll data.
 */
export async function voteOnPoll(questionId, optionIndex) {
  try {
    const response = await axiosInstance.post("/poll/vote", {
      questionId,
      optionIndex,
    });
    return response.data;
  } catch (error) {
    console.error("Error voting on poll:", error.response?.data);
    throw error.response?.data?.message || "An error occurred while voting on the poll.";
  }
}

/**
 * Closes a poll for a given question.
 * @param {string} questionId - The ID of the question (poll).
 * @returns {Promise<Object>} - The updated poll data.
 */
export async function closePoll(questionId) {
  try {
    const response = await axiosInstance.post("/poll/close", { questionId });
    return response.data;
  } catch (error) {
    console.error("Error closing poll:", error.response?.data);
    throw error.response?.data?.message || "An error occurred while closing the poll.";
  }
}

/**
 * Toggles the state of a poll (open/closed) for a given question.
 * @param {string} questionId - The ID of the question (poll).
 * @returns {Promise<Object>} - The updated poll data.
 */
export async function togglePollState(questionId) {
  try {
    const response = await axiosInstance.post("/poll/toggle", { questionId });
    return response.data;
  } catch (error) {
    console.error("Error toggling poll state:", error.response?.data);
    throw error.response?.data?.message || "An error occurred while toggling the poll state.";
  }
}

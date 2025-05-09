// /frontend/src/services/quizService.js

import axiosInstance from "../utils/axiosConfig";

const createQuiz = async (communityId, quizData) => {
  // POST /api/communities/:communityId/quizzes
  const res = await axiosInstance.post(`/communities/${communityId}/quizzes`, quizData);
  return res.data;
};

// function for AI-enabled quiz creation
const createQuizWithAI = async (communityId, formData) => {
  // POST /api/communities/:communityId/quizzes/ai
  const res = await axiosInstance.post(
    `/communities/${communityId}/quizzes/ai`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

const getQuizzesByCommunity = async (communityId) => {
  // GET /api/quizzes/:communityId/quizzes
  const res = await axiosInstance.get(`/quizzes/${communityId}/quizzes`);
  return res.data;
};

const getQuizById = async (quizId) => {
  // GET /api/quizzes/:quizId
  const res = await axiosInstance.get(`/quizzes/${quizId}`);
  return res.data;
};


const updateQuiz = async (quizId, quizData) => {
  // PUT /api/quizzes/:quizId
  const res = await axiosInstance.put(`/quizzes/${quizId}`, quizData);
  return res.data;
};

const deleteQuiz = async (quizId) => {
  // DELETE /api/quizzes/:quizId
  const res = await axiosInstance.delete(`/quizzes/${quizId}`);
  return res.data;
};

const submitQuizAttempt = async (quizId, attemptId, attemptData) => {
  // POST /api/quizzes/:quizId/attempts/:attemptId/submit
  const res = await axiosInstance.post(`/quizzes/${quizId}/attempts/${attemptId}/submit`, attemptData);
  return res.data;
};

const startQuizAttempt = async (quizId) => {
  // POST /api/quizzes/:quizId/attempts/start
  const res = await axiosInstance.post(`/quizzes/${quizId}/attempts/start`);
  return res.data;
};

const endQuizAttempt = async (quizId, attemptId) => {
  // POST /api/quizzes/:quizId/attempts/:attemptId/end
  const res = await axiosInstance.post(`/quizzes/${quizId}/attempts/${attemptId}/end`);
  return res.data;
};

const getQuizAttempt = async (quizId, attemptId) => {
  // GET /api/quizzes/:quizId/attempts/:attemptId
  if (!attemptId) {
    throw new Error("Attempt ID is undefined");
  }
  const res = await axiosInstance.get(`/quizzes/${quizId}/attempts/${attemptId}`);
  return res.data;
};

const getQuizAttemptByQuiz = async (quizId) => {
  try {
    const res = await axiosInstance.get(`/quizzes/${quizId}/attempts`);
    return res.data;
  } catch (err) {
    // If error status is 404, it means no attempt was found. Return a "no attempt" value.
    if (err.response && err.response.status === 404) {
      return { success: false, message: "No attempt found" };
    }
    // Otherwise, rethrow the error.
    throw err;
  }
};

export default {
  createQuiz,
  createQuizWithAI,
  getQuizzesByCommunity,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  startQuizAttempt,
  endQuizAttempt,
  getQuizAttempt,
  getQuizAttemptByQuiz,
};

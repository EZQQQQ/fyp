// frontend/src/services/questionService.js
import axiosInstance from "../utils/axiosConfig";

const questionService = {
  getQuestionsByCommunity: (communityId) => {
    return axiosInstance.get(`/communities/${communityId}/questions`);
  },
  searchQuestions: async (query, community) => {
    const params = { query };
    if (community && community !== "all") {
      params.community = community;
    }

    return axiosInstance.get("/question/search", { params });
  },
  deleteQuestion: (questionId) => {
    return axiosInstance.delete(`/question/${questionId}`);
  },
  deleteAnswer: (answerId) => {
    return axiosInstance.delete(`/answer/${answerId}`);
  },
  deleteComment: (commentId) => {
    return axiosInstance.delete(`/comment/${commentId}`);
  }
};

export default questionService;
// frontend/src/services/questionService.js
import axiosInstance from "../utils/axiosConfig";

const questionService = {
  getQuestionsByCommunity: (communityId) => {
    return axiosInstance.get(`/communities/${communityId}/questions`);
  },
  searchQuestions: (query, community) => {
    return axiosInstance.get("/question/search", {
      params: {
        query,
        community,
      },
    });
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
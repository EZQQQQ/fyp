// /frontend/src/services/questionService.js

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
};

export default questionService;

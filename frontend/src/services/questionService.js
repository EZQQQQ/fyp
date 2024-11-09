// /frontend/src/services/questionService.js

import axiosInstance from "../utils/axiosConfig";

const questionService = {
  getQuestionsByCommunity: (communityId) => {
    return axiosInstance.get(`/communities/${communityId}/questions`);
  },
  // ... other question-related services
};

export default questionService;

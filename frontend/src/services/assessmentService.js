// /frontend/src/services/assessmentService.js

import axiosInstance from "../utils/axiosConfig";

// Get assessment tasks by community ID
const getAssessmentTasks = async (communityId) => {
  const response = await axiosInstance.get(
    `/communities/${communityId}/assessment-tasks`
  );
  return response.data;
};

// Get user participation in a community
const getUserParticipation = async (communityId) => {
  const response = await axiosInstance.get(
    `/communities/${communityId}/user-participation`
  );
  return response.data;
};

// Get participation for all members in a community
const getAllParticipation = async (communityId) => {
  const response = await axiosInstance.get(`/communities/${communityId}/all-participation`);
  return response.data; // expect data to have { participation: [...] }
};

// Create an assessment task
const createAssessmentTask = async (communityId, taskData) => {
  const response = await axiosInstance.post(
    `/communities/${communityId}/assessment-tasks`,
    taskData
  );
  return response.data.task;
};

// Update an assessment task
const updateAssessmentTask = async (communityId, taskId, taskData) => {
  const response = await axiosInstance.put(
    `/communities/${communityId}/assessment-tasks/${taskId}`,
    taskData
  );
  return response.data.task;
};

// Delete an assessment task
const deleteAssessmentTask = async (communityId, taskId) => {
  const response = await axiosInstance.delete(
    `/communities/${communityId}/assessment-tasks/${taskId}`
  );
  return response.data;
};

export default {
  getAssessmentTasks,
  getUserParticipation,
  getAllParticipation,
  createAssessmentTask,
  updateAssessmentTask,
  deleteAssessmentTask,
};

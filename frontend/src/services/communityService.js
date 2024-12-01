// /frontend/src/services/communityService.js

import axiosInstance from "../utils/axiosConfig";

// Create a new community
const createCommunity = (formData) => {
  return axiosInstance.post("/communities", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Fetch all communities
const fetchCommunities = async () => {
  const response = await axiosInstance.get("/communities");
  return response.data;
};

// Fetch user's communities
const getUserCommunities = async () => {
  const response = await axiosInstance.get("/communities/user");
  return response.data;
};

// Join a community
const joinCommunity = async (communityId) => {
  const response = await axiosInstance.post(`/communities/${communityId}/join`);
  return response.data;
};

// Optional: Leave a community
const leaveCommunity = async (communityId) => {
  const response = await axiosInstance.post(
    `/communities/${communityId}/leave`
  );
  return response.data;
};

// Get community by ID
const getCommunityById = async (communityId) => {
  const response = await axiosInstance.get(`/communities/${communityId}`);
  return response.data;
};

// Check if community name exists
const checkCommunityName = async (communityName) => {
  const response = await axiosInstance.get(
    `/communities/check/${communityName}`
  );
  return response.data;
};

export default {
  createCommunity,
  fetchCommunities,
  getUserCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
  checkCommunityName,
};

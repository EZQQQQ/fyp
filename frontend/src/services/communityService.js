// /frontend/src/services/communityService.js

import axiosInstance from "../utils/axiosConfig";

// Create a new community
const createCommunity = async (communityData) => {
  const response = await axiosInstance.post("/communities", communityData);
  return response.data;
};

// Fetch all communities
const fetchCommunities = async () => {
  const response = await axiosInstance.get("/communities");
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

export default {
  createCommunity,
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  getCommunityById,
};

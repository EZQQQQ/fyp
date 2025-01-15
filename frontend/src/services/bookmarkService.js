// /frontend/src/services/bookmarkService.js

import axiosInstance from "../utils/axiosConfig";

// Toggle Bookmark
const toggleBookmarkQuestion = async (questionId) => {
  try {
    // Make a PUT request to toggle bookmark
    const response = await axiosInstance.put(`/user/bookmark/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

// Get all bookmarked questions for the current user
const fetchUserBookmarks = async () => {
  const response = await axiosInstance.get("/user/bookmark");
  return response.data;
};

const bookmarkService = {
  toggleBookmarkQuestion,
  fetchUserBookmarks,
};

export default bookmarkService;

// frontend/src/services/notificationService.js
import axiosInstance from "../utils/axiosConfig";

// Fetch notifications for a given user
export const fetchNotificationsAPI = async (userId) => {
  const response = await axiosInstance.get(`/notifications?userId=${userId}`);
  // console.log("Fetched notifications from API:", response.data); // DEBUG: log the response data
  return response.data;
};

// Mark a notification as read
export const markNotificationReadAPI = async (notificationId) => {
  const response = await axiosInstance.patch(`/notifications/${notificationId}`, {
    isRead: true,
  });
  return response.data;
};

// (Optional) Create a notification manually
export const createNotificationAPI = async (notificationData) => {
  const response = await axiosInstance.post("/notifications", notificationData);
  return response.data;
};

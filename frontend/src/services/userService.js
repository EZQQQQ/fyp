// frontend/src/services/userService.js

import axios from "../utils/axiosConfig";

// SSO Login
const ssoLogin = async ({ token, isAdmin }) => {
  // console.log("ssoLogin service called with:", { token, isAdmin });
  const response = await axios.post("/user/sso-login", { token, isAdmin });
  // console.log("ssoLogin service response:", response.data);
  return response.data;
};

// Create User Profile
const createProfile = async ({ username, profilePicture }) => {
  const formData = new FormData();
  formData.append("username", username);
  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  const response = await axios.post("/user/create-profile", formData);
  return response.data;
};

// Admin Login
const adminLogin = async ({ email, password }) => {
  const response = await axios.post("/user/login", { email, password });
  return response.data;
};

// Fetch User Data
const fetchUserData = async () => {
  const response = await axios.get("/user/profile");
  return response.data;
};

// Update hideDashboard Preference
const updateHideDashboard = async ({ hideDashboard }) => {
  const response = await axios.put("/user/profile/hide-dashboard", { hideDashboard });
  return response.data;
};

// Update Settings
const updateSettings = async ({ username, profilePicture, profileBio }) => {
  const formData = new FormData();
  if (username) formData.append("username", username);
  if (profileBio) formData.append("profileBio", profileBio);
  if (profilePicture) formData.append("profilePicture", profilePicture);

  const response = await axios.post("/user/settings", formData);
  return response.data;
};

// Update Profile
const updateProfile = async ({ profilePicture, profileBanner }) => {
  const formData = new FormData();
  if (profilePicture) formData.append("profilePicture", profilePicture);
  if (profileBanner) formData.append("profileBanner", profileBanner);

  const response = await axios.post("/user/profile", formData);
  return response.data;
};

const userService = {
  ssoLogin,
  createProfile,
  adminLogin,
  fetchUserData,
  updateHideDashboard,
  updateSettings,
  updateProfile,
};

export default userService;

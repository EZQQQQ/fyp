// frontend/src/services/userService.js

import axios from "../utils/axiosConfig";

// SSO Login
const ssoLogin = async ({ token, isAdmin }) => {
  console.log("ssoLogin service called with:", { token, isAdmin });
  const response = await axios.post("/user/sso-login", { token, isAdmin });
  console.log("ssoLogin service response:", response.data);
  return response.data;
};

// Create User Profile
const createProfile = async ({ username, profilePicture }) => {
  const formData = new FormData();
  formData.append("username", username);
  if (profilePicture) {
    formData.append("profilePicture", profilePicture);
  }

  const response = await axios.post("/user/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

const userService = {
  ssoLogin,
  createProfile,
  adminLogin,
  fetchUserData,
};

export default userService;

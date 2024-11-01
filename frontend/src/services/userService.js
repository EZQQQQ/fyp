// /frontend/src/services/userService.js

import axios from "axios";

// Base URL for the API
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Include cookies if your backend uses them
});

// Interceptor to add the Authorization header to each request if the token exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle specific error status codes
    // For example, if unauthorized, redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Login user
const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/user/login", credentials);
    const data = response.data;

    // Save token to local storage
    localStorage.setItem("token", data.token);

    return data;
  } catch (error) {
    // Handle error appropriately
    throw error;
  }
};

// Register user
const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/user/register", userData);
    const data = response.data;

    // Save token to local storage
    localStorage.setItem("token", data.token);

    return data;
  } catch (error) {
    // Handle error appropriately
    throw error;
  }
};

// Fetch authenticated user's profile
const fetchUserData = async () => {
  try {
    const response = await axiosInstance.get("/user/profile");
    return response.data;
  } catch (error) {
    // Handle error appropriately
    throw error;
  }
};

// Logout user
const logout = () => {
  // Remove token from local storage
  localStorage.removeItem("token");
  // Optionally redirect to login page
  window.location.href = "/login";
};

const userService = {
  login,
  register,
  fetchUserData,
  logout,
};

export default userService;

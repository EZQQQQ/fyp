// frontend/src/services/userService.js

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

// Login user
const login = async (credentials) => {
  const response = await axiosInstance.post("/user/login", credentials);
  return response.data;
};

// Register user
const register = async (userData) => {
  const response = await axiosInstance.post("/user/register", userData);
  return response.data;
};

// Fetch authenticated user's profile
const fetchUserData = async () => {
  const response = await axiosInstance.get("/user/profile");
  return response.data;
};

const userService = {
  login,
  register, // Updated from signup to register
  fetchUserData, // Added fetchUserData for completeness
};

export default userService;

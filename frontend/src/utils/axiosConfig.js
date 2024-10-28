// /frontend/src/utils/axiosConfig.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // Update with your backend URL
});

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Adjust according to your token storage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

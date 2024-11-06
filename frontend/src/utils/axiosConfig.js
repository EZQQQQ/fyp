import axios from "axios";
import config from "../config";

const API_BASE_URL = `${config.BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ensure the token is stored in localStorage after login
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

// frontend/src/utils/axiosConfig.js

import axios from "axios";
import config from "../config";
import { store } from "../app/store";

const API_BASE_URL = `${config.BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token from the Redux store
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

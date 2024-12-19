// frontend/src/utils/axiosConfig.js

import axios from "axios";
import config from "../config";
import { store } from "../app/store";

const API_BASE_URL = `${config.BACKEND_URL}/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Don't set a default Content-Type here. Let axios handle it automatically.
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state?.user?.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // If the request data is FormData, remove Content-Type so Axios can set it properly.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      // For JSON data, Axios will set application/json by default.
      // If needed, you can explicitly set it here:
      // config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

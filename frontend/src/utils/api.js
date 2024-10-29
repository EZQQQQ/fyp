// /frontend/src/utils/api.js

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

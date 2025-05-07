// /src/config.js

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
const S3_BASE_URL = process.env.REACT_APP_S3_BASE_URL;

export default {
  BACKEND_URL,
  S3_BASE_URL,
};
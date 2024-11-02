// /backend/routers/User.js

const express = require("express");
const router = express.Router();
const {
  ssoLoginUser,
  loginUser,
  createUserProfile,
  getUserProfile,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");
const uploadProfile = require("../middlewares/uploadProfile");

// SSO Login Route
router.post("/sso-login", ssoLoginUser);

// Admin Login Route
router.post("/login", loginUser);

// Create User Profile Route with Profile Photo Upload
router.post(
  "/profile",
  auth,
  uploadProfile.single("profilePicture"),
  createUserProfile
);

// Get User Profile Route
router.get("/profile", auth, getUserProfile);

module.exports = router;

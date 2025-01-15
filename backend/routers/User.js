// /backend/routers/User.js

const express = require("express");
const router = express.Router();
const {
  ssoLoginUser,
  loginUser,
  createUserProfile,
  getUserProfile,
  updateHideDashboardPreference,
  updateSettings,
  updateProfile,
} = require("../controllers/userController");
const auth = require("../middlewares/auth");
const uploadProfile = require("../middlewares/uploadProfile");

// SSO Login Route
router.post("/sso-login", ssoLoginUser);

// Admin Login Route
router.post("/login", loginUser);

// Create User Profile Route with Profile Photo Upload
router.post(
  "/create-profile",
  auth,
  uploadProfile.single("profilePicture"),
  createUserProfile
);

// Get User Profile Route
router.get("/profile", auth, getUserProfile);

// Update hideDashboard Preference
router.put("/profile/hide-dashboard", auth, updateHideDashboardPreference);

// Update User Settings
router.post(
  "/settings",
  auth,
  uploadProfile.fields([
    { name: 'profilePicture', maxCount: 1 },
  ]),
  updateSettings
);

// Update User Profile
router.post(
  "/profile",
  auth,
  uploadProfile.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'profileBanner', maxCount: 1 }
  ]),
  updateProfile
);

module.exports = router;

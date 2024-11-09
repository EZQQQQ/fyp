// /backend/routers/Community.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize"); // If using role-based authorization
const CommunityController = require("../controllers/communityController");
const uploadCommunity = require("../middlewares/uploadCommunity");
const questionController = require("../controllers/questionController");

// Create a new community (Professor and Admin only)
router.post(
  "/",
  auth, // Ensure the user is authenticated
  uploadCommunity, // Handle 'avatar' and 'files' fields
  authorizeRoles("professor", "admin"), // Role-based access
  CommunityController.createCommunity
);

// Get all communities
router.get("/", auth, CommunityController.getAllCommunities);

// Fetch user's communities
router.get("/user", auth, CommunityController.getUserCommunities);

// Join a community
router.post(
  "/:id/join",
  auth,
  authorizeRoles("student", "professor", "admin"), // Adjust roles as needed
  CommunityController.joinCommunity
);

// Leave a community
router.post(
  "/:id/leave",
  auth,
  authorizeRoles("student", "professor", "admin"), // Allow multiple roles
  CommunityController.leaveCommunity
);

// Get community by ID
router.get("/:id", auth, CommunityController.getCommunityById);

module.exports = router;

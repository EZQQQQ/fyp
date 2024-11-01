// /backend/routers/Community.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize"); // If using role-based authorization
const CommunityController = require("../controllers/communityController");

// Create a new community (Professor and Admin only)
router.post(
  "/",
  auth,
  authorizeRoles("professor", "admin"), // Use role-based middleware
  CommunityController.createCommunity
);

// Get all communities
router.get("/", auth, CommunityController.getAllCommunities);

// Join a community (Student only)
router.post(
  "/:id/join",
  auth,
  authorizeRoles("student", "professor", "admin"), // Adjust roles as needed
  CommunityController.joinCommunity
);

// Optional: Leave a community
router.post(
  "/:id/leave",
  auth,
  authorizeRoles("student", "professor", "admin"), // Allow multiple roles
  CommunityController.leaveCommunity
);

module.exports = router;

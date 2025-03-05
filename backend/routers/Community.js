// /backend/routers/Community.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize"); // Role-based authorization middleware
const CommunityController = require("../controllers/communityController");
const uploadCommunity = require("../middlewares/uploadCommunity");
const questionController = require("../controllers/questionController");

// Refresh community code route (professor and admin only)
router.post(
  "/:id/refresh-code",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.refreshCommunityCode
);

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

// Route to get questions by community ID
router.get("/:id/questions", auth, questionController.getQuestionsByCommunity);

// Check if community name exists
router.get("/check/:name", auth, CommunityController.checkCommunityName);

// Routes to manage assessment tasks (protected)
router.post(
  "/:communityId/assessment-tasks",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.createAssessmentTask
);

router.put(
  "/:communityId/assessment-tasks/:taskId",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.updateAssessmentTask
);

router.delete(
  "/:communityId/assessment-tasks/:taskId",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.deleteAssessmentTask
);

// Route to get assessment tasks for a community
router.get(
  "/:id/assessment-tasks",
  auth,
  CommunityController.getAssessmentTasks
);

// Route to get user participation metrics
router.get(
  "/:communityId/user-participation",
  auth,
  CommunityController.getUserParticipation
);

// Route to get participation data for all members in a community
router.get(
  "/:communityId/all-participation",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.getAllParticipation
);


module.exports = router;

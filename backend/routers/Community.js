// /backend/routers/Community.js

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorize");
const assignCommunityId = require("../middlewares/assignCommunityId");
const CommunityController = require("../controllers/communityController");
const uploadCommunity = require("../middlewares/uploadCommunity");
const questionController = require("../controllers/questionController");

/**
 * @swagger
 * tags:
 *   name: Community
 *   description: API for managing communities
 */

/**
 * @swagger
 * /api/communities/{id}/refresh-code:
 *   post:
 *     summary: Refresh community code (professor and admin only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Community code refreshed successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Server error.
 */
router.post(
  "/:id/refresh-code",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.refreshCommunityCode
);

/**
 * @swagger
 * /api/communities:
 *   post:
 *     summary: Create a new community (Professor and Admin only)
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Community created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Server error.
 */
router.post(
  "/",
  auth,
  authorizeRoles("professor", "admin"),
  assignCommunityId,
  uploadCommunity,
  CommunityController.createCommunity
);

/**
 * @swagger
 * /api/communities:
 *   get:
 *     summary: Get all communities
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of communities.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", auth, CommunityController.getAllCommunities);

/**
 * @swagger
 * /api/communities/user:
 *   get:
 *     summary: Fetch user's communities
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of communities for the user.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/user", auth, CommunityController.getUserCommunities);

/**
 * @swagger
 * /api/communities/{id}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID to join.
 *     responses:
 *       200:
 *         description: Joined community successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/:id/join",
  auth,
  authorizeRoles("student", "professor", "admin"),
  CommunityController.joinCommunity
);

/**
 * @swagger
 * /api/communities/{id}/leave:
 *   post:
 *     summary: Leave a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID to leave.
 *     responses:
 *       200:
 *         description: Left community successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/:id/leave",
  auth,
  authorizeRoles("student", "professor", "admin"),
  CommunityController.leaveCommunity
);

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: Get community by ID
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Returns community details.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/:id", auth, CommunityController.getCommunityById);

/**
 * @swagger
 * /api/communities/{id}/questions:
 *   get:
 *     summary: Get questions by community ID
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Returns a list of questions for the community.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/:id/questions", auth, questionController.getQuestionsByCommunity);

/**
 * @swagger
 * /api/communities/check/{name}:
 *   get:
 *     summary: Check if community name exists
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Community name to check.
 *     responses:
 *       200:
 *         description: Returns whether the community name exists.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/check/:name", auth, CommunityController.checkCommunityName);

/**
 * @swagger
 * /api/communities/{communityId}/assessment-tasks:
 *   post:
 *     summary: Create an assessment task
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assessment task created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.post(
  "/:communityId/assessment-tasks",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.createAssessmentTask
);

/**
 * @swagger
 * /api/communities/{communityId}/assessment-tasks/{taskId}:
 *   put:
 *     summary: Update an assessment task
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assessment task updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.put(
  "/:communityId/assessment-tasks/:taskId",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.updateAssessmentTask
);

/**
 * @swagger
 * /api/communities/{communityId}/assessment-tasks/{taskId}:
 *   delete:
 *     summary: Delete an assessment task
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID.
 *     responses:
 *       200:
 *         description: Assessment task deleted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.delete(
  "/:communityId/assessment-tasks/:taskId",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.deleteAssessmentTask
);

/**
 * @swagger
 * /api/communities/{id}/assessment-tasks:
 *   get:
 *     summary: Get assessment tasks for a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Returns a list of assessment tasks.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/:id/assessment-tasks",
  auth,
  CommunityController.getAssessmentTasks
);

/**
 * @swagger
 * /api/communities/{communityId}/user-participation:
 *   get:
 *     summary: Get user participation metrics in a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Returns participation metrics for the user.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  "/:communityId/user-participation",
  auth,
  CommunityController.getUserParticipation
);

/**
 * @swagger
 * /api/communities/{communityId}/all-participation:
 *   get:
 *     summary: Get participation data for all members in a community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: communityId
 *         schema:
 *           type: string
 *         required: true
 *         description: Community ID.
 *     responses:
 *       200:
 *         description: Returns participation data for all members.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
  "/:communityId/all-participation",
  auth,
  authorizeRoles("professor", "admin"),
  CommunityController.getAllParticipation
);

module.exports = router;

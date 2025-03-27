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

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for managing users and authentication
 */

/**
 * @swagger
 * /api/user/sso-login:
 *   post:
 *     summary: SSO Login for a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ssoToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: SSO login successful.
 *       400:
 *         description: Bad request.
 */
router.post("/sso-login", ssoLoginUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Admin Login for a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       400:
 *         description: Bad request.
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/user/create-profile:
 *   post:
 *     summary: Create user profile with profile photo upload
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/create-profile",
  auth,
  uploadProfile.single("profilePicture"),
  createUserProfile
);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get the user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/profile", auth, getUserProfile);

/**
 * @swagger
 * /api/user/profile/hide-dashboard:
 *   put:
 *     summary: Update hideDashboard preference for the user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hideDashboard:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preference updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.put("/profile/hide-dashboard", auth, updateHideDashboardPreference);

/**
 * @swagger
 * /api/user/settings:
 *   post:
 *     summary: Update user settings
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               settingsData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/settings",
  auth,
  uploadProfile.fields([{ name: 'profilePicture', maxCount: 1 }]),
  updateSettings
);

/**
 * @swagger
 * /api/user/profile:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               profileBanner:
 *                 type: string
 *                 format: binary
 *               profileData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
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

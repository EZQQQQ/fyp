// backend/routers/Notification.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const notificationController = require("../controllers/notificationController");

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API for managing notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.post("/", auth, notificationController.createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Fetch notifications for the current user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of notifications.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.get("/", auth, notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Notification ID.
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 */
router.patch("/:id", auth, notificationController.markNotificationAsRead);

module.exports = router;

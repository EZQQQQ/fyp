// backend/routers/Notification.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const notificationController = require("../controllers/notificationController");

// Create a notification
router.post("/", auth, notificationController.createNotification);

// Fetch notifications for a user
router.get("/", auth, notificationController.getNotifications);

// Mark a notification as read
router.patch("/:id", auth, notificationController.markNotificationAsRead);

module.exports = router;

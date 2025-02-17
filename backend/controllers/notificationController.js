// backend/controllers/notificationController.js
const Notification = require("../models/Notification");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { recipient, sender, community, type, content } = req.body;
    const notification = await Notification.create({
      recipient,
      sender,
      community,
      type,
      content,
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for a specific user
const getNotifications = async (req, res) => {
  try {
    const userId = req.query.userId;
    // console.log("Fetching notifications for userId:", userId);

    // Populate sender (with username, name, and profilePicture) and community (with name)
    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "username name profilePicture")
      .populate("community", "name")
      .populate("questionId", "title")
      .sort({ createdAt: -1 });

    // console.log("Fetched notifications count:", notifications.length);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params._id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
};

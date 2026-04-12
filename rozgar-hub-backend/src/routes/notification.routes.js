const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(verifyToken);

// Get all notifications for logged-in user
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark single notification as read
router.put("/:notificationId/read", markNotificationRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllNotificationsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

module.exports = router;

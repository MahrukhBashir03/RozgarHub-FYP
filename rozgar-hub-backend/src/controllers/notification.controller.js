const Notification = require("../models/Notification");
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../utils/notificationHelper");

// Get all notifications for logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const result = await getNotifications(userId, limit, skip);

    if (!result) {
      return res
        .status(500)
        .json({ success: false, message: "Error fetching notifications" });
    }

    res.status(200).json({
      success: true,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        total: result.total,
        page,
        pages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    console.error("Error in getNotifications:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch notifications",
        error: err.message,
      });
  }
};

// Mark a single notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Verify notification belongs to user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Notification not found or unauthorized",
        });
    }

    await markAsRead(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (err) {
    console.error("Error in markNotificationRead:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark notification as read",
        error: err.message,
      });
  }
};

// Mark all notifications as read
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("Error in markAllNotificationsRead:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to mark all notifications as read",
        error: err.message,
      });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    // Verify notification belongs to user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Notification not found or unauthorized",
        });
    }

    await deleteNotification(notificationId);

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error("Error in deleteNotification:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete notification",
        error: err.message,
      });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to get unread count",
        error: err.message,
      });
  }
};

const Notification = require("../models/Notification");

/**
 * Create a notification for a user
 */
const createNotification = async (recipientId, type, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: options.sender || null,
      type,
      title,
      message,
      relatedId: options.relatedId || null,
      relatedModel: options.relatedModel || null,
      data: options.data || {},
    });

    console.log(`✅ Notification created: ${type} for user ${recipientId}`);
    return notification;
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
    return null;
  }
};

/**
 * Get user's notifications
 */
const getNotifications = async (userId, limit = 20, skip = 0) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("sender", "name");

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return {
      notifications,
      unreadCount,
      total: await Notification.countDocuments({ recipient: userId }),
    };
  } catch (err) {
    console.error("❌ Error fetching notifications:", err.message);
    return null;
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId) => {
  try {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    return true;
  } catch (err) {
    console.error("❌ Error marking notification as read:", err.message);
    return false;
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    return true;
  } catch (err) {
    console.error("❌ Error marking all notifications as read:", err.message);
    return false;
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId) => {
  try {
    await Notification.findByIdAndDelete(notificationId);
    return true;
  } catch (err) {
    console.error("❌ Error deleting notification:", err.message);
    return false;
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

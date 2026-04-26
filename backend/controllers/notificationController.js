import Notification from '../models/Notification.js';

/**
 * Get all notifications for the current user
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.userId,
      collegeId: req.user.collegeId
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Utility for other controllers to create notifications
 */
export const createNotification = async ({ userId, collegeId, message, type, link = null }) => {
  try {
    return await Notification.create({
      userId,
      collegeId,
      message,
      type,
      link
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

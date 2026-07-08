const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Helper to validate Mongo ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('relatedTrip', 'destination status')
      .populate('relatedUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to recent 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Notification ID' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Verify ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: 'Server error updating notification status' });
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ message: 'Server error updating notifications' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient user reference is required']
  },
  type: {
    type: String,
    enum: {
      values: ['RequestSent', 'RequestAccepted', 'RequestRejected'],
      message: '{VALUE} is not a valid notification type'
    },
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTrip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Related trip reference is required']
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Related user reference is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);

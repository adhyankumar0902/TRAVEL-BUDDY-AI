const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Trip reference is required']
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester reference is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Trip owner reference is required']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [300, 'Message cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Ensure a user cannot send duplicate requests for the same trip
joinRequestSchema.index({ trip: 1, requester: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);

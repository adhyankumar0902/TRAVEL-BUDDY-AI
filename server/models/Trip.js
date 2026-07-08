const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Trip owner is required']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be a positive number']
  },
  travelStyle: {
    type: String,
    enum: {
      values: ['Adventure', 'Backpacking', 'Luxury', 'Road Trip', 'Camping', 'Solo', 'Family', 'Business'],
      message: '{VALUE} is not a valid travel style'
    },
    required: [true, 'Travel style is required']
  },
  transportation: {
    type: String,
    enum: {
      values: ['Flight', 'Train', 'Bus', 'Car', 'Bike'],
      message: '{VALUE} is not a valid transportation'
    }
  },
  accommodation: {
    type: String,
    enum: {
      values: ['Hotel', 'Hostel', 'Homestay', 'Resort', 'Any'],
      message: '{VALUE} is not a valid accommodation'
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  maxTravelers: {
    type: Number,
    min: [2, 'Maximum travelers must be at least 2']
  },
  genderPreference: {
    type: String,
    enum: {
      values: ['Male Only', 'Female Only', 'Mixed', 'No Preference'],
      message: '{VALUE} is not a valid gender preference'
    }
  },
  agePreference: {
    type: String,
    enum: {
      values: ['18-25', '26-35', '36-50', '50+', 'No Preference'],
      message: '{VALUE} is not a valid age preference'
    }
  },
  visibility: {
    type: String,
    enum: {
      values: ['Public', 'Private'],
      message: '{VALUE} is not a valid visibility type'
    },
    default: 'Public'
  },
  status: {
    type: String,
    enum: {
      values: ['Planning', 'Open for Partners', 'Matched', 'In Progress', 'Completed', 'Cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Planning'
  },
  tripTags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);

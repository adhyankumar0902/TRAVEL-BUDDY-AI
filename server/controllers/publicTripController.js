const mongoose = require('mongoose');
const Trip = require('../models/Trip');

// Helper to validate Mongo ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all public trips from other users
// @route   GET /api/public-trips
// @access  Private
const getPublicTrips = async (req, res) => {
  try {
    const { destination, travelStyle, budget, startDate, endDate } = req.query;

    // Base query: public visibility, not owned by current user, not completed or cancelled
    const query = {
      visibility: 'Public',
      owner: { $ne: req.user._id },
      status: { $nin: ['Completed', 'Cancelled'] }
    };

    // Apply combined filters
    if (destination && destination.trim() !== '') {
      query.destination = { $regex: destination.trim(), $options: 'i' };
    }

    if (travelStyle && travelStyle.trim() !== '') {
      query.travelStyle = travelStyle;
    }

    if (budget) {
      const parsedBudget = Number(budget);
      if (!isNaN(parsedBudget) && parsedBudget > 0) {
        query.budget = { $lte: parsedBudget };
      }
    }

    // Date filters: find trips whose dates fall within or start after specified values
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        query.startDate = { $gte: start };
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        query.endDate = { $lte: end };
      }
    }

    const trips = await Trip.find(query)
      .populate('owner', 'name profileImage')
      .populate('members', 'name profileImage')
      .sort({ startDate: 1 }); // Sort by start date (soonest first)

    res.json(trips);
  } catch (error) {
    console.error('Get Public Trips Error:', error);
    res.status(500).json({ message: 'Server error retrieving public trips' });
  }
};

// @desc    Get public trip by ID details
// @route   GET /api/public-trips/:id
// @access  Private
const getPublicTripById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Trip ID' });
    }

    const trip = await Trip.findById(id)
      .populate('owner', 'name email profileImage bio location languages interests travelStyle age gender')
      .populate('members', 'name profileImage bio location travelStyle age gender');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Security check: Private trips only accessible by owner
    if (trip.visibility === 'Private' && trip.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Private trip' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get Public Trip By ID Error:', error);
    res.status(500).json({ message: 'Server error retrieving trip details' });
  }
};

module.exports = {
  getPublicTrips,
  getPublicTripById
};

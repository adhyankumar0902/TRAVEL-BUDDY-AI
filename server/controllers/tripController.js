const Trip = require('../models/Trip');

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget,
      travelStyle,
      transportation,
      accommodation,
      description,
      maxTravelers,
      genderPreference,
      agePreference,
      visibility,
      status,
      tripTags
    } = req.body;

    // 1. Validation Checks
    if (!destination || destination.trim() === '') {
      return res.status(400).json({ message: 'Destination is required' });
    }

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'End date is required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    if (budget === undefined || budget === null) {
      return res.status(400).json({ message: 'Budget is required' });
    }

    const parsedBudget = Number(budget);
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      return res.status(400).json({ message: 'Budget must be a positive number greater than 0' });
    }

    if (!travelStyle) {
      return res.status(400).json({ message: 'Travel style is required' });
    }

    if (maxTravelers !== undefined && maxTravelers !== null && maxTravelers !== '') {
      const parsedMaxTravelers = Number(maxTravelers);
      if (isNaN(parsedMaxTravelers) || parsedMaxTravelers < 2) {
        return res.status(400).json({ message: 'Maximum travelers must be at least 2' });
      }
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Description cannot exceed 500 characters' });
    }

    // 2. Create Trip Object
    const trip = new Trip({
      owner: req.user._id,
      destination,
      startDate: start,
      endDate: end,
      budget: parsedBudget,
      travelStyle,
      transportation,
      accommodation,
      description,
      maxTravelers: maxTravelers || undefined,
      genderPreference,
      agePreference,
      visibility: visibility || 'Public',
      status: status || 'Planning',
      tripTags: tripTags || []
    });

    const createdTrip = await trip.save();
    res.status(201).json(createdTrip);
  } catch (error) {
    console.error('Create Trip Error:', error);
    res.status(500).json({ message: 'Server error creating trip' });
  }
};

// @desc    Get logged in user's trips
// @route   GET /api/trips
// @access  Private
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get My Trips Error:', error);
    res.status(500).json({ message: 'Server error retrieving trips' });
  }
};

// @desc    Get trip by ID
// @route   GET /api/trips/:id
// @access  Private
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('owner', 'name email profileImage');
    
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Security check: Private trips only accessible by owner
    if (trip.visibility === 'Private' && trip.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Private trip' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get Trip By ID Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error retrieving trip details' });
  }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Security check: Ensure requesting user is the owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    const {
      destination,
      startDate,
      endDate,
      budget,
      travelStyle,
      transportation,
      accommodation,
      description,
      maxTravelers,
      genderPreference,
      agePreference,
      visibility,
      status,
      tripTags
    } = req.body;

    // 1. Validation Checks
    if (destination !== undefined) {
      if (!destination || destination.trim() === '') {
        return res.status(400).json({ message: 'Destination is required' });
      }
      trip.destination = destination;
    }

    // Calculate dates validation dynamically
    const startVal = startDate !== undefined ? new Date(startDate) : new Date(trip.startDate);
    const endVal = endDate !== undefined ? new Date(endDate) : new Date(trip.endDate);

    if (startDate !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only reject if starting date changes to a new date in the past
      if (startVal < today && startVal.toDateString() !== new Date(trip.startDate).toDateString()) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }
      trip.startDate = startVal;
    }

    if (endDate !== undefined) {
      trip.endDate = endVal;
    }

    // Ensure dates are logically sound
    if (endVal < startVal) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    if (budget !== undefined) {
      if (budget === null || budget === '') {
        return res.status(400).json({ message: 'Budget is required' });
      }
      const parsedBudget = Number(budget);
      if (isNaN(parsedBudget) || parsedBudget <= 0) {
        return res.status(400).json({ message: 'Budget must be a positive number greater than 0' });
      }
      trip.budget = parsedBudget;
    }

    if (travelStyle !== undefined) {
      if (!travelStyle) {
        return res.status(400).json({ message: 'Travel style is required' });
      }
      trip.travelStyle = travelStyle;
    }

    if (maxTravelers !== undefined) {
      if (maxTravelers === null || maxTravelers === '') {
        trip.maxTravelers = undefined;
      } else {
        const parsedMaxTravelers = Number(maxTravelers);
        if (isNaN(parsedMaxTravelers) || parsedMaxTravelers < 2) {
          return res.status(400).json({ message: 'Maximum travelers must be at least 2' });
        }
        trip.maxTravelers = parsedMaxTravelers;
      }
    }

    if (description !== undefined) {
      if (description && description.length > 500) {
        return res.status(400).json({ message: 'Description cannot exceed 500 characters' });
      }
      trip.description = description;
    }

    if (transportation !== undefined) trip.transportation = transportation;
    if (accommodation !== undefined) trip.accommodation = accommodation;
    if (genderPreference !== undefined) trip.genderPreference = genderPreference;
    if (agePreference !== undefined) trip.agePreference = agePreference;
    if (visibility !== undefined) trip.visibility = visibility;
    if (status !== undefined) trip.status = status;
    if (tripTags !== undefined) trip.tripTags = tripTags;

    // 2. Save Updated Trip
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Update Trip Error:', error);
    res.status(500).json({ message: 'Server error updating trip' });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Security check: Ensure requesting user is the owner
    if (trip.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this trip' });
    }

    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.status(500).json({ message: 'Server error deleting trip' });
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip
};

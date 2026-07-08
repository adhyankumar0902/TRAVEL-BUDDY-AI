const mongoose = require('mongoose');
const JoinRequest = require('../models/JoinRequest');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');

// Helper to validate Mongo ObjectIds
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a join request
// @route   POST /api/join-requests
// @access  Private
const createJoinRequest = async (req, res) => {
  try {
    const { tripId, message } = req.body;

    if (!tripId || !isValidObjectId(tripId)) {
      return res.status(400).json({ message: 'Invalid or missing Trip ID' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // 1. A user cannot join a private trip
    if (trip.visibility === 'Private') {
      return res.status(403).json({ message: 'Cannot request to join a private trip' });
    }

    // 2. A user cannot join a completed or cancelled trip
    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return res.status(400).json({ message: `Cannot join a ${trip.status.toLowerCase()} trip` });
    }

    // 3. A user cannot join their own trip
    if (trip.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request to join your own trip' });
    }

    // 4. A user cannot join if they are already a member of the trip
    if (trip.members && trip.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this trip' });
    }

    // 5. Prevent duplicate join requests (if an active pending or accepted request exists, or any request exists)
    // To be perfectly safe, check if any JoinRequest document exists that is not Cancelled.
    // If they cancelled, they can request again, but if it is Pending, Accepted, or Rejected, they shouldn't send another request.
    const existingRequest = await JoinRequest.findOne({
      trip: tripId,
      requester: req.user._id,
      status: { $in: ['Pending', 'Accepted', 'Rejected'] }
    });

    if (existingRequest) {
      if (existingRequest.status === 'Accepted') {
        return res.status(400).json({ message: 'Your request was already accepted for this trip' });
      }
      return res.status(400).json({ message: `You already have a ${existingRequest.status.toLowerCase()} request for this trip` });
    }

    // 6. Prevent requesting full trips
    if (trip.maxTravelers) {
      const currentMembersCount = trip.members ? trip.members.length : 0;
      const availableSeats = trip.maxTravelers - 1 - currentMembersCount;
      if (availableSeats <= 0) {
        return res.status(400).json({ message: 'This trip is already full' });
      }
    }

    // Create JoinRequest
    const joinRequest = new JoinRequest({
      trip: tripId,
      requester: req.user._id,
      owner: trip.owner,
      message: message || ''
    });

    const savedRequest = await joinRequest.save();

    // Create in-app notification for the trip owner
    const newNotification = new Notification({
      user: trip.owner,
      type: 'RequestSent',
      message: `${req.user.name} requested to join your trip to ${trip.destination}.`,
      relatedTrip: trip._id,
      relatedUser: req.user._id
    });
    await newNotification.save();

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Create Join Request Error:', error);
    res.status(500).json({ message: 'Server error creating join request' });
  }
};

// @desc    Get all join requests for current user (incoming as owner, outgoing as requester)
// @route   GET /api/join-requests
// @access  Private
const getJoinRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Incoming requests (requests on trips owned by the user)
    const incoming = await JoinRequest.find({ owner: userId })
      .populate('trip', 'destination startDate endDate maxTravelers members status visibility')
      .populate('requester', 'name email profileImage bio age gender travelStyle interests')
      .sort({ createdAt: -1 });

    // Outgoing requests (requests made by the user to other owners)
    const outgoing = await JoinRequest.find({ requester: userId })
      .populate('trip', 'destination startDate endDate maxTravelers members status visibility owner')
      .populate('owner', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    console.error('Get Join Requests Error:', error);
    res.status(500).json({ message: 'Server error retrieving join requests' });
  }
};

// @desc    Accept a join request
// @route   PUT /api/join-requests/:id/accept
// @access  Private
const acceptJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Request ID' });
    }

    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Verify request belongs to a trip owned by this user
    if (joinRequest.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Verify request is still pending
    if (joinRequest.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot accept a request that is already ${joinRequest.status.toLowerCase()}` });
    }

    const trip = await Trip.findById(joinRequest.trip);
    if (!trip) {
      return res.status(404).json({ message: 'Trip associated with this request not found' });
    }

    // Verify requester is not already a member
    if (trip.members && trip.members.includes(joinRequest.requester)) {
      joinRequest.status = 'Accepted';
      await joinRequest.save();
      return res.status(400).json({ message: 'Requester is already a member of this trip' });
    }

    // Verify seats are available
    if (trip.maxTravelers) {
      const currentMembersCount = trip.members ? trip.members.length : 0;
      const availableSeats = trip.maxTravelers - 1 - currentMembersCount;
      if (availableSeats <= 0) {
        return res.status(400).json({ message: 'Trip is already full. Cannot accept more members.' });
      }
    }

    // Perform state transitions
    joinRequest.status = 'Accepted';
    await joinRequest.save();

    // Add requester as member of the trip
    if (!trip.members) {
      trip.members = [];
    }
    trip.members.push(joinRequest.requester);
    await trip.save();

    // Create in-app notification for the requester
    const newNotification = new Notification({
      user: joinRequest.requester,
      type: 'RequestAccepted',
      message: `Your request to join the trip to ${trip.destination} has been accepted!`,
      relatedTrip: trip._id,
      relatedUser: req.user._id
    });
    await newNotification.save();

    res.json(joinRequest);
  } catch (error) {
    console.error('Accept Join Request Error:', error);
    res.status(500).json({ message: 'Server error accepting join request' });
  }
};

// @desc    Reject a join request
// @route   PUT /api/join-requests/:id/reject
// @access  Private
const rejectJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Request ID' });
    }

    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    // Verify ownership
    if (joinRequest.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    // Verify request is still pending
    if (joinRequest.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot reject a request that is already ${joinRequest.status.toLowerCase()}` });
    }

    const trip = await Trip.findById(joinRequest.trip);
    if (!trip) {
      return res.status(404).json({ message: 'Trip associated with this request not found' });
    }

    // Reject request
    joinRequest.status = 'Rejected';
    await joinRequest.save();

    // Create in-app notification for the requester
    const newNotification = new Notification({
      user: joinRequest.requester,
      type: 'RequestRejected',
      message: `Your request to join the trip to ${trip.destination} was not accepted.`,
      relatedTrip: trip._id,
      relatedUser: req.user._id
    });
    await newNotification.save();

    res.json(joinRequest);
  } catch (error) {
    console.error('Reject Join Request Error:', error);
    res.status(500).json({ message: 'Server error rejecting join request' });
  }
};

// @desc    Delete or cancel a join request
// @route   DELETE /api/join-requests/:id
// @access  Private
const deleteJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid Request ID' });
    }

    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    const userIdStr = req.user._id.toString();

    // Requester cancels their own pending request
    if (joinRequest.requester.toString() === userIdStr) {
      if (joinRequest.status !== 'Pending') {
        return res.status(400).json({ message: 'You can only cancel pending requests' });
      }

      joinRequest.status = 'Cancelled';
      const updatedRequest = await joinRequest.save();
      return res.json(updatedRequest);
    }

    // Trip Owner deletes a request
    if (joinRequest.owner.toString() === userIdStr) {
      // If the request was Accepted, pull requester from trip.members
      if (joinRequest.status === 'Accepted') {
        const trip = await Trip.findById(joinRequest.trip);
        if (trip && trip.members) {
          trip.members = trip.members.filter(m => m.toString() !== joinRequest.requester.toString());
          await trip.save();
        }
      }

      await joinRequest.deleteOne();
      return res.json({ message: 'Join request deleted successfully' });
    }

    // Neither owner nor requester
    res.status(403).json({ message: 'Not authorized to modify this request' });
  } catch (error) {
    console.error('Delete Join Request Error:', error);
    res.status(500).json({ message: 'Server error deleting join request' });
  }
};

module.exports = {
  createJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  deleteJoinRequest
};

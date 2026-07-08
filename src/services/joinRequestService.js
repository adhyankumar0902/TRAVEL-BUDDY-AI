import api from './api';

// Create a join request for a public trip
const createJoinRequest = async (tripId, message) => {
  const response = await api.post('/join-requests', { tripId, message });
  return response.data;
};

// Retrieve all join requests (incoming & outgoing)
const getJoinRequests = async () => {
  const response = await api.get('/join-requests');
  return response.data;
};

// Accept a join request (for trip owners)
const acceptJoinRequest = async (id) => {
  const response = await api.put(`/join-requests/${id}/accept`);
  return response.data;
};

// Reject a join request (for trip owners)
const rejectJoinRequest = async (id) => {
  const response = await api.put(`/join-requests/${id}/reject`);
  return response.data;
};

// Cancel (for requesters) or Delete (for owners) a join request
const deleteJoinRequest = async (id) => {
  const response = await api.delete(`/join-requests/${id}`);
  return response.data;
};

const joinRequestService = {
  createJoinRequest,
  getJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
  deleteJoinRequest
};

export default joinRequestService;

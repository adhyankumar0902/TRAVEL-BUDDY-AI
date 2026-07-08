import api from './api';

// Create a new trip
const createTrip = async (tripData) => {
  const response = await api.post('/trips', tripData);
  return response.data;
};

// Retrieve all trips belonging to the logged-in user
const getMyTrips = async () => {
  const response = await api.get('/trips');
  return response.data;
};

// Retrieve a single trip by ID
const getTrip = async (id) => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

// Update an existing trip by ID
const updateTrip = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, tripData);
  return response.data;
};

// Delete a trip by ID
const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};

// Discover public trips of other users
const getPublicTrips = async (filters = {}) => {
  const response = await api.get('/public-trips', { params: filters });
  return response.data;
};

// Retrieve details for a public trip
const getPublicTripDetails = async (id) => {
  const response = await api.get(`/public-trips/${id}`);
  return response.data;
};

const tripService = {
  createTrip,
  getMyTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getPublicTrips,
  getPublicTripDetails
};

export default tripService;

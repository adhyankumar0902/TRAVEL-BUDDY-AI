import api from './api';

// Fetch the logged-in user's profile
const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

// Update the logged-in user's profile
const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Fetch another user's public profile by ID
const getPublicProfile = async (id) => {
  const response = await api.get(`/profile/${id}`);
  return response.data;
};

const profileService = {
  getProfile,
  updateProfile,
  getPublicProfile,
};

export default profileService;

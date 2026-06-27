import api from './api';

// Registers a new user
const signup = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data; // Should return { _id, name, email, token }
};

// Logs in an existing user
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data; // Should return { _id, name, email, token }
};

// Gets details of currently authenticated user based on active session JWT
const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data; // Should return user details { _id, name, email, createdAt }
};

const authService = {
  signup,
  login,
  getCurrentUser,
};

export default authService;

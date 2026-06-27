import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Proxied via Vite config to localhost:5000 in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the Bearer token
api.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, append it to authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

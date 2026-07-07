import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the Context for Auth
const AuthContext = createContext(null);

// Custom hook to consume the Auth Context easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if a user is already logged in on application startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch user details from the database
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error('Session restoration failed:', err);
          // Token is likely invalid or expired; clean up
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Action: Sign Up User
  const signupUser = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.signup(name, email, password);
      // Save token in localStorage
      localStorage.setItem('token', data.token);
      // Set user object in state
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email
      });
      setLoading(false);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  // Action: Login User
  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      // Save token in localStorage
      localStorage.setItem('token', data.token);
      // Set user object in state
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email
      });
      setLoading(false);
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  // Action: Logout User
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // Action: Update User details in state
  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      if (!prev) return updatedUserData;
      return {
        ...prev,
        ...updatedUserData
      };
    });
  };

  // Object containing context values
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signupUser,
    loginUser,
    logoutUser,
    updateUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

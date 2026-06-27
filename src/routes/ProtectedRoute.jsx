import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // If restoring auth session, render loading spinner rather than redirecting immediately
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authenticated, render matching nested Route child (via Outlet), else redirect to Login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

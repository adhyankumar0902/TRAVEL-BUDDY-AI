import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import EditProfilePage from '../pages/EditProfilePage';
import CreateTripPage from '../pages/CreateTripPage';
import MyTripsPage from '../pages/MyTripsPage';
import TripDetailsPage from '../pages/TripDetailsPage';
import EditTripPage from '../pages/EditTripPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes (Require Authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        
        {/* Trip Management Routes */}
        <Route path="/trips/create" element={<CreateTripPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/:id" element={<TripDetailsPage />} />
        <Route path="/trips/edit/:id" element={<EditTripPage />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

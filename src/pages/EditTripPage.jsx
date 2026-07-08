import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Compass, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import TripFormWizard from '../components/trip/TripFormWizard';
import tripService from '../services/tripService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const EditTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch trip details on mount
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const data = await tripService.getTrip(id);
        
        // Prevent editing if the user is not the owner
        const ownerId = data.owner?._id || data.owner;
        if (user && ownerId && ownerId.toString() !== user._id.toString()) {
          setError('You are not authorized to edit this trip.');
          setLoading(false);
          return;
        }

        setTrip(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip for edit:', err);
        const errMsg = err.response?.data?.message || 'Failed to load trip details. It might have been deleted.';
        setError(errMsg);
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id, user]);

  const handleEditSubmit = async (updatedData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await tripService.updateTrip(id, updatedData);
      // Redirect to My Trips page on success
      navigate('/trips');
    } catch (err) {
      console.error('Error updating trip:', err);
      const backendMessage = err.response?.data?.message || 'Failed to update trip. Please try again.';
      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-brand-500" />
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Travel<span className="text-brand-500">Buddy</span> <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-normal">AI</span>
            </span>
          </Link>
          <Link 
            to="/trips" 
            className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 border border-slate-700/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Trips</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
        
        {/* Banner Title */}
        <div className="text-left max-w-4xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Edit Your Trip
          </h1>
          <p className="text-slate-400 font-light text-sm">
            Modify details, status, or preferences for your trip to {trip?.destination || 'your destination'}.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Loading Trip Details...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && !trip && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Something went wrong</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <Link 
              to="/trips" 
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Go to My Trips
            </Link>
          </div>
        )}

        {/* Global Error Display (For submission failure when trip is loaded) */}
        {!loading && error && trip && (
          <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && trip && (
          <TripFormWizard 
            initialData={trip}
            onSubmit={handleEditSubmit}
            submitButtonText="Save Changes"
            isSubmitting={isSubmitting}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Trip Planner.</p>
      </footer>
    </div>
  );
};

export default EditTripPage;

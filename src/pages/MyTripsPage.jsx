import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, Plus, Calendar, DollarSign, Eye, Edit, Trash2, 
  MapPin, AlertCircle, Compass as CompassIcon, Lock, Globe, Sparkles
} from 'lucide-react';
import tripService from '../services/tripService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

// Local date display helper to avoid off-by-one errors
const formatDateLocal = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  // Force local date formatting
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_BADGES = {
  'Planning': 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  'Open for Partners': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Matched': 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  'In Progress': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Completed': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  'Cancelled': 'bg-red-500/10 text-red-400 border border-red-500/20'
};

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion Modal state
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getMyTrips();
      setTrips(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching my trips:', err);
      const errMsg = err.response?.data?.message || 'Failed to retrieve your trips. Please check your connection.';
      setError(errMsg);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteClick = (tripId) => {
    setTripToDelete(tripId);
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;

    setIsDeleting(true);
    try {
      await tripService.deleteTrip(tripToDelete);
      // Update state directly without reloading the entire page
      setTrips(prev => prev.filter(t => t._id !== tripToDelete));
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert(err.response?.data?.message || 'Failed to delete the trip.');
    } finally {
      setIsDeleting(false);
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
          <div className="flex items-center gap-3">
            <Link 
              to="/trips/create" 
              className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/10 border border-brand-500/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Trip</span>
            </Link>
            <Link 
              to="/dashboard" 
              className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 border border-slate-700/30 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Trips
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Manage your created itineraries, check status, or look for matched co-travelers.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Retrieving your trips...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Error Loading Trips</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={fetchTrips}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="max-w-xl mx-auto glass-panel p-10 rounded-3xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center animate-pulse-slow border border-brand-500/25">
              <CompassIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">No Trips Planned Yet</h2>
              <p className="text-slate-400 font-light text-sm max-w-sm mx-auto leading-relaxed">
                Start planning your first adventure. Create an itinerary, select preferences, and begin matchmaking.
              </p>
            </div>
            <Link 
              to="/trips/create" 
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/20 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/15"
            >
              <Plus className="h-4 w-4" />
              <span>Plan Your First Trip</span>
            </Link>
          </div>
        )}

        {/* Content State (Trips Grid) */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div 
                key={trip._id} 
                className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/85 glass-panel-hover"
              >
                {/* Upper section */}
                <div className="p-6 space-y-4">
                  {/* Header Row (Style + Visibility) */}
                  <div className="flex items-center justify-between">
                    <span className="bg-brand-500/10 text-brand-300 border border-brand-500/15 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {trip.travelStyle}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {trip.visibility === 'Private' ? (
                        <>
                          <Lock className="h-3 w-3 text-amber-500" />
                          <span>Private</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 text-brand-400" />
                          <span>Public</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-white tracking-tight flex items-start gap-1.5">
                      <MapPin className="h-5 w-5 text-brand-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate">{trip.destination}</span>
                    </h3>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest ${STATUS_BADGES[trip.status] || 'bg-slate-850 text-slate-300'}`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>

                  {/* Dates & Budget */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-slate-450 text-xs font-light">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>{formatDateLocal(trip.startDate)} - {formatDateLocal(trip.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-450 text-xs font-light">
                      <span className="text-sm font-bold text-brand-500 w-4 text-center">₹</span>
                      <span className="text-sm font-semibold text-white">₹{trip.budget} INR</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {trip.tripTags && trip.tripTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {trip.tripTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-navy-800/50 text-slate-400 border border-slate-800/80 px-2 py-0.5 rounded-md text-[9px] font-medium">
                          {tag}
                        </span>
                      ))}
                      {trip.tripTags.length > 3 && (
                        <span className="text-[9px] text-slate-500 font-semibold px-1.5 py-0.5">
                          +{trip.tripTags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-800/60 bg-navy-950/20 px-6 py-4 flex items-center justify-between gap-3">
                  <Link 
                    to={`/trips/${trip._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-navy-800/50 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer h-9"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </Link>
                  <Link 
                    to={`/trips/edit/${trip._id}`}
                    className="flex items-center justify-center bg-navy-800/50 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/20 text-slate-350 hover:text-brand-400 w-9 h-9 rounded-xl transition-all cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(trip._id)}
                    className="flex items-center justify-center bg-navy-800/50 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-350 hover:text-red-400 w-9 h-9 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!tripToDelete}
        title="Delete Trip"
        message="Are you sure you want to delete this trip itinerary? All associated preferences, matching history and tags will be permanently deleted. This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Trip"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTripToDelete(null)}
        isDanger={true}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Trip Planner.</p>
      </footer>
    </div>
  );
};

export default MyTripsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Compass as CompassIcon, SlidersHorizontal, Search, RotateCcw, AlertCircle, Calendar, PlusCircle } from 'lucide-react';
import tripService from '../services/tripService';
import joinRequestService from '../services/joinRequestService';
import LoadingSpinner from '../components/LoadingSpinner';
import PublicTripCard from '../components/trip/PublicTripCard';
import JoinRequestModal from '../components/trip/JoinRequestModal';
import NotificationBell from '../components/NotificationBell';
import notificationService from '../services/notificationService';

const TRAVEL_STYLES = ['Adventure', 'Backpacking', 'Luxury', 'Road Trip', 'Camping', 'Solo', 'Family', 'Business'];

const PublicTripsPage = () => {
  const navigate = useNavigate();

  // Trips & Request statuses
  const [trips, setTrips] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    destination: '',
    travelStyle: '',
    budget: '',
    startDate: '',
    endDate: ''
  });

  // Modal State
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // In-app Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotifRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotifsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  // Fetch Public Trips and Requests
  const fetchData = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Clean filter object (remove empty values)
      const cleanFilters = {};
      Object.keys(appliedFilters).forEach(key => {
        if (appliedFilters[key] !== undefined && appliedFilters[key] !== '') {
          cleanFilters[key] = appliedFilters[key];
        }
      });

      // Parallel fetch
      const [tripsData, requestsData] = await Promise.all([
        tripService.getPublicTrips(cleanFilters),
        joinRequestService.getJoinRequests()
      ]);

      setTrips(tripsData);
      setOutgoingRequests(requestsData.outgoing || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching discovery data:', err);
      setError(err.response?.data?.message || 'Failed to load public trips. Please verify your connection.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      destination: '',
      travelStyle: '',
      budget: '',
      startDate: '',
      endDate: ''
    };
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  const handleJoinClick = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (message) => {
    if (!selectedTrip) return;
    setSubmittingRequest(true);

    try {
      const response = await joinRequestService.createJoinRequest(selectedTrip._id, message);
      
      // Update local state directly to prevent a full page reload
      setOutgoingRequests(prev => [...prev, response]);
      setIsModalOpen(false);
      setSelectedTrip(null);
      
      // Re-fetch notifications to show immediate feedback if needed
      fetchNotifications();
    } catch (err) {
      console.error('Error submitting join request:', err);
      alert(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const getRequestStatusForTrip = (tripId) => {
    const match = outgoingRequests.find(req => req.trip === tripId || req.trip?._id === tripId);
    return match ? match.status : null;
  };

  const handleViewDetails = (tripId) => {
    navigate(`/trips/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      {/* Header Nav */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-brand-500" />
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Travel<span className="text-brand-500">Buddy</span> <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-normal">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <NotificationBell 
              notifications={notifications} 
              unreadCount={unreadCount} 
              onMarkAsRead={markNotifRead}
              onMarkAllAsRead={markAllNotifsRead}
            />
            
            <Link 
              to="/dashboard" 
              className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 border border-slate-700/30 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Banner Section */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Discover Trips
          </h1>
          <p className="text-slate-400 font-light text-sm">
            Explore public itineraries created by other travelers and request to join their voyages.
          </p>
        </div>

        {/* Filter Toolbar (Glassmorphic) */}
        <form onSubmit={handleApplyFilters} className="glass-panel p-6 rounded-3xl border border-slate-805 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-850 pb-3 text-white font-bold text-sm">
            <SlidersHorizontal className="h-4 w-4 text-brand-500" />
            <span>Search Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Destination Search */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination</label>
              <div className="relative">
                <Search className="absolute inset-y-0 left-3 h-4 w-4 text-slate-500 self-center mt-2.5" />
                <input
                  type="text"
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  placeholder="e.g. Paris, Goa..."
                  className="w-full bg-navy-900/30 border border-slate-800 focus:border-brand-500/50 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>

            {/* Travel Style Select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Travel Style</label>
              <select
                name="travelStyle"
                value={filters.travelStyle}
                onChange={handleFilterChange}
                className="w-full bg-navy-900/30 border border-slate-800 focus:border-brand-500/50 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none cursor-pointer"
              >
                <option value="" className="bg-[#0b1329]">All Styles</option>
                {TRAVEL_STYLES.map(style => (
                  <option key={style} value={style} className="bg-[#0b1329] text-white">{style}</option>
                ))}
              </select>
            </div>

            {/* Budget Limit */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Max Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={filters.budget}
                onChange={handleFilterChange}
                placeholder="e.g. 50000"
                min="0"
                className="w-full bg-navy-900/30 border border-slate-800 focus:border-brand-500/50 rounded-xl px-3 py-2 text-white text-xs outline-none"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full bg-navy-900/30 border border-slate-800 focus:border-brand-500/50 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none cursor-pointer"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full bg-navy-900/30 border border-slate-800 focus:border-brand-500/50 rounded-xl px-3 py-2 text-slate-300 text-xs outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-850 pt-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-800/35 hover:bg-slate-700/50 border border-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/25 rounded-xl cursor-pointer transition-all shadow-md shadow-brand-500/10"
            >
              Apply Filters
            </button>
          </div>
        </form>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Scanning the globe for trips...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Discovery Failed</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => fetchData(filters)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="max-w-xl mx-auto glass-panel p-10 rounded-3xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center border border-brand-500/25">
              <CompassIcon className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">No Matching Trips</h2>
              <p className="text-slate-400 font-light text-sm max-w-sm mx-auto leading-relaxed">
                There are no public trips matching your search preferences. Try resetting the filters or check back later!
              </p>
            </div>
            <button 
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 bg-brand-650 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/20 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/10"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Filters & Show All</span>
            </button>
          </div>
        )}

        {/* Grid List */}
        {!loading && !error && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <PublicTripCard 
                key={trip._id} 
                trip={trip} 
                onJoin={handleJoinClick}
                onViewDetails={handleViewDetails}
                requestStatus={getRequestStatusForTrip(trip._id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={isModalOpen}
        trip={selectedTrip}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrip(null);
        }}
        onSubmit={handleRequestSubmit}
        submitting={submittingRequest}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Discovery Platform.</p>
      </footer>
    </div>
  );
};

export default PublicTripsPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Compass, ArrowLeft, Calendar, DollarSign, Compass as CompassIcon,
  Users, Tag, Shield, Clock, Edit, Trash2, MapPin, Lock, Globe,
  AlertCircle, Plane, Train, Bus, Car, Bike, Hotel, ChevronRight, User, CheckCircle2
} from 'lucide-react';
import tripService from '../services/tripService';
import joinRequestService from '../services/joinRequestService';
import TripMembers from '../components/trip/TripMembers';
import JoinRequestModal from '../components/trip/JoinRequestModal';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

// Local date display helper to avoid off-by-one errors
const formatDateLocal = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

const TRANSPORT_ICONS = {
  'Flight': Plane,
  'Train': Train,
  'Bus': Bus,
  'Car': Car,
  'Bike': Bike
};

const STATUS_COLORS = {
  'Planning': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'Open for Partners': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Matched': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'In Progress': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Completed': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  'Cancelled': 'text-red-400 bg-red-500/10 border-red-500/20'
};

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTripAndRequestStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch trip details (which includes owner and member details)
        const tripData = await tripService.getTrip(id);
        setTrip(tripData);

        // Fetch request status if current user is not the owner
        const ownerId = tripData.owner?._id || tripData.owner;
        const isOwnerUser = user && ownerId && user._id.toString() === ownerId.toString();

        if (!isOwnerUser) {
          try {
            const requests = await joinRequestService.getJoinRequests();
            const match = requests.outgoing.find(r => r.trip?._id === id || r.trip === id);
            setJoinRequest(match || null);
          } catch (reqErr) {
            console.error('Error fetching request details for trip details page:', reqErr);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching trip details:', err);
        const errMsg = err.response?.data?.message || 'Failed to load trip details. It may not exist or is private.';
        setError(errMsg);
        setLoading(false);
      }
    };

    if (id) {
      fetchTripAndRequestStatus();
    }
  }, [id, user]);

  const handleCancelRequest = async () => {
    if (!joinRequest) return;
    if (!window.confirm('Are you sure you want to cancel your request to join this trip?')) return;
    try {
      const updated = await joinRequestService.deleteJoinRequest(joinRequest._id);
      if (updated.status === 'Cancelled') {
        setJoinRequest(updated);
      } else {
        setJoinRequest(null);
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert(err.response?.data?.message || 'Failed to cancel the request.');
    }
  };

  const handleJoinSubmit = async (message) => {
    setSubmittingJoin(true);
    try {
      const response = await joinRequestService.createJoinRequest(id, message);
      setJoinRequest(response);
      setShowJoinModal(false);
    } catch (err) {
      console.error('Error joining trip:', err);
      alert(err.response?.data?.message || 'Failed to send join request.');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await tripService.deleteTrip(id);
      setShowDeleteModal(false);
      // Redirect to My Trips on success
      navigate('/trips');
    } catch (err) {
      console.error('Error deleting trip:', err);
      alert(err.response?.data?.message || 'Failed to delete the trip.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine if the current authenticated user owns this trip
  const ownerId = trip?.owner?._id || trip?.owner;
  const isOwner = user && ownerId && user._id.toString() === ownerId.toString();

  const TransportIcon = trip?.transportation ? TRANSPORT_ICONS[trip.transportation] : null;

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
          <div className="flex items-center gap-2">
            <Link 
              to="/trips" 
              className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 border border-slate-700/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Trips</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
        
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Fetching trip details...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Access Error</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <Link 
              to="/trips" 
              className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Back to My Trips
            </Link>
          </div>
        )}

        {/* Content loaded */}
        {!loading && trip && (
          <div className="space-y-6">
            
            {/* Top header navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/40">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-650" />
                <Link to="/trips" className="hover:text-white transition-colors">My Trips</Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-650" />
                <span className="text-slate-200 font-medium truncate max-w-[150px]">{trip.destination}</span>
              </div>
              
              {isOwner && (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to={`/trips/edit/${trip._id}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Trip</span>
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-300 hover:text-red-200 w-9 h-9 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Trip Detail Glass Panel */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Title Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-brand-500/10 text-brand-300 border border-brand-500/15 px-3 py-0.5 rounded-full text-xs font-semibold">
                      {trip.travelStyle}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[trip.status] || 'text-slate-300 bg-slate-800/40'}`}>
                      {trip.status}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-start gap-2">
                    <MapPin className="h-8 w-8 text-brand-500 flex-shrink-0 mt-1" />
                    <span>{trip.destination}</span>
                  </h1>
                </div>

                {/* Owner Card Info */}
                {trip.owner && (
                  <div className="flex items-center gap-3 bg-navy-800/40 border border-slate-800 p-3 rounded-2xl w-fit">
                    <img 
                      src={trip.owner.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                      alt={trip.owner.name}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-700/40"
                    />
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Organized By</span>
                      {trip.owner._id ? (
                        <Link 
                          to={`/profile/${trip.owner._id}`}
                          className="text-sm font-bold text-white hover:text-brand-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{trip.owner.name}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-550" />
                        </Link>
                      ) : (
                        <span className="text-sm font-bold text-white">{trip.owner.name}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Join Request Banner */}
              {!isOwner && user && (() => {
                const currentMembersCount = trip.members ? trip.members.length : 0;
                const availableSeats = trip.maxTravelers !== undefined ? (trip.maxTravelers - 1 - currentMembersCount) : null;
                return (
                  <div className="bg-navy-800/20 border border-slate-800/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Join Matchmaking Queue</h3>
                      <p className="text-xs text-slate-400 font-light mt-1">
                        {joinRequest === null 
                          ? 'Request to join this adventure and connect with the leader.'
                          : joinRequest.status === 'Pending'
                          ? 'Your request is submitted and pending review by the trip leader.'
                          : joinRequest.status === 'Accepted'
                          ? 'You have been accepted! Check itinerary and stay in touch.'
                          : joinRequest.status === 'Rejected'
                          ? 'Your join request was declined by the leader.'
                          : 'Your request has been cancelled.'}
                      </p>
                    </div>
                    <div>
                      {joinRequest === null ? (
                        <button
                          disabled={availableSeats === 0 || trip.status === 'Completed' || trip.status === 'Cancelled'}
                          onClick={() => setShowJoinModal(true)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            availableSeats === 0 || trip.status === 'Completed' || trip.status === 'Cancelled'
                              ? 'bg-slate-800/30 text-slate-500 border-slate-800/50 cursor-not-allowed'
                              : 'bg-brand-600 hover:bg-brand-500 text-white border-brand-500/20 shadow-md shadow-brand-500/5 hover:shadow-brand-500/10'
                          }`}
                        >
                          {availableSeats === 0 ? 'Trip is Full' : 'Request to Join'}
                        </button>
                      ) : joinRequest.status === 'Pending' ? (
                        <button
                          onClick={handleCancelRequest}
                          className="px-4 py-2 bg-red-955/20 hover:bg-red-950/40 border border-red-900/30 text-red-300 hover:text-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-red-900/5"
                        >
                          Cancel Request
                        </button>
                      ) : joinRequest.status === 'Accepted' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Member of Trip</span>
                        </span>
                      ) : joinRequest.status === 'Rejected' ? (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/15 px-4 py-2 rounded-xl text-xs font-bold">
                          Request Declined
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowJoinModal(true)}
                          className="px-5 py-2.5 bg-slate-800/40 hover:bg-slate-800/70 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700/30 cursor-pointer"
                        >
                          Re-Request Join
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Dates */}
                <div className="bg-navy-800/20 border border-slate-800/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-400" />
                    <span>Duration</span>
                  </span>
                  <div className="text-sm font-semibold text-white">{formatDateLocal(trip.startDate)}</div>
                  <div className="text-xs text-slate-450">to {formatDateLocal(trip.endDate)}</div>
                </div>

                {/* Budget */}
                <div className="bg-navy-800/20 border border-slate-800/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                    <span className="text-xs font-bold text-brand-400">₹</span>
                    <span>Budget Limit</span>
                  </span>
                  <div className="text-lg font-bold text-brand-450">₹{trip.budget}</div>
                  <div className="text-xs text-slate-450">INR Estimated</div>
                </div>

                {/* Max Travelers */}
                <div className="bg-navy-800/20 border border-slate-800/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-400" />
                    <span>Group Limit</span>
                  </span>
                  <div className="text-lg font-bold text-white">{trip.maxTravelers || 'Flexible'}</div>
                  <div className="text-xs text-slate-450">Max Co-Travelers</div>
                </div>

                {/* Visibility */}
                <div className="bg-navy-800/20 border border-slate-800/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                    {trip.visibility === 'Private' ? <Lock className="h-3.5 w-3.5 text-amber-400" /> : <Globe className="h-3.5 w-3.5 text-brand-400" />}
                    <span>Privacy</span>
                  </span>
                  <div className="text-sm font-semibold text-white">{trip.visibility}</div>
                  <div className="text-xs text-slate-450">{trip.visibility === 'Private' ? 'Visible only to owner' : 'Searchable by anyone'}</div>
                </div>
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-navy-800/15 p-5 rounded-2xl border border-slate-800/40">
                {/* Logistics */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                    <CompassIcon className="h-3.5 w-3.5 text-brand-400" />
                    <span>Logistics Info</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-28">Transportation:</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        {TransportIcon && <TransportIcon className="h-4 w-4 text-brand-400" />}
                        <span>{trip.transportation || 'Flexible'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-28">Accommodation:</span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <Hotel className="h-4 w-4 text-brand-400" />
                        <span>{trip.accommodation || 'Flexible'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                    <Shield className="h-3.5 w-3.5 text-brand-400" />
                    <span>Buddy Requirements</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-28">Gender Pref:</span>
                      <span className="text-white font-semibold">{trip.genderPreference || 'No Preference'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-28">Age Pref:</span>
                      <span className="text-white font-semibold">{trip.agePreference || 'No Preference'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Panel */}
              {trip.tripTags && trip.tripTags.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-brand-400" />
                    <span>Selected Trip Tags</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {trip.tripTags.map(tag => (
                      <span key={tag} className="bg-brand-500/10 text-brand-300 border border-brand-500/15 px-3 py-1 rounded-full text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Panel */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-brand-400" />
                  <span>Itinerary & Description</span>
                </span>
                {trip.description ? (
                  <p className="text-sm text-slate-300 font-light leading-relaxed whitespace-pre-wrap bg-navy-800/25 p-5 rounded-2xl border border-slate-800/40">
                    {trip.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic font-light">No details or descriptions provided for this trip.</p>
                )}
              </div>

              {/* Trip Members Section */}
              <div className="pt-2">
                <TripMembers 
                  members={trip.members || []} 
                  owner={trip.owner} 
                />
              </div>

              {/* Meta Timestamps */}
              <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-550">
                <div>Created: {new Date(trip.createdAt).toLocaleString()}</div>
                <div>Last Updated: {new Date(trip.updatedAt).toLocaleString()}</div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={showJoinModal}
        trip={trip}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinSubmit}
        submitting={submittingJoin}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showDeleteModal}
        title="Delete Trip"
        message="Are you sure you want to delete this trip itinerary? All associated preferences, matching history and tags will be permanently deleted. This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Trip"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isDanger={true}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Trip Planner.</p>
      </footer>
    </div>
  );
};

export default TripDetailsPage;

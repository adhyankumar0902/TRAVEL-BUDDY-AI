import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Users, CheckCircle, ShieldAlert, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import joinRequestService from '../services/joinRequestService';
import tripService from '../services/tripService';
import LoadingSpinner from '../components/LoadingSpinner';
import RequestCard from '../components/trip/RequestCard';
import TripMembers from '../components/trip/TripMembers';
import NotificationBell from '../components/NotificationBell';
import notificationService from '../services/notificationService';

const JoinRequestsPage = () => {
  const [tripsOwned, setTripsOwned] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch incoming requests and owner's own trips (to display members list properly)
      const [requestsData, tripsData] = await Promise.all([
        joinRequestService.getJoinRequests(),
        tripService.getMyTrips()
      ]);

      setIncomingRequests(requestsData.incoming || []);
      setTripsOwned(tripsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching owner requests:', err);
      setError(err.response?.data?.message || 'Failed to retrieve join requests.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      const updatedRequest = await joinRequestService.acceptJoinRequest(requestId);
      
      // Update requests list state locally
      setIncomingRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: 'Accepted' } : req));
      
      // Update trips list locally to reflect the added member and decrement available seats
      setTripsOwned(prevTrips => prevTrips.map(trip => {
        if (trip._id === updatedRequest.trip || trip._id === updatedRequest.trip?._id) {
          const membersList = trip.members || [];
          if (!membersList.includes(updatedRequest.requester)) {
            // Find the request details to get the populated requester info
            const reqDetails = incomingRequests.find(r => r._id === requestId);
            const userObj = reqDetails?.requester || { _id: updatedRequest.requester };
            return {
              ...trip,
              members: [...membersList, userObj]
            };
          }
        }
        return trip;
      }));

      fetchNotifications();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(err.response?.data?.message || 'Failed to accept the request.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await joinRequestService.rejectJoinRequest(requestId);
      setIncomingRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: 'Rejected' } : req));
      fetchNotifications();
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert(err.response?.data?.message || 'Failed to reject the request.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request history entry?')) return;
    try {
      await joinRequestService.deleteJoinRequest(requestId);
      setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (err) {
      console.error('Error deleting request:', err);
      alert(err.response?.data?.message || 'Failed to delete the request.');
    }
  };

  // Group incoming requests by Trip ID
  const getRequestsForTrip = (tripId) => {
    return incomingRequests.filter(req => req.trip?._id === tripId || req.trip === tripId);
  };

  // Trips that have any requests associated with them
  const tripsWithRequests = tripsOwned.filter(trip => getRequestsForTrip(trip._id).length > 0);

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
            {/* Notification bell dropdown */}
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

      {/* Main Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Join Requests
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Review and manage incoming co-traveler requests for trips you are organizing.
            </p>
          </div>
          <button 
            onClick={fetchRequests}
            className="w-fit bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/30 px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading experience */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Retrieving join requests...</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Retrieval Error</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={fetchRequests}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && incomingRequests.length === 0 && (
          <div className="max-w-xl mx-auto glass-panel p-10 rounded-3xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center border border-brand-500/25">
              <Inbox className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">No Requests Yet</h2>
              <p className="text-slate-400 font-light text-sm max-w-sm mx-auto leading-relaxed">
                You haven't received any travel buddy requests for your public trips. Make sure your trips are "Public" and set to "Open for Partners"!
              </p>
            </div>
            <Link 
              to="/trips" 
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/20 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/10"
            >
              <span>Manage My Trips</span>
            </Link>
          </div>
        )}

        {/* Content loaded, grouped by trip */}
        {!loading && !error && incomingRequests.length > 0 && (
          <div className="space-y-10">
            {tripsOwned.map(trip => {
              const requests = getRequestsForTrip(trip._id);
              if (requests.length === 0) return null;

              const activeMembers = trip.members || [];
              const pendingCount = requests.filter(r => r.status === 'Pending').length;

              return (
                <div key={trip._id} className="space-y-6 border border-slate-850 bg-[#0c142b]/40 p-6 rounded-3xl">
                  {/* Trip Header Banner */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-navy-800/40 p-4 rounded-2xl border border-slate-800/40">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Trip to {trip.destination}</span>
                      </h2>
                      <div className="text-xs text-slate-450 mt-1">
                        Dates: {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-500/10 text-brand-350 border border-brand-500/15 px-3 py-1 rounded-full text-xs font-semibold">
                        {pendingCount} Pending Requests
                      </span>
                      {trip.maxTravelers && (
                        <span className="bg-slate-800 text-slate-300 border border-slate-700/30 px-3 py-1 rounded-full text-xs font-semibold">
                          Seats Remaining: {trip.maxTravelers - 1 - activeMembers.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Two column grid: left requests, right members */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Requests list */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1">Requests Queue</h3>
                      <div className="space-y-4">
                        {requests.map(request => (
                          <RequestCard
                            key={request._id}
                            request={request}
                            role="owner"
                            onAccept={handleAcceptRequest}
                            onReject={handleRejectRequest}
                            onDelete={handleDeleteRequest}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Members view */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1 mb-4">Current Members</h3>
                      <TripMembers
                        members={activeMembers}
                        owner={{
                          name: 'You',
                          profileImage: tripsOwned[0]?.owner?.profileImage,
                          travelStyle: tripsOwned[0]?.owner?.travelStyle
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Host Area.</p>
      </footer>
    </div>
  );
};

export default JoinRequestsPage;

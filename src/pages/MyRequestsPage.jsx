import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, Search, MapPin, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import joinRequestService from '../services/joinRequestService';
import LoadingSpinner from '../components/LoadingSpinner';
import RequestCard from '../components/trip/RequestCard';
import NotificationBell from '../components/NotificationBell';
import notificationService from '../services/notificationService';

const MyRequestsPage = () => {
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Pending');

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

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await joinRequestService.getJoinRequests();
      setOutgoingRequests(data.outgoing || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching my requests:', err);
      setError(err.response?.data?.message || 'Failed to retrieve your sent requests.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    fetchNotifications();
  }, []);

  const handleCancelRequest = async (requestId) => {
    try {
      const updatedRequest = await joinRequestService.deleteJoinRequest(requestId);
      
      // If the backend deleted the request document completely, filter it out.
      // If the backend updated it to 'Cancelled', update the item in state.
      if (updatedRequest.status === 'Cancelled') {
        setOutgoingRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: 'Cancelled' } : req));
      } else {
        setOutgoingRequests(prev => prev.filter(req => req._id !== requestId));
      }
      fetchNotifications();
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert(err.response?.data?.message || 'Failed to cancel the request.');
    }
  };

  // Filter requests based on active tab
  const getFilteredRequests = () => {
    if (activeTab === 'All') return outgoingRequests;
    if (activeTab === 'Pending') return outgoingRequests.filter(r => r.status === 'Pending');
    if (activeTab === 'Accepted') return outgoingRequests.filter(r => r.status === 'Accepted');
    if (activeTab === 'Rejected/Cancelled') return outgoingRequests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled');
    return outgoingRequests;
  };

  const filtered = getFilteredRequests();

  const TABS = ['Pending', 'Accepted', 'Rejected/Cancelled', 'All'];

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

      {/* Main Container */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Title Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              My Requests
            </h1>
            <p className="text-slate-400 font-light text-sm">
              Track status of requests you sent to join other travelers' public itineraries.
            </p>
          </div>
          <button 
            onClick={fetchMyRequests}
            className="w-fit bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/30 px-4 py-2 rounded-xl text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Status Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-1">
          {TABS.map(tab => {
            const count = tab === 'All' 
              ? outgoingRequests.length 
              : tab === 'Pending' 
              ? outgoingRequests.filter(r => r.status === 'Pending').length
              : tab === 'Accepted'
              ? outgoingRequests.filter(r => r.status === 'Accepted').length
              : outgoingRequests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer relative ${
                  activeTab === tab 
                    ? 'text-brand-400 border-b-2 border-brand-500' 
                    : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
                <span className="ml-1.5 bg-slate-850 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner size="lg" />
            <span className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Retrieving your requests...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-5 border border-red-500/20">
            <div className="mx-auto w-12 h-12 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Retrieval Failed</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={fetchMyRequests}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="max-w-xl mx-auto glass-panel p-10 rounded-3xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-brand-500/10 text-brand-400 rounded-full flex items-center justify-center border border-brand-500/25">
              <Inbox className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} requests
              </h2>
              <p className="text-slate-400 font-light text-sm max-w-sm mx-auto leading-relaxed">
                {activeTab === 'Pending' 
                  ? "You don't have any pending requests to join other trips. Explore public voyages and send one!"
                  : activeTab === 'Accepted'
                  ? "You haven't been accepted to any trips yet. Keep exploring and checking in!"
                  : activeTab === 'Rejected/Cancelled'
                  ? "You have no cancelled or rejected requests in your log."
                  : "You haven't sent any travel buddy requests yet. Start your journey by browsing public trips!"}
              </p>
            </div>
            <Link 
              to="/public-trips" 
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/20 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/10"
            >
              <span>Browse Public Trips</span>
            </Link>
          </div>
        )}

        {/* Content list */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map(request => (
              <RequestCard
                key={request._id}
                request={request}
                role="requester"
                onCancel={handleCancelRequest}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Requester Area.</p>
      </footer>
    </div>
  );
};

export default MyRequestsPage;

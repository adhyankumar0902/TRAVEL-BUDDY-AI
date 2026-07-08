import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Circle, CheckSquare, Trash2, Calendar, MapPin, Eye, Clock } from 'lucide-react';

const formatTimeAgo = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const TYPE_ICONS = {
  'RequestSent': '✈️',
  'RequestAccepted': '🎉',
  'RequestRejected': '❌'
};

const NotificationBell = ({ notifications = [], unreadCount = 0, onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read && onMarkAsRead) {
      await onMarkAsRead(notif._id);
    }
    setIsOpen(false);

    // Redirect to correct tab based on type
    if (notif.type === 'RequestSent') {
      navigate('/join-requests'); // Owner incoming dashboard
    } else {
      navigate('/my-requests'); // Requester outgoing dashboard
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white bg-slate-800/40 border border-slate-700/30 hover:border-slate-700/60 rounded-xl transition-all duration-200 cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-[#0c142b]/95 backdrop-blur-xl shadow-2xl p-1 z-50 animate-fade-in origin-top-right">
          
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-brand-500/10 text-brand-400 border border-brand-500/15 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={() => onMarkAllAsRead()}
                className="text-[10px] text-brand-400 hover:text-brand-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckSquare className="h-3 w-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-850/60 scrollbar-thin">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-slate-800/30 transition-colors flex gap-3 cursor-pointer items-start relative group ${
                    !notif.read ? 'bg-brand-500/5' : ''
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {!notif.read && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}

                  {/* Icon Indicator */}
                  <div className="text-lg bg-slate-800/40 border border-slate-700/10 p-1.5 rounded-xl flex-shrink-0">
                    {TYPE_ICONS[notif.type] || '✈️'}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-grow space-y-1">
                    <p className={`text-xs font-light text-slate-300 leading-normal break-words ${!notif.read ? 'font-medium text-slate-100' : ''}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-semibold uppercase">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-550 space-y-2">
                <Bell className="h-8 w-8 text-slate-700 mx-auto animate-pulse-slow" />
                <p className="text-xs font-light">No new notifications</p>
              </div>
            )}
          </div>

          {/* Footer view all placeholder */}
          <div className="p-2 border-t border-slate-850 bg-navy-950/20 text-center rounded-b-2xl">
            <span className="text-[10px] text-slate-500">Travel Buddy Matchmaking Alerts</span>
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationBell;

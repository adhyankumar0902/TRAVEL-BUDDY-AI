import React from 'react';
import { MapPin, Calendar, DollarSign, Users, Award, Tag, Info, Compass, Lock, Globe } from 'lucide-react';

const formatDateLocal = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_COLORS = {
  'Planning': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'Open for Partners': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Matched': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  'In Progress': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Completed': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  'Cancelled': 'text-red-400 bg-red-500/10 border-red-500/20'
};

const PublicTripCard = ({ trip, onJoin, onViewDetails, requestStatus }) => {
  const owner = trip.owner || {};
  const currentMembersCount = trip.members ? trip.members.length : 0;
  const availableSeats = trip.maxTravelers !== undefined ? (trip.maxTravelers - 1 - currentMembersCount) : null;

  return (
    <div className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/85 hover:border-brand-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5 group">
      
      {/* Card Body */}
      <div className="p-6 space-y-6">
        
        {/* Header: Travel Style & Status */}
        <div className="flex items-center justify-between">
          <span className="bg-brand-500/10 text-brand-300 border border-brand-500/15 px-3 py-0.5 rounded-full text-xs font-semibold">
            {trip.travelStyle}
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[trip.status] || 'text-slate-300 bg-slate-800/40'}`}>
            {trip.status}
          </span>
        </div>

        {/* Destination & Owner */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-start gap-1.5 group-hover:text-brand-400 transition-colors">
            <MapPin className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <span className="truncate">{trip.destination}</span>
          </h3>

          {/* Owner details */}
          <div className="flex items-center gap-2.5 bg-navy-800/30 border border-slate-800/50 p-2 rounded-xl">
            <img 
              src={owner.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={owner.name}
              className="h-7 w-7 rounded-lg object-cover border border-slate-700/30"
            />
            <div className="min-w-0">
              <span className="block text-[8px] text-slate-550 uppercase tracking-widest font-bold">Organizer</span>
              <span className="block text-xs font-medium text-slate-200 truncate">{owner.name || 'Traveler'}</span>
            </div>
          </div>
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-y border-slate-800/60 py-4">
          {/* Dates */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1">
              <Calendar className="h-3 w-3 text-brand-400" />
              <span>Dates</span>
            </span>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {formatDateLocal(trip.startDate)}
            </div>
            <div className="text-[10px] text-slate-500">
              to {formatDateLocal(trip.endDate)}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-brand-400" />
              <span>Budget</span>
            </span>
            <div className="text-sm font-bold text-brand-400">
              ₹{trip.budget}
            </div>
            <div className="text-[10px] text-slate-500">Estimated INR</div>
          </div>

          {/* Group Seats */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1">
              <Users className="h-3 w-3 text-brand-400" />
              <span>Seats Left</span>
            </span>
            <div className={`text-xs font-bold ${availableSeats === 0 ? 'text-red-400' : 'text-slate-200'}`}>
              {availableSeats === null ? 'Flexible' : `${availableSeats} of ${trip.maxTravelers - 1}`}
            </div>
            <div className="text-[10px] text-slate-550">
              {availableSeats === 0 ? 'Group is Full' : 'Available Slots'}
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider flex items-center gap-1">
              <Globe className="h-3 w-3 text-brand-400" />
              <span>Visibility</span>
            </span>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <span>{trip.visibility}</span>
            </div>
            <div className="text-[10px] text-slate-500">Public search</div>
          </div>
        </div>

        {/* Tags */}
        {trip.tripTags && trip.tripTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {trip.tripTags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-navy-800/60 text-slate-400 border border-slate-800/40 px-2.5 py-0.5 rounded-md text-[10px] font-medium">
                #{tag}
              </span>
            ))}
            {trip.tripTags.length > 3 && (
              <span className="text-slate-500 text-[10px] self-center">+{trip.tripTags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 flex gap-3">
        <button
          onClick={() => onViewDetails(trip._id)}
          className="flex-1 text-center py-2.5 bg-slate-800/45 hover:bg-slate-700/60 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700/35 rounded-xl cursor-pointer transition-all"
        >
          View Details
        </button>

        {requestStatus === 'Accepted' ? (
          <div className="flex-1 py-2.5 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl">
            Joined
          </div>
        ) : requestStatus === 'Pending' ? (
          <div className="flex-1 py-2.5 text-center bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-xl">
            Pending
          </div>
        ) : requestStatus === 'Rejected' ? (
          <div className="flex-1 py-2.5 text-center bg-red-550/10 border border-red-550/20 text-red-400 font-bold text-xs rounded-xl">
            Rejected
          </div>
        ) : (
          <button
            disabled={availableSeats === 0 || trip.status === 'Completed' || trip.status === 'Cancelled'}
            onClick={() => onJoin(trip)}
            className={`flex-1 py-2.5 text-center font-bold text-xs rounded-xl border transition-all cursor-pointer ${
              availableSeats === 0 || trip.status === 'Completed' || trip.status === 'Cancelled'
                ? 'bg-slate-800/30 text-slate-600 border-slate-800/50 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white border-brand-500/20 shadow-md shadow-brand-500/5 hover:shadow-brand-500/10'
            }`}
          >
            Join Trip
          </button>
        )}
      </div>
    </div>
  );
};

export default PublicTripCard;

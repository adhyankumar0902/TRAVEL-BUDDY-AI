import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, MessageSquare, Trash2, Check, X, ArrowRight, User, Shield, Compass, Tag } from 'lucide-react';

const formatDateLocal = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_BADGES = {
  'Pending': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Accepted': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Rejected': 'bg-red-500/10 text-red-400 border border-red-500/20',
  'Cancelled': 'bg-slate-500/10 text-slate-400 border border-slate-700/25'
};

const RequestCard = ({ request, role, onAccept, onReject, onCancel, onDelete }) => {
  const trip = request.trip || {};
  const requester = request.requester || {};
  const owner = request.owner || {};
  const [showProfile, setShowProfile] = useState(false);

  if (role === 'owner') {
    // Owner view: showing incoming requests from other users to join my trips
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-slate-750 transition-all space-y-4">
        {/* Top: Trip and Status Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/50 pb-3">
          <div className="space-y-1">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Request For Trip</span>
            <Link 
              to={`/trips/${trip._id}`}
              className="text-white hover:text-brand-400 transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-brand-500" />
              <span>{trip.destination}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
          </div>
          <div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_BADGES[request.status]}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* Middle: Requester Profile Info */}
        <div className="flex items-start gap-4">
          <img 
            src={requester.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
            alt={requester.name}
            className="h-12 w-12 rounded-2xl object-cover border border-slate-800/60 mt-1"
          />
          <div className="flex-grow space-y-2">
            <div>
              <Link 
                to={`/profile/${requester._id}`} 
                className="text-base font-extrabold text-white hover:text-brand-400 transition-colors cursor-pointer"
              >
                {requester.name}
              </Link>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-400">
                {requester.age && <span>{requester.age} years old</span>}
                {requester.gender && (
                  <>
                    <span className="text-slate-650">•</span>
                    <span>{requester.gender}</span>
                  </>
                )}
                {requester.travelStyle && (
                  <>
                    <span className="text-slate-650">•</span>
                    <span className="text-brand-400 font-medium">{requester.travelStyle} Style</span>
                  </>
                )}
              </div>
            </div>

            {/* Message Block */}
            {request.message && (
              <div className="bg-navy-900/35 border border-slate-800/50 p-3.5 rounded-2xl text-xs font-light text-slate-300 leading-relaxed flex gap-2.5 items-start">
                <MessageSquare className="h-4 w-4 text-brand-450 flex-shrink-0 mt-0.5" />
                <p className="italic">"{request.message}"</p>
              </div>
            )}

            {/* Toggle Full Profile */}
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="text-[11px] font-bold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showProfile ? 'Hide Profile Details' : 'View Requester Profile'}</span>
            </button>

            {showProfile && (
              <div className="bg-navy-950/20 border border-slate-800/40 p-4 rounded-2xl space-y-3 text-xs animate-fade-in">
                {requester.bio && (
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold mb-1">Bio</span>
                    <p className="text-slate-350 leading-relaxed font-light">{requester.bio}</p>
                  </div>
                )}
                {requester.interests && requester.interests.length > 0 && (
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold mb-1">Interests</span>
                    <div className="flex flex-wrap gap-1">
                      {requester.interests.map(interest => (
                        <span key={interest} className="bg-slate-800/40 text-slate-300 border border-slate-700/10 px-2 py-0.5 rounded text-[10px]">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Link 
                  to={`/profile/${requester._id}`} 
                  className="inline-block bg-brand-500/10 hover:bg-brand-500/20 text-brand-350 border border-brand-500/15 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  View Full Profile Card
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {request.status === 'Pending' ? (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onAccept(request._id)}
              className="flex-1 py-2.5 bg-emerald-650 hover:bg-emerald-550 text-white font-bold text-xs border border-emerald-600/35 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/10"
            >
              <Check className="h-4 w-4" />
              <span>Accept Request</span>
            </button>
            <button
              onClick={() => onReject(request._id)}
              className="flex-1 py-2.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-300 hover:text-red-200 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <X className="h-4 w-4" />
              <span>Reject Request</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-end pt-2 border-t border-slate-850">
            <button
              onClick={() => onDelete(request._id)}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-1 text-xs cursor-pointer"
              title="Delete request entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete History</span>
            </button>
          </div>
        )}
      </div>
    );
  } else {
    // Requester view: showing requests I sent to other owners
    return (
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-slate-750 transition-all space-y-5">
        
        {/* Top Destination & Status */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <Link 
              to={`/trips/${trip._id}`}
              className="text-lg font-extrabold text-white hover:text-brand-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-brand-500" />
              <span>{trip.destination}</span>
            </Link>
            <div className="text-xs text-slate-400 font-light flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-550" />
              <span>{formatDateLocal(trip.startDate)} - {formatDateLocal(trip.endDate)}</span>
            </div>
          </div>
          <div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${STATUS_BADGES[request.status]}`}>
              {request.status}
            </span>
          </div>
        </div>

        {/* Owner Information and Message */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 bg-navy-805/30 border border-slate-800/40 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <img 
              src={owner.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={owner.name}
              className="h-8 w-8 rounded-lg object-cover border border-slate-700/20"
            />
            <div>
              <span className="block text-[8px] text-slate-550 uppercase tracking-widest font-extrabold">Organized By</span>
              <span className="text-xs font-semibold text-slate-200">{owner.name}</span>
            </div>
          </div>

          {request.message && (
            <div className="sm:max-w-[60%] flex gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-light text-slate-450 italic truncate">
                "{request.message}"
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {request.status === 'Pending' && (
          <div className="pt-1 flex justify-end">
            <button
              onClick={() => onCancel(request._id)}
              className="text-xs text-red-400 bg-red-950/15 hover:bg-red-950/35 border border-red-900/25 px-4 py-2 rounded-xl cursor-pointer transition-all"
            >
              Cancel Request
            </button>
          </div>
        )}

        {request.status === 'Accepted' && (
          <div className="pt-1 flex justify-between items-center text-xs">
            <span className="text-emerald-400 font-medium">✓ You are a member of this trip</span>
            <Link 
              to={`/trips/${trip._id}`}
              className="text-brand-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Trip Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {(request.status === 'Rejected' || request.status === 'Cancelled') && (
          <div className="pt-1 flex justify-end border-t border-slate-850">
            <button
              onClick={() => onCancel(request._id)} // Cancelling here just triggers cleanup/delete if it's already cancelled/rejected
              className="p-1.5 text-slate-550 hover:text-red-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove Request from Dashboard</span>
            </button>
          </div>
        )}

      </div>
    );
  }
};

export default RequestCard;

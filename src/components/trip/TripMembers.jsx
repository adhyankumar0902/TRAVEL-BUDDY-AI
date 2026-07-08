import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Shield, User } from 'lucide-react';

const TripMembers = ({ members = [], owner }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
      <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
        <Users className="h-5 w-5 text-brand-400" />
        <span>Trip Travelers ({members.length + 1})</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner/Leader Card */}
        {owner && (
          <div className="flex items-center gap-3 bg-brand-500/5 border border-brand-500/20 p-3 rounded-2xl">
            <img 
              src={owner.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={owner.name}
              className="h-10 w-10 rounded-xl object-cover border border-brand-500/30"
            />
            <div className="min-w-0 flex-grow">
              <span className="block text-[8px] text-brand-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                <span>Trip Leader</span>
              </span>
              {owner._id ? (
                <Link 
                  to={`/profile/${owner._id}`}
                  className="text-sm font-bold text-white hover:text-brand-400 transition-colors truncate block cursor-pointer"
                >
                  {owner.name}
                </Link>
              ) : (
                <span className="text-sm font-bold text-white truncate block">{owner.name}</span>
              )}
              {owner.travelStyle && (
                <span className="text-[10px] text-brand-300 font-light">{owner.travelStyle} Traveler</span>
              )}
            </div>
          </div>
        )}

        {/* Accepted Members */}
        {members.map((member) => (
          <div key={member._id} className="flex items-center gap-3 bg-navy-800/30 border border-slate-800/40 p-3 rounded-2xl">
            <img 
              src={member.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={member.name}
              className="h-10 w-10 rounded-xl object-cover border border-slate-700/25"
            />
            <div className="min-w-0 flex-grow">
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                <User className="h-2.5 w-2.5 text-brand-400" />
                <span>Travel Buddy</span>
              </span>
              <Link 
                to={`/profile/${member._id}`}
                className="text-sm font-bold text-slate-200 hover:text-brand-400 transition-colors truncate block cursor-pointer"
              >
                {member.name}
              </Link>
              {member.travelStyle && (
                <span className="text-[10px] text-slate-450">{member.travelStyle} Traveler</span>
              )}
            </div>
          </div>
        ))}

        {/* Empty state co-travelers */}
        {members.length === 0 && (
          <div className="sm:col-span-2 py-4 text-center text-xs text-slate-500 italic bg-navy-900/10 border border-dashed border-slate-800/50 p-4 rounded-2xl">
            No travel buddies have joined this trip yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default TripMembers;

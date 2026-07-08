import React, { useState } from 'react';
import { Compass, X, Send, MapPin, User, AlertCircle } from 'lucide-react';

const JoinRequestModal = ({ isOpen, trip, onClose, onSubmit, submitting }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !trip) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.length > 300) {
      setError('Message cannot exceed 300 characters');
      return;
    }
    setError('');
    onSubmit(message);
    setMessage('');
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.length > 300) {
      setError('Message cannot exceed 300 characters');
    } else {
      setError('');
    }
  };

  const owner = trip.owner || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-800 shadow-2xl animate-fade-in z-10 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-28 h-28 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-slate-800/40 rounded-xl"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-4 mb-6 border-b border-slate-850 pb-5">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-brand-500 animate-pulse-slow" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Request to Join Trip</h2>
          </div>

          <div className="space-y-2 bg-navy-900/40 border border-slate-850 p-3 rounded-2xl text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-450">
              <User className="h-3.5 w-3.5 text-slate-550" />
              <span>Organizer: {owner.name}</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Personalized Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={handleMessageChange}
              placeholder="Hi, I would love to join your trip! Let me know if you want to chat about travel details and alignment..."
              rows={4}
              maxLength={300}
              className="w-full bg-navy-800/40 border border-slate-800 focus:border-brand-500/50 focus:ring-0 rounded-2xl p-4 text-white text-sm transition-all duration-200 outline-none resize-none font-light leading-relaxed placeholder:text-slate-550"
            />
            
            <div className="flex justify-between items-center text-[10px]">
              <span className={error ? 'text-red-400 font-medium' : 'text-slate-500'}>
                {error || 'Introduce yourself and share why you want to join.'}
              </span>
              <span className={`font-semibold ${message.length > 280 ? 'text-amber-400' : 'text-slate-500'}`}>
                {message.length}/300
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-slate-800/55 hover:bg-slate-700/60 border border-slate-700/30 text-slate-350 hover:text-white font-semibold text-xs rounded-xl cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || error !== ''}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs border border-brand-500/20 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? 'Sending Request...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRequestModal;

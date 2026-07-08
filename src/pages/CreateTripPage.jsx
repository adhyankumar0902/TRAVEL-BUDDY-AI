import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import TripFormWizard from '../components/trip/TripFormWizard';
import tripService from '../services/tripService';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (tripData) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await tripService.createTrip(tripData);
      // Redirect to My Trips page on success
      navigate('/trips');
    } catch (err) {
      console.error('Error creating trip:', err);
      const backendMessage = err.response?.data?.message || 'Failed to create trip. Please try again.';
      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
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
          <Link 
            to="/dashboard" 
            className="text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/40 border border-slate-700/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
        {/* Banner Title */}
        <div className="text-left max-w-4xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-semibold text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Wizard Setup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Plan a New Adventure
          </h1>
          <p className="text-slate-400 font-light text-sm">
            Complete the form wizard to define your travel route, budget, and find potential travel buddies.
          </p>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3.5 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Wizard Form */}
        <TripFormWizard 
          onSubmit={handleCreateSubmit} 
          submitButtonText="Create Trip" 
          isSubmitting={isSubmitting} 
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Trip Planner.</p>
      </footer>
    </div>
  );
};

export default CreateTripPage;

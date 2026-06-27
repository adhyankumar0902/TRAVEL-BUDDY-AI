import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Map, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-brand-500 animate-pulse-slow" />
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Travel<span className="text-brand-500">Buddy</span> <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-normal">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white transition-all font-medium text-sm px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-brand-600/20 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
          
          {/* Main Title & Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
              Your Intelligent <span className="bg-gradient-to-r from-brand-400 to-sky-300 bg-clip-text text-transparent">Travel Companion</span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-400 leading-relaxed font-light">
              Organize, discover, and elevate your journeys with TravelBuddy AI. Secure, responsive, and personalized for explorers worldwide.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group"
              >
                Access Your Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 border border-slate-700/50 flex items-center justify-center"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            
            <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
              <div className="bg-brand-500/10 p-3 rounded-xl w-fit">
                <ShieldCheck className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-lg text-white">Secure Authentication</h3>
              <p className="text-slate-400 text-sm">
                Industry-standard JWT tokens and secure password hashing protect your sensitive account information.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
              <div className="bg-brand-500/10 p-3 rounded-xl w-fit">
                <Map className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-lg text-white">Smart Destinations</h3>
              <p className="text-slate-400 text-sm">
                Get tailored recommendations using AI models that learn from your preferences (Coming in Phase 2).
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
              <div className="bg-brand-500/10 p-3 rounded-xl w-fit">
                <Compass className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="font-semibold text-lg text-white">Beautiful Interface</h3>
              <p className="text-slate-400 text-sm">
                A gorgeous, fully responsive user experience crafted for mobile devices, tablets, and desktops.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. All rights reserved. Phase 1 Release.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

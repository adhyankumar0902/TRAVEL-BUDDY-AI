import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Compass, MapPin, Calendar, Compass as CompassIcon, Award } from 'lucide-react';

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      
      {/* Header Dashboard Nav */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-8 w-8 text-brand-500 animate-pulse-slow" />
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Travel<span className="text-brand-500">Buddy</span> <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-normal">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-700/30">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Session Active</span>
            </div>
            
            <button
              onClick={logoutUser}
              className="bg-red-950/40 hover:bg-red-900/40 text-red-300 hover:text-red-200 border border-red-900/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'Explorer'}!
            </h1>
            <p className="text-slate-400 font-light max-w-xl text-sm sm:text-base">
              TravelBuddy AI is setting up your control center. Phase 1 authentication is active and guarding your session details.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 px-4 py-3 rounded-2xl">
            <Award className="h-5 w-5 text-brand-400" />
            <span className="text-sm font-semibold text-brand-300">Verified Explorer</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Details Profile Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-brand-400" />
                <span>Account Profile</span>
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3 bg-navy-800/40 p-3 rounded-2xl border border-slate-800/30">
                  <div className="bg-brand-500/10 p-2 rounded-xl text-brand-400">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Full Name</span>
                    <span className="text-white font-medium text-sm">{user?.name}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 bg-navy-800/40 p-3 rounded-2xl border border-slate-800/30">
                  <div className="bg-brand-500/10 p-2 rounded-xl text-brand-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Email Address</span>
                    <span className="text-white font-medium text-sm">{user?.email}</span>
                  </div>
                </div>

                {/* Registration Date placeholder */}
                <div className="flex items-start gap-3 bg-navy-800/40 p-3 rounded-2xl border border-slate-800/30">
                  <div className="bg-brand-500/10 p-2 rounded-xl text-brand-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Account Status</span>
                    <span className="text-brand-400 font-semibold text-sm">Authenticated</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-center text-slate-500">
              User ID: {user?._id}
            </div>
          </div>

          {/* Quick Stats / Highlights Block */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Status Panel */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CompassIcon className="h-5 w-5 text-brand-400" />
                <span>TravelBuddy Modules</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-brand-500/5 rounded-xl border border-brand-500/15">
                  <span className="text-sm text-slate-300">Phase 1: User Auth System</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <span className="text-sm text-slate-400">Phase 2: AI Planner</span>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">Pending</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <span className="text-sm text-slate-400">Phase 3: Itinerary Export</span>
                  <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Locked</span>
                </div>
              </div>
            </div>

            {/* Travel Buddy AI Premium Card */}
            <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-brand-950/20 via-navy-900/40 to-slate-800/10 border border-brand-500/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="bg-brand-500/10 p-2.5 rounded-xl w-fit text-brand-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-white text-lg">Plan Your Next Voyage</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Once Phase 2 is launched, you will be able to input preferences, select trip durations, and let TravelBuddy AI assemble the ideal itinerary.
                </p>
              </div>

              <div className="text-xs text-brand-400 font-semibold tracking-wider uppercase">
                Explore the world &rarr;
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Dashboard Area.</p>
      </footer>

    </div>
  );
};

export default DashboardPage;

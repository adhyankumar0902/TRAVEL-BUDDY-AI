import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  LogOut, User, Mail, Compass, MapPin, Calendar, 
  Compass as CompassIcon, Award, ArrowRight, Edit, Sparkles, CheckCircle2,
  PlusCircle, Map
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard profile:', err);
        setLoading(false);
      }
    };

    fetchDashboardProfile();
  }, []);

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

          {/* Right Area Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profile Completion Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-400" />
                  <span>Profile Completion</span>
                </span>
                {loading ? (
                  <span className="text-xs text-slate-500">Calculating...</span>
                ) : (
                  <span className="text-sm font-extrabold text-brand-400">
                    {profile?.profileCompletionPercentage || 0}% Complete
                  </span>
                )}
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden border border-slate-700/20">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${profile?.profileCompletionPercentage || 0}%` }}
                    />
                  </div>

                  {/* Encouragement / missing fields warning */}
                  {(profile?.profileCompletionPercentage || 0) < 100 ? (
                    <div className="space-y-3 bg-amber-950/15 border border-amber-500/10 p-4 rounded-2xl">
                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        <span className="text-amber-400 font-semibold">Tip:</span> Complete your profile to improve future travel buddy recommendations.
                      </p>
                      
                      {profile?.missingFields && profile.missingFields.length > 0 && (
                        <div className="space-y-1">
                          <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Remaining Checklist:</span>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {profile.missingFields.map((field) => (
                              <span key={field} className="bg-amber-500/10 text-amber-300 border border-amber-500/15 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-950/15 border border-emerald-500/10 p-4 rounded-2xl text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                      <span className="text-xs font-semibold">Your traveler profile is 100% complete! Ready for matchmaking in Phase 3.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span>Quick Actions</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3.5 bg-navy-800/40 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-2xl text-slate-300 hover:text-white transition-all duration-200 font-semibold text-sm group"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-400" />
                    <span>View Profile</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/profile/edit"
                  className="flex items-center justify-between p-3.5 bg-navy-800/40 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-2xl text-slate-300 hover:text-white transition-all duration-200 font-semibold text-sm group"
                >
                  <span className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-brand-400" />
                    <span>Edit Profile</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/trips/create"
                  className="flex items-center justify-between p-3.5 bg-navy-800/40 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-2xl text-slate-300 hover:text-white transition-all duration-200 font-semibold text-sm group"
                >
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4 text-brand-400" />
                    <span>Create Trip</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/trips"
                  className="flex items-center justify-between p-3.5 bg-navy-800/40 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/30 rounded-2xl text-slate-300 hover:text-white transition-all duration-200 font-semibold text-sm group"
                >
                  <span className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-brand-400" />
                    <span>My Trips</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>

            {/* Travel Buddy AI Premium Card */}
            <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-brand-950/20 via-navy-900/40 to-slate-800/10 border border-brand-500/20 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="bg-brand-500/10 p-2.5 rounded-xl w-fit text-brand-400">
                  <CompassIcon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-white text-lg">Plan Your Next Voyage</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Once Phase 3 is launched, you will be able to input preferences, select trip durations, and let TravelBuddy AI assemble the ideal itinerary.
                </p>
              </div>

              <div className="text-xs text-brand-400 font-semibold tracking-wider uppercase">
                Explore the world &rarr;
              </div>
            </div>

            {/* System Status Panel */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 col-span-1 md:col-span-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CompassIcon className="h-5 w-5 text-brand-400" />
                <span>TravelBuddy Modules</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-brand-500/5 rounded-xl border border-brand-500/15">
                  <span className="text-xs text-slate-300">Phase 1: Authentication</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-brand-500/10 rounded-xl border border-brand-500/20">
                  <span className="text-xs text-slate-300">Phase 2: Profile System</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl border border-slate-800/50">
                  <span className="text-xs text-slate-400">Phase 3: Matchmaking</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20">Pending</span>
                </div>
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

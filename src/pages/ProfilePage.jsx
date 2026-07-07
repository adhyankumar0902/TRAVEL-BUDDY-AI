import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft, Edit, Calendar, MapPin, User, Languages, 
  Heart, Compass, Sparkles, MessageSquare, ShieldAlert 
} from 'lucide-react';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if this is the logged-in user's own profile
  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (isOwnProfile) {
          data = await profileService.getProfile();
        } else {
          data = await profileService.getPublicProfile(id);
        }
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isOwnProfile]);

  // Format member since date
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 text-sm">Retrieving profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col justify-center items-center px-4">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-extrabold text-white">Oops! Profile Error</h2>
          <p className="text-slate-400 text-sm">{error || 'The profile you are looking for does not exist or cannot be accessed.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-2xl font-bold transition-all duration-200 cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      {/* Header Dashboard Nav */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <span className="font-extrabold text-xl tracking-tight text-white font-sans">
            Travel<span className="text-brand-500">Buddy</span> <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full font-normal">AI</span>
          </span>

          {isOwnProfile ? (
            <button
              onClick={() => navigate('/profile/edit')}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer shadow-md shadow-brand-500/10"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="w-24" /> // Spacer
          )}
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
        
        {/* Profile Card Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full text-center md:text-left">
            {/* Profile Avatar */}
            <div className="relative group">
              <img 
                src={profile.profileImage || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                alt={profile.name} 
                className="h-28 w-28 rounded-full border-2 border-brand-500/30 object-cover shadow-xl bg-slate-800"
              />
              <div className="absolute inset-0 rounded-full bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

            {/* Basic Info */}
            <div className="space-y-3 flex-grow">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{profile.name}</h1>
                
                {profile.travelStyle && (
                  <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 flex items-center gap-1">
                    <Compass className="h-3 w-3" />
                    <span>{profile.travelStyle} Style</span>
                  </span>
                )}
              </div>

              {/* Grid Metadata */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-slate-400 text-sm font-light">
                {profile.age && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-brand-400" />
                    <span>{profile.age} years old</span>
                  </div>
                )}
                
                {profile.gender && profile.gender !== 'Prefer not to say' && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-brand-400" />
                    <span>{profile.gender}</span>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brand-400" />
                    <span>{profile.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-brand-400" />
                  <span>Explorer since {formatMemberSince(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Completion Wheel (Only on Self Profile) */}
          {isOwnProfile && (
            <div className="flex flex-col items-center justify-center p-4 bg-navy-800/30 border border-slate-800/40 rounded-2xl min-w-[150px]">
              <div className="relative flex items-center justify-center h-20 w-20">
                {/* Circular Progress Path */}
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    stroke="rgba(30, 41, 59, 0.5)" 
                    strokeWidth="5" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    stroke="#0ea5e9" 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - (profile.profileCompletionPercentage || 0) / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="text-lg font-extrabold text-white">{profile.profileCompletionPercentage || 0}%</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2">Completion</span>
            </div>
          )}
        </div>

        {/* Content Details Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Details Card */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Overview / Languages */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-400" />
                <span>Overview</span>
              </h3>

              <div className="space-y-4">
                {/* Languages */}
                <div className="space-y-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Languages</span>
                  {profile.languages && profile.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.languages.map((lang) => (
                        <span key={lang} className="bg-slate-800/50 text-slate-300 border border-slate-700/30 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                          {lang}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">None listed</span>
                  )}
                </div>

                {/* Account Details if Own Profile */}
                {isOwnProfile && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/40">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email (Private)</span>
                    <span className="text-slate-300 text-xs font-medium">{profile.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Missing Fields Box (Only on Self Profile if completion is < 100%) */}
            {isOwnProfile && profile.missingFields && profile.missingFields.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl bg-amber-950/10 border border-amber-500/20 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="h-5 w-5" />
                  <h4 className="font-bold text-sm">Enhance Your Profile</h4>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-light">
                  Add the following fields to reach 100% completion and help matches discover you:
                </p>
                <ul className="space-y-1.5 text-xs text-amber-300/80 font-medium">
                  {profile.missingFields.map((field) => (
                    <li key={field} className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Bio & Interests */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand-400" />
                <span>Traveler Bio</span>
              </h3>
              
              {profile.bio ? (
                <p className="text-slate-300 text-sm leading-relaxed font-light whitespace-pre-line italic">
                  "{profile.bio}"
                </p>
              ) : (
                <p className="text-slate-500 text-sm leading-relaxed font-light italic">
                  {isOwnProfile 
                    ? "You haven't written a biography yet. Edit your profile to tell other explorers about yourself!" 
                    : "This explorer has not written a bio yet."}
                </p>
              )}
            </div>

            {/* Interests Card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-brand-400" />
                <span>Interests & Activities</span>
              </h3>

              {profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span 
                      key={interest} 
                      className="bg-brand-500/10 text-brand-300 border border-brand-500/20 px-3.5 py-1.5 rounded-2xl text-xs font-bold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm leading-relaxed font-light italic">
                  {isOwnProfile 
                    ? "No interests selected yet. Select activities you enjoy to match with similar travelers." 
                    : "This explorer has not selected any interests."}
                </p>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. Secured Profile Area.</p>
      </footer>
    </div>
  );
};

export default ProfilePage;

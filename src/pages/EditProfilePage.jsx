import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft, Save, X, Plus, Languages, Heart, 
  MapPin, User, CheckCircle, AlertCircle, Sparkles, MessageSquare 
} from 'lucide-react';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [location, setLocation] = useState('');
  const [travelStyle, setTravelStyle] = useState('');
  const [languages, setLanguages] = useState([]);
  const [langInput, setLangInput] = useState('');
  const [interests, setInterests] = useState([]);

  // Pre-defined values
  const allowedTravelStyles = [
    'Adventure', 'Backpacking', 'Luxury', 'Road Trip', 
    'Camping', 'Solo', 'Family', 'Business'
  ];

  const allowedInterests = [
    'Photography', 'Mountains', 'Beaches', 'Food', 'Wildlife', 
    'History', 'Culture', 'Shopping', 'Nightlife', 'Camping', 
    'Hiking', 'Trekking'
  ];

  // Fetch the latest profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setBio(data.bio || '');
        setAge(data.age !== undefined && data.age !== null ? data.age : '');
        setGender(data.gender || 'Prefer not to say');
        setLocation(data.location || '');
        setTravelStyle(data.travelStyle || '');
        setLanguages(data.languages || []);
        setInterests(data.interests || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile details.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Language input handlers
  const handleAddLanguage = (e) => {
    e.preventDefault();
    const cleanLang = langInput.trim();
    if (cleanLang && !languages.includes(cleanLang)) {
      setLanguages([...languages, cleanLang]);
      setLangInput('');
    }
  };

  const handleRemoveLanguage = (langToRemove) => {
    setLanguages(languages.filter(lang => lang !== langToRemove));
  };

  // Interest selection handler
  const handleToggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent double submission

    setError(null);
    setSuccess(null);

    // Frontend Validations
    if (bio.length > 300) {
      setError('Bio must not exceed 300 characters.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (age !== '') {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        setError('Age must be a positive number.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSaving(true);

    try {
      const updatedProfile = await profileService.updateProfile({
        bio,
        age: age === '' ? null : Number(age),
        gender,
        location,
        travelStyle,
        languages,
        interests
      });

      // Update in AuthContext global state
      updateUser(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Delay navigation to let user see success banner
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 text-sm">Retrieving your profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] flex flex-col">
      {/* Header Dashboard Nav */}
      <header className="border-b border-slate-800 bg-navy-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          
          <span className="font-extrabold text-lg text-white font-sans">
            Edit <span className="text-brand-500">Profile</span>
          </span>

          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 animate-fade-in space-y-6">
        
        {/* Success/Error Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-500/20 text-red-300 p-4 rounded-2xl animate-shake">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8">
          
          {/* Card Title & User Summary */}
          <div className="border-b border-slate-800 pb-5 space-y-2">
            <div className="flex items-center gap-2 text-brand-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs uppercase tracking-widest font-extrabold">Traveler Settings</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Configure Your Travel Persona</h1>
            <p className="text-slate-400 text-xs font-light">
              Customize details like your interests and travel style. This builds your unique profile signature.
            </p>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-6">

            {/* Read-only User Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-navy-800/20 border border-slate-800/40 p-4 rounded-2xl space-y-1">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Full Name</span>
                <span className="text-slate-300 font-semibold text-sm">{user?.name}</span>
                <span className="text-[10px] text-slate-500 block">(Cannot be modified)</span>
              </div>
              <div className="bg-navy-800/20 border border-slate-800/40 p-4 rounded-2xl space-y-1">
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Address</span>
                <span className="text-slate-300 font-semibold text-sm">{user?.email}</span>
                <span className="text-[10px] text-slate-500 block">(Used for accounts)</span>
              </div>
            </div>

            {/* Bio (Text Area) */}
            <div className="space-y-2">
              <label htmlFor="bio" className="flex items-center justify-between text-sm font-semibold text-slate-200">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-brand-400" />
                  <span>Traveler Bio <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
                </span>
                <span className={`text-xs ${bio.length > 280 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                  {bio.length} / 300
                </span>
              </label>
              <textarea
                id="bio"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 300))}
                placeholder="Share your travel experiences, bucket list destinations, and what you look for in a travel buddy..."
                className="w-full bg-navy-800/40 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all duration-200 resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Age & Gender (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Age */}
              <div className="space-y-2">
                <label htmlFor="age" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <User className="h-4 w-4 text-brand-400" />
                  <span>Age <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
                </label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  className="w-full bg-navy-800/40 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label htmlFor="gender" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <User className="h-4 w-4 text-brand-400" />
                  <span>Gender <span className="text-brand-400 font-normal text-xs">*</span></span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#0b1329] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-all duration-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

            </div>

            {/* Location & Travel Style (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Location */}
              <div className="space-y-2">
                <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <MapPin className="h-4 w-4 text-brand-400" />
                  <span>Location <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full bg-navy-800/40 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Travel Style */}
              <div className="space-y-2">
                <label htmlFor="travelStyle" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Heart className="h-4 w-4 text-brand-400" />
                  <span>Travel Style <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
                </label>
                <select
                  id="travelStyle"
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full bg-[#0b1329] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-all duration-200"
                >
                  <option value="">Select your travel style</option>
                  {allowedTravelStyles.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Languages (Pill Tag Input) */}
            <div className="space-y-2">
              <label htmlFor="languages" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Languages className="h-4 w-4 text-brand-400" />
                <span>Languages Spoken <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
              </label>
              <div className="flex gap-2">
                <input
                  id="languages"
                  type="text"
                  value={langInput}
                  onChange={(e) => setLangInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage(e);
                    }
                  }}
                  placeholder="Add a language and press Enter or click Add"
                  className="flex-grow bg-navy-800/40 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 px-4 rounded-2xl text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Add</span>
                </button>
              </div>

              {/* Language Tags Display */}
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {languages.map((lang) => (
                    <span 
                      key={lang}
                      className="flex items-center gap-1 bg-brand-500/10 text-brand-300 border border-brand-500/25 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      <span>{lang}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="text-brand-400 hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No languages added yet.</p>
              )}
            </div>

            {/* Interests (Multi-select Toggle Tags) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Heart className="h-4 w-4 text-brand-400" />
                <span>Interests & Activities <span className="text-brand-400 font-normal text-xs">(Required for 100%)</span></span>
              </label>
              
              <div className="flex flex-wrap gap-3">
                {allowedInterests.map((interest) => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20' 
                          : 'bg-navy-800/30 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={saving}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-bold text-sm transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-navy-950/40 py-6 text-center text-xs text-slate-500 mt-10">
        <p>&copy; {new Date().getFullYear()} TravelBuddy AI. All details are kept secure.</p>
      </footer>
    </div>
  );
};

export default EditProfilePage;

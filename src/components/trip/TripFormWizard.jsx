import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, DollarSign, Compass, Users, Tag, FileText, 
  ArrowLeft, ArrowRight, AlertCircle, Sparkles, CheckCircle2, 
  Plane, Train, Bus, Car, Bike, Hotel, Shield, Lock, Eye, EyeOff, Check
} from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

// Helper date formatters to prevent timezone-related off-by-one errors
const toLocalDateString = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toUTCDate = (localDateString) => {
  if (!localDateString) return null;
  const [year, month, day] = localDateString.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const TRAVEL_STYLE_OPTIONS = [
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Backpacking', label: 'Backpacking' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Road Trip', label: 'Road Trip' },
  { value: 'Camping', label: 'Camping' },
  { value: 'Solo', label: 'Solo' },
  { value: 'Family', label: 'Family' },
  { value: 'Business', label: 'Business' }
];

const TRANSPORTATION_OPTIONS = [
  { value: 'Flight', label: 'Flight', icon: Plane },
  { value: 'Train', label: 'Train', icon: Train },
  { value: 'Bus', label: 'Bus', icon: Bus },
  { value: 'Car', label: 'Car', icon: Car },
  { value: 'Bike', label: 'Bike', icon: Bike }
];

const ACCOMMODATION_OPTIONS = [
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Homestay', label: 'Homestay' },
  { value: 'Resort', label: 'Resort' },
  { value: 'Any', label: 'Any' }
];

const GENDER_OPTIONS = ['No Preference', 'Male Only', 'Female Only', 'Mixed'];
const AGE_OPTIONS = ['No Preference', '18-25', '26-35', '36-50', '50+'];
const VISIBILITY_OPTIONS = [
  { value: 'Public', label: 'Public (Everyone can see)', icon: Eye },
  { value: 'Private', label: 'Private (Only you can see)', icon: EyeOff }
];

const STATUS_OPTIONS = ['Planning', 'Open for Partners', 'Matched', 'In Progress', 'Completed', 'Cancelled'];

const AVAILABLE_TAGS = [
  'Photography', 'Camping', 'Food Tour', 'Road Trip', 'Nightlife', 
  'Adventure', 'Wildlife', 'Historical Places', 'Relaxation', 
  'Shopping', 'Beach', 'Mountains'
];

const TripFormWizard = ({ initialData = {}, onSubmit, submitButtonText = 'Create Trip', isSubmitting = false }) => {
  const isEdit = !!initialData._id;

  // Form State
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelStyle: 'Adventure',
    transportation: 'Flight',
    accommodation: 'Hotel',
    maxTravelers: 2,
    genderPreference: 'No Preference',
    agePreference: 'No Preference',
    visibility: 'Public',
    status: 'Planning',
    tripTags: [],
    description: ''
  });

  // Load initial data if editing
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        destination: initialData.destination || '',
        startDate: toLocalDateString(initialData.startDate),
        endDate: toLocalDateString(initialData.endDate),
        budget: initialData.budget || '',
        travelStyle: initialData.travelStyle || 'Adventure',
        transportation: initialData.transportation || 'Flight',
        accommodation: initialData.accommodation || 'Hotel',
        maxTravelers: initialData.maxTravelers !== undefined ? initialData.maxTravelers : 2,
        genderPreference: initialData.genderPreference || 'No Preference',
        agePreference: initialData.agePreference || 'No Preference',
        visibility: initialData.visibility || 'Public',
        status: initialData.status || 'Planning',
        tripTags: initialData.tripTags || [],
        description: initialData.description || ''
      });
    }
  }, [initialData, isEdit]);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Input Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const alreadySelected = prev.tripTags.includes(tag);
      return {
        ...prev,
        tripTags: alreadySelected 
          ? prev.tripTags.filter(t => t !== tag)
          : [...prev.tripTags, tag]
      };
    });
  };

  // Step Validator
  const validateStep = (currentStep) => {
    const stepErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentStep === 1) {
      if (!formData.destination.trim()) {
        stepErrors.destination = 'Destination is required';
      }
      if (!formData.startDate) {
        stepErrors.startDate = 'Start date is required';
      } else {
        const start = toUTCDate(formData.startDate);
        // Only reject if it is a new/changed start date in the past
        const originalStartString = isEdit && initialData.startDate ? toLocalDateString(initialData.startDate) : '';
        if (start < today && formData.startDate !== originalStartString) {
          stepErrors.startDate = 'Start date cannot be in the past';
        }
      }
      if (!formData.endDate) {
        stepErrors.endDate = 'End date is required';
      } else if (formData.startDate) {
        const start = toUTCDate(formData.startDate);
        const end = toUTCDate(formData.endDate);
        if (end < start) {
          stepErrors.endDate = 'End date cannot be before start date';
        }
      }
    }

    if (currentStep === 2) {
      if (formData.budget === undefined || formData.budget === null || formData.budget === '') {
        stepErrors.budget = 'Budget is required';
      } else {
        const parsedBudget = Number(formData.budget);
        if (isNaN(parsedBudget) || parsedBudget <= 0) {
          stepErrors.budget = 'Budget must be greater than 0';
        }
      }
      if (!formData.travelStyle) {
        stepErrors.travelStyle = 'Travel style is required';
      }
    }

    if (currentStep === 3) {
      if (formData.maxTravelers !== undefined && formData.maxTravelers !== null && formData.maxTravelers !== '') {
        const parsedMax = Number(formData.maxTravelers);
        if (isNaN(parsedMax) || parsedMax < 2) {
          stepErrors.maxTravelers = 'Maximum travelers must be at least 2';
        }
      }
    }

    if (currentStep === 4) {
      if (formData.description && formData.description.length > 500) {
        stepErrors.description = 'Description cannot exceed 500 characters';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (validateStep(1) && validateStep(2) && validateStep(3) && validateStep(4)) {
      // Format to Date objects
      const finalPayload = {
        ...formData,
        startDate: toUTCDate(formData.startDate),
        endDate: toUTCDate(formData.endDate),
        budget: Number(formData.budget),
        maxTravelers: formData.maxTravelers ? Number(formData.maxTravelers) : undefined
      };
      onSubmit(finalPayload);
    } else {
      // Go to first step that failed validation
      if (!validateStep(1)) setStep(1);
      else if (!validateStep(2)) setStep(2);
      else if (!validateStep(3)) setStep(3);
      else if (!validateStep(4)) setStep(4);
    }
  };

  // Step Navigation Progress
  const stepTitles = ["Basic Info", "Trip Details", "Travel Group", "Preferences", "Review"];

  return (
    <div className="w-full space-y-8 max-w-4xl mx-auto">
      {/* Visual Progress Steps Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-extrabold border border-brand-500/20">
              {step}
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Step {step} of 5</span>
              <span className="text-white font-bold text-sm">{stepTitles[step - 1]}</span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md hidden sm:block">
            {/* Real Progress Bar */}
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-700/20">
              <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  // Allow jumping to steps only if they have been validated
                  let canJump = true;
                  for (let i = 1; i < s; i++) {
                    if (!validateStep(i)) {
                      canJump = false;
                      break;
                    }
                  }
                  if (canJump) setStep(s);
                }}
                disabled={isSubmitting}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                  step === s 
                    ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/10' 
                    : step > s 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                      : 'bg-slate-800/40 text-slate-500 border-slate-700/30 hover:text-slate-300'
                }`}
              >
                {step > s ? <Check className="h-3 w-3" /> : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form container */}
      <form onSubmit={handleFinalSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative" noValidate>
        {isSubmitting && (
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center z-40 rounded-3xl">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* STEP 1: BASIC INFO */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-400" />
                <span>Basic Information</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">Specify your destination and travel date window.</p>
            </div>

            <div className="space-y-4">
              {/* Destination Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Destination</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Kyoto, Japan or Yosemite Valley, USA"
                    className={`w-full bg-navy-800/40 border ${errors.destination ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition-all duration-200 outline-none`}
                  />
                </div>
                {errors.destination && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.destination}</span>
                  </p>
                )}
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Start Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`w-full bg-navy-800/40 border ${errors.startDate ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition-all duration-200 outline-none color-white scheme-dark`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.startDate}</span>
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">End Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`w-full bg-navy-800/40 border ${errors.endDate ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition-all duration-200 outline-none color-white scheme-dark`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{errors.endDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRIP DETAILS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-400" />
                <span>Trip Details</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">Provide trip budgeting, style preferences, and logistics.</p>
            </div>

            <div className="space-y-6">
              {/* Budget Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Budget (INR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <span className="text-sm font-bold text-slate-500">₹</span>
                  </div>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    min="1"
                    className={`w-full bg-navy-800/40 border ${errors.budget ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition-all duration-200 outline-none`}
                  />
                </div>
                {errors.budget && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.budget}</span>
                  </p>
                )}
              </div>

              {/* Travel Style Options (Custom Selectable Pills) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Travel Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRAVEL_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => handleSelectChange('travelStyle', style.value)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all duration-200 cursor-pointer ${
                        formData.travelStyle === style.value
                          ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-md'
                          : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transportation & Accommodation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transportation */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Preferred Transportation</label>
                  <div className="grid grid-cols-5 gap-2">
                    {TRANSPORTATION_OPTIONS.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          title={t.label}
                          onClick={() => handleSelectChange('transportation', t.value)}
                          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                            formData.transportation === t.value
                              ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                              : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accommodation */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Accommodation</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ACCOMMODATION_OPTIONS.map((acc) => (
                      <button
                        key={acc.value}
                        type="button"
                        onClick={() => handleSelectChange('accommodation', acc.value)}
                        className={`p-3 rounded-xl border text-[10px] font-semibold text-center transition-all duration-200 cursor-pointer flex items-center justify-center h-12 leading-tight ${
                          formData.accommodation === acc.value
                            ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-md'
                            : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVEL GROUP */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-400" />
                <span>Travel Group Preferences</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">Specify partner preferences, size limits, and trip privacy.</p>
            </div>

            <div className="space-y-6">
              {/* Max Travelers */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Maximum Travelers</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    name="maxTravelers"
                    value={formData.maxTravelers}
                    onChange={handleChange}
                    min="2"
                    className={`w-full bg-navy-800/40 border ${errors.maxTravelers ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl pl-10 pr-4 py-3 text-white text-sm transition-all duration-200 outline-none`}
                  />
                </div>
                {errors.maxTravelers && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.maxTravelers}</span>
                  </p>
                )}
                <span className="block text-[10px] text-slate-500 font-light leading-normal">Minimum of 2 travelers required. Leave empty or change if flexible.</span>
              </div>

              {/* Preferences: Gender & Age (Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender Preference */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Gender Preference</label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectChange('genderPreference', opt)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                          formData.genderPreference === opt
                            ? 'bg-brand-500/10 border-brand-500/50 text-brand-300'
                            : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Preference */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Age Preference</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AGE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectChange('agePreference', opt)}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer ${
                          formData.agePreference === opt
                            ? 'bg-brand-500/10 border-brand-500/50 text-brand-300'
                            : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trip Visibility */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Trip Visibility</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VISIBILITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectChange('visibility', opt.value)}
                        className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer ${
                          formData.visibility === opt.value
                            ? 'bg-brand-500/10 border-brand-500 text-white'
                            : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${formData.visibility === opt.value ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800/40 text-slate-500'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-white">{opt.value}</span>
                          <span className="text-[10px] text-slate-400 font-light">{opt.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Selector (Only if in Edit mode to manage trip status updates) */}
              {isEdit && (
                <div className="space-y-2 border-t border-slate-800/60 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Trip Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((statusOpt) => (
                      <button
                        key={statusOpt}
                        type="button"
                        onClick={() => handleSelectChange('status', statusOpt)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                          formData.status === statusOpt
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-navy-800/25 border-slate-800/80 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        {statusOpt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: PREFERENCES & TAGS */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-brand-400" />
                <span>Preferences & Tags</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">Select tags that describe the trip highlights and write a short summary.</p>
            </div>

            <div className="space-y-6">
              {/* Selectable tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Trip Tags</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = formData.tripTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs border font-medium transition-all duration-250 cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-500/10 border-brand-500 text-brand-300 shadow-sm shadow-brand-500/5'
                            : 'bg-navy-800/30 border-slate-850 text-slate-400 hover:border-slate-700/60 hover:text-slate-300'
                        }`}
                      >
                        <span>{tag}</span>
                        {isSelected && <Check className="h-3 w-3 text-brand-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description field with counter */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    (formData.description?.length || 0) > 480 ? 'text-red-400' : 'text-slate-500'
                  }`}>
                    {formData.description?.length || 0} / 500
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    maxLength="500"
                    placeholder="Provide a detailed itinerary or share your trip vision... (e.g. exploring the old streets of Gion, hiking Fushimi Inari at night, and trying out local matcha teas)"
                    className={`w-full bg-navy-800/40 border ${errors.description ? 'border-red-500/50' : 'border-slate-800 focus:border-brand-500/50'} focus:ring-0 rounded-xl p-4 text-white text-sm transition-all duration-200 outline-none resize-none`}
                  />
                </div>
                {errors.description && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{errors.description}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-400" />
                <span>Review Information</span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-1">Review your adventure itinerary detail before confirming.</p>
            </div>

            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic Card */}
                <div className="bg-navy-800/45 p-5 rounded-2xl border border-slate-800/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                    <MapPin className="h-3.5 w-3.5 text-brand-400" />
                    <span>Basic Details</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div className="text-sm"><span className="text-slate-500">Destination:</span> <strong className="text-white ml-1">{formData.destination}</strong></div>
                    <div className="text-sm"><span className="text-slate-500">Dates:</span> <strong className="text-white ml-1">{formData.startDate} to {formData.endDate}</strong></div>
                    <div className="text-sm"><span className="text-slate-500">Budget:</span> <strong className="text-brand-400 ml-1">₹{formData.budget} INR</strong></div>
                    <div className="text-sm"><span className="text-slate-500">Travel Style:</span> <strong className="text-white ml-1">{formData.travelStyle}</strong></div>
                  </div>
                </div>

                {/* Logistics Card */}
                <div className="bg-navy-800/45 p-5 rounded-2xl border border-slate-800/50 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Users className="h-3.5 w-3.5 text-brand-400" />
                    <span>Group & Options</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div className="text-sm"><span className="text-slate-500">Transportation:</span> <span className="text-white font-medium ml-1">{formData.transportation || 'None'}</span></div>
                    <div className="text-sm"><span className="text-slate-500">Accommodation:</span> <span className="text-white font-medium ml-1">{formData.accommodation || 'None'}</span></div>
                    <div className="text-sm"><span className="text-slate-500">Max Partners:</span> <span className="text-white font-medium ml-1">{formData.maxTravelers || 'Flexible'}</span></div>
                    <div className="text-sm"><span className="text-slate-500">Group Preferences:</span> <span className="text-white font-medium ml-1">{formData.genderPreference} / {formData.agePreference}</span></div>
                    <div className="text-sm"><span className="text-slate-500">Visibility:</span> <span className="text-white font-medium ml-1">{formData.visibility}</span></div>
                    {isEdit && <div className="text-sm"><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-semibold ml-1">{formData.status}</span></div>}
                  </div>
                </div>
              </div>

              {/* Tags Panel */}
              {formData.tripTags.length > 0 && (
                <div className="bg-navy-800/25 p-4 rounded-2xl border border-slate-800/40 space-y-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Selected Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tripTags.map(t => (
                      <span key={t} className="bg-brand-500/10 text-brand-300 border border-brand-500/15 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Panel */}
              {formData.description ? (
                <div className="bg-navy-800/25 p-4 rounded-2xl border border-slate-800/40 space-y-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Itinerary Description</span>
                  <p className="text-sm text-slate-350 font-light leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No description provided.</p>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-6 mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-750 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/10 border border-brand-500/20 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer ml-auto"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{submitButtonText}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TripFormWizard;

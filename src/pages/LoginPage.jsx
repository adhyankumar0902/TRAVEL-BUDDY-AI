import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const { loginUser, error, setError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    // Clear global error context on page mount
    setError(null);
  }, [isAuthenticated, navigate, setError]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(null);

    // 1. Simple Client-Side Validations
    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // 2. Submit credentials
    setIsSubmitting(true);
    try {
      const success = await loginUser(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Errors are handled by AuthContext and stored in 'error' state
      console.error('Login action error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-[#0b1329] to-[#1e293b] px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Brand/Logo Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <Compass className="h-9 w-9 text-brand-500 transition-transform group-hover:rotate-45 duration-300" />
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Travel<span className="text-brand-500">Buddy</span>
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your travel dashboard
          </p>
        </div>

        {/* Error Alert Display */}
        {activeError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-navy-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                  placeholder="name@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-navy-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-brand-800 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/35 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Navigation Footer */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold transition-all">
              Sign up for free
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

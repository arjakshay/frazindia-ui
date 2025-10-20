// src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userId.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const credentials = {
        userId: formData.userId.trim(),
        password: formData.password
      };

      const response = await authAPI.login(credentials);
      
      // Store token - assuming your backend returns a token in the response
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Success animation delay before redirect
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Invalid user ID or password');
      } else if (err.response?.status === 403) {
        setError('Account disabled. Please contact administrator.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (err.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials helper (remove in production)
  const fillDemoCredentials = () => {
    setFormData({
      userId: 'demo_user',
      password: 'demo123'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-32 size-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 size-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse [animation-delay:4000ms]" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Card with glass morphism effect */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 transition-all duration-500 hover:shadow-3xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 transition-transform duration-300 hover:scale-110 shadow-lg">
              <Shield className="size-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {import.meta.env.VITE_APP_NAME || 'FrazIndia Reports'}
            </h1>
            <p className="text-white/60 text-lg">Sign in to your account</p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-500">
              <AlertCircle className="size-5 text-red-300 shrink-0" />
              <span className="text-red-100 text-sm flex-1">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-500">
              <CheckCircle className="size-5 text-green-300 shrink-0" />
              <span className="text-green-100 text-sm flex-1">{success}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-3">
              <label htmlFor="userId" className="flex items-center gap-2 text-white/80 text-sm font-medium">
                <User className="size-4" />
                <span>User ID</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 group-hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  placeholder="Enter your user ID"
                  disabled={isLoading}
                  autoComplete="username"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="flex items-center gap-2 text-white/80 text-sm font-medium">
                  <Lock className="size-4" />
                  <span>Password</span>
                </label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pe-12 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 group-hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Demo Credentials Button (Remove in production) */}
              {import.meta.env.VITE_APP_ENV === 'development' && (
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-white/5 border border-white/10 text-white/70 rounded-xl font-medium text-sm hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
                >
                  Fill Demo Credentials
                </button>
              )}
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-center">
              <Link 
                to="/forgot-password" 
                className="text-white/60 hover:text-white text-sm transition-colors duration-200 hover:underline disabled:opacity-50 text-center"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/50 text-sm text-center">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-all duration-200 hover:underline disabled:opacity-50"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -end-4 size-8 bg-yellow-400/20 rounded-full animate-bounce" />
        <div className="absolute -bottom-4 -start-4 size-6 bg-cyan-400/20 rounded-full animate-bounce [animation-delay:1000ms]" />
      </div>

      {/* Security Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Shield className="size-3" />
          <span>Secure Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
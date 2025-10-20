// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, AlertCircle, CheckCircle, Loader2, Sparkles, XCircle, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/images/frazindia-logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ userId: '', password: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'userId':
        if (!value.trim()) {
          errors.userId = 'User ID is required';
        } else {
          errors.userId = '';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else {
          errors.password = '';
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field in real-time
    validateField(name, value);
    
    // Clear general error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.userId.trim()) {
      errors.userId = 'User ID is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(fieldErrors).find(key => fieldErrors[key]);
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
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

      await login(credentials);

      setSuccess('Login successful! Redirecting...');
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      let errorType = 'general';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        errorType = 'credentials';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid user ID or password. Please check your credentials.';
        errorType = 'credentials';
      } else if (err.response?.status === 403) {
        errorMessage = 'Account disabled. Please contact your administrator.';
        errorType = 'account';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again in a few minutes.';
        errorType = 'rateLimit';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server is temporarily unavailable. Please try again later.';
        errorType = 'server';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
        errorType = 'network';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
        errorType = 'timeout';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError({ message: errorMessage, type: errorType });

      // Auto-clear error after 8 seconds
      setTimeout(() => {
        setError('');
      }, 8000);

    } finally {
      setIsLoading(false);
    }
  };

  const getErrorIcon = (type) => {
    switch (type) {
      case 'credentials':
        return <Shield className="w-5 h-5 text-amber-500" />;
      case 'account':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'network':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'server':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getErrorColor = (type) => {
    switch (type) {
      case 'credentials':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
      case 'account':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'network':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'server':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      default:
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  const getErrorTextColor = (type) => {
    switch (type) {
      case 'credentials':
        return 'text-amber-800 dark:text-amber-200';
      case 'account':
        return 'text-red-800 dark:text-red-200';
      case 'network':
        return 'text-blue-800 dark:text-blue-200';
      case 'server':
        return 'text-orange-800 dark:text-orange-200';
      default:
        return 'text-red-800 dark:text-red-200';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/20 p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-amber-500/20 dark:bg-amber-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/30 dark:bg-amber-500/20 rounded-full animate-bounce" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-amber-500/20 dark:bg-amber-600/10 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-amber-600/10 dark:bg-amber-700/5 rounded-full animate-bounce delay-1000" />
      </div>

      {/* Enhanced Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/60 dark:border-amber-700/30 p-8 transform transition-all duration-300 hover:shadow-amber-200/20 dark:hover:shadow-amber-900/20">

          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl blur-md opacity-75 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src={logo}
                  alt="FrazIndia Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-16 h-16 hidden items-center justify-center text-white">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-800 dark:from-amber-300 dark:to-amber-200 bg-clip-text text-transparent mb-2">
              FrazIndia
            </h1>
            <p className="text-amber-700/80 dark:text-amber-300/80 text-lg">Welcome back! Please sign in</p>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className={`mb-6 p-4 border rounded-xl flex items-start gap-3 animate-shake ${getErrorColor(error.type)}`}>
              {getErrorIcon(error.type)}
              <div className="flex-1">
                <p className={`font-medium ${getErrorTextColor(error.type)}`}>
                  {error.message}
                </p>
                {error.type === 'credentials' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                    <span className="text-amber-500 dark:text-amber-500">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, password: '' }));
                        document.getElementById('password')?.focus();
                      }}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline transition-colors"
                    >
                      Clear Password
                    </button>
                  </div>
                )}
                {error.type === 'account' && (
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                    Contact support if you believe this is an error.
                  </p>
                )}
              </div>
              <button
                onClick={() => setError('')}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors p-1 rounded"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 text-sm flex-1">{success}</span>
            </div>
          )}

          {/* Enhanced Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced User ID Field */}
            <div className="space-y-3">
              <label htmlFor="userId" className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>User ID</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  onBlur={(e) => validateField('userId', e.target.value)}
                  required
                  className={`w-full px-4 py-3.5 bg-white dark:bg-gray-700 border rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                    fieldErrors.userId 
                      ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                      : 'border-amber-300 dark:border-amber-600 focus:border-amber-400 dark:focus:border-amber-500'
                  }`}
                  placeholder="Enter your user ID"
                  disabled={isLoading}
                  autoComplete="username"
                />
                {fieldErrors.userId && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              {fieldErrors.userId && (
                <p className="text-red-500 text-sm flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.userId}
                </p>
              )}
            </div>

            {/* Enhanced Password Field */}
            <div className="space-y-3">
              <label htmlFor="password" className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={(e) => validateField('password', e.target.value)}
                  required
                  className={`w-full px-4 py-3.5 pr-12 bg-white dark:bg-gray-700 border rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                    fieldErrors.password 
                      ? 'border-red-300 dark:border-red-600 focus:border-red-400 dark:focus:border-red-500' 
                      : 'border-amber-300 dark:border-amber-600 focus:border-amber-400 dark:focus:border-amber-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {fieldErrors.password && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <button
                    type="button"
                    className="text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all duration-200 p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-sm flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 text-sm font-medium transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading || Object.values(fieldErrors).some(error => error)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-amber-300/30 dark:hover:shadow-amber-900/30 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <div className={`w-5 h-5 transform transition-transform duration-300 ${isHovered ? 'translate-x-1' : 'translate-x-0'}`}>
                      <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-semibold transition-colors duration-200"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-8 pt-6 border-t border-amber-200 dark:border-amber-700/50">
            <div className="flex items-center justify-between text-sm">
              <p className="text-amber-600 dark:text-amber-400">
                Secure Authentication System
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-amber-500 dark:text-amber-500">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
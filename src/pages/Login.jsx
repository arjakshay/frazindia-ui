// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, AlertCircle, CheckCircle, Loader2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

      await login(credentials);
      
      setSuccess('Login successful! Redirecting...');
      navigate('/dashboard', { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      
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

  const fillDemoCredentials = () => {
    setFormData({
      userId: 'demo_user',
      password: 'demo123'
    });
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
              <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-800 dark:from-amber-300 dark:to-amber-200 bg-clip-text text-transparent mb-2">
              Front India
            </h1>
            <p className="text-amber-700/80 dark:text-amber-300/80 text-lg">Welcome back! Please sign in</p>
          </div>

          {/* Enhanced Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</span>
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
                  required
                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border border-amber-300 dark:border-amber-600 rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  placeholder="Enter your user ID"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
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
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white dark:bg-gray-700 border border-amber-300 dark:border-amber-600 rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all duration-200 p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
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

              {/* Enhanced Demo Credentials Button */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-xl font-medium text-sm hover:bg-amber-200 dark:hover:bg-amber-900/50 hover:text-amber-800 dark:hover:text-amber-200 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]"
                >
                  Fill Demo Credentials
                </button>
              )}
            </div>
          </form>

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
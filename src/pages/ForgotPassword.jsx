// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, AlertCircle, CheckCircle, Loader2, Shield, Sparkles, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    userId: '',
    emailId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
    
    if (!formData.userId.trim() || !formData.emailId.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.emailId)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically make an API call to send password reset email
      // await sendPasswordReset({ userId: formData.userId, email: formData.emailId });
      
      setSuccess('Password reset instructions have been sent to your email!');
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/20 p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-amber-400/20 dark:bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-amber-500/20 dark:bg-amber-700/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Enhanced Forgot Password Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/60 dark:border-amber-700/30 p-8 transform transition-all duration-300 hover:shadow-amber-200/20 dark:hover:shadow-amber-900/20">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

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
              FrazIndia
            </h1>
            <p className="text-amber-700/80 dark:text-amber-300/80 text-lg">Recover your password</p>
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

          {/* Enhanced Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-3">
              <label htmlFor="userId" className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>Enter User Id to recover password</span>
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border border-amber-300 dark:border-amber-600 rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-300 disabled:opacity-50"
                placeholder="Enter User Id"
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="emailId" className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm font-medium">
                <Mail className="w-4 h-4" />
                <span>Email Id</span>
              </label>
              <input
                type="email"
                id="emailId"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 bg-white dark:bg-gray-700 border border-amber-300 dark:border-amber-600 rounded-xl text-amber-900 dark:text-white placeholder-amber-400 dark:placeholder-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all duration-300 disabled:opacity-50"
                placeholder="Enter Email Id"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-xl font-semibold text-lg hover:from-amber-600 hover:to-amber-700 dark:hover:from-amber-700 dark:hover:to-amber-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-amber-300/30 dark:hover:shadow-amber-900/30 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Instructions</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-semibold transition-colors duration-200"
              >
                Back to Login
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

export default ForgotPassword;
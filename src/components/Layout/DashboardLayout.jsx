import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LogOut,
  Menu,
  User,
  ChevronDown,
  Settings,
  Bell,
  Search,
  Sun,
  Moon,
  HelpCircle,
  Download,
  Shield,
  Sparkles,
  Clock,
  AlertTriangle
} from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [apiSessionExpired, setApiSessionExpired] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const apiCheckIntervalRef = useRef(null);

  // Session timeout configuration (60 minutes)
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes in milliseconds
  const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before expiry
  const API_CHECK_INTERVAL = 30 * 1000; // Check API session every 30 seconds

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Session timeout management - Fixed 60 minutes
  useEffect(() => {
    const initializeSession = () => {
      const existingExpiry = localStorage.getItem('sessionExpiry');
      const sessionId = localStorage.getItem('sessionId');
      const currentSessionId = localStorage.getItem('currentSessionId');
      const loginTime = localStorage.getItem('loginTime');

      // If no session exists or session IDs don't match, create new session
      if (!existingExpiry || sessionId !== currentSessionId || !loginTime) {
        const expiryTime = Date.now() + SESSION_TIMEOUT;
        const newSessionId = generateSessionId();
        
        localStorage.setItem('sessionExpiry', expiryTime.toString());
        localStorage.setItem('sessionId', newSessionId);
        localStorage.setItem('currentSessionId', newSessionId);
        localStorage.setItem('loginTime', Date.now().toString());
        
        setSessionTimeLeft(SESSION_TIMEOUT);
      } else {
        const timeLeft = parseInt(existingExpiry) - Date.now();
        if (timeLeft <= 0) {
          handleSessionExpiry();
          return;
        }
        setSessionTimeLeft(timeLeft);
        
        if (timeLeft <= WARNING_THRESHOLD) {
          setShowSessionWarning(true);
        }
      }

      // Set timeout for session expiry
      const timeUntilExpiry = getTimeUntilExpiry();
      if (timeUntilExpiry > 0) {
        sessionTimerRef.current = setTimeout(() => {
          handleSessionExpiry();
        }, timeUntilExpiry);

        // Set timeout for warning
        const warningTime = timeUntilExpiry - WARNING_THRESHOLD;
        if (warningTime > 0) {
          setTimeout(() => {
            setShowSessionWarning(true);
          }, warningTime);
        }
      }
    };

    const getTimeUntilExpiry = () => {
      const expiryTime = parseInt(localStorage.getItem('sessionExpiry') || '0');
      return Math.max(0, expiryTime - Date.now());
    };

    const updateSessionCountdown = () => {
      const expiryTime = parseInt(localStorage.getItem('sessionExpiry') || '0');
      const timeLeft = expiryTime - Date.now();
      
      if (timeLeft > 0) {
        setSessionTimeLeft(timeLeft);
        
        // Check if we need to show warning
        if (timeLeft <= WARNING_THRESHOLD && !showSessionWarning) {
          setShowSessionWarning(true);
        }
      } else {
        handleSessionExpiry();
      }
    };

    const handleSessionExpiry = () => {
      console.log('Session expired - forcing logout');
      cleanupSession();
      forceLogout();
    };

    const cleanupSession = () => {
      if (sessionTimerRef.current) {
        clearTimeout(sessionTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (apiCheckIntervalRef.current) {
        clearInterval(apiCheckIntervalRef.current);
      }
      setShowSessionWarning(false);
      setSessionTimeLeft(0);
    };

    const generateSessionId = () => {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // API Session Health Check
    const checkApiSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setApiSessionExpired(true);
          return;
        }

        // Make a lightweight API call to check session validity
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.log('API session expired detected');
          setApiSessionExpired(true);
          handleSessionExpiry();
        }
      } catch (error) {
        console.log('API check failed:', error);
        // Don't logout on network errors, only on auth errors
      }
    };

    // Listen for storage changes (multi-device logout)
    const handleStorageChange = (e) => {
      if (e.key === 'forceLogout' || e.key === 'sessionId') {
        const currentSessionId = localStorage.getItem('currentSessionId');
        const globalSessionId = localStorage.getItem('sessionId');
        
        if (currentSessionId !== globalSessionId) {
          console.log('Multi-device logout detected');
          cleanupSession();
          forceLogout();
        }
      }
      
      if (e.key === 'apiSessionExpired' && e.newValue === 'true') {
        console.log('API session expired from another tab');
        setApiSessionExpired(true);
        handleSessionExpiry();
      }
    };

    // Listen for beforeunload to cleanup
    const handleBeforeUnload = () => {
      cleanupSession();
    };

    // Custom event listener for API session expiry
    const handleApiSessionExpired = () => {
      console.log('API session expired event received');
      setApiSessionExpired(true);
      handleSessionExpiry();
    };

    // Initialize session
    initializeSession();

    // Update countdown every second
    countdownIntervalRef.current = setInterval(updateSessionCountdown, 1000);

    // Check API session health periodically
    apiCheckIntervalRef.current = setInterval(checkApiSession, API_CHECK_INTERVAL);

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('apiSessionExpired', handleApiSessionExpired);

    // Global function to trigger session expiry from anywhere in the app
    window.triggerSessionExpiry = () => {
      console.log('Manual session expiry triggered');
      setApiSessionExpired(true);
      handleSessionExpiry();
    };

    return () => {
      cleanupSession();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('apiSessionExpired', handleApiSessionExpired);
      delete window.triggerSessionExpiry;
    };
  }, [logout, navigate]);

  // Effect to handle API session expiry
  useEffect(() => {
    if (apiSessionExpired) {
      console.log('API session expired - performing logout');
      handleSessionExpiry();
    }
  }, [apiSessionExpired]);

  const forceLogout = async () => {
    // Set flag to indicate session expired
    localStorage.setItem('sessionExpired', 'true');
    
    // Clear all session data
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('loginTime');
    
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (apiCheckIntervalRef.current) {
      clearInterval(apiCheckIntervalRef.current);
    }
    
    await logout();
    
    // Use window.location for hard redirect to ensure complete logout
    window.location.href = '/login?session=expired';
  };

  const handleSessionExpiry = () => {
    console.log('Session expiry handler called');
    forceLogout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Clear session data
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('currentSessionId');
    localStorage.removeItem('loginTime');
    
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (apiCheckIntervalRef.current) {
      clearInterval(apiCheckIntervalRef.current);
    }
    
    await logout();
    navigate('/login', { replace: true });
  };

  const handleExtendSession = () => {
    // For fixed session, we don't extend, just hide warning
    setShowSessionWarning(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formatTimeLeft = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const mainApps = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      path: '/analytics',
    },
    {
      id: 'test2treat',
      name: 'Test2Treat',
      path: '/test2treat',
      comingSoon: true
    },
    {
      id: 'elearning',
      name: 'E-Learning',
      path: '/elearning',
      comingSoon: true
    },
    {
      id: 'policies',
      name: 'Policies',
      path: '/policies',
      comingSoon: true
    }
  ];

  const currentApp = mainApps.find(app => location.pathname.startsWith(app.path)) || mainApps[0];

  // Enhanced children with session expiry handler
  const childrenWithProps = React.Children.map(children, child =>
    React.isValidElement(child) 
      ? React.cloneElement(child, { 
          darkMode,
          onSessionExpired: () => {
            console.log('Session expired from child component');
            setApiSessionExpired(true);
          }
        })
      : child
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 flex ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-amber-50'
    }`}>
      {/* Session Expiry Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl ${
            darkMode 
              ? 'bg-gray-800 border border-amber-500/30' 
              : 'bg-white border border-amber-300'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Session About to Expire
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your session will expire in {formatTimeLeft(sessionTimeLeft)}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  Time remaining:
                </span>
                <span className={`text-lg font-bold ${
                  sessionTimeLeft && sessionTimeLeft < 60000 
                    ? 'text-red-500' 
                    : darkMode ? 'text-amber-300' : 'text-amber-700'
                }`}>
                  {formatTimeLeft(sessionTimeLeft)}
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    sessionTimeLeft && sessionTimeLeft < 60000 
                      ? 'bg-red-500' 
                      : 'bg-amber-500'
                  }`}
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (sessionTimeLeft / SESSION_TIMEOUT) * 100))}%` 
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Log Out Now
              </button>
              <button
                onClick={handleExtendSession}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Continue Working
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
      />

      {/* Enhanced Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-2' : 'lg:ml-0'
      }`}>
        {/* Enhanced Header */}
        <header className={`sticky top-0 z-30 transition-all duration-300 backdrop-blur-md ${
          darkMode 
            ? 'bg-gray-900/80 border-b border-gray-700/50' 
            : 'bg-white/80 border-b border-amber-200/50'
        }`}>
          <div className="flex items-center justify-between px-6 py-4.5">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl transition-all duration-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:scale-110"
              >
                <Menu className={`w-5 h-5 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </button>
              
              {/* Enhanced Page Title */}
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  darkMode 
                    ? 'bg-amber-500/10 border border-amber-500/20' 
                    : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentApp.name}
                  </h1>
                  <p className={`text-sm ${
                    darkMode ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    {currentApp.id === 'dashboard' ? 'Executive Overview' : 
                     currentApp.id === 'analytics' ? 'Business Intelligence & Analytics' : 'Coming Soon'}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Right Section */}
            <div className="flex items-center space-x-3">
              {/* Session Timer */}
              {sessionTimeLeft && sessionTimeLeft > 0 && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${
                  darkMode 
                    ? sessionTimeLeft < 60000 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : sessionTimeLeft < 60000 
                      ? 'bg-red-100 border-red-300 text-red-600' 
                      : 'bg-amber-100 border-amber-300 text-amber-600'
                } transition-all duration-300`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatTimeLeft(sessionTimeLeft)}
                  </span>
                </div>
              )}

              {/* Enhanced Quick Actions */}
              <button 
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' 
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                } hover:scale-110`}
                title="Download Reports"
              >
                <Download className="w-5 h-5" />
              </button>

              {/* Enhanced Help */}
              <button 
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' 
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                } hover:scale-110`}
                title="Help & Support"
              >
                <HelpCircle className="w-5 h-5" />
              </button>

              {/* Enhanced Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all duration-200 ${
                  darkMode 
                    ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300' 
                    : 'text-amber-600 hover:bg-amber-100 hover:text-amber-700'
                } hover:scale-110`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Enhanced Notifications */}
              <button className={`p-2.5 rounded-xl transition-all duration-200 relative ${
                darkMode 
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' 
                  : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
              } hover:scale-110`}
              title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
              </button>

              {/* Enhanced Search */}
              <div className="relative" ref={searchRef}>
                <div className={`flex items-center transition-all duration-300 ${
                  searchOpen ? 'w-72' : 'w-12'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchOpen(!searchOpen);
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      darkMode 
                        ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' 
                        : 'text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                    } hover:scale-110`}
                    title="Search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  {searchOpen && (
                    <div className="flex-1 ml-2">
                      <input
                        type="text"
                        placeholder="Search reports, analytics..."
                        className={`w-full px-4 py-2.5 outline-none text-sm rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                          darkMode
                            ? 'bg-gray-800 border-amber-500/30 text-white placeholder-amber-400/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                            : 'bg-white border-amber-300 text-gray-900 placeholder-amber-500/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                        }`}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setSearchOpen(false);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 ${
                    darkMode 
                      ? 'hover:bg-amber-500/10' 
                      : 'hover:bg-amber-100'
                  } hover:scale-105`}
                  title="User Menu"
                >
                  <div className="text-right hidden lg:block">
                    <p className={`text-sm font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.name?.split(' ')[1] || 'User'}
                    </p>
                    <p className={`text-xs ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {user?.designation?.split(' ')[0] || 'Role'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    darkMode 
                      ? 'bg-amber-500/10 border border-amber-500/20' 
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  } ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                </button>

                {userMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl py-2 z-50 animate-fadeIn ${
                    darkMode
                      ? 'bg-gray-800/95 border-amber-500/20'
                      : 'bg-white/95 border-amber-200'
                  }`}>
                    {/* Enhanced User Header */}
                    <div className={`px-4 py-3 border-b ${
                      darkMode ? 'border-amber-500/20' : 'border-amber-100'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          darkMode 
                            ? 'bg-amber-500/10 border border-amber-500/20' 
                            : 'bg-amber-50 border border-amber-200'
                        }`}>
                          <User className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user?.name || 'User'}
                          </p>
                          <p className={`text-xs truncate ${
                            darkMode ? 'text-amber-400' : 'text-amber-600'
                          }`}>
                            {user?.designation || 'User Role'}
                          </p>
                          <div className="flex items-center mt-1 space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className={`text-xs ${
                              darkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Menu Items */}
                    <div className="space-y-1 p-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                          darkMode
                            ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-400'
                            : 'text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                          darkMode
                            ? 'text-amber-300 hover:bg-amber-500/10 hover:text-amber-400'
                            : 'text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <div className={`border-t pt-2 ${
                        darkMode ? 'border-amber-500/20' : 'border-amber-100'
                      }`}>
                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                            darkMode
                              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {childrenWithProps}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
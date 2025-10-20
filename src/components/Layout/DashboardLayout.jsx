// src/components/Layout/DashboardLayout.jsx
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
  Sparkles
} from 'lucide-react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [notifications, setNotifications] = useState([]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Sync dark mode with localStorage and document class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  // Enhanced children with darkMode prop
  const childrenWithDarkMode = React.Children.map(children, child =>
    React.isValidElement(child) 
      ? React.cloneElement(child, { darkMode })
      : child
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 flex ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 to-amber-50'
    }`}>
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
                    : 'bg-amber-50 border border-amber-200'
                }`}>
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
            {childrenWithDarkMode}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
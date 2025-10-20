// src/components/Layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  BarChart3,
  Stethoscope,
  BookOpen,
  FileText,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Home
} from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse,
  darkMode = false
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mainApps = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      activeColor: 'text-amber-700 dark:text-amber-300',
      inactiveColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-500/30',
      borderColor: 'border-amber-200 dark:border-amber-500/30'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      activeColor: 'text-amber-700 dark:text-amber-300',
      inactiveColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-500/30',
      borderColor: 'border-amber-200 dark:border-amber-500/30'
    },
    {
      id: 'test2treat',
      name: 'Test2Treat',
      icon: Stethoscope,
      path: '/test2treat',
      activeColor: 'text-amber-700 dark:text-amber-300',
      inactiveColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-500/30',
      borderColor: 'border-amber-200 dark:border-amber-500/30',
      comingSoon: true
    },
    {
      id: 'elearning',
      name: 'E-Learning',
      icon: BookOpen,
      path: '/elearning',
      activeColor: 'text-amber-700 dark:text-amber-300',
      inactiveColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-500/30',
      borderColor: 'border-amber-200 dark:border-amber-500/30',
      comingSoon: true
    },
    {
      id: 'policies',
      name: 'Policies & Circulars',
      icon: FileText,
      path: '/policies',
      activeColor: 'text-amber-700 dark:text-amber-300',
      inactiveColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-500/30',
      borderColor: 'border-amber-200 dark:border-amber-500/30',
      comingSoon: true
    }
  ];

  // Simple current app detection
  const currentApp = mainApps.find(app => 
    location.pathname === app.path || 
    location.pathname.startsWith(app.path + '/')
  ) || mainApps[0];

  // Show analytics reports when on analytics or reports pages
  const isAnalyticsActive = 
    location.pathname === '/analytics' || 
    location.pathname.startsWith('/reports');

  const handleAppClick = (app) => {
    if (!app.comingSoon) {
      navigate(app.path);
      if (window.innerWidth < 1024) { // Close on mobile after navigation
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        flex flex-col h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-80'}
        ${darkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-amber-200'}
        fixed lg:sticky top-0 left-0 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-screen
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center py-6.5' : 'justify-between p-6'} border-b ${
            darkMode ? 'border-gray-700' : 'border-amber-200'
          }`}>
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Front India
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enterprise Platform
                  </p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleCollapse}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Collapse Toggle for Collapsed State */}
          {isCollapsed && (
            <div className="flex justify-center py-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={onToggleCollapse}
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="space-y-2">
              {mainApps.map((app) => {
                const isActive = currentApp.id === app.id;
                const IconComponent = app.icon;
                
                return (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`
                      w-full flex items-center rounded-xl transition-all duration-200
                      ${isCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                      ${isActive
                        ? `${app.bgColor} border ${app.borderColor} shadow-sm`
                        : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} ${app.hoverBg}`
                      }
                      ${app.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={app.comingSoon}
                    title={isCollapsed ? app.name : ''}
                  >
                    <IconComponent className={`w-5 h-5 ${
                      isActive ? app.activeColor : app.inactiveColor
                    }`} />
                    
                    {!isCollapsed && (
                      <div className="flex items-center justify-between flex-1">
                        <span className={`font-medium ${
                          isActive ? app.activeColor : app.inactiveColor
                        }`}>
                          {app.name}
                        </span>
                        {app.comingSoon && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            Soon
                          </span>
                        )}
                        {isActive && (
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-sm truncate ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.designation || 'User Role'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
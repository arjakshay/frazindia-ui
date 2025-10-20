// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Download,
  FileText,
  ArrowUp,
  ArrowDown,
  Target,
  Zap,
  Activity,
  Eye,
  Shield,
  Sparkles,
  Clock,
  CheckCircle2,
  X,
  AlertTriangle,
  Info,
  Star
} from 'lucide-react';

const Dashboard = ({ darkMode = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeTimeFrame, setActiveTimeFrame] = useState('monthly');
  const [dismissedBanners, setDismissedBanners] = useState([]);

  // Banner data
  const banners = [
    {
      id: 1,
      type: 'info',
      title: 'New Feature Available',
      description: 'Try our new advanced analytics with real-time insights and predictive forecasting.',
      cta: 'Explore Now',
      action: () => navigate('/analytics'),
      icon: Sparkles,
      gradient: darkMode 
        ? 'from-blue-500/20 to-purple-500/20' 
        : 'from-blue-50 to-purple-50',
      borderColor: darkMode ? 'border-blue-500/30' : 'border-blue-200',
      textColor: darkMode ? 'text-blue-400' : 'text-blue-600'
    },
    {
      id: 2,
      type: 'warning',
      title: 'System Maintenance',
      description: 'Scheduled maintenance on Saturday, 10:00 PM - 2:00 AM. Some features may be unavailable.',
      cta: 'View Schedule',
      action: () => navigate('/maintenance'),
      icon: AlertTriangle,
      gradient: darkMode 
        ? 'from-amber-500/20 to-orange-500/20' 
        : 'from-amber-50 to-orange-50',
      borderColor: darkMode ? 'border-amber-500/30' : 'border-amber-200',
      textColor: darkMode ? 'text-amber-400' : 'text-amber-600'
    },
    {
      id: 3,
      type: 'success',
      title: 'Quarterly Goals Achieved!',
      description: 'Your team has exceeded Q3 targets by 15%. View detailed performance report.',
      cta: 'See Report',
      action: () => navigate('/reports/performance'),
      icon: Star,
      gradient: darkMode 
        ? 'from-green-500/20 to-emerald-500/20' 
        : 'from-green-50 to-emerald-50',
      borderColor: darkMode ? 'border-green-500/30' : 'border-green-200',
      textColor: darkMode ? 'text-green-400' : 'text-green-600'
    }
  ];

  const dismissBanner = (bannerId) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));

  // Use light mode colors by default, dark mode only when explicitly in dark mode
  const stats = [
    {
      name: 'Total Reports',
      value: '24',
      change: '+4.75%',
      changeType: 'positive',
      icon: BarChart3,
      description: 'Available reports',
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
      bgColor: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      borderColor: darkMode ? 'border-blue-500/20' : 'border-blue-200'
    },
    {
      name: 'Active Users',
      value: '1,234',
      change: '+12.4%',
      changeType: 'positive',
      icon: Users,
      description: 'Online now',
      color: darkMode ? 'text-green-400' : 'text-green-600',
      bgColor: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      borderColor: darkMode ? 'border-green-500/20' : 'border-green-200'
    },
    {
      name: 'Monthly Sales',
      value: '₹42.8L',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Current month',
      color: darkMode ? 'text-amber-400' : 'text-amber-600',
      bgColor: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      borderColor: darkMode ? 'border-amber-500/20' : 'border-amber-200'
    },
    {
      name: 'Products',
      value: '156',
      change: '+3.2%',
      changeType: 'positive',
      icon: Package,
      description: 'Active items',
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
      bgColor: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      borderColor: darkMode ? 'border-purple-500/20' : 'border-purple-200'
    }
  ];

  const quickActions = [
    {
      name: 'Sales Statement',
      description: 'View detailed sales performance',
      icon: FileText,
      color: darkMode ? 'text-blue-400' : 'text-blue-600',
      bgColor: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      hoverColor: darkMode ? 'hover:bg-blue-500/20' : 'hover:bg-blue-100',
      action: () => navigate('/reports/sales-stmt')
    },
    {
      name: 'Dispatch Report',
      description: 'Track dispatch operations',
      icon: Package,
      color: darkMode ? 'text-green-400' : 'text-green-600',
      bgColor: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      hoverColor: darkMode ? 'hover:bg-green-500/20' : 'hover:bg-green-100',
      action: () => navigate('/reports/dispatch-stmt')
    },
    {
      name: 'Monthly Performance',
      description: 'YPM analysis and reports',
      icon: Target,
      color: darkMode ? 'text-amber-400' : 'text-amber-600',
      bgColor: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      hoverColor: darkMode ? 'hover:bg-amber-500/20' : 'hover:bg-amber-100',
      action: () => navigate('/reports/mon-cumm-ypm')
    },
    {
      name: 'Data Export',
      description: 'Download reports in multiple formats',
      icon: Download,
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
      bgColor: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      hoverColor: darkMode ? 'hover:bg-purple-500/20' : 'hover:bg-purple-100',
      action: () => navigate('/exports')
    }
  ];

  const recentActivities = [
    { 
      action: 'Sales Report Generated', 
      time: '2 mins ago', 
      user: 'You', 
      type: 'success',
      icon: CheckCircle2
    },
    { 
      action: 'New User Registered', 
      time: '5 mins ago', 
      user: 'System', 
      type: 'info',
      icon: Users
    },
    { 
      action: 'Data Export Completed', 
      time: '10 mins ago', 
      user: 'You', 
      type: 'success',
      icon: Download
    },
    { 
      action: 'System Backup', 
      time: '1 hour ago', 
      user: 'Admin', 
      type: 'warning',
      icon: Shield
    }
  ];

  const getActivityColor = (type) => {
    const colors = {
      success: darkMode ? 'text-green-400' : 'text-green-500',
      info: darkMode ? 'text-blue-400' : 'text-blue-500',
      warning: darkMode ? 'text-amber-400' : 'text-amber-500',
      error: darkMode ? 'text-red-400' : 'text-red-500'
    };
    return colors[type] || (darkMode ? 'text-amber-400' : 'text-amber-500');
  };

  const timeFrames = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome back, {user?.name?.split(' ')[1] || 'User'}! 👋
            </h1>
            <p className="text-amber-100 text-lg opacity-90 max-w-2xl">
              Here's what's happening with your analytics today. You have <span className="font-semibold">12 new reports</span> and <span className="font-semibold">3 important updates</span>.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-4 right-4 w-4 h-4 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full animate-bounce"></div>
      </div>

      {/* Modern Banners Section */}
      {activeBanners.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Announcements & Updates
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeBanners.map((banner) => {
              const IconComponent = banner.icon;
              return (
                <div
                  key={banner.id}
                  className={`relative rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 hover:shadow-lg group overflow-hidden ${banner.gradient} ${banner.borderColor}`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-2 right-2 w-16 h-16 bg-current rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-12 h-12 bg-current rounded-full"></div>
                  </div>
                  
                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissBanner(banner.id)}
                    className={`absolute top-3 right-3 p-1 rounded-lg transition-all duration-200 ${
                      darkMode 
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                        : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-2 rounded-xl ${banner.bgColor || (darkMode ? 'bg-white/10' : 'bg-white/50')}`}>
                        <IconComponent className={`w-5 h-5 ${banner.textColor}`} />
                      </div>
                      <h3 className={`font-bold text-lg flex-1 ${banner.textColor}`}>
                        {banner.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {banner.description}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={banner.action}
                      className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-white/20 hover:bg-white/30 text-white' 
                          : 'bg-white/80 hover:bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      {banner.cta}
                    </button>
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${banner.borderColor}`}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={`rounded-2xl p-6 border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Hover effect background */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              index === 0 
                ? darkMode ? 'from-blue-500/5 to-blue-500/10' : 'from-blue-50 to-blue-100'
                : index === 1 
                ? darkMode ? 'from-green-500/5 to-green-500/10' : 'from-green-50 to-green-100'
                : index === 2 
                ? darkMode ? 'from-amber-500/5 to-amber-500/10' : 'from-amber-50 to-amber-100'
                : darkMode ? 'from-purple-500/5 to-purple-500/10' : 'from-purple-50 to-purple-100'
            }`}></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.name}
                  </p>
                  <p className={`text-3xl font-bold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border transition-all duration-300 group-hover:scale-110 ${
                  hoveredCard === index ? 'scale-110' : 'scale-100'
                } ${stat.bgColor} ${stat.borderColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className={`flex items-center space-x-2 text-sm font-semibold ${
                stat.changeType === 'positive' 
                  ? darkMode ? 'text-green-400' : 'text-green-600'
                  : darkMode ? 'text-red-400' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
                <span className={`font-normal ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  from last month
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Quick Actions */}
        <div className="lg:col-span-2">
          <div className={`rounded-2xl p-6 border shadow-sm ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h2>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Frequently accessed reports and tools
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-amber-500/10' : 'bg-amber-50'
              }`}>
                <Zap className={`w-6 h-6 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className={`rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${action.bgColor}`}>
                    <action.icon className={`w-7 h-7 ${action.color}`} />
                  </div>
                  <h3 className={`font-bold text-base mb-2 group-hover:text-amber-600 transition-colors ${
                    darkMode 
                      ? 'text-white group-hover:text-amber-400' 
                      : 'text-gray-900 group-hover:text-amber-600'
                  }`}>
                    {action.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className={`rounded-2xl p-6 border shadow-sm ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Activity
              </h2>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Latest system activities
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-amber-500/10' : 'bg-amber-50'
            }`}>
              <Activity className={`w-6 h-6 ${
                darkMode ? 'text-amber-400' : 'text-amber-600'
              }`} />
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              const bgColor = getActivityColor(activity.type).replace('text-', 'bg-').replace('-400', '-500/10').replace('-500', '-500/10');
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 group ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
                    <IconComponent className={`w-5 h-5 ${getActivityColor(activity.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {activity.action}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <p className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Performance Overview */}
      <div className={`rounded-2xl p-6 border shadow-sm ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Performance Overview
            </h2>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Key metrics and analytics trends
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {timeFrames.map((timeFrame) => (
              <button
                key={timeFrame.id}
                onClick={() => setActiveTimeFrame(timeFrame.id)}
                className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 ${
                  activeTimeFrame === timeFrame.id
                    ? 'bg-amber-500 text-white shadow-lg'
                    : darkMode 
                      ? 'text-gray-400 hover:bg-gray-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {timeFrame.name}
              </button>
            ))}
          </div>
        </div>
        <div className={`h-64 rounded-xl border-2 border-dashed flex items-center justify-center ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-700 to-amber-500/5 border-amber-500/20' 
            : 'bg-gradient-to-br from-gray-50 to-amber-50 border-amber-200'
        }`}>
          <div className="text-center">
            <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-amber-500' : 'text-amber-400'
            }`} />
            <p className={`text-lg font-medium ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Interactive Analytics Dashboard
            </p>
            <p className={`text-sm mt-2 max-w-md ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Real-time performance metrics and visualization charts <br />
              will be displayed here based on selected time frame
            </p>
            <button className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// src/pages/Analytics/Analytics.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Filter, 
  Search, 
  ChevronDown,
  Calendar,
  Users,
  Package,
  Target,
  Zap,
  Eye,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Clock,
  Star,
  BarChart,
  PieChart,
  LineChart
} from 'lucide-react';

const Analytics = ({ darkMode = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [sortBy, setSortBy] = useState('popular');
  const [hoveredCard, setHoveredCard] = useState(null);

  const reports = [
    {
      id: 'sales-stmt',
      name: 'Sales Statement',
      description: 'Detailed sales performance and revenue analysis with trend indicators and comparative analytics across all regions and product lines.',
      icon: TrendingUp,
      path: '/reports/sales-stmt',
      color: darkMode ? 'from-blue-400 to-cyan-400' : 'from-blue-500 to-cyan-500',
      bgColor: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      borderColor: darkMode ? 'border-blue-500/20' : 'border-blue-200',
      category: 'sales',
      popularity: 95,
      lastUpdated: '2 hours ago',
      records: '1.2M+',
      trend: 'up',
      views: '2.4K',
      favorite: true
    },
    {
      id: 'dispatch-stmt',
      name: 'Dispatch Statement',
      description: 'Real-time product dispatch and delivery tracking with automated status updates and delivery performance metrics.',
      icon: FileText,
      path: '/reports/dispatch-stmt',
      color: darkMode ? 'from-green-400 to-emerald-400' : 'from-green-500 to-emerald-500',
      bgColor: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      borderColor: darkMode ? 'border-green-500/20' : 'border-green-200',
      category: 'operations',
      popularity: 88,
      lastUpdated: '1 hour ago',
      records: '45K+',
      trend: 'up',
      views: '1.8K',
      favorite: false
    },
    {
      id: 'dispatch-summ',
      name: 'Dispatch Summary',
      description: 'Comprehensive summary of dispatch operations with efficiency metrics, performance insights, and bottleneck analysis.',
      icon: BarChart3,
      path: '/reports/dispatch-summ',
      color: darkMode ? 'from-purple-400 to-violet-400' : 'from-purple-500 to-violet-500',
      bgColor: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      borderColor: darkMode ? 'border-purple-500/20' : 'border-purple-200',
      category: 'operations',
      popularity: 76,
      lastUpdated: '4 hours ago',
      records: 'Monthly',
      trend: 'stable',
      views: '1.2K',
      favorite: true
    },
    {
      id: 'mon-cumm-reval',
      name: 'Monthly Cumulative Revaluation',
      description: 'Advanced financial revaluation and asset tracking with historical comparisons and predictive analytics.',
      icon: LineChart,
      path: '/reports/mon-cumm-reval',
      color: darkMode ? 'from-orange-400 to-red-400' : 'from-orange-500 to-red-500',
      bgColor: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      borderColor: darkMode ? 'border-orange-500/20' : 'border-orange-200',
      category: 'finance',
      popularity: 82,
      lastUpdated: '6 hours ago',
      records: 'Financial',
      trend: 'up',
      views: '956',
      favorite: false
    },
    {
      id: 'mon-cumm-ypm',
      name: 'Monthly Cumulative YPM',
      description: 'Yearly Performance Measurement analysis with predictive insights and performance forecasting models.',
      icon: BarChart,
      path: '/reports/mon-cumm-ypm',
      color: darkMode ? 'from-indigo-400 to-blue-400' : 'from-indigo-500 to-blue-500',
      bgColor: darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50',
      borderColor: darkMode ? 'border-indigo-500/20' : 'border-indigo-200',
      category: 'performance',
      popularity: 91,
      lastUpdated: '3 hours ago',
      records: 'Metrics',
      trend: 'up',
      views: '3.1K',
      favorite: true
    },
    {
      id: 'mon-cumm-ypm-prdgrp',
      name: 'Monthly Cumulative YPM Product Group',
      description: 'Granular product group performance measurement with detailed insights and comparative analysis.',
      icon: PieChart,
      path: '/reports/mon-cumm-ypm-prdgrp',
      color: darkMode ? 'from-pink-400 to-rose-400' : 'from-pink-500 to-rose-500',
      bgColor: darkMode ? 'bg-pink-500/10' : 'bg-pink-50',
      borderColor: darkMode ? 'border-pink-500/20' : 'border-pink-200',
      category: 'performance',
      popularity: 79,
      lastUpdated: '5 hours ago',
      records: 'Product',
      trend: 'stable',
      views: '1.5K',
      favorite: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Reports', count: reports.length, icon: BarChart3 },
    { id: 'sales', name: 'Sales', count: reports.filter(r => r.category === 'sales').length, icon: TrendingUp },
    { id: 'operations', name: 'Operations', count: reports.filter(r => r.category === 'operations').length, icon: Package },
    { id: 'finance', name: 'Finance', count: reports.filter(r => r.category === 'finance').length, icon: LineChart },
    { id: 'performance', name: 'Performance', count: reports.filter(r => r.category === 'performance').length, icon: Target }
  ];

  const timeFrames = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' }
  ];

  const sortOptions = [
    { id: 'popular', name: 'Most Popular' },
    { id: 'recent', name: 'Recently Updated' },
    { id: 'name', name: 'Name (A-Z)' },
    { id: 'views', name: 'Most Viewed' }
  ];

  const filteredReports = reports
    .filter(report => 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(report => 
      selectedCategory === 'all' || report.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.popularity - a.popularity;
        case 'recent':
          return a.lastUpdated.localeCompare(b.lastUpdated);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'views':
          return parseInt(b.views) - parseInt(a.views);
        default:
          return 0;
      }
    });

  const handleReportClick = (report) => {
    navigate(report.path);
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <ArrowUp className="w-3 h-3 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowDown className="w-3 h-3 text-red-500" />;
    }
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const stats = [
    {
      name: 'Total Reports',
      value: reports.length.toString(),
      change: '+12.5%',
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
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
      description: 'Online now',
      color: darkMode ? 'text-green-400' : 'text-green-600',
      bgColor: darkMode ? 'bg-green-500/10' : 'bg-green-50',
      borderColor: darkMode ? 'border-green-500/20' : 'border-green-200'
    },
    {
      name: 'Data Processed',
      value: '1.5M+',
      change: '+15.7%',
      changeType: 'positive',
      icon: Package,
      description: 'This month',
      color: darkMode ? 'text-purple-400' : 'text-purple-600',
      bgColor: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      borderColor: darkMode ? 'border-purple-500/20' : 'border-purple-200'
    },
    {
      name: 'Avg Performance',
      value: '98.7%',
      change: '+2.3%',
      changeType: 'positive',
      icon: Target,
      description: 'System uptime',
      color: darkMode ? 'text-amber-400' : 'text-amber-600',
      bgColor: darkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      borderColor: darkMode ? 'border-amber-500/20' : 'border-amber-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
              Discover powerful insights with our comprehensive analytics suite. Access real-time data, <span className="font-semibold">predictive analytics</span>, and <span className="font-semibold">interactive reports</span>.
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
                ? darkMode ? 'from-purple-500/5 to-purple-500/10' : 'from-purple-50 to-purple-100'
                : darkMode ? 'from-amber-500/5 to-amber-500/10' : 'from-amber-50 to-amber-100'
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

      {/* Enhanced Controls Section */}
      <div className={`rounded-2xl p-6 border shadow-sm ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Enhanced Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? darkMode 
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                        : 'bg-amber-50 border border-amber-200 text-amber-700'
                      : darkMode
                        ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? darkMode ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                      : darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Enhanced Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 min-w-64 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-3 rounded-xl border transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                }`}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                darkMode 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}>
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => {
          const IconComponent = report.icon;
          return (
            <div
              key={report.id}
              onClick={() => handleReportClick(report)}
              onMouseEnter={() => setHoveredCard(index + 10)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                darkMode ? 'hover:shadow-2xl' : 'hover:shadow-xl'
              }`}
            >
              <div className={`rounded-2xl border p-6 h-full transition-all duration-300 group-hover:border-amber-300 dark:group-hover:border-amber-500 relative overflow-hidden ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                {/* Hover effect background */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  report.category === 'sales'
                    ? darkMode ? 'from-blue-500/5 to-blue-500/10' : 'from-blue-50 to-blue-100'
                    : report.category === 'operations'
                    ? darkMode ? 'from-green-500/5 to-green-500/10' : 'from-green-50 to-green-100'
                    : report.category === 'finance'
                    ? darkMode ? 'from-orange-500/5 to-orange-500/10' : 'from-orange-50 to-orange-100'
                    : darkMode ? 'from-indigo-500/5 to-indigo-500/10' : 'from-indigo-50 to-indigo-100'
                }`}></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${report.color} shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {report.favorite && (
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      )}
                      {getTrendIcon(report.trend)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {report.popularity}%
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-semibold mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {report.name}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {report.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {report.views}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {report.records}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                          {report.lastUpdated}
                        </span>
                      </div>
                    </div>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group-hover:bg-amber-500 group-hover:text-white ${
                      darkMode 
                        ? 'bg-gray-700 text-amber-400' 
                        : 'bg-gray-100 text-amber-700'
                    }`}>
                      <span>View</span>
                      <Zap className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Empty State */}
      {filteredReports.length === 0 && (
        <div className={`rounded-2xl p-12 text-center border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <BarChart3 className={`w-20 h-20 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No reports found
          </h3>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Try adjusting your search or filter criteria
          </p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
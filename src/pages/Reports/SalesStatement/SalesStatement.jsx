// src/pages/Reports/SalesStatement/SalesStatement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { 
  reportMetaAPI, 
  salesStatementAPI, 
  payloadUtils, 
  downloadBlob 
} from '../../../services/salesStatementApi';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Filter, 
  Calendar,
  Users,
  Building,
  Target,
  BarChart3,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const SalesStatement = ({ darkMode = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [salesGroups, setSalesGroups] = useState([]);
  const [salesLevels, setSalesLevels] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [error, setError] = useState('');
  const [tableScrollPosition, setTableScrollPosition] = useState(0);
  const [monthlyAchievements, setMonthlyAchievements] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    division: [],
    salesGroup: [],
    showSalesPerson: false,
    level: '',
    hcode: ''
  });

  // Initialize data
  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  const initializeData = () => {
    const divisionOptions = user.division.map(div => {
      const [code, name] = div.split(' | ');
      return { code, name: name || code };
    });
    setDivisions(divisionOptions);
    
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const defaultDivisions = divisionOptions
      .filter(div => div.code !== '00')
      .map(div => div.code);

    setFilters(prev => ({
      ...prev,
      dateFrom: formatDate(firstDayOfMonth),
      dateTo: formatDate(today),
      division: defaultDivisions.length > 0 ? defaultDivisions : [divisionOptions[0]?.code]
    }));

    fetchSalesLevels();
  };

  useEffect(() => {
    if (filters.division.length > 0 && user) {
      fetchSalesGroups();
    }
  }, [filters.division, user]);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchSalesGroups = async () => {
    if (!user || filters.division.length === 0) return;
    
    try {
      setLoading(true);
      setError('');
      const payload = payloadUtils.createSalesGroupsPayload(user, filters.division);
      const data = await reportMetaAPI.getSalesGroups(payload);
      setSalesGroups(data);
      
      if (data.length > 0 && filters.salesGroup.length === 0) {
        setFilters(prev => ({ ...prev, salesGroup: [data[0].sales_group] }));
      }
    } catch (error) {
      console.error('Error fetching sales groups:', error);
      setError(`Failed to load sales groups: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesLevels = async () => {
    if (!user) return;
    
    try {
      setError('');
      const payload = payloadUtils.createSalesLevelsPayload(user);
      const data = await reportMetaAPI.getSalesLevels(payload);
      setSalesLevels(data);
    } catch (error) {
      console.error('Error fetching sales levels:', error);
      setError(`Failed to load sales levels: ${error.message}`);
    }
  };

  const fetchSalesPersons = async () => {
    if (!user || !filters.level || filters.division.length === 0 || filters.salesGroup.length === 0) return;
    
    try {
      setError('');
      const payload = payloadUtils.createSalesPersonsPayload(user, filters);
      const data = await reportMetaAPI.getSalesPersons(payload);
      setSalesPersons(data);
    } catch (error) {
      console.error('Error fetching sales persons:', error);
      setError(`Failed to load sales persons: ${error.message}`);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };

    setFilters(newFilters);

    if (key === 'level' && value && newFilters.showSalesPerson) {
      fetchSalesPersons();
    }

    if (key === 'showSalesPerson' && !value) {
      setFilters(prev => ({ 
        ...prev, 
        level: '', 
        hcode: '',
        [key]: value 
      }));
    }
  };

  const handleMultiSelectChange = (key, selectedOptions) => {
    setFilters(prev => ({
      ...prev,
      [key]: selectedOptions
    }));
  };

  const removeMultiSelectItem = (key, itemToRemove) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].filter(item => item !== itemToRemove)
    }));
  };

  const getMonthYearFromDate = () => {
    if (!filters.dateFrom) return { month: "", year: "", quarter: "" };

    const d = new Date(filters.dateFrom);
    const month = d.getMonth();
    const year = d.getFullYear();

    const fiscalYearBase = year;

    let quarter;
    let prepend;
    if (month >= 3 && month <= 5) {
      quarter = 1;
      prepend = "ST";
    } else if (month >= 6 && month <= 8) {
      quarter = 2;
      prepend = "ND";
    } else if (month >= 9 && month <= 11) {
      quarter = 3;
      prepend = "RD";
    } else {
      quarter = 4;
      prepend = "TH";
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return {
      month: monthNames[month],
      year,
      quarter: quarter,
      currentYear: fiscalYearBase - 2000,
      previousYear: fiscalYearBase - 1 - 2000,
      nextYear: fiscalYearBase + 1 - 2000,
      prepend,
    };
  };

  const handleGenerateReport = async () => {
    if (!user) return;
    
    setGenerating(true);
    setError('');
    try {
      const payload = payloadUtils.createReportDataPayload(user, filters);
      console.log('Sending request with payload:', payload);
      
      const data = await salesStatementAPI.getReportData(payload);
      console.log('Received report data:', data);
      
      setReportData(data);
      setMonthlyAchievements(data?.monthly_achivement || []);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;
    
    try {
      setError('');
      const payload = payloadUtils.createReportDataPayload(user, filters);
      const blob = await salesStatementAPI.generateExcel(payload);
      downloadBlob(blob, 'Sales_Statement.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError(`Failed to export Excel: ${error.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!user) return;
    
    try {
      setError('');
      const payload = payloadUtils.createReportDataPayload(user, filters);
      const blob = await salesStatementAPI.generatePDF(payload);
      downloadBlob(blob, 'Sales_Statement.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(`Failed to export PDF: ${error.message}`);
    }
  };

  const scrollTable = (direction) => {
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
      const scrollAmount = 300;
      const newPosition = direction === 'right' 
        ? tableScrollPosition + scrollAmount
        : tableScrollPosition - scrollAmount;
      
      tableContainer.scrollLeft = newPosition;
      setTableScrollPosition(newPosition);
    }
  };

  const MultiSelectDropdown = ({ 
    label, 
    options, 
    selected, 
    onSelect, 
    onRemove,
    placeholder = "Select options...",
    icon: Icon 
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${
        darkMode ? 'text-amber-300' : 'text-amber-800'
      }`}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            darkMode ? 'text-amber-400' : 'text-amber-500'
          }`} />
        )}
        <select
          onChange={(e) => {
            if (e.target.value && !selected.includes(e.target.value)) {
              onSelect([...selected, e.target.value]);
            }
            e.target.value = '';
          }}
          className={`pl-10 pr-4 py-2.5 w-full rounded-xl border appearance-none transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option 
              key={option.code || option.sales_group || option.h_level} 
              value={option.code || option.sales_group || option.h_level}
              disabled={selected.includes(option.code || option.sales_group || option.h_level)}
            >
              {option.name || option.sales_group || option.level_descr}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
          darkMode ? 'text-amber-400' : 'text-amber-500'
        }`} />
      </div>
      
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((item) => {
            const option = options.find(opt => 
              opt.code === item || opt.sales_group === item || opt.h_level === item
            );
            return (
              <span
                key={item}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  darkMode 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {option?.name || option?.sales_group || option?.level_descr || item}
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="ml-2 hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGrowthIndicator = (value) => {
    if (!value && value !== 0) return <span className="text-sm text-amber-500/70">-</span>;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (numValue > 0) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">+{numValue.toFixed(0)}%</span>
        </div>
      );
    } else if (numValue < 0) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{numValue.toFixed(0)}%</span>
        </div>
      );
    }
    return <span className="text-sm text-amber-500/70">0%</span>;
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN').format(numValue);
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${numValue.toFixed(0)}%`;
  };

  const getRowStyle = (item) => {
    if (item.isGrandTotal) {
      return darkMode 
        ? 'bg-amber-500/20 text-white font-bold' 
        : 'bg-amber-100 text-amber-800 font-bold';
    } else if (item.isTotalRow) {
      return darkMode 
        ? 'bg-amber-500/10 text-amber-200 font-semibold' 
        : 'bg-amber-50 text-amber-700 font-semibold';
    }
    return darkMode ? 'text-gray-200' : 'text-gray-800';
  };

  const prependData = getMonthYearFromDate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-amber-600 dark:text-amber-400">User data not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/analytics')}
            className={`p-2 rounded-xl transition-all duration-200 ${
              darkMode 
                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-400 border border-amber-500/20' 
                : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-amber-800'
            }`}>
              Sales Statement
            </h1>
            <p className={`text-sm ${
              darkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>
              Comprehensive sales performance analysis with monthly, quarterly and cumulative data
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPDF}
            disabled={!reportData}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
              darkMode 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
            } ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>
          
          <button
            onClick={handleExportExcel}
            disabled={!reportData}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
              darkMode 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
            } ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>
          
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>{generating ? 'Generating...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`rounded-2xl p-4 border ${
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
        darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date From */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>
              From Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-amber-400' : 'text-amber-500'
              }`} />
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>
              To Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-amber-400' : 'text-amber-500'
              }`} />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            </div>
          </div>

          {/* Division - Multi Select */}
          <MultiSelectDropdown
            label="Division"
            options={divisions}
            selected={filters.division}
            onSelect={(selected) => handleMultiSelectChange('division', selected)}
            onRemove={(item) => removeMultiSelectItem('division', item)}
            placeholder="Select divisions..."
            icon={Building}
          />

          {/* Sales Group - Multi Select */}
          <MultiSelectDropdown
            label="Sales Group"
            options={salesGroups}
            selected={filters.salesGroup}
            onSelect={(selected) => handleMultiSelectChange('salesGroup', selected)}
            onRemove={(item) => removeMultiSelectItem('salesGroup', item)}
            placeholder="Select sales groups..."
            icon={Users}
          />
        </div>

        {/* Additional Filters */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.showSalesPerson}
              onChange={(e) => handleFilterChange('showSalesPerson', e.target.checked)}
              className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
            />
            <span className={`text-sm ${
              darkMode ? 'text-amber-300' : 'text-amber-800'
            }`}>
              Include Sales Person
            </span>
          </label>

          {filters.showSalesPerson && (
            <>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-800'
                }`}>
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                >
                  <option value="">Select Level</option>
                  {salesLevels.map((level) => (
                    <option key={level.h_level} value={level.h_level}>
                      {level.level_descr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-800'
                }`}>
                  Sales Person
                </label>
                <select
                  value={filters.hcode}
                  onChange={(e) => handleFilterChange('hcode', e.target.value)}
                  className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${
                    darkMode
                      ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                      : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                >
                  <option value="">Select Sales Person</option>
                  {salesPersons.map((person) => (
                    <option key={person.hcode} value={person.hcode}>
                      {person.name} - {person.hcode}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Data Section */}
      {reportData && reportData.sales_statement && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Month */}
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  MONTHLY SALES
                </p>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>U</span>
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>V</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatNumber(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_month_units__base) || 0), 0))}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatCurrency(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_month_rv) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Quarterly */}
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  {prependData.quarter}{prependData.prepend} QTR SALES
                </p>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>U</span>
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>V</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatNumber(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_qtr_units__base) || 0), 0))}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatCurrency(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_qtr_rv) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Cumulative */}
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  CUMM. SALES
                </p>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>U</span>
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>V</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatNumber(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_yr_cumm_units__base) || 0), 0))}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatCurrency(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_yr_cumm_rv) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Annual */}
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'
            }`}>
              <div className="text-center">
                <p className={`text-sm font-medium mb-2 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  ANNUAL SALES
                </p>
                <div className="flex justify-between text-xs">
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>U</span>
                  <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>V</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatNumber(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_yr_cumm_units__base) || 0), 0))}
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-amber-800'}>
                    {formatCurrency(reportData.sales_statement.reduce((sum, item) => sum + (parseFloat(item.curr_yr_cumm_rv) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Navigation */}
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-amber-800'
            }`}>
              Detailed Sales Statement
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollTable('left')}
                className={`p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTable('right')}
                className={`p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${
            darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
          }`}>
            <div className="table-container overflow-x-auto" style={{ maxHeight: '600px' }}>
              <table className="w-full min-w-max">
                <thead>
                  <tr className={darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20 sticky left-0 bg-inherit z-10">
                      Products
                    </th>
                    
                    {/* Current Month Sales */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.month} {prependData.year} SALES
                    </th>
                    
                    {/* Previous Year Sales */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.month} {prependData.year - 1} SALES
                    </th>
                    
                    {/* Monthly Growth */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      % MONTHLY GWTH
                    </th>
                    
                    {/* Monthly Target & ACH */}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      MONTHLY TGT
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      %ACH
                    </th>
                    
                    {/* Quarterly Sales */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.quarter}{prependData.prepend} QTR SALES {prependData.currentYear}-{prependData.nextYear}
                    </th>
                    
                    {/* Previous Year Quarterly */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.quarter}{prependData.prepend} QTR SALES {prependData.previousYear}-{prependData.currentYear}
                    </th>
                    
                    {/* Quarterly Growth */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      % QTR GWTH
                    </th>
                    
                    {/* Quarterly Target & ACH */}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.quarter}{prependData.prepend} QTR TGT
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      %ACH
                    </th>
                    
                    {/* Cumulative Sales */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.month}-{prependData.currentYear} CUMM. SALES
                    </th>
                    
                    {/* Previous Year Cumulative */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      {prependData.month}-{prependData.previousYear} CUMM. SALES
                    </th>
                    
                    {/* Cumulative Growth */}
                    <th colSpan="2" className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      % CUMM. GWTH
                    </th>
                    
                    {/* Cumulative Target & ACH */}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      CUMM.TGT
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      %ACH
                    </th>
                    
                    {/* Annual Target & ACH */}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300 border-r border-amber-500/20">
                      ANNUAL TGT
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-300">
                      %ACH
                    </th>
                  </tr>
                  
                  {/* Sub Headers */}
                  <tr className={darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}>
                    <th className="px-4 py-2 text-left text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20 sticky left-0 bg-inherit z-10">
                      Category / Description
                    </th>
                    
                    {/* Current Month Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Previous Year Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Monthly Growth Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Monthly Target & ACH */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Quarterly Sales Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Previous Year Quarterly Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Quarterly Growth Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Quarterly Target & ACH */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    
                    {/* Cumulative Sales Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Previous Year Cumulative Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Cumulative Growth Sub-headers */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Cumulative Target & ACH */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">RV</th>
                    
                    {/* Annual Target & ACH */}
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 border-r border-amber-500/20">UNITS</th>
                    <th className="px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">UNITS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/20">
                  {reportData.sales_statement.map((item, index) => (
                    <tr key={index} className={`hover:bg-amber-500/5 ${getRowStyle(item)}`}>
                      <td className="px-4 py-3 text-sm border-r border-amber-500/20 sticky left-0 bg-inherit z-10">
                        <div className="font-medium">{item.descr}</div>
                        <div className="text-xs opacity-75">{item.category}</div>
                      </td>
                      
                      {/* Current Month Data */}
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatNumber(item.curr_month_units__base)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatCurrency(item.curr_month_rv)}
                      </td>
                      
                      {/* Previous Year Data */}
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatNumber(item.prev_yr_units__base)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatCurrency(item.pre_yr_rv)}
                      </td>
                      
                      {/* Monthly Growth */}
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {renderGrowthIndicator(item.monthly_growth_unit__base)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {renderGrowthIndicator(item.monthly_growth_rv)}
                      </td>
                      
                      {/* Monthly Target & ACH */}
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatNumber(item.current_month_target__base)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500-20">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          item.monthly_achi__base >= 100
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                            : item.monthly_achi__base >= 80
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                        }`}>
                          {formatPercentage(item.monthly_achi__base)}
                        </span>
                      </td>
                      
                      {/* Quarterly Data - Continue this pattern for all columns */}
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatNumber(item.curr_qtr_units__base)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-r border-amber-500/20">
                        {formatCurrency(item.curr_qtr_rv)}
                      </td>
                      
                      {/* Add remaining columns following the same pattern */}
                      {/* ... Additional columns for quarterly, cumulative, annual data ... */}
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Achievement Section */}
          {monthlyAchievements.length > 0 && (
            <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
              darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-white' : 'text-amber-800'
              }`}>
                Monthly Achievement Trend
              </h3>
              <div className="flex overflow-x-auto space-x-4 pb-2">
                {monthlyAchievements.map((item, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-24 text-center p-3 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      darkMode ? 'text-amber-300' : 'text-amber-600'
                    }`}>
                      {item.month_name?.toUpperCase() || 'N/A'}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${
                      darkMode ? 'text-white' : 'text-amber-800'
                    }`}>
                      {formatPercentage(item.monthly_achivement)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {generating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className={`rounded-2xl p-8 max-w-md w-full mx-4 backdrop-blur-sm ${
            darkMode ? 'bg-gray-800/95 border-amber-500/20 border' : 'bg-white/95 border-amber-200 border'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${
              darkMode ? 'text-white' : 'text-amber-800'
            }`}>
              Generating Report
            </h3>
            <p className={`text-center text-sm ${
              darkMode ? 'text-amber-300' : 'text-amber-600'
            }`}>
              Please wait while we process your sales data...
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !generating && (
        <div className={`rounded-2xl p-12 text-center border backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
        }`}>
          <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-amber-500/50' : 'text-amber-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-amber-800'
          }`}>
            No Report Generated
          </h3>
          <p className={`mb-6 ${
            darkMode ? 'text-amber-300' : 'text-amber-600'
          }`}>
            Configure your filters and generate a sales statement report to view detailed analytics.
          </p>
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Generate Your First Report</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesStatement;
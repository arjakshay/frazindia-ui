// src/pages/Reports/LocationWise/LocationWiseFilter.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { format, isAfter, lastDayOfMonth, startOfMonth } from "date-fns";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Users,
  Building,
  FileType,
  BarChart3,
  RefreshCw,
  AlertCircle,
  MapPin,
  ChevronRight,
  ChevronLeft,
  X,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import LocationWiseReport from './LocationWiseReport';
import { locationWiseServices } from './api';

// MultiSelectDropdown Component (Updated to match SalesStatement style)
const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onSelect,
  onRemove,
  placeholder = "Select options...",
  icon: Icon,
  darkMode = false
}) => {
  const [selectValue, setSelectValue] = useState('');

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value && !selected.some(item => (item.value || item) === value)) {
      const selectedOption = options.find(opt =>
        (opt.value || opt.sales_group || opt.doc_type) === value
      );
      if (selectedOption) {
        onSelect([...selected, selectedOption]);
      }
    }
    setSelectValue('');
  };

  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
        )}
        <select
          value={selectValue}
          onChange={handleSelectChange}
          className={`pl-10 pr-4 py-2.5 w-full rounded-xl border appearance-none transition-all duration-200 ${darkMode
            ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
            : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
            }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.value || option.sales_group || option.doc_type}
              value={option.value || option.sales_group || option.doc_type}
              disabled={selected.some(item =>
                (item.value || item) === (option.value || option.sales_group || option.doc_type)
              )}
            >
              {option.label || option.sales_group || option.descr}
            </option>
          ))}
        </select>
        <ChevronRight className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rotate-90 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((item, index) => {
            let displayText;
            if (typeof item === 'object') {
              displayText = item.label || item.sales_group || item.descr || item.value || 'Unknown';
            } else {
              const option = options.find(opt =>
                (opt.value || opt.sales_group || opt.doc_type) === item
              );
              displayText = option?.label || option?.sales_group || option?.descr || item;
            }

            const itemValue = typeof item === 'object' ? (item.value || item) : item;

            return (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${darkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
              >
                {displayText}
                <button
                  type="button"
                  onClick={() => onRemove(itemValue)}
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
};

const LocationWiseFilter = ({ darkMode = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentDate = new Date();
  const lastDateOfMonth = lastDayOfMonth(currentDate);
  const resultDate = isAfter(currentDate, lastDateOfMonth)
    ? lastDateOfMonth
    : currentDate;

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [divisionList, setDivisionList] = useState([]);
  const [salesGroupList, setSalesGroupList] = useState([]);
  const [docTypeList, setDocTypeList] = useState([]);
  
  const [filters, setFilters] = useState({
    fromDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    toDate: format(resultDate, "yyyy-MM-dd"),
    selectedDivision: '',
    salesGroup: '',
    docType: '',
    includeSreturn: 'Y',
    maxToDate: format(resultDate, "yyyy-MM-dd")
  });
  
  const [filterData, setFilterData] = useState(null);

  // Destructure API services
  const locationWiseAPI = locationWiseServices.report;
  const locationWiseMetaAPI = locationWiseServices.meta;
  const payloadUtils = locationWiseServices.payloadUtils;

  // Format date helper
  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd");
  };

  // Initialize component
  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  const initializeData = () => {
    // Process divisions from user data
    const divisionOptions = user?.division
      ?.filter((item) => item !== "00 | ALL")
      ?.map((item) => ({
        label: item,
        value: item
      })) || [];

    setDivisionList(divisionOptions);

    // Set default division
    const defaultDivision = divisionOptions.length > 0 ? divisionOptions[0].value : '';

    setFilters(prev => ({
      ...prev,
      selectedDivision: defaultDivision
    }));

    // Fetch initial data
    fetchInitialData(defaultDivision);
  };

  const fetchInitialData = async (division) => {
    if (!user || !division) return;

    try {
      setLoading(true);
      setError('');

      // Fetch sales groups and document types in parallel
      const [salesGroupsRes, docTypesRes] = await Promise.all([
        locationWiseMetaAPI.getSalesGroups(payloadUtils.createSalesGroupsPayload(user, division)),
        locationWiseMetaAPI.getDocTypes(payloadUtils.createDocTypesPayload(user, division))
      ]);

      console.log('Sales groups response:', salesGroupsRes);
      console.log('Document types response:', docTypesRes);

      // Process sales groups
      const salesGroups = Array.isArray(salesGroupsRes) ? salesGroupsRes : salesGroupsRes;
      setSalesGroupList(salesGroups);

      // Process document types
      const docTypes = Array.isArray(docTypesRes) ? docTypesRes : docTypesRes;
      setDocTypeList(docTypes);

      // Update filters with first options
      if (salesGroups.length > 0 || docTypes.length > 0) {
        setFilters(prev => ({
          ...prev,
          salesGroup: salesGroups.length > 0 ? salesGroups[0]?.sales_group || salesGroups[0]?.value || '' : '',
          docType: docTypes.length > 0 ? docTypes[0]?.doc_type || docTypes[0]?.value || '' : ''
        }));
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle division change
  useEffect(() => {
    if (filters.selectedDivision && user) {
      fetchInitialData(filters.selectedDivision);
    }
  }, [filters.selectedDivision]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getLastDate = (date) => {
    const selectedDate = new Date(date);
    const lastDateOfMonth = lastDayOfMonth(selectedDate);
    const resultDate = isAfter(currentDate, selectedDate)
      ? isAfter(currentDate, lastDateOfMonth)
        ? lastDateOfMonth
        : currentDate
      : selectedDate;
    return resultDate;
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const lastDate = getLastDate(selectedDate);
    
    setFilters(prev => ({
      ...prev,
      fromDate: selectedDate,
      toDate: format(lastDate, "yyyy-MM-dd"),
      maxToDate: format(lastDate, "yyyy-MM-dd")
    }));
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    setFilters(prev => ({
      ...prev,
      toDate: selectedDate
    }));
  };

  const validateDates = () => {
    if (filters.fromDate && filters.toDate && new Date(filters.toDate) < new Date(filters.fromDate)) {
      alert("To Date must be greater than or equal to From Date.");
      setFilters(prev => ({
        ...prev,
        toDate: ''
      }));
    }
  };

  const handleGenerateReport = async () => {
    if (!user || !filters.selectedDivision || !filters.salesGroup || !filters.docType) {
      setError('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      // Prepare payload
      const payload = payloadUtils.createReportDataPayload(user, {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        selectedDivision: filters.selectedDivision,
        salesGroup: filters.salesGroup,
        docType: filters.docType,
        includeSreturn: filters.includeSreturn
      });

      console.log('Generating report with payload:', payload);
      
      // Set filter data for the report component
      setFilterData({
        ...payload,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        selectedDivision: filters.selectedDivision
      });

    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user || !filterData) {
      setError('Please generate a report first');
      return;
    }

    try {
      setError('');
      const payload = payloadUtils.createReportDataPayload(user, {
        fromDate: filterData.fromDate,
        toDate: filterData.toDate,
        selectedDivision: filterData.selectedDivision,
        salesGroup: filterData.salesGroup,
        docType: filterData.docType,
        includeSreturn: filterData.includeSreturn
      });

      const fileName = `${filterData.salesGroup}_LOCATION_WISE_SALES_${new Date().toISOString().slice(0, 10)}.xlsx`;
      
      await locationWiseAPI.generateExcel(payload)
        .then(blob => {
          locationWiseServices.downloadBlob(blob, fileName);
        })
        .catch(err => {
          console.error('Excel download error:', err);
          setError(`Failed to export Excel: ${err.message}`);
        });

    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError(`Failed to export Excel: ${error.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!user || !filterData) {
      setError('Please generate a report first');
      return;
    }

    try {
      setError('');
      const payload = payloadUtils.createReportDataPayload(user, {
        fromDate: filterData.fromDate,
        toDate: filterData.toDate,
        selectedDivision: filterData.selectedDivision,
        salesGroup: filterData.salesGroup,
        docType: filterData.docType,
        includeSreturn: filterData.includeSreturn
      });

      const fileName = `${filterData.salesGroup}_LOCATION_WISE_SALES_${new Date().toISOString().slice(0, 10)}.pdf`;
      
      await locationWiseAPI.generatePDF(payload)
        .then(blob => {
          locationWiseServices.downloadBlob(blob, fileName);
        })
        .catch(err => {
          console.error('PDF download error:', err);
          setError(`Failed to export PDF: ${err.message}`);
        });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(`Failed to export PDF: ${error.message}`);
    }
  };

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
      {/* Header Section - Matching SalesStatement style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/analytics')}
            className={`p-2 rounded-xl transition-all duration-200 ${darkMode
              ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-400 border border-amber-500/20'
              : 'bg-white text-amber-600 hover:bg-amber-50 border border-amber-200'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
              Location Wise Sales Report
            </h1>
            <p className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Detailed sales analysis by location with region-wise breakdown
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPDF}
            disabled={!filterData}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${darkMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
              : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
              } ${!filterData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={!filterData}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${darkMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
              : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
              } ${!filterData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={generating || !filters.selectedDivision || !filters.salesGroup || !filters.docType}
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
        <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`rounded-2xl p-6 border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date From */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              From Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <input
                type="date"
                value={filters.fromDate}
                onChange={handleStartDateChange}
                max={format(new Date(), "yyyy-MM-dd")}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              To Date
            </label>
            <div className="relative">
              <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <input
                type="date"
                value={filters.toDate}
                onChange={handleEndDateChange}
                onBlur={validateDates}
                min={filters.fromDate}
                max={filters.maxToDate}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
              />
            </div>
          </div>

          {/* Division */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Division
            </label>
            <div className="relative">
              <Building className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <select
                value={filters.selectedDivision}
                onChange={(e) => handleFilterChange('selectedDivision', e.target.value)}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
              >
                <option value="">Select Division</option>
                {divisionList.map((division) => (
                  <option key={division.value} value={division.value}>
                    {division.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sales Group */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Sales Group
            </label>
            <div className="relative">
              <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <select
                value={filters.salesGroup}
                onChange={(e) => handleFilterChange('salesGroup', e.target.value)}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
              >
                <option value="">Select Sales Group</option>
                {salesGroupList.map((group, index) => (
                  <option key={group.sales_group || index} value={group.sales_group || group.value}>
                    {group.sales_group || group.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Document Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Document Type
            </label>
            <div className="relative">
              <FileType className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <select
                value={filters.docType}
                onChange={(e) => handleFilterChange('docType', e.target.value)}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                  }`}
              >
                <option value="">Select Document Type</option>
                {docTypeList.map((docType, index) => (
                  <option key={docType.doc_type || index} value={docType.doc_type || docType.value}>
                    {docType.descr || docType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Include Sales Returns Checkbox */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleFilterChange('includeSreturn', filters.includeSreturn === 'Y' ? 'N' : 'Y')}
              className={`p-2 rounded-lg border transition-all duration-200 ${darkMode
                ? 'border-amber-500/30 hover:border-amber-500/50'
                : 'border-amber-300 hover:border-amber-400'
                }`}
            >
              {filters.includeSreturn === 'Y' ? (
                <CheckSquare className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              ) : (
                <Square className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </button>
            <span className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
              Include Sales Returns
            </span>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={generating || !filters.selectedDivision || !filters.salesGroup || !filters.docType}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200 w-full md:w-auto"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
              ) : (
                <Filter className="w-4 h-4 inline-block mr-2" />
              )}
              {generating ? 'Generating...' : 'Apply Filters'}
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {(filters.selectedDivision || filters.salesGroup || filters.docType) && (
          <div className="mt-4 pt-4 border-t border-amber-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                Active Filters
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.selectedDivision && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${darkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                  <Building className="w-3 h-3 mr-1" />
                  Division: {filters.selectedDivision}
                </span>
              )}
              {filters.salesGroup && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${darkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                  <Users className="w-3 h-3 mr-1" />
                  Sales Group: {filters.salesGroup}
                </span>
              )}
              {filters.docType && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${darkMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                  <FileType className="w-3 h-3 mr-1" />
                  Doc Type: {filters.docType}
                </span>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${darkMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                <Calendar className="w-3 h-3 mr-1" />
                Date Range: {filters.fromDate} to {filters.toDate}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${darkMode
                ? filters.includeSreturn === 'Y' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                : filters.includeSreturn === 'Y' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                Sales Returns: {filters.includeSreturn === 'Y' ? 'Included' : 'Excluded'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Report Section */}
      {filterData && (
        <div className="space-y-6">
          {/* Report Header */}
          <div className={`rounded-2xl p-6 border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                  Location Wise Sales Report
                </h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  Showing sales data from {filterData.fromDate} to {filterData.toDate}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                {filterData.salesGroup} - {filterData.docType}
              </div>
            </div>
          </div>

          {/* Report Component */}
          <LocationWiseReport 
            filterData={filterData} 
            darkMode={darkMode}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
          />
        </div>
      )}

      {/* Empty State */}
      {!filterData && !generating && (
        <div className={`rounded-2xl p-12 text-center border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'}`}>
          <MapPin className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-amber-500/50' : 'text-amber-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-amber-800'}`}>
            No Report Generated
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
            Configure your filters and generate a location wise sales report to view detailed analysis by region and location.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={!filters.selectedDivision || !filters.salesGroup || !filters.docType}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            <MapPin className="w-5 h-5" />
            <span>Generate Location Report</span>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
          <div className={`rounded-2xl p-8 max-w-md w-full mx-4 border backdrop-blur-xl transform transition-all duration-300 scale-100 ${darkMode ? 'bg-gray-800/80 border-amber-500/30' : 'bg-white/90 border-amber-200'}`}>
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${darkMode ? 'text-white' : 'text-amber-800'}`}>
              Generating Report
            </h3>
            <p className={`text-center text-sm ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              Please wait while we process your location wise sales data...
            </p>
            <div className="mt-4 w-full bg-amber-500/20 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationWiseFilter;
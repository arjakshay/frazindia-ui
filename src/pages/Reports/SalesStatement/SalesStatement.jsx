// src/pages/Reports/SalesStatement/SalesStatement.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Users,
  Building,
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
        (opt.value || opt.sales_group || opt.h_level) === value
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
              key={option.value || option.sales_group || option.h_level}
              value={option.value || option.sales_group || option.h_level}
              disabled={selected.some(item =>
                (item.value || item) === (option.value || option.sales_group || option.h_level)
              )}
            >
              {option.label || option.sales_group || option.level_descr}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((item, index) => {
            let displayText;
            if (typeof item === 'object') {
              displayText = item.label || item.sales_group || item.level_descr || item.value || 'Unknown';
            } else {
              const option = options.find(opt =>
                (opt.value || opt.sales_group || opt.h_level) === item
              );
              displayText = option?.label || option?.sales_group || option?.level_descr || item;
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
  const [grandTotal, setGrandTotal] = useState(null);

  const loginDiv = user?.division?.[0]?.split(' | ')[0] || '00';

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    selectedDivision: [],
    salesGroup: [],
    showSalespers: loginDiv === '00' ? 'N' : 'Y',
    hLevel: '',
    hcode: ''
  });

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getValue = (value) => {
    return value.map((item) => item.label?.split(" | ")[0]).join(",");
  };

  useEffect(() => {
    console.log('=== CURRENT STATE DEBUG ===');
    console.log('Report data:', reportData);
    console.log('Has sales_statemet:', reportData?.sales_statemet?.length);
    console.log('Monthly achievements:', monthlyAchievements);
    console.log('Grand total:', grandTotal);
  }, [reportData, monthlyAchievements, grandTotal]);

  useEffect(() => {
    console.log('Report data state updated:', reportData);
  }, [reportData]);

  useEffect(() => {
    console.log('Monthly achievements state updated:', monthlyAchievements);
  }, [monthlyAchievements]);

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user]);

  const initializeData = () => {
    const divisionOptions = user?.division
      ?.filter((item) => item !== "00 | ALL")
      ?.map((item) => ({
        label: item,
        value: item.split(" | ")[0],
      })) || [];

    setDivisions(divisionOptions);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const defaultDivisions = divisionOptions.length > 0 ? [divisionOptions[0]] : [];

    setFilters(prev => ({
      ...prev,
      fromDate: formatDate(firstDayOfMonth),
      toDate: formatDate(today),
      selectedDivision: defaultDivisions,
      showSalespers: loginDiv === '00' ? 'N' : 'Y'
    }));

    fetchSalesLevels();
  };

  useEffect(() => {
    console.log('=== DEBUG DATA STRUCTURE ===');
    console.log('Report data keys:', reportData ? Object.keys(reportData) : 'No data');
    console.log('Has sales_statemet:', reportData?.sales_statemet?.length);
    console.log('Has sales_statement:', reportData?.sales_statement?.length);

    if (reportData?.sales_statemet) {
      console.log('First sales_statemet item:', reportData.sales_statemet[0]);
    }
    if (reportData?.sales_statement) {
      console.log('First sales_statement item:', reportData.sales_statement[0]);
    }
    console.log('============================');
  }, [reportData]);

  useEffect(() => {
    if (filters.selectedDivision.length > 0 && user) {
      fetchSalesGroups();
    }
  }, [filters.selectedDivision, user]);

  const fetchSalesGroups = async () => {
    if (!user || filters.selectedDivision.length === 0) return;

    try {
      setLoading(true);
      setError('');
      const postData = {
        loginDiv: user?.division[0].split(' | ')[0],
        loginUserid: user?.userId,
        loginHlevel: user?.hierarchyLevel,
        reportName: "SALES_STMT",
        div: getValue(filters.selectedDivision),
      };

      console.log('Fetching sales groups with payload:', postData);
      const response = await reportMetaAPI.getSalesGroups(postData);
      console.log('Sales groups API response:', response);

      let salesGroupsData = [];
      if (Array.isArray(response)) {
        salesGroupsData = response;
      } else if (response && Array.isArray(response.data)) {
        salesGroupsData = response.data;
      } else {
        console.warn('Unexpected sales groups response format:', response);
        salesGroupsData = [];
      }

      const list = salesGroupsData.map((item) => ({
        label: item.sales_group,
        value: item.sales_group,
      }));

      console.log('Processed sales groups list:', list);
      setSalesGroups(list);

      if (list.length > 0 && filters.salesGroup.length === 0) {
        setFilters(prev => ({
          ...prev,
          salesGroup: [list[0]],
          selectedSalesGroup: list[0].value,
        }));
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
      const postData = {
        reportName: "SALES_STMT",
        loginHlevel: user?.hierarchyLevel,
      };

      console.log('Fetching sales levels with payload:', postData);
      const response = await reportMetaAPI.getSalesLevels(postData);
      console.log('Sales levels API response:', response);

      let levelsData = [];
      if (Array.isArray(response)) {
        levelsData = response;
      } else if (response && Array.isArray(response.data)) {
        levelsData = response.data;
      } else {
        console.warn('Unexpected sales levels response format:', response);
        levelsData = [];
      }

      console.log('Processed sales levels:', levelsData);
      setSalesLevels(levelsData);

      if (levelsData.length > 0) {
        setFilters(prev => ({
          ...prev,
          hLevel: levelsData[0].h_level
        }));
      }
    } catch (error) {
      console.error('Error fetching sales levels:', error);
      setError(`Failed to load sales levels: ${error.message}`);
    }
  };

  const fetchSalesPersons = async () => {
    if (!user || !filters.hLevel || filters.selectedDivision.length === 0 || filters.salesGroup.length === 0) return;

    try {
      setError('');

      const postData = {
        loginDiv: user?.division[0].split(' | ')[0],
        loginUserid: user?.userId,
        loginHlevel: user?.hierarchyLevel,
        reportName: "SALES_STMT",
        div: getValue(filters.selectedDivision),
        hLevel: filters.hLevel,
        salesGroup: filters.salesGroup.map(item => item.value).join(','),
      };

      console.log('Fetching sales persons with payload:', postData);
      const response = await reportMetaAPI.getSalesPersons(postData);
      console.log('Sales persons API response:', response);

      let salesPersonsArray = [];
      if (Array.isArray(response)) {
        salesPersonsArray = response;
      } else if (response && Array.isArray(response.data)) {
        salesPersonsArray = response.data;
      } else {
        console.warn('Unexpected sales persons response format:', response);
        salesPersonsArray = [];
      }

      setSalesPersons(salesPersonsArray);

      if (salesPersonsArray.length > 0 && !filters.hcode) {
        setFilters(prev => ({
          ...prev,
          hcode: salesPersonsArray[0].hierarchy_code
        }));
      }
    } catch (error) {
      console.error('Error fetching sales persons:', error);
      setError(`Failed to load sales persons: ${error.message}`);
      setSalesPersons([]);
    }
  };

  useEffect(() => {
    if (filters.hLevel && filters.salesGroup.length > 0 && filters.showSalespers !== 'N') {
      fetchSalesPersons();
    }
  }, [filters.hLevel, filters.salesGroup, filters.showSalespers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectChange = (key, selectedOptions) => {
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        [key]: selectedOptions
      };

      if (key === 'selectedDivision' && selectedOptions.length === 0) {
        updatedFilters.salesGroup = [];
      }

      if (key === 'salesGroup' && selectedOptions.length > 0) {
        updatedFilters.selectedSalesGroup = selectedOptions.map(item => item.value).join(',');
      }

      return updatedFilters;
    });
  };

  const removeMultiSelectItem = (key, itemToRemove) => {
    setFilters(prev => {
      const updatedArray = prev[key].filter(item => {
        if (typeof item === 'object') {
          return item.value !== itemToRemove;
        }
        return item !== itemToRemove;
      });

      const updatedFilters = {
        ...prev,
        [key]: updatedArray
      };

      if (key === 'selectedDivision') {
        updatedFilters.salesGroup = [];
      }

      return updatedFilters;
    });
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

  const debugAPIResponse = (response) => {
    console.log('=== API RESPONSE DEBUG ===');
    console.log('Full response:', response);
    console.log('Response type:', typeof response);
    console.log('Is array:', Array.isArray(response));

    if (response && typeof response === 'object') {
      console.log('Response keys:', Object.keys(response));
      console.log('Has sales_statemet:', 'sales_statemet' in response);
      console.log('Has sales_statement:', 'sales_statement' in response); // Add this
      console.log('Has monthly_achivement:', 'monthly_achivement' in response);

      // Check both properties
      if (response.sales_statemet) {
        console.log('sales_statemet type:', typeof response.sales_statemet);
        console.log('sales_statemet is array:', Array.isArray(response.sales_statemet));
        console.log('sales_statemet length:', response.sales_statemet?.length);
      }

      if (response.sales_statement) { // Add this check
        console.log('sales_statement type:', typeof response.sales_statement);
        console.log('sales_statement is array:', Array.isArray(response.sales_statement));
        console.log('sales_statement length:', response.sales_statement?.length);
      }

      if (response.data) {
        console.log('data property exists, type:', typeof response.data);
        console.log('data keys:', Object.keys(response.data));
      }
    }

    console.log('=== TABLE DATA DEBUG ===');
console.log('Report data available:', !!reportData);
console.log('Sales data available:', !!(reportData?.sales_statement || reportData?.sales_statemet));
console.log('Sales data length:', (reportData?.sales_statement || reportData?.sales_statemet)?.length);
console.log('First row sample:', (reportData?.sales_statement || reportData?.sales_statemet)?.[0]);
console.log('Column definitions:', getColumnDefinitions().length);
console.log('========================');
    console.log('=== END DEBUG ===');
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    setGenerating(true);
    setError('');
    try {
      const postData = {
        dateFrom: filters.fromDate,
        dateTo: filters.toDate,
        salesGroup: filters.salesGroup.map(item => item.value).join(','),
        loginDiv: user?.division[0].split(' | ')[0],
        loginUserid: user?.userId,
        loginHlevel: user?.hierarchyLevel,
        div: getValue(filters.selectedDivision),
      };

      if (filters.showSalespers !== 'N') {
        postData.showSalespers = 'Y';
        postData.level = filters.hLevel;
        postData.hcode = filters.hcode;
      } else {
        postData.showSalespers = '';
        postData.level = '';
        postData.hcode = '';
      }

      console.log('Generating report with payload:', postData);
      const response = await salesStatementAPI.getReportData(postData);

      // Debug the API response
      debugAPIResponse(response);

      let reportData = null;
      let monthlyAchievementsData = [];

      // Handle the response structure properly - CHECK BOTH PROPERTY NAMES
      if (response) {
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));

        // Check for both possible property names
        let salesData = null;

        if (response.sales_statement && Array.isArray(response.sales_statement)) {
          console.log('Using sales_statement property');
          salesData = response.sales_statement;
          monthlyAchievementsData = response.monthly_achivement || [];
          reportData = response;
        }
        else if (response.sales_statemet && Array.isArray(response.sales_statemet)) {
          console.log('Using sales_statemet property');
          salesData = response.sales_statemet;
          monthlyAchievementsData = response.monthly_achivement || [];
          reportData = response;
        }
        // Check if response has a data property
        else if (response.data) {
          if (response.data.sales_statement && Array.isArray(response.data.sales_statement)) {
            console.log('Using response.data.sales_statement');
            salesData = response.data.sales_statement;
            monthlyAchievementsData = response.data.monthly_achivement || [];
            reportData = response.data;
          }
          else if (response.data.sales_statemet && Array.isArray(response.data.sales_statemet)) {
            console.log('Using response.data.sales_statemet');
            salesData = response.data.sales_statemet;
            monthlyAchievementsData = response.data.monthly_achivement || [];
            reportData = response.data;
          }
        }

        console.log('Sales data found:', !!salesData);
        console.log('Sales data length:', salesData?.length);
      }

      // Process the data if we found sales data
      if (reportData && (reportData.sales_statement || reportData.sales_statemet)) {
        console.log('Processing report data');

        const processedData = processReportData(reportData);
        setReportData(processedData);
        setMonthlyAchievements(monthlyAchievementsData);

        // Extract grand total for summary metrics
        const salesArray = processedData.sales_statement || processedData.sales_statemet;
        const grandTotalRow = salesArray.find(item => item.isGrandTotal);
        setGrandTotal(grandTotalRow);

        console.log('Report data processed successfully');
        console.log('Processed data length:', salesArray.length);
      } else {
        console.log('No valid report data found in response');
        console.log('Report data structure:', reportData);
        console.log('Available keys in reportData:', reportData ? Object.keys(reportData) : 'No reportData');
        setReportData(null);
        setMonthlyAchievements([]);
        setGrandTotal(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}`);
      setReportData(null);
      setGrandTotal(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = async () => {
    if (!user) return;

    try {
      setError('');
      const postData = {
        dateFrom: filters.fromDate,
        dateTo: filters.toDate,
        salesGroup: filters.salesGroup.map(item => item.value).join(','),
        loginDiv: user?.division[0].split(' | ')[0],
        loginUserid: user?.userId,
        loginHlevel: user?.hierarchyLevel,
        div: getValue(filters.selectedDivision),
        showSalespers: filters.showSalespers !== 'N' ? 'Y' : '',
        level: filters.showSalespers !== 'N' ? filters.hLevel : '',
        hcode: filters.showSalespers !== 'N' ? filters.hcode : '',
      };

      await salesStatementAPI.generateExcel(postData, 'excel', 'Sales_Statement.xlsx');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError(`Failed to export Excel: ${error.message}`);
    }
  };

  const handleExportPDF = async () => {
    if (!user) return;

    try {
      setError('');
      const postData = {
        dateFrom: filters.fromDate,
        dateTo: filters.toDate,
        salesGroup: filters.salesGroup.map(item => item.value).join(','),
        loginDiv: user?.division[0].split(' | ')[0],
        loginUserid: user?.userId,
        loginHlevel: user?.hierarchyLevel,
        div: getValue(filters.selectedDivision),
        showSalespers: filters.showSalespers !== 'N' ? 'Y' : '',
        level: filters.showSalespers !== 'N' ? filters.hLevel : '',
        hcode: filters.showSalespers !== 'N' ? filters.hcode : '',
      };

      await salesStatementAPI.generatePDF(postData, 'pdf', 'Sales_Statement.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError(`Failed to export PDF: ${error.message}`);
    }
  };

  const getMonthYearFromDate = () => {
    if (!filters.fromDate) return { month: "", year: "", quarter: "" };

    const d = new Date(filters.fromDate);
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

  const getTotalWithFormula = () => [
    {
      key: "monthly_growth_unit__base",
      totalFromula: ({ curr_month_units__base, prev_yr_units__base }) => {
        const numDivisor = Number(prev_yr_units__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_month_units__base) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "monthly_growth_rv",
      totalFromula: ({ curr_month_rv, pre_yr_rv }) => {
        const numDivisor = Number(pre_yr_rv);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_month_rv) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "monthly_achi",
      totalFromula: ({
        curr_month_units__base,
        current_month_target__base,
      }) => {
        const numDivisor = Number(current_month_target__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_month_units__base) / numDivisor) * 100;
      },
    },
    {
      key: "qtr_growth_unit__base",
      totalFromula: ({ curr_qtr_units__base, prev_yr_qtr_units__base }) => {
        const numDivisor = Number(prev_yr_qtr_units__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_qtr_units__base) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "qtr_growth_rv",
      totalFromula: ({ curr_qtr_rv, prev_yr_qtr_rv }) => {
        const numDivisor = Number(prev_yr_qtr_rv);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_qtr_rv) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "qtr_achi__base",
      totalFromula: ({ curr_qtr_units__base, curr_qtr_target__base }) => {
        const numDivisor = Number(curr_qtr_target__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_qtr_units__base) / numDivisor) * 100;
      },
    },
    {
      key: "cumm_growth_unit__base",
      totalFromula: ({
        curr_yr_cumm_units__base,
        prev_yr_cumm_units__base,
      }) => {
        const numDivisor = Number(prev_yr_cumm_units__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_yr_cumm_units__base) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "cumm_growth_rv",
      totalFromula: ({ curr_yr_cumm_rv, prev_yr_cumm_rv }) => {
        const numDivisor = Number(prev_yr_cumm_rv);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_yr_cumm_rv) / numDivisor) * 100 - 100;
      },
    },
    {
      key: "cumm_achi__base",
      totalFromula: ({ curr_yr_cumm_units__base, cumm_target__base }) => {
        const numDivisor = Number(cumm_target__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_yr_cumm_units__base) / numDivisor) * 100;
      },
    },
    {
      key: "achievement__base",
      totalFromula: ({ curr_yr_cumm_units__base, annually_target__base }) => {
        const numDivisor = Number(annually_target__base);
        if (isNaN(numDivisor) || numDivisor === 0) return 0;
        return (Number(curr_yr_cumm_units__base) / numDivisor) * 100;
      },
    },
  ];

  const getFormulaByKey = (key) => {
    const formulas = getTotalWithFormula();
    const formulaDefinition = formulas.find((def) => def.key === key);
    return formulaDefinition ? formulaDefinition.totalFromula : null;
  };

  const getUpdatedTotalRow = (totalRow) => {
    Object.keys(totalRow).forEach((key) => {
      const formula = getFormulaByKey(key);
      if (formula) {
        totalRow[key] = formula(totalRow);
      }
    });
    return totalRow;
  };

  const processReportData = (data) => {
    // Handle both possible property names
    const salesData = data.sales_statement || data.sales_statemet;

    if (!salesData || !Array.isArray(salesData)) {
      console.log('No sales data found:', data);
      return data;
    }

    const groupedData = {};

    // Group data by category
    salesData.forEach(item => {
      const category = item.category || 'Other';
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      item.categoryName = item.category;
      if (groupedData[category].length > 0) {
        item.categoryName = "";
      }
      groupedData[category].push(item);
    });

    // Calculate totals and grand totals
    const tempTotals = [];
    const grandTotalKeysToExclude = [
      "tgt_amount",
      "tgt_amount_qtr",
      "tgt_amount_cumm",
      "tgt_amount_yr",
    ];

    Object.keys(groupedData).forEach(category => {
      const groupArray = groupedData[category];
      if (groupArray.length > 0) {
        const totalRow = { ...groupArray[0] };

        // Reset all values
        Object.keys(totalRow).forEach(key => {
          totalRow[key] = typeof totalRow[key] === 'number' ? 0 : "";
        });

        totalRow.descr = `Total ${category}`;
        totalRow.isTotalRow = true;
        totalRow.categoryName = category;

        // Calculate sum for all numeric fields
        groupArray.forEach(item => {
          Object.keys(item).forEach(key => {
            if (
              typeof item[key] === 'number' &&
              !isNaN(item[key]) &&
              !grandTotalKeysToExclude.includes(key)
            ) {
              totalRow[key] = (totalRow[key] || 0) + item[key];
            } else if (grandTotalKeysToExclude.includes(key)) {
              totalRow[key] = item[key];
            }
          });
        });

        const updateTotalRow = getUpdatedTotalRow(totalRow);
        groupedData[category].push(updateTotalRow);
        tempTotals.push(updateTotalRow);
      }
    });

    // Calculate grand total
    const grandTotal = { ...tempTotals[0] };
    Object.keys(grandTotal).forEach(key => {
      grandTotal[key] = typeof grandTotal[key] === 'number' ? 0 : "";
    });

    grandTotal.descr = "Grand Total";
    grandTotal.categoryName = "";
    grandTotal.isGrandTotal = true;

    tempTotals.forEach(total => {
      Object.keys(total).forEach(key => {
        if (
          typeof total[key] === 'number' &&
          !isNaN(total[key]) &&
          !grandTotalKeysToExclude.includes(key)
        ) {
          grandTotal[key] = (grandTotal[key] || 0) + total[key];
        } else if (grandTotalKeysToExclude.includes(key)) {
          grandTotal[key] = total[key];
        }
      });
    });

    const updatedGrandTotal = getUpdatedTotalRow(grandTotal);

    // Create processed data array
    const processedData = [];
    Object.keys(groupedData).forEach(category => {
      processedData.push(...groupedData[category]);
    });
    processedData.push(updatedGrandTotal);

    return {
      ...data,
      sales_statement: processedData,
      sales_statemet: processedData
    };
  };

  const formatNumber = (num, decimals = 0) => {
    if (num === null || typeof num === "undefined") return "0";
    if (decimals === "%" && typeof num === "number") {
      return `${Number(num).toFixed(0)}%`;
    }
    const numericValue = Number(num);
    if (isNaN(numericValue)) return "0";

    return numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: typeof decimals === "number" ? decimals : 0,
      maximumFractionDigits: typeof decimals === "number" ? decimals : 0,
    })?.replace(/,/g, '');
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
        ? 'bg-green-500/10 text-green-200 font-semibold'
        : 'bg-green-50 text-green-700 font-semibold';
    }
    return darkMode ? 'text-gray-200' : 'text-gray-800';
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

  const prependData = useMemo(() => getMonthYearFromDate(), [filters.fromDate]);

  // Summary Metrics Component
  const SummaryMetrics = ({ grandTotal, monthlyAchievements, prependData }) => {

    console.log('SummaryMetrics props:', { grandTotal, monthlyAchievements, prependData });
    const calculatePercentage = (value, total) => {
      const newValue = Number(value);
      const newTotal = Number(total);
      if (newTotal === null || typeof newTotal === "undefined") return 0;
      if (newTotal === 0) return 0;
      return (newValue / newTotal) * 100;
    };

    if (!grandTotal) {
    return <div className={`p-4 text-center ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>Loading summary...</div>;
  }

    const thisMonthSalesUnits = grandTotal?.curr_month_units__base;
    const thisMonthSalesRV = grandTotal?.curr_month_rv;
    const thisMonthTarget = grandTotal?.tgt_amount;
    const thisMonthAch = calculatePercentage(
      grandTotal?.curr_month_rv,
      grandTotal?.tgt_amount
    );

    const thisQtrSalesUnits = grandTotal?.curr_qtr_units__base;
    const thisQtrSalesRV = grandTotal?.curr_qtr_rv;
    const thisQtrTarget = grandTotal?.tgt_amount_qtr;
    const thisQtrAch = calculatePercentage(
      grandTotal?.curr_qtr_rv,
      grandTotal?.tgt_amount_qtr
    );

    const thisCummSalesUnits = grandTotal?.curr_yr_cumm_units__base;
    const thisCummSalesRV = grandTotal?.curr_yr_cumm_rv;
    const thisCummTarget = grandTotal?.tgt_amount_cumm;
    const thisCummAch = calculatePercentage(
      grandTotal?.curr_yr_cumm_rv,
      grandTotal?.tgt_amount_cumm
    );

    const thisAnnualSalesUnits = grandTotal?.curr_yr_cumm_units__base;
    const thisAnnualSalesRV = grandTotal?.curr_yr_cumm_rv;
    const thisAnnualTarget = grandTotal?.tgt_amount_yr;
    const thisAnnualAch = calculatePercentage(
      grandTotal?.curr_yr_cumm_rv,
      grandTotal?.tgt_amount_yr
    );

    if (!grandTotal) {
      return <div className={`p-4 text-center ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>Loading summary...</div>;
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* This Month */}
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
            <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">MONTHLY SALES</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">U</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisMonthSalesUnits)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">V</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisMonthSalesRV)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">%</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisMonthAch, '%')}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20">
              <div className="text-xs text-amber-600 dark:text-amber-400">Target: {formatNumber(thisMonthTarget)}</div>
            </div>
          </div>

          {/* This Quarter */}
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
            <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">
              {prependData?.quarter}{prependData?.prepend} QTR SALES
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">U</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisQtrSalesUnits)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">V</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisQtrSalesRV)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">%</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisQtrAch, '%')}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20">
              <div className="text-xs text-amber-600 dark:text-amber-400">Target: {formatNumber(thisQtrTarget)}</div>
            </div>
          </div>

          {/* Cumulative */}
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
            <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">CUMM. SALES</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">U</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisCummSalesUnits)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">V</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisCummSalesRV)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">%</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisCummAch, '%')}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20">
              <div className="text-xs text-amber-600 dark:text-amber-400">Target: {formatNumber(thisCummTarget)}</div>
            </div>
          </div>

          {/* Annual */}
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
            <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">ANNUAL SALES</div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">U</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisAnnualSalesUnits)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">V</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisAnnualSalesRV)}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">%</div>
                <div className={darkMode ? 'text-white' : 'text-gray-900'}>{formatNumber(thisAnnualAch, '%')}</div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20">
              <div className="text-xs text-amber-600 dark:text-amber-400">Target: {formatNumber(thisAnnualTarget)}</div>
            </div>
          </div>
        </div>

        {/* Monthly Achievement Trend */}
        {monthlyAchievements?.length > 0 && (
          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              Monthly Achievement Trend
            </h3>
            <div className="flex overflow-x-auto space-x-2">
              {monthlyAchievements.map((item, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-20 text-center p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className={`text-xs font-medium ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                    {item.month_name?.toUpperCase() || 'N/A'}
                  </div>
                  <div className={`text-sm font-bold mt-1 ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                    {formatNumber(item.monthly_achivement, '%')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Column Definitions based on working code
  const getColumnDefinitions = () => {
    const { month, year, quarter, currentYear, previousYear, nextYear, prepend } = prependData;

    return [
      {
        headerName: "",
        field: "categoryName",
        pinned: "left",
        width: 120,
        cellStyle: { fontWeight: '500' }
      },
      {
        headerName: "Products",
        field: "descr",
        pinned: "left",
        width: 180,
        cellStyle: { fontWeight: '500' }
      },

      // CURRENT MONTH SALES
      {
        headerName: `${month} ${year} SALES`,
        headerClass: "centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "curr_month_units__base",
            width: 100,
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "curr_month_rv",
            width: 120,
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // PREVIOUS YEAR MONTH SALES
      {
        headerName: `${month} ${year - 1} SALES`,
        headerClass: "centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "prev_yr_units__base",
            width: 100,
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "pre_yr_rv",
            width: 120,
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // MONTHLY GROWTH
      {
        headerName: "% MONTHLY GWTH",
        headerClass: "monthly-growth-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "monthly_growth_unit__base",
            width: 100,
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
          {
            headerName: "RV",
            field: "monthly_growth_rv",
            width: 100,
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // MONTHLY TARGET
      {
        headerName: "MONTHLY TGT",
        headerClass: "monthly-target-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "current_month_target__base",
            width: 120,
            cellStyle: { backgroundColor: "#f7c9ac" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // MONTHLY ACHIEVEMENT
      {
        headerName: "%ACH",
        headerClass: "monthly-ach-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "RV",
            field: "monthly_achi",
            width: 80,
            cellStyle: { backgroundColor: "#ffe597" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // MONTHLY CONTRIBUTION
      {
        headerName: "% CONTR",
        headerClass: "monthly-contr-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "monthly_contri__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffccff" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(2)}` : "0",
          },
        ],
      },

      // CURRENT QUARTER SALES
      {
        headerName: `${quarter}${prepend} QTR SALES ${currentYear}-${nextYear}`,
        headerClass: "qtr-sales-current-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "curr_qtr_units__base",
            width: 100,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "curr_qtr_rv",
            width: 120,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // PREVIOUS YEAR QUARTER SALES
      {
        headerName: `${quarter}${prepend} QTR SALES ${previousYear}-${currentYear}`,
        headerClass: "qtr-sales-current-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "prev_yr_qtr_units__base",
            width: 100,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "prev_yr_qtr_rv",
            width: 120,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // QUARTER GROWTH
      {
        headerName: "% QTR GWTH",
        headerClass: "qtr-growth-header qtr-sales-current-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "qtr_growth_unit__base",
            width: 100,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
          {
            headerName: "RV",
            field: "qtr_growth_rv",
            width: 100,
            cellStyle: { backgroundColor: "#87CEEB" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // QUARTER TARGET
      {
        headerName: `${quarter}${prepend} QTR TGT`,
        headerClass: "qtr-target-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "curr_qtr_target__base",
            width: 120,
            cellStyle: { backgroundColor: "#f7c9ac" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // QUARTER ACHIEVEMENT
      {
        headerName: "%ACH",
        headerClass: "qtr-ach-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "qtr_achi__base",
            width: 80,
            cellStyle: { backgroundColor: "#ffe597" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // QUARTER CONTRIBUTION
      {
        headerName: "% CONTR",
        headerClass: "qtr-contr-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "qtr_contri__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffccff" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(2)}` : "0",
          },
        ],
      },

      // CURRENT YEAR CUMULATIVE SALES
      {
        headerName: `${month}-${currentYear} CUMM. SALES`,
        headerClass: "cumm-sales-current-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "curr_yr_cumm_units__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "curr_yr_cumm_rv",
            width: 120,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // PREVIOUS YEAR CUMULATIVE SALES
      {
        headerName: `${month}-${previousYear} CUMM. SALES`,
        headerClass: "cumm-sales-prev-header centered-header cumm-sales-current-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "prev_yr_cumm_units__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "RV",
            field: "prev_yr_cumm_rv",
            width: 120,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // CUMULATIVE GROWTH
      {
        headerName: "% CUMM. GWTH",
        headerClass: "centered-header cumm-growth-header cumm-sales-current-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "cumm_growth_unit__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
          {
            headerName: "RV",
            field: "cumm_growth_rv",
            width: 100,
            cellStyle: { backgroundColor: "#ffff98" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // CUMULATIVE TARGET
      {
        headerName: "CUMM.TGT",
        headerClass: "monthly-target-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "cumm_target__base",
            width: 120,
            cellStyle: { backgroundColor: "#f7c9ac" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // CUMULATIVE ACHIEVEMENT
      {
        headerName: "%ACH",
        headerClass: "monthly-ach-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "RV",
            field: "cumm_achi__base",
            width: 80,
            cellStyle: { backgroundColor: "#ffe597" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // CUMULATIVE CONTRIBUTION
      {
        headerName: "% CONTR",
        headerClass: "monthly-contr-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "cumm_contri__base",
            width: 100,
            cellStyle: { backgroundColor: "#ffccff" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(2)}` : "0",
          },
        ],
      },

      // ANNUAL TARGET
      {
        headerName: "ANNUAL TGT",
        headerClass: "annual-target-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "annually_target__base",
            width: 120,
            cellStyle: { backgroundColor: "#c8c8c8" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },

      // ANNUAL ACHIEVEMENT
      {
        headerName: "%ACH",
        headerClass: "monthly-ach-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "UNITS",
            field: "achievement__base",
            width: 80,
            cellStyle: { backgroundColor: "#ffe597" },
            valueFormatter: (params) => params?.value ? `${params.value.toFixed(0)}` : "0",
          },
        ],
      },

      // YPM (Yearly Performance Measurement)
      {
        headerName: "YPM",
        headerClass: "ypm-header centered-header",
        cellStyle: { textAlign: "center" },
        children: [
          {
            headerName: "MONTHLY",
            field: "ypm_mothly__base",
            width: 100,
            cellStyle: { backgroundColor: "#ff6699" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
          {
            headerName: "CUMM",
            field: "ypm_cumm__base",
            width: 100,
            cellStyle: { backgroundColor: "#ff6699" },
            valueFormatter: (params) => formatNumber(params?.value),
          },
        ],
      },
    ];
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
      {/* Header Section */}
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
              Sales Statement
            </h1>
            <p className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Comprehensive sales performance analysis with monthly, quarterly and cumulative data
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPDF}
            disabled={!reportData}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${darkMode
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
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${darkMode
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
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
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
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                onBlur={validateDates}
                className={`pl-10 pr-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
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
            selected={filters.selectedDivision}
            onSelect={(selected) => handleMultiSelectChange('selectedDivision', selected)}
            onRemove={(item) => removeMultiSelectItem('selectedDivision', item)}
            placeholder="Select divisions..."
            icon={Building}
            darkMode={darkMode}
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
            darkMode={darkMode}
          />
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {loginDiv === '00' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showSalespers === 'Y'}
                onChange={(e) => handleFilterChange('showSalespers', e.target.checked ? 'Y' : 'N')}
                className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
              />
              <span className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                Include Sales Person
              </span>
            </div>
          )}

          {(filters.showSalespers === 'Y' || loginDiv !== '00') && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  Level
                </label>
                <select
                  value={filters.hLevel}
                  onChange={(e) => handleFilterChange('hLevel', e.target.value)}
                  className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  Sales Person
                </label>
                <select
                  value={filters.hcode}
                  onChange={(e) => handleFilterChange('hcode', e.target.value)}
                  className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${darkMode
                    ? 'bg-gray-800 border-amber-500/30 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-white border-amber-300 text-amber-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                    }`}
                >
                  <option value="">Select Sales Person</option>
                  {salesPersons.map((person) => (
                    <option key={person.hierarchy_code} value={person.hierarchy_code}>
                      {person.sales_pers}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {filters.showSalespers === 'N' && (
            <div className="flex justify-end">
              <button
                onClick={handleGenerateReport}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {(filters.showSalespers === 'Y' || loginDiv !== '00') && (
          <div className="flex justify-end mt-4">
            <button
              onClick={handleGenerateReport}
              disabled={!filters.selectedDivision.length || !filters.salesGroup.length}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        )}
      </div>


{/* Report Data Section */}
{reportData && (reportData.sales_statement || reportData.sales_statemet) && (
  <div className="space-y-6">
    {/* Summary Metrics with Enhanced Design */}
    <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-amber-500/20' : 'bg-gradient-to-br from-white to-amber-50 border-amber-200'
    }`}>
      <div className="p-6 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
            Performance Overview
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
          }`}>
            {filters.fromDate} to {filters.toDate}
          </div>
        </div>
        <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
          Comprehensive sales performance metrics and trends
        </p>
      </div>
      <div className="p-6">
        <SummaryMetrics
          grandTotal={grandTotal}
          monthlyAchievements={monthlyAchievements}
          prependData={prependData}
        />
      </div>
    </div>

    {/* Data Table Section with Enhanced Header */}
    <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
      darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
    }`}>
      {/* Table Header with Stats */}
      <div className="p-6 border-b border-amber-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
              Detailed Sales Statement
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Comprehensive breakdown of sales performance across all categories
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Record Count */}
            <div className={`px-3 py-2 rounded-lg ${
              darkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className={`text-xs font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                Records
              </div>
              <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                {(reportData.sales_statement || reportData.sales_statemet).length}
              </div>
            </div>

            {/* Table Navigation */}
            <div className="flex items-center gap-2">
              <div className={`text-xs font-medium mr-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                Scroll
              </div>
              <button
                onClick={() => scrollTable('left')}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                    : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTable('right')}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  darkMode
                    ? 'bg-gray-700 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                    : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table Container */}
      <div className="relative">
        {/* Scroll Indicator */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-amber-500/20 z-20 ${
          tableScrollPosition > 0 ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-200`}>
          <div 
            className="h-full bg-amber-500 transition-all duration-200"
            style={{ 
              width: `${Math.min((tableScrollPosition / 1000) * 100, 100)}%` 
            }}
          />
        </div>

        {/* Table with Enhanced Styling */}
        <div 
          className="table-container overflow-x-auto relative scroll-smooth"
          style={{ maxHeight: '70vh' }}
          onScroll={(e) => setTableScrollPosition(e.target.scrollLeft)}
        >
          <table className="w-full min-w-max">
            <thead>
              {/* Main Headers */}
              <tr className={darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}>
                {getColumnDefinitions().map((colDef, index) => {
                  if (!colDef.children) {
                    return (
                      <th
                        key={index}
                        className={`px-4 py-4 text-left text-sm font-semibold border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 ${
                          darkMode 
                            ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/15' 
                            : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                        }`}
                        style={{
                          minWidth: colDef.width,
                          position: colDef.pinned ? 'sticky' : 'static',
                          left: colDef.pinned ? (index === 0 ? 0 : colDef.width) : 'auto',
                          zIndex: colDef.pinned ? 20 : 10
                        }}
                        colSpan="1"
                      >
                        <div className="flex items-center gap-2">
                          {colDef.headerName}
                          {colDef.pinned && (
                            <div className={`w-1 h-4 rounded ${
                              darkMode ? 'bg-amber-500' : 'bg-amber-400'
                            }`} />
                          )}
                        </div>
                      </th>
                    );
                  }
                  
                  return (
                    <th
                      key={index}
                      className={`px-4 py-4 text-center text-sm font-semibold border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 ${
                        darkMode 
                          ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/15' 
                          : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                      }`}
                      style={{
                        minWidth: colDef.width,
                      }}
                      colSpan={colDef.children.length}
                    >
                      {colDef.headerName}
                    </th>
                  );
                })}
              </tr>
              
              {/* Child Headers */}
              <tr className={darkMode ? 'bg-amber-500/5' : 'bg-amber-50/70'}>
                {getColumnDefinitions().flatMap((colDef, index) => {
                  if (!colDef.children) {
                    return [
                      <th
                        key={`${index}-child`}
                        className={`px-4 py-3 text-left text-xs font-medium border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 ${
                          darkMode 
                            ? 'text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' 
                            : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100'
                        }`}
                        style={{
                          minWidth: colDef.width,
                          position: colDef.pinned ? 'sticky' : 'static',
                          left: colDef.pinned ? (index === 0 ? 0 : colDef.width) : 'auto',
                          zIndex: colDef.pinned ? 20 : 10
                        }}
                      >
                        {/* Optional: Add sub-header content if needed */}
                      </th>
                    ];
                  }
                  
                  return colDef.children.map((childCol, childIndex) => (
                    <th
                      key={`${index}-${childIndex}`}
                      className={`px-4 py-3 text-center text-xs font-medium border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 ${
                        darkMode 
                          ? 'text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' 
                          : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100'
                      }`}
                      style={{
                        minWidth: childCol.width,
                      }}
                    >
                      {childCol.headerName}
                    </th>
                  ));
                })}
              </tr>
            </thead>
            
            {/* Table Body with Enhanced Rows */}
            <tbody className="divide-y divide-amber-500/10">
              {(reportData.sales_statement || reportData.sales_statemet).map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`group transition-all duration-200 ${
                    item.isGrandTotal 
                      ? darkMode 
                        ? 'bg-amber-500/20 hover:bg-amber-500/25' 
                        : 'bg-amber-100 hover:bg-amber-200'
                      : item.isTotalRow
                      ? darkMode
                        ? 'bg-green-500/10 hover:bg-green-500/15'
                        : 'bg-green-50 hover:bg-green-100'
                      : darkMode
                        ? 'hover:bg-amber-500/5'
                        : 'hover:bg-amber-50'
                  } ${getRowStyle(item)}`}
                >
                  {getColumnDefinitions().flatMap((colDef, colIndex) => {
                    if (!colDef.children) {
                      return [
                        <td
                          key={colIndex}
                          className={`px-4 py-3 text-sm border-r border-amber-500/20 transition-colors duration-200 ${
                            darkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}
                          style={{
                            position: colDef.pinned ? 'sticky' : 'static',
                            left: colDef.pinned ? (colIndex === 0 ? 0 : colDef.width) : 'auto',
                            zIndex: colDef.pinned ? 15 : 1,
                            backgroundColor: 'inherit',
                            ...(colDef.cellStyle || {})
                          }}
                        >
                          <div className={item.isGrandTotal || item.isTotalRow ? 'font-semibold' : ''}>
                            {colDef.valueFormatter
                              ? colDef.valueFormatter({ value: item[colDef.field] })
                              : item[colDef.field]
                            }
                          </div>
                        </td>
                      ];
                    }
                    
                    return colDef.children.map((childCol, childIndex) => {
                      const value = item[childCol.field];
                      const isPercentage = childCol.field?.includes('growth') || 
                                         childCol.field?.includes('achi') || 
                                         childCol.field?.includes('contri');
                      
                      return (
                        <td
                          key={`${colIndex}-${childIndex}`}
                          className={`px-4 py-3 text-sm border-r border-amber-500/20 text-center transition-colors duration-200 ${
                            darkMode ? 'text-gray-200' : 'text-gray-800'
                          } ${
                            isPercentage && typeof value === 'number' 
                              ? value >= 0 
                                ? darkMode ? 'text-green-400' : 'text-green-600'
                                : darkMode ? 'text-red-400' : 'text-red-600'
                              : ''
                          }`}
                          style={{
                            ...(childCol.cellStyle || {})
                          }}
                        >
                          <div className={`${item.isGrandTotal || item.isTotalRow ? 'font-semibold' : ''} ${
                            isPercentage && typeof value === 'number' && value < 0 ? 'animate-pulse' : ''
                          }`}>
                            {childCol.valueFormatter
                              ? childCol.valueFormatter({ value })
                              : value
                            }
                          </div>
                        </td>
                      );
                    });
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className={`border-t border-amber-500/20 p-4 ${
          darkMode ? 'bg-gray-800/80' : 'bg-amber-50/50'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              <div className={`w-2 h-2 rounded-full ${
                darkMode ? 'bg-green-400' : 'bg-green-500'
              }`} />
              <span>Total Rows</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                {(reportData.sales_statement || reportData.sales_statemet).length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                <div className={`w-3 h-3 rounded ${
                  darkMode ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-amber-100 border border-amber-300'
                }`} />
                <span>Category Total</span>
              </div>
              
              <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                <div className={`w-3 h-3 rounded ${
                  darkMode ? 'bg-amber-500/40 border border-amber-500/60' : 'bg-amber-200 border border-amber-400'
                }`} />
                <span>Grand Total</span>
              </div>
            </div>

            <button
              onClick={() => document.querySelector('.table-container')?.scrollTo({ left: 0, behavior: 'smooth' })}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                darkMode
                  ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              Scroll to Start
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions Footer */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className={`text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
        Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleExportPDF}
          disabled={!reportData}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
            darkMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
              : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
          } ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={handleExportExcel}
          disabled={!reportData}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${
            darkMode
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
              : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
          } ${!reportData ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>
    </div>
  </div>
)}
      {/* Loading State */}
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
              Please wait while we process your sales data...
            </p>
            <div className="mt-4 w-full bg-amber-500/20 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !generating && (
        <div className={`rounded-2xl p-12 text-center border backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'}`}>
          <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-amber-500/50' : 'text-amber-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-amber-800'}`}>
            No Report Generated
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
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
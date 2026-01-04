// src/pages/Reports/LocationWise/LocationWiseReport.jsx
import React, { Fragment, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { format, subDays } from "date-fns";
import {
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  MapPin,
  BarChart3,
  TrendingUp,
  Filter,
  Search,
  X,
  ArrowUpDown,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Calculator,
  ChevronDown,
  ChevronUp,
  Settings,
  Grid3x3
} from 'lucide-react';
import { locationWiseAPI } from './api';

const LocationWiseReport = ({ filterData, darkMode = false, onExportExcel, onExportPDF }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tableScrollPosition, setTableScrollPosition] = useState(0);
  const [summaryData, setSummaryData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [processedWithTotals, setProcessedWithTotals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState(new Set());
  const [columnWidths, setColumnWidths] = useState({});
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Default column widths
  const defaultColumnWidths = {
    expandCollapse: 60,
    region: 120,
    location: 200,
    prev_day_sale: 180,
    curr_day_sale: 180,
    cumm_day_sale: 180,
    gross_value: 150
  };

  useEffect(() => {
    if (filterData) {
      setRowData([]);
      setLoading(true);
      setError('');
      getData();
    }
  }, [filterData]);

  useEffect(() => {
    // Initialize visible columns
    const initialVisible = {};
    getColumnDefinitions().forEach(col => {
      initialVisible[col.field] = true;
    });
    getValueColumns().forEach(col => {
      initialVisible[col.field] = true;
    });
    setVisibleColumns(initialVisible);

    // Initialize column widths
    const initialWidths = { ...defaultColumnWidths };
    getColumnDefinitions().forEach(col => {
      if (col.width) initialWidths[col.field] = col.width;
    });
    getValueColumns().forEach(col => {
      if (col.width) initialWidths[col.field] = col.width;
    });
    setColumnWidths(initialWidths);
  }, [materials]);

  const getData = async () => {
    try {
      console.log('Fetching report data with filterData:', filterData);

      const response = await locationWiseAPI.getReportData(filterData);
      console.log('API Response:', response);

      if (response?.data && Array.isArray(response.data)) {
        const data = response.data;

        setRowData(data);
        calculateSummary(data);

        // Extract unique materials from the data
        const uniqueMaterials = [...new Set(data.map(item => item.material))].sort();
        setMaterials(uniqueMaterials);

        // Process data for table with totals
        const processed = processTableDataWithTotals(data, uniqueMaterials);
        setProcessedData(processed.processed);
        setProcessedWithTotals(processed.withTotals);

        // Expand all regions by default
        const allRegions = new Set(processed.withTotals
          .filter(item => item.isRegionHeader)
          .map(item => item.regionData)
        );
        setExpandedRegions(allRegions);

        setLoading(false);
      } else {
        console.log('No data in response:', response);
        setRowData([]);
        setSummaryData(null);
        setMaterials([]);
        setProcessedData([]);
        setProcessedWithTotals([]);
        setLoading(false);
        setError('No data available for the selected filters');
      }
    } catch (err) {
      console.error('Error fetching location wise report:', err);
      setError(`Failed to load report data: ${err.message}`);
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    if (!data || data.length === 0) {
      setSummaryData(null);
      return;
    }

    const summary = {
      totalLocations: new Set(data.map(item => item.location || item.city)).size,
      totalRegions: new Set(data.map(item => item.region)).size,
      totalMaterials: new Set(data.map(item => item.material)).size,
      totalGrossValue: data.reduce((sum, item) => sum + (parseFloat(item.gross_value) || 0), 0),
      totalQty: data.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0),
      totalCummSales: data.reduce((sum, item) => sum + (parseFloat(item.cumm_day_sale) || 0), 0),
      totalCurrSales: data.reduce((sum, item) => sum + (parseFloat(item.curr_day_sale) || 0), 0),
      totalPrevSales: data.reduce((sum, item) => sum + (parseFloat(item.prev_day_sale) || 0), 0)
    };

    setSummaryData(summary);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0.00";
    return Number(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatCompactNumber = (num) => {
    if (isNaN(num)) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  };

  // Prepare column definitions
  const getColumnDefinitions = () => {
    return [
      {
        headerName: "",
        field: "expandCollapse",
        pinned: "left",
        width: columnWidths.expandCollapse || 60,
        cellStyle: {
          textAlign: "center",
          padding: "0 8px"
        },
        valueGetter: (params) => {
          if (params.data.isRegionHeader) {
            return params.data.isExpanded !== undefined ? params.data.isExpanded : true;
          }
          return null;
        }
      },
      {
        headerName: "Region",
        field: "region",
        pinned: "left",
        width: columnWidths.region || 120,
        cellStyle: (params) => {
          if (params.data.isRegionHeader || params.data.isGrandTotal) {
            return {
              fontWeight: '700',
              backgroundColor: darkMode ? '#374151' : '#fef3c7',
              textAlign: "left"
            };
          }
          if (params.data.isRegionTotal) {
            return {
              fontWeight: '700',
              backgroundColor: darkMode ? '#4b5563' : '#fde68a',
              textAlign: "left"
            };
          }
          return {
            fontWeight: '500',
            backgroundColor: darkMode ? '#1f2937' : '#fffbeb',
            textAlign: "left"
          };
        }
      },
      {
        headerName: "Location",
        field: "location",
        pinned: "left",
        width: columnWidths.location || 200,
        cellStyle: {
          fontWeight: '500'
        }
      }
    ];
  };

  const getMaterialColumns = useCallback(() => {
    if (materials.length === 0) return [];

    return materials.map(material => ({
      headerName: material,
      field: `material_${material}`,
      width: columnWidths[`material_${material}`] || 140,
      valueGetter: (params) => {
        if (params.data.isRegionHeader || params.data.isGrandTotal) return null;
        if (params.data.isRegionTotal) return params.data[`material_${material}`] || 0;

        const locationKey = `${params.data.region}|${params.data.location}`;
        const materialData = rowData.find(item =>
          `${item.region}|${item.location}` === locationKey &&
          item.material === material
        );
        return materialData ? parseFloat(materialData.qty) || 0 : 0;
      },
      valueFormatter: (params) => params.value !== null ? formatNumber(params.value) : '',
      cellStyle: (params) => ({
        textAlign: "right",
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        fontSize: '13px',
        fontWeight: params.data.isRegionTotal || params.data.isGrandTotal ? '700' : '400',
        backgroundColor: params.data.isRegionTotal ? (darkMode ? '#374151' : '#fef3c7') : 'inherit'
      })
    }));
  }, [materials, rowData, darkMode, columnWidths]);

  const getValueColumns = () => {
    if (!filterData?.toDate) return [];

    return [
      {
        headerName: `Sales until ${format(subDays(new Date(filterData.toDate), 1), "dd.MM.yyyy")} PTS`,
        field: "prev_day_sale",
        width: columnWidths.prev_day_sale || 180,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: (params) => ({
          textAlign: "right",
          fontFamily: "'Roboto Mono', 'Courier New', monospace",
          fontSize: '13px',
          fontWeight: params.data.isRegionTotal || params.data.isGrandTotal ? '700' : '400',
          backgroundColor: params.data.isRegionTotal ? (darkMode ? '#374151' : '#fef3c7') : 'inherit'
        })
      },
      {
        headerName: `Sales on ${format(new Date(filterData.toDate), "dd.MM.yyyy")} PTS`,
        field: "curr_day_sale",
        width: columnWidths.curr_day_sale || 180,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: (params) => ({
          textAlign: "right",
          fontFamily: "'Roboto Mono', 'Courier New', monospace",
          fontSize: '13px',
          fontWeight: params.data.isRegionTotal || params.data.isGrandTotal ? '700' : '400',
          backgroundColor: params.data.isRegionTotal ? (darkMode ? '#374151' : '#fef3c7') : 'inherit'
        })
      },
      {
        headerName: `Cumulative Sales PTS`,
        field: "cumm_day_sale",
        width: columnWidths.cumm_day_sale || 180,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: (params) => ({
          textAlign: "right",
          fontFamily: "'Roboto Mono', 'Courier New', monospace",
          fontSize: '13px',
          fontWeight: params.data.isRegionTotal || params.data.isGrandTotal ? '700' : '400',
          backgroundColor: params.data.isRegionTotal ? (darkMode ? '#374151' : '#fef3c7') : 'inherit'
        })
      },
      {
        headerName: "Gross Value",
        field: "gross_value",
        width: columnWidths.gross_value || 150,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: (params) => ({
          textAlign: "right",
          fontFamily: "'Roboto Mono', 'Courier New', monospace",
          fontSize: '13px',
          fontWeight: params.data.isRegionTotal || params.data.isGrandTotal ? '700' : '400',
          backgroundColor: params.data.isRegionTotal ? (darkMode ? '#374151' : '#fef3c7') : 'inherit'
        })
      }
    ];
  };

  const processTableDataWithTotals = (data, materialList) => {
    if (data.length === 0) return { processed: [], withTotals: [] };

    // Group data by location first
    const locationMap = new Map();
    const regionTotals = new Map();

    // Initialize region totals
    const uniqueRegions = [...new Set(data.map(item => item.region))];
    uniqueRegions.forEach(region => {
      regionTotals.set(region, {
        region: `${region} - TOTAL`,
        location: "",
        isRegionTotal: true,
        prev_day_sale: 0,
        curr_day_sale: 0,
        cumm_day_sale: 0,
        gross_value: 0
      });

      // Initialize material columns for region total
      materialList.forEach(material => {
        regionTotals.get(region)[`material_${material}`] = 0;
      });
    });

    // Initialize grand total
    const grandTotal = {
      region: "GRAND TOTAL",
      location: "",
      isGrandTotal: true,
      prev_day_sale: 0,
      curr_day_sale: 0,
      cumm_day_sale: 0,
      gross_value: 0
    };

    // Initialize material totals in grand total
    materialList.forEach(material => {
      grandTotal[`material_${material}`] = 0;
    });

    // Group data by location and calculate totals
    data.forEach(item => {
      const locationKey = `${item.region}|${item.location}`;
      const material = item.material;
      const region = item.region;

      // Create or update location data
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          region: region,
          location: item.location,
          prev_day_sale: 0,
          curr_day_sale: 0,
          cumm_day_sale: 0,
          gross_value: 0,
          isLocationRow: true
        });

        // Initialize material columns for this location
        materialList.forEach(mat => {
          locationMap.get(locationKey)[`material_${mat}`] = 0;
        });
      }

      const locationData = locationMap.get(locationKey);
      const qty = parseFloat(item.qty) || 0;

      // Update location data
      locationData.prev_day_sale += parseFloat(item.prev_day_sale) || 0;
      locationData.curr_day_sale += parseFloat(item.curr_day_sale) || 0;
      locationData.cumm_day_sale += parseFloat(item.cumm_day_sale) || 0;
      locationData.gross_value += parseFloat(item.gross_value) || 0;
      locationData[`material_${material}`] = (locationData[`material_${material}`] || 0) + qty;

      // Update region totals
      const regionTotal = regionTotals.get(region);
      regionTotal.prev_day_sale += parseFloat(item.prev_day_sale) || 0;
      regionTotal.curr_day_sale += parseFloat(item.curr_day_sale) || 0;
      regionTotal.cumm_day_sale += parseFloat(item.cumm_day_sale) || 0;
      regionTotal.gross_value += parseFloat(item.gross_value) || 0;
      regionTotal[`material_${material}`] = (regionTotal[`material_${material}`] || 0) + qty;

      // Update grand total
      grandTotal.prev_day_sale += parseFloat(item.prev_day_sale) || 0;
      grandTotal.curr_day_sale += parseFloat(item.curr_day_sale) || 0;
      grandTotal.cumm_day_sale += parseFloat(item.cumm_day_sale) || 0;
      grandTotal.gross_value += parseFloat(item.gross_value) || 0;
      grandTotal[`material_${material}`] = (grandTotal[`material_${material}`] || 0) + qty;
    });

    // Convert to arrays and sort
    const processedLocations = Array.from(locationMap.values())
      .sort((a, b) => a.region.localeCompare(b.region) || a.location.localeCompare(b.location));

    // Build final array with hierarchy
    const withTotals = [];
    let currentRegion = null;
    let regionLocationCount = 0;

    processedLocations.forEach((location, index) => {
      if (location.region !== currentRegion) {
        // Add region header for new region
        withTotals.push({
          region: location.region,
          location: "",
          isRegionHeader: true,
          isExpanded: true,
          regionData: location.region
        });
        currentRegion = location.region;
        regionLocationCount = 0;
      }

      // Add location row
      withTotals.push(location);
      regionLocationCount++;

      // Check if this is the last location in this region
      const isLastLocationInRegion = !processedLocations[index + 1] ||
        processedLocations[index + 1].region !== currentRegion;

      if (isLastLocationInRegion && regionLocationCount > 0) {
        // Add region total after all locations in region
        const regionTotal = regionTotals.get(currentRegion);
        if (regionTotal) {
          withTotals.push(regionTotal);
        }
      }
    });

    // Add grand total at the end
    withTotals.push(grandTotal);

    return {
      processed: processedLocations,
      withTotals
    };
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...processedWithTotals];

    // Apply search filter (only to location rows)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (item.isRegionHeader || item.isRegionTotal || item.isGrandTotal) {
          return true; // Always show total rows
        }
        return (
          item.region?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting (only sort location rows, keep totals in place)
    if (sortConfig.key) {
      const locationRows = result.filter(item => !item.isRegionHeader && !item.isRegionTotal && !item.isGrandTotal);
      const totalRows = result.filter(item => item.isRegionHeader || item.isRegionTotal || item.isGrandTotal);

      locationRows.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      // Reconstruct with totals in correct positions
      const newResult = [];
      let currentRegion = null;

      locationRows.forEach((row, index) => {
        if (row.region !== currentRegion) {
          // Find and add region header
          const regionHeader = totalRows.find(item =>
            item.isRegionHeader && item.regionData === row.region
          );
          if (regionHeader) {
            newResult.push(regionHeader);
          }
          currentRegion = row.region;
        }

        // Add location row
        newResult.push(row);

        // Check if this is the last location in region
        const isLastInRegion = !locationRows[index + 1] || locationRows[index + 1].region !== currentRegion;
        if (isLastInRegion) {
          // Add region total
          const regionTotal = totalRows.find(item =>
            item.isRegionTotal && item.region.startsWith(currentRegion)
          );
          if (regionTotal) {
            newResult.push(regionTotal);
          }
        }
      });

      // Add grand total
      const grandTotal = totalRows.find(item => item.isGrandTotal);
      if (grandTotal) {
        newResult.push(grandTotal);
      }

      result = newResult;
    }

    // Apply region expansion/collapse - FIXED THIS SECTION
    result = result.filter(item => {
      if (item.isRegionHeader || item.isGrandTotal) {
        return true; // Always show region headers and grand total
      }
      if (item.isRegionTotal) {
        // Show region total only if its region is expanded
        const region = item.region?.replace(' - TOTAL', '') || item.region;
        return expandedRegions.has(region);
      }
      if (item.isLocationRow) {
        // Show location row only if its region is expanded
        return expandedRegions.has(item.region);
      }
      return true;
    });

    return result;
  }, [processedWithTotals, searchQuery, sortConfig, expandedRegions]);

  const toggleRegionExpansion = (region) => {
    setExpandedRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(region)) {
        newSet.delete(region);
      } else {
        newSet.add(region);
      }
      return newSet;
    });
  };

  useEffect(() => {
  console.log('Processed Data:', processedData.length);
  console.log('Filtered Data:', filteredAndSortedData.length);
  console.log('Expanded Regions:', Array.from(expandedRegions));
  console.log('Location Rows in filtered:', filteredAndSortedData.filter(item => item.isLocationRow).length);
}, [filteredAndSortedData, expandedRegions, processedData]);

  const expandAllRegions = () => {
    const allRegions = new Set(processedWithTotals
      .filter(item => item.isRegionHeader)
      .map(item => item.regionData)
    );
    setExpandedRegions(allRegions);
  };

  const collapseAllRegions = () => {
    setExpandedRegions(new Set());
  };

  const handleSort = (field) => {
    setSortConfig(current => ({
      key: field,
      direction: current.key === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumnVisibility = (field) => {
    setVisibleColumns(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const updateColumnWidth = (field, newWidth) => {
    setColumnWidths(prev => ({
      ...prev,
      [field]: Math.max(80, newWidth) // Minimum width 80px
    }));
  };

  const columnDefs = useMemo(() => [
    ...getColumnDefinitions(),
    ...getMaterialColumns(),
    ...getValueColumns()
  ], [getMaterialColumns, getColumnDefinitions, getValueColumns]);

  const scrollTable = (direction) => {
    if (!tableContainerRef.current) return;

    const scrollAmount = 300;
    const newPosition = direction === 'right'
      ? tableScrollPosition + scrollAmount
      : Math.max(0, tableScrollPosition - scrollAmount);

    tableContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 300);
  };

  const handleScroll = (e) => {
    setTableScrollPosition(e.target.scrollLeft);
  };

  const getRowStyle = (item) => {
    if (item.isGrandTotal) {
      return darkMode
        ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/30 text-white font-bold'
        : 'bg-gradient-to-r from-purple-50 to-purple-100 text-gray-900 font-bold border-t-2 border-purple-300';
    }
    if (item.isRegionTotal) {
      return darkMode
        ? 'bg-gradient-to-r from-amber-900/20 to-amber-800/10 text-amber-300 font-semibold'
        : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 font-semibold border-t border-amber-300';
    }
    if (item.isRegionHeader) {
      return darkMode
        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-amber-300 font-semibold'
        : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 font-semibold border-y border-amber-300';
    }
    if (item.isLocationRow) {
      return darkMode
        ? 'text-gray-200 hover:bg-gray-700/30 border-b border-gray-700/50'
        : 'text-gray-800 hover:bg-amber-50/50 border-b border-amber-100';
    }
    return '';
  };

  const renderTableCell = (colDef, item, colIndex) => {
    // Special handling for expand/collapse column
    if (colDef.field === "expandCollapse") {
      if (item.isRegionHeader) {
        const isExpanded = expandedRegions.has(item.regionData);
        return (
          <button
            onClick={() => toggleRegionExpansion(item.regionData)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${darkMode
              ? 'hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'hover:bg-amber-200 text-amber-600 border border-amber-300'
              }`}
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        );
      }
      if (item.isGrandTotal) {
        return (
          <div className="flex items-center justify-center">
            <Calculator className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
        );
      }
      return null;
    }

    // For other columns
    const value = item[colDef.field];
    
    if (colDef.valueFormatter) {
      return colDef.valueFormatter({ value });
    }
    
    // Region headers should show their region name in the region column
    if (item.isRegionHeader) {
      if (colDef.field === 'region') {
        return item.region; // This is the key fix - return region name for region headers
      }
      return '';
    }
    
    if (item.isRegionTotal || item.isGrandTotal) {
      if (colDef.field === 'location') return '';
      return value || '';
    }
    
    return value || '-';
  };

  // Add CSS for better table styling
  const tableStyles = `
    .table-container {
      scrollbar-width: thin;
      scrollbar-color: ${darkMode ? '#f59e0b rgba(245, 158, 11, 0.1)' : '#f59e0b rgba(245, 158, 11, 0.1)'};
    }
    .table-container::-webkit-scrollbar {
      height: 12px;
      width: 12px;
    }
    .table-container::-webkit-scrollbar-track {
      background: ${darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
      border-radius: 6px;
    }
    .table-container::-webkit-scrollbar-thumb {
      background: ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.3)'};
      border-radius: 6px;
      border: 2px solid ${darkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 251, 235, 0.8)'};
    }
    .table-container::-webkit-scrollbar-thumb:hover {
      background: ${darkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.5)'};
    }
    .table-container::-webkit-scrollbar-corner {
      background: transparent;
    }
    
    .sticky-column {
      position: sticky;
      z-index: 10;
    }
    
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 20;
    }
    
    .table-cell {
      min-width: 80px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      cursor: col-resize;
      background: transparent;
      transition: background-color 0.2s;
    }
    
    .resize-handle:hover {
      background: ${darkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.5)'};
    }
    
    .resize-handle.active {
      background: ${darkMode ? 'rgba(245, 158, 11, 0.8)' : 'rgba(245, 158, 11, 0.8)'};
    }
  `;

  // Column Settings Panel
  const ColumnSettingsPanel = () => (
    <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl z-50 ${darkMode
      ? 'bg-gray-800 border-amber-500/30'
      : 'bg-white border-amber-300'
      }`}>
      <div className={`p-4 border-b ${darkMode ? 'border-amber-500/20' : 'border-amber-200'
        }`}>
        <h4 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-amber-300' : 'text-amber-700'
          }`}>
          <Settings className="w-4 h-4" />
          Column Settings
        </h4>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Columns: {columnDefs.length}
            </span>
            <button
              onClick={() => {
                const allVisible = {};
                columnDefs.forEach(col => {
                  allVisible[col.field] = true;
                });
                setVisibleColumns(allVisible);
              }}
              className={`px-3 py-1 text-xs rounded-lg ${darkMode
                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}
            >
              Show All
            </button>
          </div>

          {columnDefs.map((colDef) => (
            <div key={colDef.field} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleColumns[colDef.field] !== false}
                  onChange={() => toggleColumnVisibility(colDef.field)}
                  className={`rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <span className={`text-sm truncate max-w-[180px] ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  {colDef.headerName || colDef.field}
                </span>
              </label>
              <div className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                {colDef.width || 120}px
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-3 border-t ${darkMode ? 'border-amber-500/20 bg-gray-900/50' : 'border-amber-200 bg-amber-50'
        }`}>
        <button
          onClick={() => setShowColumnSettings(false)}
          className={`w-full px-3 py-2 text-sm rounded-lg ${darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
        >
          Close
        </button>
      </div>
    </div>
  );

  // Summary Metrics Component (keep existing)
  const SummaryMetrics = () => {
    if (!summaryData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... keep existing SummaryMetrics JSX ... */}
      </div>
    );
  };

  return (
    <Fragment>
      <style>{tableStyles}</style>

      {loading ? (
        <div className={`rounded-2xl p-12 text-center border ${darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'}`}>
          <RefreshCw className={`w-12 h-12 mx-auto mb-4 animate-spin ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
            Loading Location Data...
          </h3>
          <p className={`mt-2 ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
            Please wait while we fetch location-wise sales information
          </p>
        </div>
      ) : error ? (
        <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
              {error}
            </span>
          </div>
          <button
            onClick={getData}
            className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${darkMode
              ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
          >
            Try Again
          </button>
        </div>
      ) : processedData.length > 0 ? (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${darkMode
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-amber-500/20'
            : 'bg-gradient-to-br from-white to-amber-50 border-amber-200'
            }`}>
            <div className="p-6 border-b border-amber-500/20">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                  Performance Overview
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-amber-100 text-amber-700'
                  }`}>
                  {filterData.salesGroup} • {filterData.docType}
                </div>
              </div>
              <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                Location-wise sales performance metrics and trends
              </p>
            </div>
            <div className="p-6">
              <SummaryMetrics />
            </div>
          </div>

          {/* Data Table Section */}
          <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${darkMode
            ? 'bg-gray-800/80 border-amber-500/20'
            : 'bg-white/80 border-amber-200'
            }`}>
            {/* Table Header with Controls */}
            <div className="p-6 border-b border-amber-500/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                    Detailed Location Sales with Region Totals
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {processedData.length} locations • {materials.length} materials • {summaryData?.totalRegions || 0} regions
                    {searchQuery && ` • Filtered: ${filteredAndSortedData.filter(item => item.isLocationRow).length}/${processedData.length}`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {/* Region Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={expandAllRegions}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode
                        ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                        }`}
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllRegions}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode
                        ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300'
                        }`}
                    >
                      Collapse All
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search locations, regions..."
                      className={`pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border transition-all duration-200 ${darkMode
                        ? 'bg-gray-700 border-amber-500/30 text-white placeholder-amber-400/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                        : 'bg-white border-amber-300 text-amber-800 placeholder-amber-500/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
                        }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                      </button>
                    )}
                  </div>

                  {/* Column Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnSettings(!showColumnSettings)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${darkMode
                        ? 'bg-gray-700 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                        : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
                        }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      <span className="text-sm">Columns</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showColumnSettings ? 'rotate-180' : ''}`} />
                    </button>
                    {showColumnSettings && <ColumnSettingsPanel />}
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onExportPDF}
                      disabled={!filteredAndSortedData.length}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${darkMode
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50'
                        : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 disabled:opacity-50'
                        }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={onExportExcel}
                      disabled={!filteredAndSortedData.length}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${darkMode
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 disabled:opacity-50'
                        : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 disabled:opacity-50'
                        }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="relative">
              {/* Scroll Indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1 z-20 ${tableScrollPosition > 0 ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}>
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-200"
                  style={{
                    width: tableContainerRef.current
                      ? `${(tableScrollPosition / (tableContainerRef.current.scrollWidth - tableContainerRef.current.clientWidth)) * 100}%`
                      : '0%'
                  }}
                />
              </div>

              {/* Table */}
              <div
                ref={tableContainerRef}
                className="table-container overflow-x-auto"
                style={{
                  maxHeight: 'calc(70vh - 180px)',
                  scrollBehavior: 'smooth'
                }}
                onScroll={handleScroll}
              >
                <table
                  ref={tableRef}
                  className="w-full border-collapse"
                  style={{
                    minWidth: 'max-content',
                    tableLayout: 'auto'
                  }}
                >
                  <thead className="sticky-header">
                    <tr className={darkMode ? 'bg-gray-900' : 'bg-amber-100'}>
                      {columnDefs.map((colDef, index) => {
                        if (visibleColumns[colDef.field] === false) return null;

                        const isNumericColumn = colDef.field?.startsWith('material_') ||
                          ['prev_day_sale', 'curr_day_sale', 'cumm_day_sale', 'gross_value'].includes(colDef.field);
                        const isPinned = colDef.pinned === 'left';

                        return (
                          <th
                            key={index}
                            className={`px-4 py-3 text-xs font-semibold border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 table-cell ${colDef.field !== 'expandCollapse' ? 'cursor-pointer group' : ''
                              } ${isNumericColumn ? 'text-right' : 'text-left'} ${isPinned ? 'sticky-column' : ''
                              } ${darkMode
                                ? 'text-amber-300 bg-gray-900 hover:bg-gray-800'
                                : 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                              }`}
                            style={{
                              width: colDef.width || 'auto',
                              minWidth: colDef.width || '150px',
                              left: isPinned ? (index === 0 ? 0 : `calc(${index} * ${colDef.width}px)`) : 'auto',
                              backgroundColor: 'inherit',
                              position: isPinned ? 'sticky' : 'relative',
                              zIndex: isPinned ? 30 : 20,
                            }}
                            onClick={() => colDef.field !== 'expandCollapse' && handleSort(colDef.field)}
                          >
                            <div className={`flex items-center ${isNumericColumn ? 'justify-end' : 'justify-start'} overflow-hidden gap-2`}>
                              <span className="truncate" title={colDef.headerName}>
                                {colDef.headerName}
                              </span>
                              {sortConfig.key === colDef.field && colDef.field !== 'expandCollapse' && (
                                <ArrowUpDown className={`w-3 h-3 flex-shrink-0 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                              )}
                              {colDef.field !== 'expandCollapse' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronDown className="w-3 h-3 text-amber-500" />
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedData.length > 0 ? (
                      filteredAndSortedData.map((item, rowIndex) => {
                        const isTotalRow = item.isRegionTotal || item.isGrandTotal;
                        const isHeaderRow = item.isRegionHeader;
                        const isExpanded = expandedRegions.has(item.regionData);

                        // Skip rendering if region is collapsed
                        // if (item.isLocationRow && !isExpanded && item.region && expandedRegions.has(item.region)) {
                        //   return null;
                        // }

                        return (
                          <tr
                            key={rowIndex}
                            className={`transition-all duration-200 ${getRowStyle(item)} ${isTotalRow ? 'border-t-2' : ''
                              }`}
                          >
                            {columnDefs.map((colDef, colIndex) => {
                              if (visibleColumns[colDef.field] === false) return null;

                              const isNumericColumn = colDef.field?.startsWith('material_') ||
                                ['prev_day_sale', 'curr_day_sale', 'cumm_day_sale', 'gross_value'].includes(colDef.field);
                              const isPinned = colDef.pinned === 'left';
                              const cellStyle = typeof colDef.cellStyle === 'function'
                                ? colDef.cellStyle({ data: item })
                                : colDef.cellStyle;

                              return (
                                <td
                                  key={colIndex}
                                  className={`px-4 py-3 text-sm border-r border-amber-500/20 transition-colors duration-200 table-cell ${isNumericColumn ? 'text-right monospace-font' : 'text-left'
                                    } ${isHeaderRow ? 'font-semibold' : ''} ${isTotalRow ? 'font-bold' : ''} ${isPinned ? 'sticky-column' : ''
                                    }`}
                                  style={{
                                    width: colDef.width || 'auto',
                                    minWidth: colDef.width || '150px',
                                    left: isPinned ? (colIndex === 0 ? 0 : `calc(${colIndex} * ${colDef.width}px)`) : 'auto',
                                    zIndex: isPinned ? 25 : 1,
                                    backgroundColor: 'inherit',
                                    position: isPinned ? 'sticky' : 'relative',
                                    ...cellStyle
                                  }}
                                  title={item[colDef.field]?.toString()}
                                >
                                  <div className="truncate">
                                    {renderTableCell(colDef, item, colIndex)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={columnDefs.filter(col => visibleColumns[col.field] !== false).length}
                          className="px-4 py-8 text-center"
                        >
                          <div className={`flex flex-col items-center gap-3 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                            <Search className="w-8 h-8 opacity-50" />
                            <div className="text-sm">
                              No results found for "{searchQuery}"
                            </div>
                            <button
                              onClick={() => setSearchQuery('')}
                              className={`px-3 py-1.5 text-xs rounded-lg ${darkMode
                                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                            >
                              Clear Search
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Navigation */}
              <div className={`absolute bottom-4 right-4 flex items-center gap-2 ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'
                } p-2 rounded-xl border ${darkMode ? 'border-amber-500/30' : 'border-amber-300'
                } shadow-lg backdrop-blur-sm`}>
                <button
                  onClick={() => scrollTable('left')}
                  disabled={tableScrollPosition === 0}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode
                    ? 'bg-gray-800 text-amber-400 hover:bg-amber-500/20 disabled:opacity-30'
                    : 'bg-white text-amber-600 hover:bg-amber-50 disabled:opacity-30'
                    } border ${darkMode ? 'border-amber-500/30' : 'border-amber-300'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className={`text-xs px-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  Scroll
                </div>
                <button
                  onClick={() => scrollTable('right')}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode
                    ? 'bg-gray-800 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-white text-amber-600 hover:bg-amber-50'
                    } border ${darkMode ? 'border-amber-500/30' : 'border-amber-300'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Table Footer */}
              <div className={`border-t ${darkMode
                ? 'border-amber-500/20 bg-gradient-to-t from-gray-900 to-gray-800/80'
                : 'border-amber-300 bg-gradient-to-t from-amber-100 to-amber-50/50'
                } p-4`}>
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'
                        }`} />
                      <span>Showing:</span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                        {filteredAndSortedData.filter(item => item.isLocationRow).length} of {processedData.length} locations
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      <Calculator className="w-3 h-3" />
                      <span>
                        {expandedRegions.size} of {summaryData?.totalRegions || 0} regions expanded
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      {columnDefs.filter(col => visibleColumns[col.field] !== false).length} columns visible
                    </div>

                    <button
                      onClick={() => {
                        tableContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                        setTableScrollPosition(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode
                        ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                    >
                      Scroll to Start
                    </button>

                    <button
                      onClick={getData}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode
                        ? 'bg-gray-800 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                        : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-300'
                        }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ... keep existing Quick Stats and Quick Actions Footer ... */}
        </div>
      ) : (
        <div className={`rounded-2xl p-12 text-center border ${darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
          }`}>
          <MapPin className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-amber-500/50' : 'text-amber-400'
            }`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-amber-800'
            }`}>
            No Location Data Available
          </h3>
          <p className={`mb-6 ${darkMode ? 'text-amber-300' : 'text-amber-600'
            }`}>
            No sales data found for the selected filters and date range.
          </p>
          <button
            onClick={getData}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </Fragment>
  );
};

export default LocationWiseReport;
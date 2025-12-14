// src/pages/Reports/LocationWise/LocationWiseReport.jsx
import React, { Fragment, useEffect, useState } from "react";
import { format } from "date-fns";
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
  Filter
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

  useEffect(() => {
    if (filterData) {
      setRowData([]);
      setLoading(true);
      setError('');
      getData();
    }
  }, [filterData]);

  const getData = async () => {
    try {
      console.log('Fetching report data with filterData:', filterData);
      
      const response = await locationWiseAPI.getReportData(filterData);
      console.log('API Response:', response);
      
      if (response?.data && Array.isArray(response.data)) {
        const data = response.data;
        
        // Log sample data to understand structure
        if (data.length > 0) {
          console.log('Sample data item:', data[0]);
        }
        
        setRowData(data);
        calculateSummary(data);
        
        // Extract unique materials from the data
        const uniqueMaterials = [...new Set(data.map(item => item.material))].sort();
        setMaterials(uniqueMaterials);
        
        // Process data for table
        const processed = processTableData(data, uniqueMaterials);
        setProcessedData(processed);
        
        setLoading(false);
      } else {
        console.log('No data in response:', response);
        setRowData([]);
        setSummaryData(null);
        setMaterials([]);
        setProcessedData([]);
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

  // Prepare column definitions based on actual API response
  const getColumnDefinitions = () => {
    return [
      {
        headerName: "Region",
        field: "region",
        pinned: "left",
        width: 120,
        cellStyle: { 
          fontWeight: '500',
          backgroundColor: darkMode ? '#ffdaa730' : '#ffdaa7',
          textAlign: "center"
        }
      },
      {
        headerName: "City",
        field: "city",
        pinned: "left",
        width: 150,
        cellStyle: { 
          fontWeight: '500'
        }
      },
      {
        headerName: "Location",
        field: "location",
        pinned: "left",
        width: 180,
        cellStyle: { 
          fontWeight: '500'
        }
      },
      {
        headerName: "Plant",
        field: "plant",
        width: 100,
        cellStyle: { textAlign: "center" }
      },
      {
        headerName: "Division",
        field: "division",
        width: 100,
        cellStyle: { textAlign: "center" }
      },
      {
        headerName: "Sales Org",
        field: "sales_org",
        width: 100,
        cellStyle: { textAlign: "center" }
      },
      {
        headerName: "Sales Group",
        field: "sales_group",
        width: 120,
        cellStyle: { textAlign: "center" }
      }
    ];
  };

  const getMaterialColumns = () => {
    if (materials.length === 0) return [];

    return materials.map(material => ({
      headerName: material,
      field: `material_${material}`,
      width: 150,
      valueGetter: (params) => {
        // Find the row for this material at this location
        const locationKey = `${params.data.region}|${params.data.city}|${params.data.location}`;
        const materialData = rowData.find(item => 
          `${item.region}|${item.city}|${item.location}` === locationKey && 
          item.material === material
        );
        return materialData ? parseFloat(materialData.qty) || 0 : 0;
      },
      valueFormatter: (params) => formatNumber(params.value),
      cellStyle: { textAlign: "right" }
    }));
  };

  const getValueColumns = () => {
    return [
      {
        headerName: "Quantity",
        field: "total_qty",
        width: 100,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: { textAlign: "right" }
      },
      {
        headerName: "Gross Value",
        field: "total_gross_value",
        width: 120,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: { textAlign: "right" }
      },
      {
        headerName: "Cumulative Sale",
        field: "cumm_day_sale",
        width: 150,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: { textAlign: "right" }
      },
      {
        headerName: "Current Day Sale",
        field: "curr_day_sale",
        width: 150,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: { textAlign: "right" }
      },
      {
        headerName: "Previous Day Sale",
        field: "prev_day_sale",
        width: 150,
        valueFormatter: (params) => formatNumber(params.value),
        cellStyle: { textAlign: "right" }
      }
    ];
  };

  const processTableData = (data, materialList) => {
    if (data.length === 0) return [];

    // Group data by location
    const locationMap = new Map();
    
    data.forEach(item => {
      const locationKey = `${item.region}|${item.city}|${item.location}`;
      
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          region: item.region,
          city: item.city,
          location: item.location,
          plant: item.plant,
          division: item.division,
          sales_org: item.sales_org,
          sales_group: item.sales_group,
          total_qty: 0,
          total_gross_value: 0,
          cumm_day_sale: item.cumm_day_sale,
          curr_day_sale: item.curr_day_sale,
          prev_day_sale: item.prev_day_sale,
          materials: {}
        });
      }
      
      const locationData = locationMap.get(locationKey);
      locationData.total_qty += parseFloat(item.qty) || 0;
      locationData.total_gross_value += parseFloat(item.gross_value) || 0;
      
      // Store material quantity
      locationData.materials[item.material] = (locationData.materials[item.material] || 0) + (parseFloat(item.qty) || 0);
    });

    // Convert to array
    const result = Array.from(locationMap.values());
    
    // Add material columns to each row
    result.forEach(row => {
      materialList.forEach(material => {
        row[`material_${material}`] = row.materials[material] || 0;
      });
    });

    return result;
  };

  const getDynamicColumns = () => {
    if (materials.length === 0) return [];
    
    return materials.map(material => ({
      headerName: material,
      field: `material_${material}`,
      width: 120,
      valueFormatter: (params) => formatNumber(params.value),
      cellStyle: { textAlign: "right" }
    }));
  };

  const columnDefs = [
    ...getColumnDefinitions(),
    ...getMaterialColumns(),
    ...getValueColumns()
  ];

  const getRowStyle = (item) => {
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

  // Summary Metrics Component
  const SummaryMetrics = () => {
    if (!summaryData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Locations */}
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
          <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">LOCATIONS</div>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {summaryData.totalLocations}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {summaryData.totalRegions} Regions
              </div>
            </div>
            <MapPin className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
          </div>
        </div>

        {/* Materials */}
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-green-500/30' : 'bg-white border-green-200'}`}>
          <div className="text-sm font-semibold mb-3 text-green-600 dark:text-green-400">MATERIALS</div>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {summaryData.totalMaterials}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Products
              </div>
            </div>
            <BarChart3 className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
          </div>
        </div>

        {/* Total Quantity */}
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-amber-500/30' : 'bg-white border-amber-200'}`}>
          <div className="text-sm font-semibold mb-3 text-amber-600 dark:text-amber-400">TOTAL QTY</div>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatNumber(summaryData.totalQty)}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Units
              </div>
            </div>
            <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
          </div>
        </div>

        {/* Total Value */}
        <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-purple-500/30' : 'bg-white border-purple-200'}`}>
          <div className="text-sm font-semibold mb-3 text-purple-600 dark:text-purple-400">TOTAL VALUE</div>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{formatNumber(summaryData.totalGrossValue)}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Gross Value
              </div>
            </div>
            <TrendingUp className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
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
            {/* Table Header */}
            <div className="p-6 border-b border-amber-500/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                    Detailed Location Sales
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {processedData.length} records • {materials.length} materials
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Record Count */}
                  <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                    }`}>
                    <div className={`text-xs font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Records
                    </div>
                    <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                      {processedData.length}
                    </div>
                  </div>

                  {/* Table Navigation */}
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-medium mr-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Scroll
                    </div>
                    <button
                      onClick={() => scrollTable('left')}
                      className={`p-2 rounded-lg border transition-all duration-200 ${darkMode
                        ? 'bg-gray-700 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                        : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400'
                        }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTable('right')}
                      className={`p-2 rounded-lg border transition-all duration-200 ${darkMode
                        ? 'bg-gray-700 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50'
                        : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50 hover:border-amber-400'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onExportPDF}
                      disabled={!processedData.length}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        darkMode
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                      } ${!processedData.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={onExportExcel}
                      disabled={!processedData.length}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        darkMode
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20'
                          : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                      } ${!processedData.length ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <div className={`absolute top-0 left-0 right-0 h-1 bg-amber-500/20 z-20 ${
                tableScrollPosition > 0 ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200`}>
                <div
                  className="h-full bg-amber-500 transition-all duration-200"
                  style={{
                    width: `${Math.min((tableScrollPosition / 5000) * 100, 100)}%`
                  }}
                />
              </div>

              {/* Table */}
              <div
                className="table-container overflow-x-auto relative scroll-smooth"
                style={{ 
                  maxHeight: '70vh',
                  minWidth: '100%'
                }}
                onScroll={(e) => setTableScrollPosition(e.target.scrollLeft)}
              >
                <table className="w-full min-w-max" style={{ tableLayout: 'auto' }}>
                  <thead>
                    <tr className={darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}>
                      {columnDefs.map((colDef, index) => (
                        <th
                          key={index}
                          className={`px-3 py-3 text-left text-xs font-semibold border-r border-amber-500/20 whitespace-nowrap transition-colors duration-200 ${
                            darkMode
                              ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/15'
                              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                          }`}
                          style={{
                            width: colDef.width,
                            position: colDef.pinned ? 'sticky' : 'static',
                            left: colDef.pinned ? (index === 0 ? 0 : colDef.width) : 'auto',
                            zIndex: colDef.pinned ? 20 : 10,
                            ...colDef.cellStyle
                          }}
                        >
                          {colDef.headerName}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-amber-500/10">
                    {processedData.map((item, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={`group transition-all duration-200 hover:bg-amber-500/5 ${
                          darkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        {columnDefs.map((colDef, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-3 py-2 text-xs border-r border-amber-500/20 transition-colors duration-200 ${
                              colDef.cellStyle?.textAlign === 'right' ? 'text-right' : ''
                            }`}
                            style={{
                              width: colDef.width,
                              position: colDef.pinned ? 'sticky' : 'static',
                              left: colDef.pinned ? (colIndex === 0 ? 0 : colDef.width) : 'auto',
                              zIndex: colDef.pinned ? 15 : 1,
                              backgroundColor: 'inherit',
                              ...colDef.cellStyle
                            }}
                          >
                            <div>
                              {colDef.valueFormatter
                                ? colDef.valueFormatter({ value: item[colDef.field] })
                                : item[colDef.field] || '-'}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className={`border-t border-amber-500/20 p-4 ${
                darkMode ? 'bg-gray-800/80' : 'bg-amber-50/50'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${
                      darkMode ? 'bg-green-400' : 'bg-green-500'
                    }`} />
                    <span>Total Rows:</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-amber-800'}`}>
                      {processedData.length}
                    </span>
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

          {/* Quick Stats */}
          <div className={`rounded-2xl p-6 border ${
            darkMode ? 'bg-gray-800 border-amber-500/20' : 'bg-white border-amber-200'
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold mb-1 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {summaryData?.totalLocations || 0}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Locations
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {materials.length}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Materials
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>
                  {summaryData?.totalRegions || 0}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Regions
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold mb-1 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {formatCompactNumber(summaryData?.totalGrossValue || 0)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Value
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
                onClick={onExportPDF}
                disabled={!processedData.length}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
                  : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
                  } ${!processedData.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={onExportExcel}
                disabled={!processedData.length}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${darkMode
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
                  : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400'
                  } ${!processedData.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded-2xl p-12 text-center border ${
          darkMode ? 'bg-gray-800/80 border-amber-500/20' : 'bg-white/80 border-amber-200'
        }`}>
          <MapPin className={`w-16 h-16 mx-auto mb-4 ${
            darkMode ? 'text-amber-500/50' : 'text-amber-400'
          }`} />
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-amber-800'
          }`}>
            No Location Data Available
          </h3>
          <p className={`mb-6 ${
            darkMode ? 'text-amber-300' : 'text-amber-600'
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
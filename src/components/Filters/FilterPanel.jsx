// components/Filters/FilterPanel.jsx
import { Calendar, Filter, Search } from 'lucide-react';

export default function FilterPanel({ filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Filter className="w-5 h-5 text-gray-400 mr-2" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Reports
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Search reports..."
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select 
            className="input-field"
            value={filters.dateRange}
            onChange={(e) => onFilterChange({...filters, dateRange: e.target.value})}
          >
            <option value="today">Today</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <select 
            className="input-field"
            value={filters.reportType}
            onChange={(e) => onFilterChange({...filters, reportType: e.target.value})}
          >
            <option value="all">All Types</option>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="financial">Financial Report</option>
            <option value="analytics">Analytics Report</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select 
            className="input-field"
            value={filters.status}
            onChange={(e) => onFilterChange({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
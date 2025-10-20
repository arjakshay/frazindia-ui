import { useState } from 'react';

export default function Dashboard() {
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    reportType: 'all',
    status: 'all'
  });

  // Mock data
  const stats = {
    totalReports: 1247,
    downloads: 892,
    activeUsers: 328,
    storageUsed: '2.7 GB'
  };

  const reports = [
    {
      id: 1,
      name: 'Sales Report Q1 2024',
      description: 'Quarterly sales performance analysis',
      status: 'completed',
      generatedDate: '2024-03-31',
      size: '2.4 MB',
      type: 'sales'
    },
    {
      id: 2,
      name: 'Inventory Summary',
      description: 'Current inventory levels and trends',
      status: 'completed',
      generatedDate: '2024-03-28',
      size: '1.8 MB',
      type: 'inventory'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Manage and download your reports</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Reports', value: stats.totalReports, color: 'blue' },
          { title: 'Downloads', value: stats.downloads, color: 'green' },
          { title: 'Active Users', value: stats.activeUsers, color: 'purple' },
          { title: 'Storage Used', value: stats.storageUsed, color: 'yellow' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-500">{report.description}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                  <span>Generated: {report.generatedDate}</span>
                  <span>Size: {report.size}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <button className="btn-primary btn-sm">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
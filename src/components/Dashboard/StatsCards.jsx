// components/Dashboard/StatsCards.jsx
import { TrendingUp, FileText, Download, Users } from 'lucide-react';

const stats = [
  {
    title: 'Total Reports',
    value: '1,234',
    icon: FileText,
    change: '+12%',
    trend: 'up'
  },
  {
    title: 'Downloads',
    value: '856',
    icon: Download,
    change: '+8%',
    trend: 'up'
  },
  {
    title: 'Active Users',
    value: '324',
    icon: Users,
    change: '+5%',
    trend: 'up'
  },
  {
    title: 'Storage Used',
    value: '2.4 GB',
    icon: TrendingUp,
    change: '+15%',
    trend: 'up'
  }
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className={`text-sm mt-1 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <stat.icon className={`w-6 h-6 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
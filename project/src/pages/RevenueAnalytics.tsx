import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, TrendingUp, Users, ArrowUp, ArrowDown,
  Calendar, Filter, Download, AlertCircle, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const RevenueAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Mock data - replace with real data from your API
  const revenueData = [
    { date: '2025-01', ad: 12500, affiliate: 8500, sponsorship: 15000, total: 36000 },
    { date: '2025-02', ad: 14000, affiliate: 9200, sponsorship: 18000, total: 41200 },
    { date: '2025-03', ad: 16800, affiliate: 11000, sponsorship: 21000, total: 48800 },
    { date: '2025-04', ad: 19500, affiliate: 13500, sponsorship: 25000, total: 58000 },
    { date: '2025-05', ad: 22000, affiliate: 15800, sponsorship: 28000, total: 65800 },
  ];

  const platformRevenue = [
    { name: 'YouTube', value: 45000 },
    { name: 'TikTok', value: 32000 },
    { name: 'Instagram', value: 28000 },
    { name: 'Twitter', value: 15000 },
  ];

  const revenueStreams = [
    { name: 'Ad Revenue', value: 35 },
    { name: 'Sponsorships', value: 30 },
    { name: 'Affiliate', value: 20 },
    { name: 'Products', value: 15 },
  ];

  const projectionData = [
    { month: 'Current', revenue: 65800 },
    { month: '+1', revenue: 85000 },
    { month: '+2', revenue: 120000 },
    { month: '+3', revenue: 180000 },
    { month: '+4', revenue: 250000 },
    { month: '+5', revenue: 350000 },
    { month: '+6', revenue: 500000 },
  ];

  const topContent = [
    { 
      id: 1, 
      title: 'Morning Productivity Hacks',
      platform: 'YouTube',
      views: 1243000,
      revenue: 4582,
      rpu: 3.69
    },
    { 
      id: 2, 
      title: '5-Minute Healthy Breakfast',
      platform: 'TikTok',
      views: 876000,
      revenue: 3240,
      rpu: 3.70
    },
    { 
      id: 3, 
      title: 'Passive Income Strategies',
      platform: 'YouTube',
      views: 654000,
      revenue: 5120,
      rpu: 7.83
    },
  ];

  const milestones = [
    { revenue: '100K', date: '2025-07', progress: 65.8 },
    { revenue: '250K', date: '2025-09', progress: 26.3 },
    { revenue: '500K', date: '2025-12', progress: 13.2 },
    { revenue: '1M', date: '2026-03', progress: 6.6 },
    { revenue: '10M', date: '2026-12', progress: 0.7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <DollarSign className="mr-2 text-blue-500" />
          Revenue Analytics
        </h1>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              className="appearance-none bg-gray-800 text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="thisyear">This Year</option>
              <option value="alltime">All Time</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Calendar size={16} />
            </div>
          </div>
          
          <div className="relative">
            <select
              className="appearance-none bg-gray-800 text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPlatform || ''}
              onChange={(e) => setSelectedPlatform(e.target.value || null)}
            >
              <option value="">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Filter size={16} />
            </div>
          </div>

          <button className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-gray-900 rounded-lg p-4 shadow"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-white">$65,800</h3>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-2">
              <DollarSign size={20} className="text-blue-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <ArrowUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+12.4%</span>
            <span className="text-gray-400 text-sm ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-900 rounded-lg p-4 shadow"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Revenue per View</p>
              <h3 className="text-2xl font-bold text-white">$4.82</h3>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-full p-2">
              <TrendingUp size={20} className="text-green-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <ArrowUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+8.7%</span>
            <span className="text-gray-400 text-sm ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-900 rounded-lg p-4 shadow"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Active Revenue Streams</p>
              <h3 className="text-2xl font-bold text-white">12</h3>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-full p-2">
              <Users size={20} className="text-purple-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <ArrowUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+2</span>
            <span className="text-gray-400 text-sm ml-2">new this month</span>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gray-900 rounded-lg p-4 shadow"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Path to $10M</p>
              <h3 className="text-2xl font-bold text-white">0.7%</h3>
            </div>
            <div className="bg-orange-500 bg-opacity-20 rounded-full p-2">
              <Target size={20} className="text-orange-500" />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500" style={{ width: '0.7%' }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Revenue Growth</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-xs">Monthly</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full text-xs transition-colors">Quarterly</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full text-xs transition-colors">Yearly</button>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Streams</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueStreams}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueStreams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {revenueStreams.map((stream, index) => (
                <div key={stream.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-300">{stream.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Projection</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={projectionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.revenue} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">${milestone.revenue}</span>
                  <span className="text-gray-400 text-sm">{milestone.date}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${milestone.progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-blue-400">{milestone.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold text-white mb-4">Top Performing Content</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Content</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Views</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">RPU</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topContent.map((content) => (
                <tr key={content.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{content.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{content.platform}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{content.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">${content.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-400">${content.rpu.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformRevenue}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6">
                  {platformRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Anomaly Detection</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-500 bg-opacity-10 rounded-lg">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-400">Revenue Drop Detected</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Significant decrease in YouTube ad revenue (-25%) in the last 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-yellow-500 bg-opacity-10 rounded-lg">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-400">Unusual Pattern</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Affiliate revenue showing irregular fluctuations over the past week.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-500 bg-opacity-10 rounded-lg">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-400">Positive Trend</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Sponsorship revenue showing consistent growth (+15%) month over month.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
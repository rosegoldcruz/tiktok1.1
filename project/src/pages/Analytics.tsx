import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, ChevronDown, BarChart2, PieChart, Activity } from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import ROIHeatmap from '../components/analytics/ROIHeatmap';

const performanceData = [
  { name: 'Jan', views: 4000, engagement: 2400, revenue: 1500 },
  { name: 'Feb', views: 3000, engagement: 1398, revenue: 1210 },
  { name: 'Mar', views: 2000, engagement: 9800, revenue: 2290 },
  { name: 'Apr', views: 2780, engagement: 3908, revenue: 2000 },
  { name: 'May', views: 1890, engagement: 4800, revenue: 2181 },
  { name: 'Jun', views: 2390, engagement: 3800, revenue: 2500 },
  { name: 'Jul', views: 3490, engagement: 4300, revenue: 2800 },
];

const platformData = [
  { name: 'TikTok', value: 45 },
  { name: 'YouTube', value: 28 },
  { name: 'Instagram', value: 18 },
  { name: 'Twitter', value: 9 },
];

const categoryData = [
  { name: 'Tech', value: 35 },
  { name: 'Lifestyle', value: 25 },
  { name: 'Finance', value: 20 },
  { name: 'Health', value: 15 },
  { name: 'Other', value: 5 },
];

const contentData = [
  { name: 'Jan', short: 12, long: 5 },
  { name: 'Feb', short: 19, long: 7 },
  { name: 'Mar', short: 25, long: 9 },
  { name: 'Apr', short: 32, long: 12 },
  { name: 'May', short: 28, long: 10 },
  { name: 'Jun', short: 35, long: 14 },
  { name: 'Jul', short: 42, long: 17 },
];

const topContentData = [
  { id: 1, title: 'Morning Productivity Hacks', views: 1243000, engagement: 8.4, revenue: 4582 },
  { id: 2, title: '5-Minute Healthy Breakfast Ideas', views: 876000, engagement: 7.2, revenue: 3240 },
  { id: 3, title: 'Passive Income Strategies 2023', views: 654000, engagement: 9.1, revenue: 5120 },
  { id: 4, title: 'AI Tools for Content Creators', views: 543000, engagement: 6.8, revenue: 2180 },
  { id: 5, title: 'Night Routine for Better Sleep', views: 432000, engagement: 7.5, revenue: 1850 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9C27B0'];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('last90days');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <BarChart3 className="mr-2 text-blue-500" />
          Analytics Dashboard
        </h1>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              className="appearance-none bg-gray-800 text-white pl-4 pr-10 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Views</p>
              <h3 className="text-2xl font-bold text-white">24.5M</h3>
            </div>
            <div className="bg-blue-500 bg-opacity-20 rounded-full p-2">
              <Users size={20} className="text-blue-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+12.6%</span>
            <span className="text-gray-400 text-sm ml-2">vs last period</span>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Engagement Rate</p>
              <h3 className="text-2xl font-bold text-white">5.8%</h3>
            </div>
            <div className="bg-green-500 bg-opacity-20 rounded-full p-2">
              <Activity size={20} className="text-green-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+3.2%</span>
            <span className="text-gray-400 text-sm ml-2">vs last period</span>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Estimated Revenue</p>
              <h3 className="text-2xl font-bold text-white">$42,580</h3>
            </div>
            <div className="bg-purple-500 bg-opacity-20 rounded-full p-2">
              <DollarSign size={20} className="text-purple-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+24.8%</span>
            <span className="text-gray-400 text-sm ml-2">vs last period</span>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Videos Created</p>
              <h3 className="text-2xl font-bold text-white">142</h3>
            </div>
            <div className="bg-orange-500 bg-opacity-20 rounded-full p-2">
              <BarChart2 size={20} className="text-orange-500" />
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-500">+18.3%</span>
            <span className="text-gray-400 text-sm ml-2">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-xs">Views</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full text-xs transition-colors">Engagement</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full text-xs transition-colors">Revenue</button>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="views" stroke="#3B82F6" fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Platform Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
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
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {platformData.map((platform, index) => (
                <div key={platform.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm text-gray-300">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ROIHeatmap />

        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Content Production</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contentData}
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
                <Legend />
                <Bar dataKey="short" stackId="a" name="Short Videos" fill="#8884d8" />
                <Bar dataKey="long" stackId="a" name="Long Videos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold text-white mb-4">Top Performing Content</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Content Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Views</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Engagement Rate</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topContentData.map((content) => (
                <tr key={content.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{content.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{content.views.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">{content.engagement}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">${content.revenue.toLocaleString()}</div>
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
    </div>
  );
};

export default Analytics;
import React, { useState } from 'react';
import { Search, Filter, TrendingUp, RefreshCw } from 'lucide-react';

const mockTrends = [
  { 
    id: 1, 
    title: 'Morning Productivity Hacks', 
    platform: 'TikTok', 
    category: 'Productivity',
    growth: 84.2,
    engagement: 7.8,
    revenue: '$45.20',
    date: '2023-08-12'
  },
  { 
    id: 2, 
    title: '5-Minute Healthy Breakfast Ideas', 
    platform: 'Instagram', 
    category: 'Food',
    growth: 76.8,
    engagement: 6.2,
    revenue: '$38.50',
    date: '2023-08-14'
  },
  { 
    id: 3, 
    title: 'Passive Income Strategies 2023', 
    platform: 'YouTube', 
    category: 'Finance',
    growth: 65.3,
    engagement: 8.4,
    revenue: '$72.10',
    date: '2023-08-10'
  },
  { 
    id: 4, 
    title: 'AI Tools for Content Creators', 
    platform: 'Twitter', 
    category: 'Tech',
    growth: 58.7,
    engagement: 5.1,
    revenue: '$29.80',
    date: '2023-08-11'
  },
  { 
    id: 5, 
    title: 'Plant-Based Diet Benefits', 
    platform: 'Reddit', 
    category: 'Health',
    growth: 52.1,
    engagement: 6.7,
    revenue: '$41.60',
    date: '2023-08-13'
  },
  { 
    id: 6, 
    title: 'Minimalist Home Office Setup', 
    platform: 'Pinterest', 
    category: 'Lifestyle',
    growth: 47.9,
    engagement: 5.9,
    revenue: '$32.90',
    date: '2023-08-15'
  },
  { 
    id: 7, 
    title: 'Quick 15-Minute HIIT Workouts', 
    platform: 'TikTok', 
    category: 'Fitness',
    growth: 43.2,
    engagement: 7.2,
    revenue: '$44.30',
    date: '2023-08-16'
  },
  { 
    id: 8, 
    title: 'Night Routine for Better Sleep', 
    platform: 'YouTube', 
    category: 'Wellness',
    growth: 38.5,
    engagement: 5.6,
    revenue: '$31.20',
    date: '2023-08-17'
  }
];

const platformColors: Record<string, string> = {
  TikTok: 'bg-pink-500',
  YouTube: 'bg-red-500',
  Reddit: 'bg-orange-500',
  Twitter: 'bg-blue-400',
  Instagram: 'bg-purple-500',
  Pinterest: 'bg-red-600',
};

const categoryColors: Record<string, string> = {
  Tech: 'bg-blue-500 text-blue-100',
  Lifestyle: 'bg-green-500 text-green-100',
  Productivity: 'bg-purple-500 text-purple-100',
  Food: 'bg-yellow-500 text-yellow-100',
  Finance: 'bg-emerald-500 text-emerald-100',
  Health: 'bg-cyan-500 text-cyan-100',
  Fitness: 'bg-orange-500 text-orange-100',
  Wellness: 'bg-teal-500 text-teal-100',
};

const TrendDiscovery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const categories = Array.from(new Set(mockTrends.map(trend => trend.category)));
  const platforms = Array.from(new Set(mockTrends.map(trend => trend.platform)));

  const filteredTrends = mockTrends.filter(trend => {
    const matchesSearch = trend.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || trend.category === selectedCategory;
    const matchesPlatform = !selectedPlatform || trend.platform === selectedPlatform;
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="mr-2 text-blue-500" />
          Trend Discovery
        </h1>
        
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors">
            <RefreshCw size={16} className="mr-2" />
            Refresh Trends
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search trends..."
              className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-gray-800 text-white pl-4 pr-8 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Filter size={14} />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-gray-800 text-white pl-4 pr-8 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPlatform || ''}
                onChange={(e) => setSelectedPlatform(e.target.value || null)}
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Filter size={14} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trend</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Growth</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Engagement</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Revenue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTrends.map((trend) => (
                <tr key={trend.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{trend.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${platformColors[trend.platform]} mr-2`}></div>
                      <div className="text-sm text-gray-300">{trend.platform}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[trend.category]}`}>
                      {trend.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400">+{trend.growth}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{trend.engagement}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{trend.revenue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{trend.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors">
                      Generate
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

export default TrendDiscovery;
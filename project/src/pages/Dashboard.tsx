import React from 'react';
import { ArrowUp, ArrowDown, FilmIcon, FileText, TrendingUp, Play } from 'lucide-react';
import TrendingCard from '../components/dashboard/TrendingCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/dashboard/StatCard';
import ContentProgressCard from '../components/dashboard/ContentProgressCard';

const performanceData = [
  { name: 'Jan', tiktok: 4000, youtube: 2400, reddit: 1800 },
  { name: 'Feb', tiktok: 3000, youtube: 1398, reddit: 2000 },
  { name: 'Mar', tiktok: 2000, youtube: 9800, reddit: 2200 },
  { name: 'Apr', tiktok: 2780, youtube: 3908, reddit: 2500 },
  { name: 'May', tiktok: 1890, youtube: 4800, reddit: 2100 },
  { name: 'Jun', tiktok: 2390, youtube: 3800, reddit: 2400 },
  { name: 'Jul', tiktok: 3490, youtube: 4300, reddit: 2800 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Content"
          value="2,568"
          change="+14.6%"
          isPositive={true}
          icon={<FileText size={20} className="text-purple-500" />}
          color="bg-purple-500"
        />
        <StatCard 
          title="Video Renders"
          value="842"
          change="+7.8%"
          isPositive={true}
          icon={<FilmIcon size={20} className="text-blue-500" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Trending Topics"
          value="65"
          change="+32.4%"
          isPositive={true}
          icon={<TrendingUp size={20} className="text-green-500" />}
          color="bg-green-500"
        />
        <StatCard 
          title="Engagement Rate"
          value="4.6%"
          change="-2.1%"
          isPositive={false}
          icon={<Play size={20} className="text-orange-500" />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Platform Performance</h2>
            <div className="text-xs bg-gray-800 rounded-full px-3 py-1">Last 7 months</div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={performanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTiktok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5c8d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff5c8d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff0000" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReddit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4500" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff4500" stopOpacity={0}/>
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
                <Area type="monotone" dataKey="tiktok" stroke="#ff5c8d" fillOpacity={1} fill="url(#colorTiktok)" />
                <Area type="monotone" dataKey="youtube" stroke="#ff0000" fillOpacity={1} fill="url(#colorYoutube)" />
                <Area type="monotone" dataKey="reddit" stroke="#ff4500" fillOpacity={1} fill="url(#colorReddit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Top Trending</h2>
            <button className="text-xs bg-blue-500 hover:bg-blue-600 rounded-full px-3 py-1 text-white transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            <TrendingCard 
              title="Web Development in 2025"
              platform="TikTok"
              growth={84}
              category="Tech"
            />
            <TrendingCard 
              title="Morning Routine Optimization"
              platform="YouTube"
              growth={67}
              category="Lifestyle"
            />
            <TrendingCard 
              title="AI-Generated Productivity Tips"
              platform="Reddit"
              growth={52}
              category="Productivity"
            />
            <TrendingCard 
              title="5-Minute Dinner Recipes"
              platform="Instagram"
              growth={43}
              category="Food"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold text-white mb-4">Content Production</h2>
          <div className="space-y-4">
            <ContentProgressCard 
              title="Morning Productivity Hacks"
              progress={100}
              status="complete"
              platform="TikTok"
            />
            <ContentProgressCard 
              title="5 Web Dev Trends for 2025"
              progress={75}
              status="rendering"
              platform="YouTube"
            />
            <ContentProgressCard 
              title="AI Tools for Content Creators"
              progress={50}
              status="scripting"
              platform="Instagram"
            />
            <ContentProgressCard 
              title="Passive Income Strategies"
              progress={25}
              status="planning"
              platform="Twitter"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="bg-green-500/10 rounded-full p-2">
                <FilmIcon size={16} className="text-green-500" />
              </div>
              <div>
                <p className="text-white">Video "10x Your Productivity" has finished rendering</p>
                <p className="text-xs text-gray-400">10 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="bg-blue-500/10 rounded-full p-2">
                <FileText size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-white">New script generated for "Financial Freedom in 30 Days"</p>
                <p className="text-xs text-gray-400">25 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="bg-purple-500/10 rounded-full p-2">
                <TrendingUp size={16} className="text-purple-500" />
              </div>
              <div>
                <p className="text-white">New trending topic detected: "Zero Effort Cooking"</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 hover:bg-gray-800 rounded-lg transition-colors">
              <div className="bg-orange-500/10 rounded-full p-2">
                <Play size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white">"5-Minute Ab Workout" video has reached 1M views</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
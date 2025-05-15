import React, { useState } from 'react';
import { Video, PlayCircle, Download, Clock, Film, FastForward, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoItem {
  id: number;
  title: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  duration: string;
  platform: string;
  created: string;
  thumbnail?: string;
}

const mockVideos: VideoItem[] = [
  {
    id: 1,
    title: "Morning Productivity Hacks",
    status: "rendering",
    progress: 65,
    duration: "3:24",
    platform: "TikTok",
    created: "10 minutes ago",
    thumbnail: "https://images.pexels.com/photos/1470165/pexels-photo-1470165.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
  },
  {
    id: 2,
    title: "5-Minute Healthy Breakfast Ideas",
    status: "completed",
    progress: 100,
    duration: "2:48",
    platform: "Instagram",
    created: "1 hour ago",
    thumbnail: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
  },
  {
    id: 3,
    title: "Passive Income Strategies 2023",
    status: "queued",
    progress: 0,
    duration: "4:12",
    platform: "YouTube",
    created: "15 minutes ago",
    thumbnail: undefined
  },
  {
    id: 4,
    title: "AI Tools for Content Creators",
    status: "completed",
    progress: 100,
    duration: "3:05",
    platform: "Twitter",
    created: "2 hours ago",
    thumbnail: "https://images.pexels.com/photos/7047522/pexels-photo-7047522.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
  },
  {
    id: 5,
    title: "Plant-Based Diet Benefits",
    status: "failed",
    progress: 37,
    duration: "3:48",
    platform: "YouTube",
    created: "35 minutes ago",
    thumbnail: undefined
  }
];

const statusColors = {
  queued: 'bg-yellow-500',
  rendering: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500'
};

const statusText = {
  queued: 'In Queue',
  rendering: 'Rendering',
  completed: 'Completed',
  failed: 'Failed'
};

const VideoProduction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'rendering' | 'completed'>('all');
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);
  
  const filteredVideos = mockVideos.filter(video => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rendering') return video.status === 'rendering' || video.status === 'queued';
    if (activeTab === 'completed') return video.status === 'completed';
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedVideoId(expandedVideoId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Video className="mr-2 text-blue-500" />
          Video Production
        </h1>
        
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors">
            <FastForward size={16} className="mr-2" />
            Start Batch Render
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow p-4">
        <div className="border-b border-gray-700 mb-4">
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                activeTab === 'all' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Videos
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                activeTab === 'rendering' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('rendering')}
            >
              In Progress
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                activeTab === 'completed' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <motion.div 
              key={video.id} 
              className="bg-gray-800 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <div className="flex-shrink-0 w-full md:w-48 h-28 bg-gray-700 rounded-md overflow-hidden mb-4 md:mb-0">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <Film size={32} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-medium text-white mb-1">{video.title}</h3>
                      <span className={`${statusColors[video.status].replace('bg-', 'bg-opacity-20')} ${statusColors[video.status].replace('bg-', 'text-')} px-2.5 py-0.5 rounded-full text-xs flex items-center`}>
                        {video.status === 'rendering' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                        )}
                        {statusText[video.status]}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Clock size={14} className="mr-1" />
                      <span>{video.duration}</span>
                      <span className="mx-2">•</span>
                      {video.platform}
                      <span className="mx-2">•</span>
                      {video.created}
                    </div>
                    
                    {(video.status === 'rendering' || video.status === 'queued') && (
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{video.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${statusColors[video.status]}`}
                            style={{ width: `${video.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0">
                    {video.status === 'completed' && (
                      <>
                        <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm">
                          <PlayCircle size={14} className="mr-1.5" />
                          Play
                        </button>
                        <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm">
                          <Download size={14} className="mr-1.5" />
                          Download
                        </button>
                      </>
                    )}
                    {video.status === 'rendering' && (
                      <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm">
                        Cancel
                      </button>
                    )}
                    {video.status === 'queued' && (
                      <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm">
                        <FastForward size={14} className="mr-1.5" />
                        Start Now
                      </button>
                    )}
                    {video.status === 'failed' && (
                      <button className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm">
                        Retry
                      </button>
                    )}
                  </div>
                  
                  <button 
                    className="text-gray-400 hover:text-white ml-2"
                    onClick={() => toggleExpand(video.id)}
                  >
                    {expandedVideoId === video.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedVideoId === video.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-700 px-4 py-3 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Rendering Settings</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Resolution:</span>
                            <span className="text-white">1080p</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Format:</span>
                            <span className="text-white">MP4 (H.264)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Aspect Ratio:</span>
                            <span className="text-white">9:16 (Portrait)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Script Stats</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Word Count:</span>
                            <span className="text-white">487</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Voice:</span>
                            <span className="text-white">Emma (US English)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Background Music:</span>
                            <span className="text-white">Uplifting Ambient</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Export Options</h4>
                        <div className="space-y-1 text-sm">
                          <button className="w-full flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                            <span className="flex items-center">
                              <Download size={14} className="mr-1.5" />
                              MP4 High Quality
                            </span>
                            <span className="text-xs text-gray-400">45MB</span>
                          </button>
                          <button className="w-full flex items-center justify-between p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                            <span className="flex items-center">
                              <Download size={14} className="mr-1.5" />
                              MP4 Web Optimized
                            </span>
                            <span className="text-xs text-gray-400">18MB</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Queue Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Processing Capacity:</span>
              <span className="text-white">3/4 Tasks</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-gray-300">78%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Memory Usage</span>
                <span className="text-gray-300">63%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '63%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Storage</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Storage:</span>
              <span className="text-white">256 GB</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Used</span>
                <span className="text-gray-300">154.2 GB (60%)</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="text-right">
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Manage Storage
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-white mb-4">Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Videos Created:</span>
              <span className="text-white">143</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Render Time:</span>
              <span className="text-white">4:32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Success Rate:</span>
              <span className="text-green-400">98.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoProduction;
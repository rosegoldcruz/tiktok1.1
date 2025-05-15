import React, { useEffect, useState } from 'react';
import { Play, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { videosApi } from '../lib/api';
import { Video } from '../lib/api/types';
import RenderProgress from './video/RenderProgress';
import toast from 'react-hot-toast';

const VideoGallery: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videosApi.getAll();
        if (response.error) throw new Error(response.error);
        if (response.data) setVideos(response.data);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleDownload = (video: Video) => {
    // In production, this would trigger actual download
    toast.success(`Downloading ${video.title}...`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg overflow-hidden"
        >
          <div className="aspect-video bg-gray-900 relative">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play size={32} className="text-gray-600" />
              </div>
            )}
            
            {video.status === 'completed' && (
              <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-xs text-white">
                {video.duration}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-white mb-2">{video.title}</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <Clock size={14} className="mr-1" />
                {new Date(video.created_at).toLocaleDateString()}
              </div>
              <span className="text-sm text-gray-400">{video.platform}</span>
            </div>

            {video.status === 'completed' ? (
              <div className="flex space-x-2">
                <button
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
                  onClick={() => toast.success('Playing video...')}
                >
                  <Play size={16} className="mr-1.5" />
                  Play
                </button>
                <button
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
                  onClick={() => handleDownload(video)}
                >
                  <Download size={16} className="mr-1.5" />
                  Download
                </button>
              </div>
            ) : (
              <RenderProgress
                videoId={video.id}
                onComplete={() => {
                  toast.success(`${video.title} has finished rendering!`);
                }}
              />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default VideoGallery;
import React from 'react';
import { motion } from 'framer-motion';

interface ContentProgressCardProps {
  title: string;
  progress: number;
  status: 'planning' | 'scripting' | 'rendering' | 'complete';
  platform: string;
}

const statusLabels = {
  planning: 'Planning',
  scripting: 'Scripting',
  rendering: 'Rendering',
  complete: 'Complete',
};

const statusColors = {
  planning: 'bg-yellow-500',
  scripting: 'bg-blue-500',
  rendering: 'bg-purple-500',
  complete: 'bg-green-500',
};

const ContentProgressCard: React.FC<ContentProgressCardProps> = ({ 
  title, 
  progress, 
  status,
  platform
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <div className="text-xs text-gray-400 mt-1">{platform}</div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${statusColors[status].replace('bg-', 'bg-opacity-20')} ${statusColors[status].replace('bg-', 'text-')}`}>
          {statusLabels[status]}
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${statusColors[status]}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContentProgressCard;
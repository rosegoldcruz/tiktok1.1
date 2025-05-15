import React from 'react';
import { motion } from 'framer-motion';
import { useVideoRender } from '../../lib/hooks/useVideoRender';
import { Play, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface RenderProgressProps {
  videoId: string;
  onComplete?: () => void;
}

const statusIcons = {
  queued: Clock,
  rendering: Play,
  completed: CheckCircle,
  failed: AlertCircle,
  cancelled: X
};

const statusColors = {
  queued: 'text-yellow-500',
  rendering: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
  cancelled: 'text-gray-500'
};

const RenderProgress: React.FC<RenderProgressProps> = ({ videoId, onComplete }) => {
  const { status, progress, error, startRender, cancelRender } = useVideoRender(videoId);
  
  const StatusIcon = statusIcons[status];

  React.useEffect(() => {
    if (status === 'completed' && onComplete) {
      onComplete();
    }
  }, [status, onComplete]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <StatusIcon className={`mr-2 ${statusColors[status]}`} size={20} />
          <span className="text-white font-medium capitalize">{status}</span>
        </div>
        
        {status === 'rendering' && (
          <button
            onClick={cancelRender}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
        
        {status === 'queued' && (
          <button
            onClick={startRender}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center"
          >
            <Play size={16} className="mr-1" />
            Start
          </button>
        )}
      </div>

      {(status === 'rendering' || status === 'completed') && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default RenderProgress;
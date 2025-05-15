import React, { useState } from 'react';
import { useContentOptimizer } from '../../lib/hooks/useContentOptimizer';
import { Brain, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentItem {
  id: string;
  title: string;
  vertical: string;
  content_type: string;
  platform: string;
  complexity_score: number;
  word_count: number;
  source: string;
}

interface OptimizationResult {
  content_id: string;
  recommended_source: string;
  confidence: number;
  expected_revenue: number;
  reasoning: string;
}

const ContentOptimizer: React.FC = () => {
  const { optimizeContent, isLoading, error } = useContentOptimizer();
  const [content, setContent] = useState<ContentItem>({
    id: crypto.randomUUID(),
    title: '',
    vertical: 'tech',
    content_type: 'video',
    platform: 'tiktok',
    complexity_score: 0.5,
    word_count: 500,
    source: 'pending'
  });
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimize = async () => {
    setOptimizing(true);
    const optimizationResult = await optimizeContent(content);
    setResult(optimizationResult);
    setOptimizing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: name === 'complexity_score' || name === 'word_count' 
        ? parseFloat(value) 
        : value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-400">Initializing optimizer...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Brain className="mr-2 text-blue-500" />
          Content Optimization
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={content.title}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter content title"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vertical</label>
              <select
                name="vertical"
                value={content.vertical}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tech">Technology</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
              <select
                name="content_type"
                value={content.content_type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video</option>
                <option value="post">Post</option>
                <option value="story">Story</option>
                <option value="reel">Reel</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
              <select
                name="platform"
                value={content.platform}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Word Count</label>
              <input
                type="number"
                name="word_count"
                value={content.word_count}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Complexity Score: {content.complexity_score.toFixed(2)}
            </label>
            <input
              type="range"
              name="complexity_score"
              min="0"
              max="1"
              step="0.01"
              value={content.complexity_score}
              onChange={handleInputChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Simple</span>
              <span>Moderate</span>
              <span>Complex</span>
            </div>
          </div>
          
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {optimizing ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Optimizing...
              </>
            ) : (
              <>
                <Brain className="mr-2" />
                Optimize Content
              </>
            )}
          </button>
        </div>
      </div>
      
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg p-6 shadow"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-500" />
            Optimization Result
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Recommended Workflow:</span>
                <span className="text-white font-medium capitalize">
                  {result.recommended_source.replace('_', '-')}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Confidence:</span>
                <span className="text-white font-medium">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Expected Revenue:</span>
                <span className="text-green-400 font-medium">
                  ${result.expected_revenue.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Reasoning</h3>
              <p className="text-gray-300">{result.reasoning}</p>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 w-full transition-colors">
                Apply Recommendation
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContentOptimizer;
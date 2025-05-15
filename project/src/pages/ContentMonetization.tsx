import React, { useState } from 'react';
import { Brain, TrendingUp, DollarSign, BarChart2, Play, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { monetizationApi } from '../lib/api';
import { ContentVariant } from '../lib/agents/types';
import toast from 'react-hot-toast';

const ContentMonetization: React.FC = () => {
  const [content, setContent] = useState<ContentVariant>({
    title: '',
    script: '',
    style: 'casual',
    hashtags: [],
    format: 'short',
    hook: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await monetizationApi.analyzeContent(content);
      if (result.success) {
        setAnalysis(result.data);
        toast.success('Content analysis completed!');
      } else {
        toast.error(result.error || 'Analysis failed');
      }
    } catch (error) {
      toast.error('Failed to analyze content');
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Brain className="mr-2 text-blue-500" />
          Content Monetization
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-white mb-4">Content Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={content.title}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hook</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={content.hook}
                  onChange={(e) => setContent({ ...content, hook: e.target.value })}
                  placeholder="Enter attention-grabbing hook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Script</label>
                <textarea
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  value={content.script}
                  onChange={(e) => setContent({ ...content, script: e.target.value })}
                  placeholder="Enter your content script"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select
                    className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content.format}
                    onChange={(e) => setContent({ ...content, format: e.target.value as 'short' | 'long' })}
                  >
                    <option value="short">Short Form</option>
                    <option value="long">Long Form</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
                  <select
                    className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content.style}
                    onChange={(e) => setContent({ ...content, style: e.target.value })}
                  >
                    <option value="casual">Casual</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="educational">Educational</option>
                    <option value="entertaining">Entertaining</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hashtags</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hashtags (comma separated)"
                  onBlur={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                    setContent({ ...content, hashtags: tags });
                  }}
                />
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !content.title || !content.script}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Content
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2" size={20} />
                      Analyze Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {analysis && (
            <div className="bg-gray-900 rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold text-white mb-4">Content Variants</h2>
              
              <div className="space-y-4">
                {analysis.variants.map((variant: ContentVariant, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full bg-blue-500 mr-2`}></div>
                        <h3 className="font-medium text-white">Variant {index + 1}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Copy size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Play size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">{variant.hook}</p>
                      <p className="text-xs text-gray-400">{variant.script.substring(0, 100)}...</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Style: {variant.style}</span>
                        <span className="text-green-400">
                          Est. Revenue: ${analysis.estimates[index].estimated_earnings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {analysis && (
            <>
              <div className="bg-gray-900 rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold text-white mb-4">Revenue Forecast</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Best Variant</span>
                    <span className="text-white font-medium">Variant 1</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Est. Revenue</span>
                    <span className="text-green-400 font-medium">
                      ${Math.max(...analysis.estimates.map((e: any) => e.estimated_earnings)).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Confidence Score</span>
                    <span className="text-blue-400 font-medium">
                      {(analysis.estimates[0].confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 shadow">
                <h2 className="text-lg font-semibold text-white mb-4">Scaling Strategy</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Recommended Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.strategy.recommended_platforms.map((platform: string) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Optimal Posting Times</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.strategy.optimal_posting_times.map((time: string) => (
                        <span
                          key={time}
                          className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Hashtag Groups</h3>
                    <div className="space-y-2">
                      {analysis.strategy.hashtag_groups.map((group: string[], index: number) => (
                        <div key={index} className="flex flex-wrap gap-1">
                          {group.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-800 text-blue-400 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentMonetization;
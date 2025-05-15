import React, { useState } from 'react';
import { FileText, TrendingUp, Video, Check, X, PlayCircle, Download, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const ContentGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [trendInput, setTrendInput] = useState('');
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const mockTrends = [
    'Morning Productivity Hacks',
    '5-Minute Healthy Breakfast Ideas',
    'Passive Income Strategies 2023',
    'AI Tools for Content Creators'
  ];

  const handleGenerateScript = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedScript(`# ${selectedTrend || trendInput}

## Introduction
- Hook: "Ever wonder how top performers seem to get so much done before breakfast?"
- Problem statement: Many people struggle with productivity in the morning
- Solution preview: In this video, we'll reveal 5 morning hacks that can transform your day

## Main Points
1. **Prepare the night before**
   - Set out clothes
   - Plan your meals
   - Write down your top 3 priorities
   
2. **Wake up at the same time daily**
   - Creates biological rhythm
   - Improves sleep quality
   - Reduces morning grogginess
   
3. **Hydrate immediately**
   - 16oz of water within 5 minutes of waking
   - Rehydrates after sleep
   - Kickstarts metabolism
   
4. **Exercise for just 7 minutes**
   - Increases blood flow
   - Releases endorphins
   - Doesn't require equipment
   
5. **No screens for 30 minutes**
   - Avoids stress triggers
   - Prevents reactive mode
   - Allows for intentional start

## Conclusion
- Summary of benefits
- Call to action: "Which hack will you try tomorrow morning?"
- End screen with links to related content`);
      setIsGenerating(false);
      setActiveStep(2);
    }, 3000);
  };

  const handleCreateVideo = () => {
    // Navigate to video production
    setActiveStep(3);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FileText className="mr-2 text-blue-500" />
          Content Generator
        </h1>
      </div>

      <div className="bg-gray-900 rounded-lg shadow">
        <div className="border-b border-gray-700">
          <div className="flex">
            <button 
              className={`px-6 py-3 flex items-center text-sm font-medium focus:outline-none ${
                activeStep >= 1 ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveStep(1)}
            >
              <span className="w-6 h-6 rounded-full bg-gray-800 inline-flex items-center justify-center mr-2">
                {activeStep > 1 ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <span className="text-xs">1</span>
                )}
              </span>
              Select Trend
            </button>
            
            <button 
              className={`px-6 py-3 flex items-center text-sm font-medium focus:outline-none ${
                activeStep >= 2 ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'
              } ${activeStep < 2 ? 'cursor-not-allowed' : ''}`}
              disabled={activeStep < 2}
              onClick={() => activeStep >= 2 && setActiveStep(2)}
            >
              <span className="w-6 h-6 rounded-full bg-gray-800 inline-flex items-center justify-center mr-2">
                {activeStep > 2 ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <span className="text-xs">2</span>
                )}
              </span>
              Generate Script
            </button>
            
            <button 
              className={`px-6 py-3 flex items-center text-sm font-medium focus:outline-none ${
                activeStep >= 3 ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'
              } ${activeStep < 3 ? 'cursor-not-allowed' : ''}`}
              disabled={activeStep < 3}
              onClick={() => activeStep >= 3 && setActiveStep(3)}
            >
              <span className="w-6 h-6 rounded-full bg-gray-800 inline-flex items-center justify-center mr-2">
                {activeStep > 3 ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <span className="text-xs">3</span>
                )}
              </span>
              Video Production
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Select Trend */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select a trending topic or enter your own</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {mockTrends.map((trend) => (
                    <motion.div
                      key={trend}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                        selectedTrend === trend 
                          ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                          : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        setSelectedTrend(trend);
                        setTrendInput('');
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-blue-400 mr-2" />
                          <span className="text-white font-medium">{trend}</span>
                        </div>
                        {selectedTrend === trend && (
                          <Check size={18} className="text-blue-500" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your own topic idea..."
                    className="bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    value={trendInput}
                    onChange={(e) => {
                      setTrendInput(e.target.value);
                      setSelectedTrend(null);
                    }}
                  />
                  {trendInput && (
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setTrendInput('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedTrend && !trendInput}
                  onClick={handleGenerateScript}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generate Script */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Generated Script</label>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-white">
                      <Copy size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-white">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                
                {isGenerating ? (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-400">Generating script...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 h-96 overflow-y-auto">
                    <div className="prose prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{generatedScript}</pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button 
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </button>
                <button 
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  onClick={handleCreateVideo}
                >
                  Create Video
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Video Production */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4 text-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Video className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-300">Ready for production</h3>
                    <div className="mt-2 text-sm">
                      <p>Your script has been sent to the Video Production module. You can now proceed to the Video Production page to manage the rendering process.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium text-white">{selectedTrend || trendInput}</h3>
                  <span className="bg-yellow-500 bg-opacity-20 text-yellow-300 px-2.5 py-0.5 rounded-full text-xs">Pending</span>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">Waiting in queue</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Estimated time:</span>
                      <span className="text-white">~2 minutes</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Video length:</span>
                      <span className="text-white">~3:45</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </button>
                <button 
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <PlayCircle size={18} className="mr-2" />
                  Go to Video Production
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
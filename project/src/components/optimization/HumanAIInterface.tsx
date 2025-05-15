import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Brain, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ContentOptimizer from './ContentOptimizer';

const HumanAIInterface: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [complexityData, setComplexityData] = useState<any[]>([]);
  const [marginalValueData, setMarginalValueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch performance data
        const { data: performanceData, error: performanceError } = await supabase
          .from('content_analysis')
          .select(`
            id,
            source,
            engagement_rate,
            completion_rate,
            sentiment_score,
            monetization_logs (revenue)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (performanceError) throw performanceError;

        // Process performance data
        const processedPerformance = processPerformanceData(performanceData);
        setPerformanceData(processedPerformance);

        // Fetch complexity data
        const { data: complexityData, error: complexityError } = await supabase
          .from('content_analysis')
          .select(`
            id,
            source,
            complexity_score,
            engagement_rate,
            monetization_logs (revenue)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (complexityError) throw complexityError;

        // Process complexity data
        const processedComplexity = processComplexityData(complexityData);
        setComplexityData(processedComplexity);

        // Generate marginal value data (this would typically come from backend)
        setMarginalValueData([
          { name: 'Content Planning', value: 12.5, time: 30 },
          { name: 'Script Writing', value: 8.2, time: 60 },
          { name: 'Visual Direction', value: 6.7, time: 45 },
          { name: 'Quality Review', value: 15.3, time: 15 }
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processPerformanceData = (data) => {
    // Group by source
    const grouped = data.reduce((acc, item) => {
      const source = item.source || 'unknown';
      if (!acc[source]) {
        acc[source] = {
          count: 0,
          engagement_rate: 0,
          completion_rate: 0,
          sentiment_score: 0,
          revenue: 0
        };
      }
      
      acc[source].count += 1;
      acc[source].engagement_rate += item.engagement_rate || 0;
      acc[source].completion_rate += item.completion_rate || 0;
      acc[source].sentiment_score += item.sentiment_score || 0;
      acc[source].revenue += item.monetization_logs.reduce((sum, log) => sum + log.revenue, 0);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(grouped).forEach(source => {
      const count = grouped[source].count;
      if (count > 0) {
        grouped[source].engagement_rate /= count;
        grouped[source].completion_rate /= count;
        grouped[source].sentiment_score /= count;
        grouped[source].revenue /= count;
      }
    });

    // Convert to array format for charts
    return [
      { 
        metric: 'Engagement Rate', 
        'AI Only': grouped['ai_only']?.engagement_rate || 0,
        'Human-AI': grouped['human_ai']?.engagement_rate || 0,
        'Human Only': grouped['human_only']?.engagement_rate || 0
      },
      { 
        metric: 'Completion Rate', 
        'AI Only': grouped['ai_only']?.completion_rate || 0,
        'Human-AI': grouped['human_ai']?.completion_rate || 0,
        'Human Only': grouped['human_only']?.completion_rate || 0
      },
      { 
        metric: 'Sentiment Score', 
        'AI Only': grouped['ai_only']?.sentiment_score || 0,
        'Human-AI': grouped['human_ai']?.sentiment_score || 0,
        'Human Only': grouped['human_only']?.sentiment_score || 0
      },
      { 
        metric: 'Revenue', 
        'AI Only': grouped['ai_only']?.revenue || 0,
        'Human-AI': grouped['human_ai']?.revenue || 0,
        'Human Only': grouped['human_only']?.revenue || 0
      }
    ];
  };

  const processComplexityData = (data) => {
    // Define complexity ranges
    const ranges = [
      { min: 0, max: 0.3, label: 'Simple' },
      { min: 0.3, max: 0.6, label: 'Moderate' },
      { min: 0.6, max: 1.0, label: 'Complex' }
    ];

    // Group by complexity range and source
    const grouped = data.reduce((acc, item) => {
      const source = item.source || 'unknown';
      const range = ranges.find(r => 
        item.complexity_score >= r.min && item.complexity_score <= r.max
      )?.label || 'Unknown';
      
      const key = `${range}-${source}`;
      if (!acc[key]) {
        acc[key] = {
          complexity: range,
          source,
          count: 0,
          engagement_rate: 0,
          revenue: 0
        };
      }
      
      acc[key].count += 1;
      acc[key].engagement_rate += item.engagement_rate || 0;
      acc[key].revenue += item.monetization_logs.reduce((sum, log) => sum + log.revenue, 0);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(grouped).forEach(key => {
      const count = grouped[key].count;
      if (count > 0) {
        grouped[key].engagement_rate /= count;
        grouped[key].revenue /= count;
      }
    });

    // Convert to array format for charts
    return Object.values(grouped).map(item => ({
      complexity: item.complexity,
      source: item.source,
      engagement: item.engagement_rate * 100, // Convert to percentage
      revenue: item.revenue
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Brain className="mr-2 text-blue-500" />
          Human-AI Interface Optimization
        </h1>
      </div>

      <div className="bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-800">
          <nav className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'optimizer'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('optimizer')}
            >
              Content Optimizer
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Advanced Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm font-medium mb-1">Human-AI Improvement</p>
                          <h3 className="text-2xl font-bold text-white">+42.8%</h3>
                        </div>
                        <div className="bg-blue-500 bg-opacity-20 rounded-full p-2">
                          <TrendingUp size={20} className="text-blue-500" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">vs. AI-only workflow</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm font-medium mb-1">Avg. Revenue Lift</p>
                          <h3 className="text-2xl font-bold text-white">$24.50</h3>
                        </div>
                        <div className="bg-green-500 bg-opacity-20 rounded-full p-2">
                          <DollarSign size={20} className="text-green-500" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">per content piece</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm font-medium mb-1">Optimal Touchpoints</p>
                          <h3 className="text-2xl font-bold text-white">2</h3>
                        </div>
                        <div className="bg-purple-500 bg-opacity-20 rounded-full p-2">
                          <Users size={20} className="text-purple-500" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">human intervention points</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm font-medium mb-1">Model Accuracy</p>
                          <h3 className="text-2xl font-bold text-white">87.2%</h3>
                        </div>
                        <div className="bg-orange-500 bg-opacity-20 rounded-full p-2">
                          <Brain size={20} className="text-orange-500" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">for workflow recommendations</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Performance Comparison</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart outerRadius={90} data={performanceData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                            <Radar
                              name="AI Only"
                              dataKey="AI Only"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.2}
                            />
                            <Radar
                              name="Human-AI"
                              dataKey="Human-AI"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.2}
                            />
                            <Radar
                              name="Human Only"
                              dataKey="Human Only"
                              stroke="#ffc658"
                              fill="#ffc658"
                              fillOpacity={0.2}
                            />
                            <Legend />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">Marginal Value by Stage</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={marginalValueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="value" name="$ Value Per Minute" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="time" name="Time (minutes)" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Performance by Content Complexity</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complexityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="complexity" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="revenue" name="Avg Revenue" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="engagement" name="Engagement %" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Optimization Insights</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-blue-500 bg-opacity-10 rounded-lg">
                        <div className="flex-shrink-0">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-blue-400">Optimal Human Touchpoints</h4>
                          <p className="mt-1 text-sm text-gray-400">
                            Quality review and content planning provide the highest value per minute of human time investment.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-green-500 bg-opacity-10 rounded-lg">
                        <div className="flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-green-400">Complexity-Based Routing</h4>
                          <p className="mt-1 text-sm text-gray-400">
                            Route complex content (score &gt; 0.6) through human-AI workflow for 150% better performance.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-purple-500 bg-opacity-10 rounded-lg">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-purple-400">AI Model Fine-Tuning</h4>
                          <p className="mt-1 text-sm text-gray-400">
                            Finance vertical shows 68% performance gap between AI and human-AI. Fine-tune AI models on human-edited finance content.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'optimizer' && (
            <ContentOptimizer />
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Advanced analytics features are coming soon in the next update. Stay tuned for more detailed insights!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanAIInterface;
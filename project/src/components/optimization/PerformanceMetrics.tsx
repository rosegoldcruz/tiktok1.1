```typescript
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react';
import { PerformanceAnalytics } from '../../lib/optimization/PerformanceAnalytics';

const PerformanceMetrics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const analytics = new PerformanceAnalytics();

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const end = new Date();
        const start = new Date();
        
        switch (timeRange) {
          case 'day':
            start.setDate(start.getDate() - 1);
            break;
          case 'week':
            start.setDate(start.getDate() - 7);
            break;
          case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        }

        const result = await analytics.analyzePerformance({ start, end });
        setMetrics(result);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Performance Metrics</h2>
        <div className="flex space-x-2">
          {['day', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 rounded-full text-xs ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metrics.metrics).map(([source, data]: [string, any]) => (
          <div key={source} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  {source.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-')}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  ${data.revenue.toFixed(2)}
                </h3>
              </div>
              <div className={`bg-${getSourceColor(source)}-500 bg-opacity-20 rounded-full p-2`}>
                {getSourceIcon(source)}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-sm text-green-500">
                +{(data.engagementRate * 100).toFixed(1)}%
              </span>
              <span className="text-gray-400 text-sm ml-2">engagement</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Revenue Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ai_only"
                  name="AI Only"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="human_ai"
                  name="Human-AI"
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="human_only"
                  name="Human Only"
                  stroke="#F59E0B"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Quality vs Speed</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.values(metrics.metrics)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="source"
                  stroke="#9CA3AF"
                  tickFormatter={(value) =>
                    value.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-')
                  }
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
                <Legend />
                
                <Bar
                  dataKey="qualityScore"
                  name="Quality Score"
                  fill="#3B82F6"
                />
                <Bar
                  dataKey="processingTime"
                  name="Processing Time (s)"
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {metrics.insights.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.insights.map((insight: any, index: number) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  insight.impact === 'high'
                    ? 'bg-blue-500 bg-opacity-10'
                    : insight.impact === 'medium'
                    ? 'bg-yellow-500 bg-opacity-10'
                    : 'bg-gray-700'
                }`}
              >
                {getInsightIcon(insight.type)}
                <div>
                  <p className="text-sm text-white">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getSourceColor(source: string): string {
  switch (source) {
    case 'ai_only':
      return 'blue';
    case 'human_ai':
      return 'green';
    case 'human_only':
      return 'yellow';
    default:
      return 'gray';
  }
}

function getSourceIcon(source: string) {
  const className = `h-5 w-5 text-${getSourceColor(source)}-500`;
  switch (source) {
    case 'ai_only':
      return <TrendingUp className={className} />;
    case 'human_ai':
      return <Users className={className} />;
    case 'human_only':
      return <Clock className={className} />;
    default:
      return <DollarSign className={className} />;
  }
}

function getInsightIcon(type: string) {
  switch (type) {
    case 'engagement':
      return <Users className="h-5 w-5 text-blue-500" />;
    case 'revenue':
      return <DollarSign className="h-5 w-5 text-green-500" />;
    case 'efficiency':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    default:
      return <TrendingUp className="h-5 w-5 text-gray-500" />;
  }
}

export default PerformanceMetrics;
```
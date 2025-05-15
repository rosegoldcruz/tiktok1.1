```typescript
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { RealTimeMonitor } from '../../lib/optimization/RealTimeMonitor';

interface MetricsDisplayProps {
  monitor: RealTimeMonitor;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ monitor }) => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time metrics
    const subscription = monitor.subscribeToMetrics((newMetrics) => {
      setMetrics(current => [...current, { ...newMetrics, timestamp: new Date() }]);
    });

    // Load historical data
    const loadHistory = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      const history = await monitor.getMetricsHistory({ start: startDate, end: endDate });
      setMetrics(history);
      setLoading(false);
    };

    loadHistory();

    return () => subscription.unsubscribe();
  }, [monitor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Real-time Metrics</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
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
              <Line 
                type="monotone" 
                dataKey="modelAccuracy" 
                name="Model Accuracy"
                stroke="#3B82F6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="humanAiImprovement" 
                name="Human-AI Improvement"
                stroke="#10B981" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="revenueIncrease" 
                name="Revenue Increase"
                stroke="#F59E0B" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Active Alerts</h3>
          
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start space-x-3 p-4 rounded-lg ${
                alert.severity === 'high' 
                  ? 'bg-red-500 bg-opacity-10 border border-red-500' 
                  : alert.severity === 'medium'
                  ? 'bg-yellow-500 bg-opacity-10 border border-yellow-500'
                  : 'bg-blue-500 bg-opacity-10 border border-blue-500'
              }`}
            >
              <AlertCircle className={`h-5 w-5 ${
                alert.severity === 'high' 
                  ? 'text-red-500' 
                  : alert.severity === 'medium'
                  ? 'text-yellow-500'
                  : 'text-blue-500'
              }`} />
              <div>
                <h4 className={`text-sm font-medium ${
                  alert.severity === 'high' 
                    ? 'text-red-400' 
                    : alert.severity === 'medium'
                    ? 'text-yellow-400'
                    : 'text-blue-400'
                }`}>
                  {alert.type}
                </h4>
                <p className="mt-1 text-sm text-gray-400">{alert.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricsDisplay;
```
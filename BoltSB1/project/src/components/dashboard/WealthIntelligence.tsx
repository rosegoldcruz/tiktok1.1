import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { Brain, TrendingUp, Zap, Target } from 'lucide-react';
import HumanAIMerger from '../../services/HumanAIMerger';

export const WealthIntelligence: React.FC = () => {
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await HumanAIMerger.getInstance().optimizeWealthGeneration();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch wealth metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load wealth intelligence metrics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card decoration="top" decorationColor="blue">
          <div className="flex items-center space-x-4">
            <Brain className="w-8 h-8 text-blue-500" />
            <div>
              <Text>Revenue Multiplier</Text>
              <Title>{metrics.metrics.revenueMultiplier.toFixed(2)}x</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="green">
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <Text>Human Efficiency</Text>
              <Title>{(metrics.metrics.humanEfficiency * 100).toFixed(1)}%</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="purple">
          <div className="flex items-center space-x-4">
            <Zap className="w-8 h-8 text-purple-500" />
            <div>
              <Text>AI Accuracy</Text>
              <Title>{(metrics.metrics.aiAccuracy * 100).toFixed(1)}%</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor="orange">
          <div className="flex items-center space-x-4">
            <Target className="w-8 h-8 text-orange-500" />
            <div>
              <Text>Days to $10M</Text>
              <Title>{metrics.timeline.daysTo10M}</Title>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Title>Strategic Recommendations</Title>
        <div className="mt-4 space-y-2">
          {metrics.recommendations.map((recommendation: string, index: number) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <Text>{recommendation}</Text>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Synergistic Gains</Title>
          <div className="mt-4">
            <Text className="text-2xl font-bold text-green-600">
              {(metrics.metrics.synergisticGains * 100).toFixed(1)}%
            </Text>
            <Text className="text-gray-500">
              Combined human-AI performance boost
            </Text>
          </div>
        </Card>

        <Card>
          <Title>Confidence Level</Title>
          <div className="mt-4">
            <Text className="text-2xl font-bold text-blue-600">
              {(metrics.timeline.confidence * 100).toFixed(1)}%
            </Text>
            <Text className="text-gray-500">
              Timeline prediction accuracy
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};
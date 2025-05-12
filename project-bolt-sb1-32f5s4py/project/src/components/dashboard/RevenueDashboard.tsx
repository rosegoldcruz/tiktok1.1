import React, { useState, useEffect } from 'react';
import { AreaChart, Card, Title, Text } from '@tremor/react';
import { DollarSign, TrendingUp, Users, Clock, Target } from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  targetRevenue: number;
  accountRevenues: {
    [key: string]: number;
  };
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
  projectedDate: string;
  topPerformers: {
    accountId: string;
    revenue: number;
    roi: number;
  }[];
}

export const RevenueDashboard: React.FC<{ whiteLabel?: boolean; brandColor?: string }> = ({ 
  whiteLabel = false,
  brandColor = '#2563eb' // Default blue color
}) => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
    const interval = setInterval(fetchRevenueData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/analytics/revenue', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response was not JSON');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const revenueData = await response.json();
      setData(revenueData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      setError('Failed to load revenue data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load revenue data</p>
      </div>
    );
  }

  const progressPercentage = (data.totalRevenue / data.targetRevenue) * 100;

  return (
    <div className="p-6 space-y-6">
      {!whiteLabel && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-gray-600">Track your progress to $10M</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card decoration="top" decorationColor={whiteLabel ? brandColor : "blue"}>
          <div className="flex items-center space-x-4">
            <DollarSign className="w-8 h-8" style={{ color: brandColor }} />
            <div>
              <Text>Current Revenue</Text>
              <Title>${data.totalRevenue.toLocaleString()}</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor={whiteLabel ? brandColor : "green"}>
          <div className="flex items-center space-x-4">
            <Target className="w-8 h-8" style={{ color: brandColor }} />
            <div>
              <Text>Target</Text>
              <Title>$10,000,000</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor={whiteLabel ? brandColor : "yellow"}>
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8" style={{ color: brandColor }} />
            <div>
              <Text>Progress</Text>
              <Title>{progressPercentage.toFixed(2)}%</Title>
            </div>
          </div>
        </Card>

        <Card decoration="top" decorationColor={whiteLabel ? brandColor : "purple"}>
          <div className="flex items-center space-x-4">
            <Clock className="w-8 h-8" style={{ color: brandColor }} />
            <div>
              <Text>Projected Completion</Text>
              <Title>{new Date(data.projectedDate).toLocaleDateString()}</Title>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Title>Revenue Growth</Title>
        <AreaChart
          className="h-72 mt-4"
          data={data.dailyRevenue}
          index="date"
          categories={["revenue"]}
          colors={[whiteLabel ? brandColor : "blue"]}
          valueFormatter={(number) => `$${number.toLocaleString()}`}
        />
      </Card>

      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-6 h-6" style={{ color: brandColor }} />
          <Title>Top Performing Accounts</Title>
        </div>
        <div className="space-y-4">
          {data.topPerformers.map((account) => (
            <div key={account.accountId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Text className="font-medium">{account.accountId}</Text>
                <Text className="text-sm text-gray-500">ROI: {account.roi.toFixed(2)}x</Text>
              </div>
              <Text className="text-green-600 font-bold">
                ${account.revenue.toLocaleString()}
              </Text>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Daily Revenue</Title>
          <div className="mt-4">
            <Text className="text-2xl font-bold" style={{ color: brandColor }}>
              ${(data.dailyRevenue[data.dailyRevenue.length - 1]?.revenue || 0).toLocaleString()}
            </Text>
            <Text className="text-gray-500">per day</Text>
          </div>
        </Card>

        <Card>
          <Title>Weekly Growth Rate</Title>
          <div className="mt-4">
            <Text className="text-2xl font-bold" style={{ color: brandColor }}>
              {calculateWeeklyGrowth(data.dailyRevenue)}%
            </Text>
            <Text className="text-gray-500">week over week</Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

function calculateWeeklyGrowth(dailyRevenue: { date: string; revenue: number }[]): number {
  if (dailyRevenue.length < 14) return 0;
  
  const lastWeek = dailyRevenue.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
  const previousWeek = dailyRevenue.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
  
  if (previousWeek === 0) return 0;
  return ((lastWeek - previousWeek) / previousWeek) * 100;
}
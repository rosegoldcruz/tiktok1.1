import React, { useState, useEffect } from 'react';
import { HeatMapGrid } from 'react-grid-heatmap';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ROIData {
  vertical: string;
  platform: string;
  revenue: number;
  engagement: number;
}

const ROIHeatmap: React.FC = () => {
  const [data, setData] = useState<ROIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verticals = ['Tech', 'Lifestyle', 'Finance', 'Health', 'Entertainment'];
  const platforms = ['TikTok', 'YouTube', 'Instagram', 'Twitter'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: monetizationData, error } = await supabase
          .from('monetization_logs')
          .select(`
            revenue,
            platform,
            content_analysis (
              content_variants (
                title,
                style
              )
            )
          `)
          .gte('created_at', format(new Date().setDate(new Date().getDate() - 30), 'yyyy-MM-dd'));

        if (error) throw error;

        // Process and aggregate data
        const processedData = monetizationData.reduce((acc: ROIData[], log) => {
          const vertical = log.content_analysis?.content_variants?.[0]?.style || 'Other';
          const existing = acc.find(d => d.vertical === vertical && d.platform === log.platform);

          if (existing) {
            existing.revenue += log.revenue;
            existing.engagement += 1;
          } else {
            acc.push({
              vertical,
              platform: log.platform,
              revenue: log.revenue,
              engagement: 1
            });
          }

          return acc;
        }, []);

        setData(processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create the heatmap matrix
  const matrix = verticals.map(vertical =>
    platforms.map(platform => {
      const match = data.find(d => d.vertical === vertical && d.platform === platform);
      return match ? match.revenue / match.engagement : 0;
    })
  );

  // Calculate color intensity based on value
  const getColor = (value: number) => {
    const normalizedValue = Math.min(value / 1000, 1);
    return `rgba(59, 130, 246, ${normalizedValue})`; // Blue with varying opacity
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg text-red-500">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">ROI Heatmap</h2>
      <div className="h-64">
        <HeatMapGrid
          data={matrix}
          xLabels={platforms}
          yLabels={verticals}
          cellStyle={(_x, _y, value) => ({
            background: getColor(value),
            fontSize: '11px',
            color: 'white',
          })}
          cellRender={(x, y, value) => (
            <div className="p-2">
              ${value.toFixed(2)}
            </div>
          )}
          xLabelsStyle={() => ({
            fontSize: '12px',
            color: '#9CA3AF',
            padding: '0.5rem',
          })}
          yLabelsStyle={() => ({
            fontSize: '12px',
            color: '#9CA3AF',
            padding: '0.5rem',
          })}
        />
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <span>Last 30 days</span>
        <span>Average Revenue per Engagement ($)</span>
      </div>
    </div>
  );
};

export default ROIHeatmap;
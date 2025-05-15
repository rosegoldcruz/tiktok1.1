```typescript
import { supabase } from '../supabase';

interface PerformanceMetrics {
  contentId: string;
  source: 'ai_only' | 'human_ai' | 'human_only';
  engagementRate: number;
  completionRate: number;
  revenue: number;
  processingTime: number;
  qualityScore: number;
}

export class PerformanceAnalytics {
  async analyzePerformance(timeRange: { start: Date; end: Date }) {
    const { data, error } = await supabase
      .from('content_analysis')
      .select(`
        id,
        source,
        engagement_rate,
        completion_rate,
        monetization_logs (revenue),
        processing_time,
        quality_score
      `)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) throw error;

    const metrics = this.processMetrics(data);
    const insights = this.generateInsights(metrics);
    const recommendations = this.generateRecommendations(metrics);

    return {
      metrics,
      insights,
      recommendations
    };
  }

  private processMetrics(data: any[]): Record<string, PerformanceMetrics[]> {
    return data.reduce((acc, item) => {
      const source = item.source as 'ai_only' | 'human_ai' | 'human_only';
      if (!acc[source]) acc[source] = [];

      acc[source].push({
        contentId: item.id,
        source,
        engagementRate: item.engagement_rate,
        completionRate: item.completion_rate,
        revenue: item.monetization_logs.reduce((sum: number, log: any) => sum + log.revenue, 0),
        processingTime: item.processing_time,
        qualityScore: item.quality_score
      });

      return acc;
    }, {});
  }

  private generateInsights(metrics: Record<string, PerformanceMetrics[]>) {
    const insights = [];

    // Compare performance across sources
    const averages = Object.entries(metrics).reduce((acc, [source, data]) => {
      acc[source] = {
        engagementRate: this.calculateAverage(data, 'engagementRate'),
        completionRate: this.calculateAverage(data, 'completionRate'),
        revenue: this.calculateAverage(data, 'revenue'),
        processingTime: this.calculateAverage(data, 'processingTime'),
        qualityScore: this.calculateAverage(data, 'qualityScore')
      };
      return acc;
    }, {});

    // Generate insights based on averages
    if (averages.human_ai && averages.ai_only) {
      const engagementImprovement = 
        (averages.human_ai.engagementRate - averages.ai_only.engagementRate) / 
        averages.ai_only.engagementRate * 100;

      insights.push({
        type: 'engagement',
        message: `Human-AI collaboration improves engagement by ${engagementImprovement.toFixed(1)}%`,
        impact: 'high'
      });
    }

    // Add more insights...

    return insights;
  }

  private generateRecommendations(metrics: Record<string, PerformanceMetrics[]>) {
    const recommendations = [];

    // Analyze processing time vs quality
    Object.entries(metrics).forEach(([source, data]) => {
      const avgProcessingTime = this.calculateAverage(data, 'processingTime');
      const avgQualityScore = this.calculateAverage(data, 'qualityScore');

      if (source === 'human_ai' && avgProcessingTime > 300 && avgQualityScore < 0.8) {
        recommendations.push({
          type: 'optimization',
          message: 'Optimize human review process to reduce processing time while maintaining quality',
          priority: 'high',
          actions: [
            'Implement parallel review workflows',
            'Add automated quality checks',
            'Provide clearer review guidelines'
          ]
        });
      }
    });

    // Add more recommendations...

    return recommendations;
  }

  private calculateAverage(data: any[], key: string): number {
    return data.reduce((sum, item) => sum + item[key], 0) / data.length;
  }
}
```
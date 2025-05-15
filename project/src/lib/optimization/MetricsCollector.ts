```typescript
import { supabase } from '../supabase';

interface MetricsData {
  modelVersion: string;
  rmse: number;
  r2: number;
  meanDrift: number;
  sampleSize: number;
  metadata?: Record<string, any>;
}

export class MetricsCollector {
  private batchSize = 10;
  private metrics: MetricsData[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor() {
    // Flush metrics every minute
    this.flushInterval = setInterval(() => this.flush(), 60000);
  }

  public async collect(metrics: MetricsData) {
    this.metrics.push(metrics);

    if (this.metrics.length >= this.batchSize) {
      await this.flush();
    }
  }

  public async flush() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      const { error } = await supabase
        .from('model_metrics')
        .insert(metricsToFlush.map(metrics => ({
          model_version: metrics.modelVersion,
          rmse: metrics.rmse,
          r2: metrics.r2,
          mean_drift: metrics.meanDrift,
          sample_size: metrics.sampleSize,
          metadata: metrics.metadata
        })));

      if (error) {
        console.error('Error flushing metrics:', error);
        // Add back to queue
        this.metrics = [...metricsToFlush, ...this.metrics];
      }
    } catch (error) {
      console.error('Error flushing metrics:', error);
      // Add back to queue
      this.metrics = [...metricsToFlush, ...this.metrics];
    }
  }

  public async getMetricsSummary(timeRange: { start: Date; end: Date }) {
    const { data, error } = await supabase
      .from('model_metrics')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }

    return {
      totalSamples: data.reduce((sum, m) => sum + m.sample_size, 0),
      averageRmse: data.reduce((sum, m) => sum + m.rmse, 0) / data.length,
      averageR2: data.reduce((sum, m) => sum + m.r2, 0) / data.length,
      averageDrift: data.reduce((sum, m) => sum + m.mean_drift, 0) / data.length,
      modelVersions: [...new Set(data.map(m => m.model_version))]
    };
  }

  public destroy() {
    clearInterval(this.flushInterval);
  }
}
```
```typescript
import { supabase } from '../supabase';

interface DriftMetrics {
  modelVersion: string;
  metricName: string;
  currentValue: number;
  baselineValue: number;
  driftScore: number;
  timestamp: string;
}

export class ModelDriftDetector {
  private readonly driftThreshold = 0.15; // 15% drift threshold
  private baselineMetrics: Record<string, number> = {};

  constructor() {
    this.loadBaseline();
  }

  private async loadBaseline() {
    const { data, error } = await supabase
      .from('model_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading baseline metrics:', error);
      return;
    }

    // Calculate baseline values
    this.baselineMetrics = this.calculateBaseline(data);
  }

  private calculateBaseline(data: any[]) {
    const metrics = {};
    const metricKeys = ['rmse', 'r2', 'mean_drift'];

    metricKeys.forEach(key => {
      metrics[key] = data.reduce((sum, item) => sum + item[key], 0) / data.length;
    });

    return metrics;
  }

  public async detectDrift(currentMetrics: Record<string, number>) {
    const driftMetrics: DriftMetrics[] = [];
    const timestamp = new Date().toISOString();

    Object.entries(currentMetrics).forEach(([metric, value]) => {
      const baseline = this.baselineMetrics[metric];
      if (baseline === undefined) return;

      const driftScore = Math.abs(value - baseline) / baseline;

      driftMetrics.push({
        modelVersion: 'current',
        metricName: metric,
        currentValue: value,
        baselineValue: baseline,
        driftScore,
        timestamp
      });
    });

    // Store drift metrics
    await this.storeDriftMetrics(driftMetrics);

    // Check for significant drift
    const significantDrift = driftMetrics.some(
      metric => metric.driftScore > this.driftThreshold
    );

    if (significantDrift) {
      await this.triggerDriftAlert(driftMetrics);
    }

    return {
      hasDrift: significantDrift,
      metrics: driftMetrics
    };
  }

  private async storeDriftMetrics(metrics: DriftMetrics[]) {
    await supabase
      .from('model_metrics')
      .insert(metrics.map(metric => ({
        model_version: metric.modelVersion,
        metric_name: metric.metricName,
        current_value: metric.currentValue,
        baseline_value: metric.baselineValue,
        drift_score: metric.driftScore,
        created_at: metric.timestamp
      })));
  }

  private async triggerDriftAlert(metrics: DriftMetrics[]) {
    const driftingMetrics = metrics.filter(
      metric => metric.driftScore > this.driftThreshold
    );

    await supabase
      .from('model_alerts')
      .insert({
        type: 'model_drift',
        severity: this.calculateDriftSeverity(driftingMetrics),
        metrics: driftingMetrics,
        created_at: new Date().toISOString()
      });
  }

  private calculateDriftSeverity(metrics: DriftMetrics[]): 'low' | 'medium' | 'high' {
    const maxDrift = Math.max(...metrics.map(m => m.driftScore));

    if (maxDrift > 0.3) return 'high';
    if (maxDrift > 0.2) return 'medium';
    return 'low';
  }

  public async getDriftHistory(timeRange: { start: Date; end: Date }) {
    const { data, error } = await supabase
      .from('model_metrics')
      .select('*')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching drift history:', error);
      return [];
    }

    return data;
  }
}
```
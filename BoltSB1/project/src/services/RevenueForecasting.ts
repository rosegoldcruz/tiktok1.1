import { createCanvas } from 'canvas';
import { exponentialRegression, calculateConfidenceInterval } from './statistics';
import logger from './logger';

interface RevenueStream {
  name: string;
  daily: number[];
  growth: number;
  risk: number;
}

export class RevenueForecasting {
  private static instance: RevenueForecasting;
  private target = 10000000; // $10M target
  
  private constructor() {}
  
  public static getInstance(): RevenueForecasting {
    if (!RevenueForecasting.instance) {
      RevenueForecasting.instance = new RevenueForecasting();
    }
    return RevenueForecasting.instance;
  }

  async generateForecast(data: {
    streams: RevenueStream[];
    daysOfHistory: number;
  }) {
    try {
      const forecasts = data.streams.map(stream => {
        // Calculate growth trajectory
        const trajectory = exponentialRegression(stream.daily);
        
        // Risk-adjusted growth rate
        const adjustedGrowth = stream.growth * (1 - stream.risk);
        
        // Project future revenue
        const projectedRevenue = this.projectRevenue(
          stream.daily[stream.daily.length - 1],
          adjustedGrowth,
          this.target
        );

        return {
          stream: stream.name,
          projectedDays: projectedRevenue.daysToTarget,
          confidence: calculateConfidenceInterval(stream.daily),
          riskAdjustedRevenue: projectedRevenue.timeline
        };
      });

      // Combine all streams
      const combinedProjection = this.combineStreamProjections(forecasts);
      
      // Generate visualization
      const chart = await this.generateProjectionChart(combinedProjection);

      return {
        streams: forecasts,
        combined: {
          daysToTarget: combinedProjection.daysToTarget,
          expectedDate: new Date(Date.now() + combinedProjection.daysToTarget * 86400000),
          confidence: combinedProjection.confidence,
          chart
        }
      };
    } catch (error) {
      logger.error('Forecast generation failed:', error);
      throw error;
    }
  }

  private projectRevenue(
    currentRevenue: number,
    growthRate: number,
    target: number
  ) {
    const timeline = [];
    let revenue = currentRevenue;
    let days = 0;

    while (revenue < target && days < 730) { // Cap at 2 years
      revenue *= (1 + growthRate);
      timeline.push(revenue);
      days++;
    }

    return {
      daysToTarget: days,
      timeline
    };
  }

  private combineStreamProjections(forecasts: any[]) {
    // Combine multiple revenue streams
    const combined = forecasts.reduce((acc, forecast) => {
      return {
        daysToTarget: Math.min(acc.daysToTarget, forecast.projectedDays),
        confidence: (acc.confidence + forecast.confidence) / 2
      };
    }, { daysToTarget: Infinity, confidence: 0 });

    return combined;
  }

  private async generateProjectionChart(projection: any) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Chart implementation...
    // (Basic chart setup omitted for brevity)

    return canvas.toBuffer('image/png');
  }
}

export default RevenueForecasting.getInstance();
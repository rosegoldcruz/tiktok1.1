import { ContentVariant, RevenueEstimate } from './types';
import { format } from 'date-fns';

export class RevenueForecasterAgent {
  private platformMultipliers = {
    'TikTok': 1.2,
    'YouTube': 1.5,
    'Instagram': 1.0,
    'Twitter': 0.8
  };

  private timeMultipliers = {
    morning: 1.2,   // 6AM - 10AM
    midday: 1.0,    // 10AM - 2PM
    afternoon: 1.1, // 2PM - 6PM
    evening: 1.3,   // 6PM - 10PM
    night: 0.8      // 10PM - 6AM
  };

  private getTimeMultiplier(hour: number): number {
    if (hour >= 6 && hour < 10) return this.timeMultipliers.morning;
    if (hour >= 10 && hour < 14) return this.timeMultipliers.midday;
    if (hour >= 14 && hour < 18) return this.timeMultipliers.afternoon;
    if (hour >= 18 && hour < 22) return this.timeMultipliers.evening;
    return this.timeMultipliers.night;
  }

  public async estimateEarnings(content: ContentVariant, platform: string): Promise<RevenueEstimate> {
    const now = new Date();
    const hour = now.getHours();
    
    const platformMultiplier = this.platformMultipliers[platform] || 1.0;
    const timeMultiplier = this.getTimeMultiplier(hour);
    
    // Base earnings calculation using content characteristics
    let baseEarnings = 0;
    
    // Factor in content length
    if (content.format === 'short') {
      baseEarnings = 15; // Base rate for short content
    } else {
      baseEarnings = 25; // Base rate for long content
    }
    
    // Adjust for hashtag optimization
    const hashtagMultiplier = Math.min(1 + (content.hashtags.length * 0.05), 1.3);
    
    // Calculate final estimate
    const estimatedEarnings = baseEarnings * platformMultiplier * timeMultiplier * hashtagMultiplier;
    
    // Calculate confidence score based on historical data match
    const confidenceScore = 0.85; // Placeholder - would use ML model in production
    
    return {
      estimated_earnings: Number(estimatedEarnings.toFixed(2)),
      confidence_score: confidenceScore,
      platform_multiplier: platformMultiplier,
      time_multiplier: timeMultiplier
    };
  }
}
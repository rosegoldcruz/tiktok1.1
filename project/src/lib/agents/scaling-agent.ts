import { ContentVariant, ContentMetrics, ScalingStrategy } from './types';
import { RevenueForecasterAgent } from './revenue-forecaster';

export class ScalingAgent {
  private revenueForecaster: RevenueForecasterAgent;
  
  constructor() {
    this.revenueForecaster = new RevenueForecasterAgent();
  }
  
  public async detectWinners(contents: ContentVariant[]): Promise<ContentVariant[]> {
    return contents.filter(content => {
      if (!content.metrics) return false;
      
      // Winner criteria
      const hasHighRevenue = content.metrics.revenue > 20;
      const hasGoodEngagement = content.metrics.engagement_rate 
        ? content.metrics.engagement_rate > 0.08 
        : false;
      
      return hasHighRevenue && hasGoodEngagement;
    });
  }
  
  public async createScalingStrategy(winner: ContentVariant): Promise<ScalingStrategy> {
    // Determine best platforms based on content type
    const recommendedPlatforms = this.getRecommendedPlatforms(winner);
    
    // Calculate optimal number of variants
    const variantCount = winner.format === 'short' ? 5 : 3;
    
    // Get optimal posting times
    const optimalPostingTimes = this.getOptimalPostingTimes(recommendedPlatforms);
    
    // Generate hashtag groups
    const hashtagGroups = this.generateHashtagGroups(winner.hashtags);
    
    return {
      recommended_platforms: recommendedPlatforms,
      variant_count: variantCount,
      optimal_posting_times: optimalPostingTimes,
      hashtag_groups: hashtagGroups
    };
  }
  
  private getRecommendedPlatforms(content: ContentVariant): string[] {
    if (content.format === 'short') {
      return ['TikTok', 'Instagram', 'YouTube'];
    }
    return ['YouTube', 'Instagram'];
  }
  
  private getOptimalPostingTimes(platforms: string[]): string[] {
    // Simplified logic - would use ML model in production
    return [
      '08:00',
      '12:00',
      '17:00',
      '20:00'
    ];
  }
  
  private generateHashtagGroups(baseHashtags: string[]): string[][] {
    // Create variations of hashtag combinations
    const group1 = [...baseHashtags, '#trending', '#viral'];
    const group2 = [...baseHashtags, '#fyp', '#foryou'];
    const group3 = [...baseHashtags, '#learn', '#education'];
    
    return [group1, group2, group3];
  }
}
import { ContentVariant, RevenueEstimate, ScalingStrategy } from './types';
import { RevenueForecasterAgent } from './revenue-forecaster';
import { ABContentGenerator } from './content-generator';
import { ScalingAgent } from './scaling-agent';

export class MonetizationBrain {
  private revenueForecaster: RevenueForecasterAgent;
  private contentGenerator: ABContentGenerator;
  private scalingAgent: ScalingAgent;
  
  constructor() {
    this.revenueForecaster = new RevenueForecasterAgent();
    this.contentGenerator = new ABContentGenerator();
    this.scalingAgent = new ScalingAgent();
  }
  
  public async analyzeContent(content: ContentVariant): Promise<{
    variants: ContentVariant[];
    estimates: RevenueEstimate[];
    strategy: ScalingStrategy;
  }> {
    // Generate content variants
    const variants = await this.contentGenerator.generateVariants(content);
    
    // Get revenue estimates for each variant
    const estimates = await Promise.all(
      variants.map(variant => 
        this.revenueForecaster.estimateEarnings(variant, 'TikTok')
      )
    );
    
    // Create scaling strategy for the best variant
    const bestVariantIndex = this.findBestVariant(estimates);
    const strategy = await this.scalingAgent.createScalingStrategy(variants[bestVariantIndex]);
    
    return {
      variants,
      estimates,
      strategy
    };
  }
  
  private findBestVariant(estimates: RevenueEstimate[]): number {
    return estimates.reduce((maxIndex, current, currentIndex, array) => 
      current.estimated_earnings > array[maxIndex].estimated_earnings ? currentIndex : maxIndex
    , 0);
  }
}
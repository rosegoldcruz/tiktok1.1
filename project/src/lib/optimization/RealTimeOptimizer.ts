import { ModelTrainer } from '../ml/ModelTrainer';
import { supabase } from '../supabase';
import * as tf from '@tensorflow/tfjs';

interface ContentItem {
  id: string;
  title: string;
  vertical: string;
  content_type: string;
  platform: string;
  complexity_score: number;
  word_count: number;
  source: string;
}

interface OptimizationResult {
  content_id: string;
  recommended_source: string;
  confidence: number;
  expected_revenue: number;
  reasoning: string;
}

export class RealTimeOptimizer {
  private modelTrainer: ModelTrainer;

  constructor() {
    this.modelTrainer = new ModelTrainer();
  }

  async initialize() {
    try {
      await this.modelTrainer.load();
    } catch (error) {
      console.log('Training new model...');
      await this.modelTrainer.train();
      await this.modelTrainer.save();
    }
  }

  async optimizeContent(content: ContentItem): Promise<OptimizationResult> {
    // Prepare features for each source type
    const sources = ['ai_only', 'human_ai', 'human_only'];
    const predictions = {};
    
    for (const source of sources) {
      const features = this.prepareFeatures(content, source);
      const [prediction] = await this.modelTrainer.predict([features]);
      predictions[source] = prediction;
    }

    // Determine best source
    const bestSource = Object.entries(predictions)
      .reduce((best, [source, value]) => 
        value > best.value ? { source, value } : best,
        { source: '', value: -Infinity }
      );

    // Calculate confidence
    const values = Object.values(predictions);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const maxDiff = Math.max(...values) - mean;
    const confidence = maxDiff / (mean || 1); // Avoid division by zero

    // Generate reasoning
    const reasoning = this.generateReasoning(content, bestSource.source, predictions);

    return {
      content_id: content.id,
      recommended_source: bestSource.source,
      confidence,
      expected_revenue: bestSource.value,
      reasoning
    };
  }

  private prepareFeatures(content: ContentItem, source: string): number[] {
    // Create feature array matching the model's expected input
    return [
      content.complexity_score,
      content.word_count / 1000, // Normalize word count
      // One-hot encode categorical variables
      ...this.oneHotEncode(content.vertical, ['tech', 'lifestyle', 'finance', 'health']),
      ...this.oneHotEncode(content.platform, ['tiktok', 'youtube', 'instagram']),
      ...this.oneHotEncode(source, ['ai_only', 'human_ai', 'human_only'])
    ];
  }

  private oneHotEncode(value: string, categories: string[]): number[] {
    return categories.map(cat => value === cat ? 1 : 0);
  }

  private generateReasoning(content: ContentItem, bestSource: string, predictions: Record<string, number>): string {
    const reasons = {
      ai_only: "AI-only workflow is recommended for efficiency with sufficient quality",
      human_ai: "Human-AI hybrid workflow provides the best balance of quality and efficiency",
      human_only: "Human-only workflow is recommended for maximum quality"
    };

    if (bestSource === 'ai_only' && content.complexity_score < 0.4) {
      return `${reasons[bestSource]} The low complexity score (${content.complexity_score.toFixed(2)}) indicates that AI can handle this content well without human intervention.`;
    }

    if (bestSource === 'human_ai' && content.complexity_score > 0.6) {
      return `${reasons[bestSource]} The high complexity score (${content.complexity_score.toFixed(2)}) benefits from human expertise, but full human production is not cost-effective.`;
    }

    if (bestSource === 'human_only' && ['finance', 'legal', 'medical'].includes(content.vertical)) {
      return `${reasons[bestSource]} Content in the ${content.vertical} vertical often requires domain expertise and careful review that pure AI cannot yet provide.`;
    }

    return reasons[bestSource];
  }

  async storeOptimizationResult(result: OptimizationResult) {
    const { data, error } = await supabase
      .from('optimization_results')
      .insert({
        content_id: result.content_id,
        recommended_source: result.recommended_source,
        confidence: result.confidence,
        expected_revenue: result.expected_revenue,
        reasoning: result.reasoning
      });

    if (error) {
      console.error('Error storing optimization result:', error);
    }

    return data;
  }
}
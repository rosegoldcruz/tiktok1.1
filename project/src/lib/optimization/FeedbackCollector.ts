```typescript
import { supabase } from '../supabase';

interface Feedback {
  contentId: string;
  userId: string;
  feedbackType: 'quality' | 'accuracy' | 'usefulness';
  rating: number;
  comments?: string;
  metadata?: Record<string, any>;
}

export class FeedbackCollector {
  async submitFeedback(feedback: Feedback) {
    const { data, error } = await supabase
      .from('content_reviews')
      .insert({
        content_id: feedback.contentId,
        reviewer_id: feedback.userId,
        quality_score: feedback.feedbackType === 'quality' ? feedback.rating : null,
        accuracy_score: feedback.feedbackType === 'accuracy' ? feedback.rating : null,
        engagement_prediction: feedback.feedbackType === 'usefulness' ? feedback.rating : null,
        improvement_suggestions: feedback.comments ? [feedback.comments] : [],
        expert_annotations: feedback.metadata || {},
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // Generate insights from feedback
    await this.generateInsights(feedback);

    return data;
  }

  private async generateInsights(feedback: Feedback) {
    const { data: existingFeedback } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('content_id', feedback.contentId);

    const insights = this.analyzeFeedback(existingFeedback || []);

    await supabase
      .from('learning_insights')
      .insert({
        source_type: 'feedback',
        source_id: feedback.contentId,
        insight_type: 'quality_improvement',
        insight_data: insights,
        confidence_score: this.calculateConfidence(existingFeedback?.length || 0),
        created_at: new Date().toISOString()
      });
  }

  private analyzeFeedback(feedbackList: any[]) {
    const analysis = {
      averageQuality: 0,
      averageAccuracy: 0,
      commonIssues: new Map<string, number>(),
      improvementAreas: new Set<string>()
    };

    feedbackList.forEach(feedback => {
      if (feedback.quality_score) {
        analysis.averageQuality += feedback.quality_score;
      }
      if (feedback.accuracy_score) {
        analysis.averageAccuracy += feedback.accuracy_score;
      }

      // Analyze comments for common issues
      if (feedback.improvement_suggestions) {
        feedback.improvement_suggestions.forEach((suggestion: string) => {
          const issues = this.extractIssues(suggestion);
          issues.forEach(issue => {
            analysis.commonIssues.set(
              issue,
              (analysis.commonIssues.get(issue) || 0) + 1
            );
          });
        });
      }
    });

    // Calculate averages
    if (feedbackList.length > 0) {
      analysis.averageQuality /= feedbackList.length;
      analysis.averageAccuracy /= feedbackList.length;
    }

    // Identify top issues
    const topIssues = Array.from(analysis.commonIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue]) => issue);

    return {
      metrics: {
        quality: analysis.averageQuality,
        accuracy: analysis.averageAccuracy
      },
      topIssues,
      sampleSize: feedbackList.length
    };
  }

  private extractIssues(text: string): string[] {
    // Simple keyword-based issue extraction
    const issues = [];
    const keywords = {
      clarity: ['unclear', 'confusing', 'hard to understand'],
      accuracy: ['incorrect', 'inaccurate', 'wrong'],
      style: ['style', 'tone', 'voice'],
      technical: ['technical', 'complex', 'complicated']
    };

    Object.entries(keywords).forEach(([category, words]) => {
      if (words.some(word => text.toLowerCase().includes(word))) {
        issues.push(category);
      }
    });

    return issues;
  }

  private calculateConfidence(sampleSize: number): number {
    // Simple confidence calculation based on sample size
    const minSamples = 5;
    const maxSamples = 50;
    
    if (sampleSize < minSamples) return 0.5;
    if (sampleSize > maxSamples) return 1.0;
    
    return 0.5 + (0.5 * (sampleSize - minSamples) / (maxSamples - minSamples));
  }

  async getFeedbackSummary(contentId: string) {
    const { data, error } = await supabase
      .from('content_reviews')
      .select('*')
      .eq('content_id', contentId);

    if (error) throw error;

    const analysis = this.analyzeFeedback(data || []);

    return {
      ...analysis,
      feedbackCount: data?.length || 0,
      lastUpdated: data?.[0]?.created_at
    };
  }
}
```
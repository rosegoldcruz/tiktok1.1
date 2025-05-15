import { supabase } from '../supabase';

export class ABTestingFramework {
  private experimentName: string;
  private variants: string[];
  private assignments: Record<string, string> = {};

  constructor(experimentName: string, variants: string[]) {
    this.experimentName = experimentName;
    this.variants = variants;
  }

  async assignVariant(contentId: string): Promise<string> {
    // Check if already assigned
    if (this.assignments[contentId]) {
      return this.assignments[contentId];
    }

    // Check database for existing assignment
    const { data, error } = await supabase
      .from('ab_test_assignments')
      .select('variant')
      .eq('experiment', this.experimentName)
      .eq('content_id', contentId)
      .single();

    if (data?.variant) {
      this.assignments[contentId] = data.variant;
      return data.variant;
    }

    // Random assignment
    const variant = this.variants[Math.floor(Math.random() * this.variants.length)];
    this.assignments[contentId] = variant;

    // Store assignment
    await supabase
      .from('ab_test_assignments')
      .insert({
        experiment: this.experimentName,
        content_id: contentId,
        variant,
        assigned_at: new Date().toISOString()
      });

    return variant;
  }

  async trackResult(contentId: string, metrics: Record<string, number>) {
    const variant = this.assignments[contentId];
    
    if (!variant) {
      console.warn(`Content ${contentId} not assigned to a variant`);
      return;
    }

    // Store result
    await supabase
      .from('ab_test_results')
      .insert({
        experiment: this.experimentName,
        content_id: contentId,
        variant,
        metrics,
        recorded_at: new Date().toISOString()
      });
  }

  async getExperimentResults(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('ab_test_results')
      .select('variant, metrics')
      .eq('experiment', this.experimentName);

    if (error) {
      console.error('Error fetching experiment results:', error);
      return {};
    }

    // Group results by variant
    const results = {};
    
    for (const variant of this.variants) {
      const variantResults = data.filter(r => r.variant === variant);
      
      if (variantResults.length === 0) {
        results[variant] = { count: 0, metrics: {} };
        continue;
      }

      // Calculate average metrics
      const metrics = {};
      const firstResult = variantResults[0];
      
      Object.keys(firstResult.metrics).forEach(key => {
        metrics[key] = variantResults.reduce((sum, result) => 
          sum + result.metrics[key], 0
        ) / variantResults.length;
      });

      results[variant] = {
        count: variantResults.length,
        metrics
      };
    }

    return results;
  }
}
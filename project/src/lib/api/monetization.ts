import { MonetizationBrain } from '../agents/monetization-brain';
import { ContentVariant } from '../agents/types';
import { supabase } from '../supabase';

export const monetizationApi = {
  private: {
    brain: new MonetizationBrain()
  },

  async analyzeContent(content: ContentVariant) {
    try {
      const analysis = await this.private.brain.analyzeContent(content);
      
      // Store analysis results
      const { data, error } = await supabase
        .from('content_analysis')
        .insert({
          content_id: content.title, // Use proper ID in production
          variants: analysis.variants,
          estimates: analysis.estimates,
          strategy: analysis.strategy,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      return {
        success: true,
        data: analysis,
        error: null
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
};
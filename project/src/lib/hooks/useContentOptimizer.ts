import { useState, useEffect } from 'react';
import { RealTimeOptimizer } from '../optimization/RealTimeOptimizer';

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

export function useContentOptimizer() {
  const [optimizer, setOptimizer] = useState<RealTimeOptimizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initOptimizer = async () => {
      try {
        const optimizerInstance = new RealTimeOptimizer();
        await optimizerInstance.initialize();
        setOptimizer(optimizerInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing optimizer:', err);
        setError('Failed to initialize content optimizer');
        setIsLoading(false);
      }
    };

    initOptimizer();
  }, []);

  const optimizeContent = async (content: ContentItem): Promise<OptimizationResult | null> => {
    if (!optimizer) {
      setError('Optimizer not initialized');
      return null;
    }

    try {
      const result = await optimizer.optimizeContent(content);
      await optimizer.storeOptimizationResult(result);
      return result;
    } catch (err) {
      console.error('Error optimizing content:', err);
      setError('Failed to optimize content');
      return null;
    }
  };

  return {
    optimizeContent,
    isLoading,
    error
  };
}
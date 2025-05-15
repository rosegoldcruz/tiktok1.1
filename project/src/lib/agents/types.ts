import { z } from 'zod';

export const ContentMetricsSchema = z.object({
  views: z.number(),
  watch_time: z.number(),
  revenue: z.number(),
  engagement_rate: z.number().optional(),
});

export const ContentVariantSchema = z.object({
  title: z.string(),
  script: z.string(),
  style: z.string(),
  hashtags: z.array(z.string()),
  format: z.enum(['short', 'long']),
  hook: z.string(),
  metrics: ContentMetricsSchema.optional(),
});

export type ContentMetrics = z.infer<typeof ContentMetricsSchema>;
export type ContentVariant = z.infer<typeof ContentVariantSchema>;

export interface RevenueEstimate {
  estimated_earnings: number;
  confidence_score: number;
  platform_multiplier: number;
  time_multiplier: number;
}

export interface ScalingStrategy {
  recommended_platforms: string[];
  variant_count: number;
  optimal_posting_times: string[];
  hashtag_groups: string[][];
}
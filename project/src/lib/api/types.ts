import { z } from 'zod';

// Base schemas
export const TrendSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  platform: z.string(),
  category: z.string(),
  growth: z.number(),
  engagement: z.number(),
  revenue: z.number(),
  created_at: z.string().datetime(),
  status: z.string()
});

export const VideoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  progress: z.number(),
  duration: z.string().nullable(),
  platform: z.string(),
  created_at: z.string().datetime(),
  thumbnail_url: z.string().nullable()
});

// Response schemas
export const TrendsResponseSchema = z.object({
  data: z.array(TrendSchema).nullable(),
  error: z.string().nullable()
});

export const VideosResponseSchema = z.object({
  data: z.array(VideoSchema).nullable(),
  error: z.string().nullable()
});

// Types
export type Trend = z.infer<typeof TrendSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type TrendsResponse = z.infer<typeof TrendsResponseSchema>;
export type VideosResponse = z.infer<typeof VideosResponseSchema>;
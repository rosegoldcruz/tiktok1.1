import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { z } from 'npm:zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Input validation schema
const ContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  script: z.string().min(10, 'Script must be at least 10 characters'),
  style: z.string(),
  hashtags: z.array(z.string()),
  format: z.enum(['short', 'long']),
  hook: z.string().min(1, 'Hook is required'),
});

// Platform-specific metrics
const platformMultipliers = {
  TikTok: { base: 1.2, viral: 2.0, engagement: 1.5 },
  YouTube: { base: 1.5, viral: 1.8, engagement: 1.3 },
  Instagram: { base: 1.0, viral: 1.6, engagement: 1.4 },
  Twitter: { base: 0.8, viral: 1.4, engagement: 1.2 }
};

// Time-based optimization
const timeMultipliers = {
  morning: 1.2,   // 6AM - 10AM
  midday: 1.0,    // 10AM - 2PM
  afternoon: 1.1, // 2PM - 6PM
  evening: 1.3,   // 6PM - 10PM
  night: 0.8      // 10PM - 6AM
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse and validate request body
    const { content } = await req.json();
    const validatedContent = ContentSchema.parse(content);

    // Calculate base metrics
    const baseMetrics = {
      views: calculatePotentialViews(validatedContent),
      engagement: calculateEngagementScore(validatedContent),
      revenue: calculateRevenueEstimate(validatedContent)
    };

    // Generate content variants
    const variants = generateContentVariants(validatedContent);

    // Create scaling strategy
    const strategy = createScalingStrategy(validatedContent, baseMetrics);

    // Calculate revenue estimates
    const estimates = calculatePlatformEstimates(baseMetrics, strategy);

    // Store analysis results
    const { data, error } = await supabaseClient
      .from('content_analysis')
      .insert({
        content_id: validatedContent.title,
        variants,
        estimates,
        strategy,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        data: { variants, estimates, strategy }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Monetization analyzer error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof z.ZodError ? error.errors : error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof z.ZodError ? 400 : 500,
      }
    );
  }
});

// Helper functions
function calculatePotentialViews(content: z.infer<typeof ContentSchema>): number {
  const baseViews = content.format === 'short' ? 1000 : 500;
  const hashtagMultiplier = Math.min(1 + (content.hashtags.length * 0.1), 2.0);
  const hookScore = Math.min(content.hook.length / 50, 1.5);
  
  return Math.floor(baseViews * hashtagMultiplier * hookScore);
}

function calculateEngagementScore(content: z.infer<typeof ContentSchema>): number {
  const baseEngagement = content.format === 'short' ? 0.08 : 0.05;
  const styleMultiplier = {
    dramatic: 1.2,
    educational: 1.1,
    entertaining: 1.3,
    casual: 1.0
  }[content.style] || 1.0;
  
  return Number((baseEngagement * styleMultiplier).toFixed(3));
}

function calculateRevenueEstimate(content: z.infer<typeof ContentSchema>): number {
  const baseRate = content.format === 'short' ? 15 : 25;
  const lengthMultiplier = Math.min(content.script.length / 500, 2.0);
  
  return Number((baseRate * lengthMultiplier).toFixed(2));
}

function generateContentVariants(content: z.infer<typeof ContentSchema>) {
  const styles = ['dramatic', 'educational', 'entertaining', 'casual'];
  
  return styles.map(style => ({
    title: content.title,
    style,
    script: `[${style.toUpperCase()}] ${content.script}`,
    hook: `[${style.toUpperCase()}] ${content.hook}`,
    hashtags: [...content.hashtags, `#${style}`],
    format: content.format,
    confidence_score: 0.85
  }));
}

function createScalingStrategy(
  content: z.infer<typeof ContentSchema>,
  metrics: { views: number; engagement: number; revenue: number }
) {
  const recommendedPlatforms = Object.entries(platformMultipliers)
    .filter(([_, multipliers]) => 
      metrics.views * multipliers.base * multipliers.engagement > 1000
    )
    .map(([platform]) => platform);

  const optimalTimes = [
    { time: '08:00', multiplier: timeMultipliers.morning },
    { time: '12:00', multiplier: timeMultipliers.midday },
    { time: '17:00', multiplier: timeMultipliers.afternoon },
    { time: '20:00', multiplier: timeMultipliers.evening }
  ].sort((a, b) => b.multiplier - a.multiplier);

  const hashtagGroups = [
    [...content.hashtags, '#trending', '#viral'],
    [...content.hashtags, '#fyp', '#foryou'],
    [...content.hashtags, '#learn', '#education']
  ];

  return {
    recommended_platforms: recommendedPlatforms,
    optimal_times: optimalTimes.map(t => t.time),
    hashtag_groups: hashtagGroups,
    variant_count: content.format === 'short' ? 4 : 2
  };
}

function calculatePlatformEstimates(
  metrics: { views: number; engagement: number; revenue: number },
  strategy: { recommended_platforms: string[] }
) {
  return strategy.recommended_platforms.map(platform => {
    const multipliers = platformMultipliers[platform];
    const estimatedViews = Math.floor(metrics.views * multipliers.base);
    const estimatedRevenue = Number((metrics.revenue * multipliers.base * multipliers.engagement).toFixed(2));
    
    return {
      platform,
      estimated_views: estimatedViews,
      estimated_revenue: estimatedRevenue,
      confidence_score: 0.85
    };
  });
}
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { load } from 'npm:@tensorflow-models/toxicity@1.2.2';
import natural from 'npm:natural@6.10.4';
import nlp from 'npm:compromise@14.12.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const toxicityThreshold = 0.9;
const sentimentAnalyzer = new natural.SentimentAnalyzer();
const tokenizer = new natural.WordTokenizer();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'analyze-sentiment':
        return handleSentimentAnalysis(req, supabaseClient);
      case 'analyze-demographics':
        return handleDemographicsAnalysis(req, supabaseClient);
      case 'analyze-engagement':
        return handleEngagementAnalysis(req, supabaseClient);
      case 'analyze-content-performance':
        return handleContentPerformance(req, supabaseClient);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleSentimentAnalysis(req: Request, supabaseClient) {
  const { contentId, comments } = await req.json();
  const toxicityModel = await load(toxicityThreshold);

  const results = await Promise.all(comments.map(async (comment) => {
    // Analyze toxicity
    const predictions = await toxicityModel.classify(comment);
    const toxicityScore = predictions[0].results[0].probabilities[1];

    // Analyze sentiment
    const tokens = tokenizer.tokenize(comment);
    const sentimentScore = sentimentAnalyzer.getSentiment(tokens);

    // Extract topics
    const doc = nlp(comment);
    const topics = doc.topics().json().map(t => t.text);

    return {
      content_id: contentId,
      comment_text: comment,
      sentiment_score: sentimentScore,
      toxicity_score: toxicityScore,
      topics,
      analyzed_at: new Date().toISOString()
    };
  }));

  const { data, error } = await supabaseClient
    .from('sentiment_analysis')
    .insert(results)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleDemographicsAnalysis(req: Request, supabaseClient) {
  const { accountId, platformData } = await req.json();

  const demographics = processPlatformDemographics(platformData);

  const { data, error } = await supabaseClient
    .from('audience_demographics')
    .upsert(
      demographics.map(demo => ({
        account_id: accountId,
        ...demo,
        updated_at: new Date().toISOString()
      }))
    )
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleEngagementAnalysis(req: Request, supabaseClient) {
  const { contentId, accountId, metrics } = await req.json();

  const engagementData = {
    content_id: contentId,
    account_id: accountId,
    views_count: metrics.views,
    likes_count: metrics.likes,
    comments_count: metrics.comments,
    shares_count: metrics.shares,
    watch_time: metrics.watchTime,
    retention_rate: calculateRetentionRate(metrics),
    bounce_rate: calculateBounceRate(metrics),
    follower_gain: metrics.newFollowers,
    measured_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from('engagement_metrics')
    .insert(engagementData)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleContentPerformance(req: Request, supabaseClient) {
  const { contentId, accountId, metrics } = await req.json();

  const performanceData = {
    content_id: contentId,
    account_id: accountId,
    audience_growth: calculateAudienceGrowth(metrics),
    engagement_score: calculateEngagementScore(metrics),
    retention_score: calculateRetentionScore(metrics),
    virality_score: calculateViralityScore(metrics),
    ltv_impact: calculateLTVImpact(metrics),
    content_type: metrics.type,
    performance_tags: generatePerformanceTags(metrics),
    measured_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from('content_performance')
    .insert(performanceData)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Helper functions
function processPlatformDemographics(platformData) {
  // Process and normalize demographics data from different platforms
  return platformData.map(data => ({
    age_range: data.ageRange,
    gender: data.gender,
    location: data.location,
    interests: data.interests,
    language: data.language,
    device_type: data.deviceType,
    percentage: data.percentage
  }));
}

function calculateRetentionRate(metrics) {
  return (metrics.completedViews / metrics.totalViews) * 100;
}

function calculateBounceRate(metrics) {
  return (metrics.earlyExits / metrics.totalViews) * 100;
}

function calculateAudienceGrowth(metrics) {
  return metrics.newFollowers - metrics.unfollows;
}

function calculateEngagementScore(metrics) {
  const interactions = metrics.likes + metrics.comments + metrics.shares;
  return (interactions / metrics.views) * 100;
}

function calculateRetentionScore(metrics) {
  return (metrics.returnViewers / metrics.uniqueViewers) * 100;
}

function calculateViralityScore(metrics) {
  return (metrics.shares / metrics.views) * metrics.shareReach;
}

function calculateLTVImpact(metrics) {
  const engagementValue = 0.1;
  const followerValue = 1.0;
  return (metrics.totalEngagement * engagementValue) + (metrics.newFollowers * followerValue);
}

function generatePerformanceTags(metrics) {
  const tags = [];
  if (metrics.viralityScore > 2.0) tags.push('viral');
  if (metrics.retentionRate > 70) tags.push('high_retention');
  if (metrics.engagementRate > 10) tags.push('high_engagement');
  if (metrics.followerGain > 1000) tags.push('growth_driver');
  return tags;
}
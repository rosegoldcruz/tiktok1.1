import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Premium niche categories with their CPM multipliers
const nicheMultipliers = {
  finance: 2.5,
  technology: 2.0,
  business: 1.8,
  education: 1.6,
  health: 1.5,
  luxury: 2.2,
  gaming: 1.4,
  travel: 1.3
};

// Platform-specific optimization rules
const platformOptimizations = {
  youtube: {
    minLength: 8, // minutes
    maxLength: 15,
    optimalTags: 15,
    adBreaks: 3
  },
  tiktok: {
    minLength: 30, // seconds
    maxLength: 60,
    optimalTags: 8,
    verticalFormat: true
  }
};

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
      case 'analyze-niche':
        return handleNicheAnalysis(req, supabaseClient);
      case 'optimize-content':
        return handleContentOptimization(req, supabaseClient);
      case 'revenue-forecast':
        return handleRevenueForecasting(req, supabaseClient);
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

async function handleNicheAnalysis(req: Request, supabaseClient) {
  const { content, platform } = await req.json();

  // Analyze content for niche categorization
  const nicheAnalysis = analyzeNiche(content);
  
  // Calculate potential revenue based on niche
  const revenueMetrics = calculateNicheRevenue(nicheAnalysis, platform);

  // Store analysis results
  const { data, error } = await supabaseClient
    .from('content_analysis')
    .insert({
      content_id: content.id,
      niche_analysis: nicheAnalysis,
      revenue_metrics: revenueMetrics,
      created_at: new Date().toISOString()
    })
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        niche: nicheAnalysis,
        metrics: revenueMetrics
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleContentOptimization(req: Request, supabaseClient) {
  const { content, platform, niche } = await req.json();

  // Get platform-specific optimization rules
  const rules = platformOptimizations[platform];
  
  // Optimize content structure
  const optimizedContent = optimizeContentStructure(content, rules, niche);
  
  // Generate monetization opportunities
  const opportunities = generateMonetizationOpportunities(optimizedContent, platform);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        optimizedContent,
        opportunities
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleRevenueForecasting(req: Request, supabaseClient) {
  const { content, platform, niche } = await req.json();

  // Calculate potential revenue streams
  const forecast = calculateRevenueStreams(content, platform, niche);
  
  // Generate optimization recommendations
  const recommendations = generateOptimizationRecommendations(forecast);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        forecast,
        recommendations
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Helper functions
function analyzeNiche(content) {
  const keywords = extractKeywords(content);
  const topics = categorizeTopics(keywords);
  const competitionLevel = analyzeCompetition(topics);
  
  return {
    primary_niche: findPrimaryNiche(topics),
    sub_niches: findSubNiches(topics),
    competition_level: competitionLevel,
    monetization_potential: calculateMonetizationPotential(topics, competitionLevel)
  };
}

function calculateNicheRevenue(nicheAnalysis, platform) {
  const baseRate = 10; // Base CPM rate
  const nicheMultiplier = nicheMultipliers[nicheAnalysis.primary_niche] || 1.0;
  const competitionMultiplier = 1 - (nicheAnalysis.competition_level * 0.1);
  
  return {
    estimated_cpm: baseRate * nicheMultiplier * competitionMultiplier,
    potential_revenue: calculatePotentialRevenue(baseRate, nicheMultiplier, competitionMultiplier),
    revenue_streams: identifyRevenueStreams(nicheAnalysis)
  };
}

function optimizeContentStructure(content, rules, niche) {
  return {
    title: optimizeTitle(content.title, niche),
    description: optimizeDescription(content.description, niche),
    tags: optimizeTags(content.tags, rules.optimalTags),
    length: optimizeLength(content.length, rules),
    monetization_points: identifyMonetizationPoints(content, rules)
  };
}

function generateMonetizationOpportunities(content, platform) {
  return {
    ad_placements: identifyAdPlacements(content, platform),
    affiliate_opportunities: findAffiliateOpportunities(content),
    sponsorship_potential: evaluateSponsorshipPotential(content),
    product_placement: identifyProductPlacement(content)
  };
}

function calculateRevenueStreams(content, platform, niche) {
  const adRevenue = calculateAdRevenue(content, platform);
  const affiliateRevenue = calculateAffiliateRevenue(content, niche);
  const sponsorshipRevenue = calculateSponsorshipRevenue(content, niche);
  
  return {
    total_potential: adRevenue + affiliateRevenue + sponsorshipRevenue,
    streams: {
      advertising: adRevenue,
      affiliate: affiliateRevenue,
      sponsorship: sponsorshipRevenue
    },
    optimization_score: calculateOptimizationScore(content, platform, niche)
  };
}

function generateOptimizationRecommendations(forecast) {
  return {
    content_structure: recommendContentStructure(forecast),
    monetization_strategy: recommendMonetizationStrategy(forecast),
    platform_specific: recommendPlatformOptimizations(forecast),
    growth_opportunities: identifyGrowthOpportunities(forecast)
  };
}

// Utility functions
function extractKeywords(content) {
  const words = content.toLowerCase().split(/\W+/);
  return words.filter(word => word.length > 3);
}

function categorizeTopics(keywords) {
  const topics = new Map();
  keywords.forEach(word => {
    const category = findTopicCategory(word);
    topics.set(category, (topics.get(category) || 0) + 1);
  });
  return Object.fromEntries(topics);
}

function analyzeCompetition(topics) {
  // Simplified competition analysis
  return Object.keys(topics).length > 5 ? 0.8 : 0.5;
}

function findPrimaryNiche(topics) {
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)[0][0];
}

function findSubNiches(topics) {
  return Object.entries(topics)
    .sort(([,a], [,b]) => b - a)
    .slice(1, 4)
    .map(([topic]) => topic);
}

function calculateMonetizationPotential(topics, competitionLevel) {
  const nicheStrength = Object.values(topics).reduce((sum: number, count: number) => sum + count, 0);
  return (nicheStrength * (1 - competitionLevel)) / 100;
}

function calculatePotentialRevenue(baseRate, nicheMultiplier, competitionMultiplier) {
  const viewsEstimate = 10000; // Base monthly views estimate
  return (baseRate * nicheMultiplier * competitionMultiplier * viewsEstimate) / 1000;
}

function identifyRevenueStreams(nicheAnalysis) {
  return {
    advertising: nicheAnalysis.monetization_potential > 0.7,
    affiliate: nicheAnalysis.monetization_potential > 0.5,
    sponsorship: nicheAnalysis.monetization_potential > 0.8,
    products: nicheAnalysis.monetization_potential > 0.6
  };
}

function optimizeTitle(title: string, niche: string) {
  const keywords = getNicheKeywords(niche);
  return incorporateKeywords(title, keywords, 2);
}

function optimizeDescription(description: string, niche: string) {
  const keywords = getNicheKeywords(niche);
  return incorporateKeywords(description, keywords, 5);
}

function optimizeTags(tags: string[], optimalCount: number) {
  return tags
    .slice(0, optimalCount)
    .map(tag => optimizeTag(tag));
}

function optimizeLength(length: number, rules: any) {
  return Math.min(Math.max(length, rules.minLength), rules.maxLength);
}

function identifyMonetizationPoints(content: any, rules: any) {
  const points = [];
  const contentLength = content.length;
  const interval = contentLength / (rules.adBreaks + 1);
  
  for (let i = interval; i < contentLength; i += interval) {
    points.push(Math.floor(i));
  }
  
  return points;
}

function identifyAdPlacements(content: any, platform: string) {
  const placements = [];
  const rules = platformOptimizations[platform];
  
  if (rules.adBreaks > 0) {
    const interval = content.length / (rules.adBreaks + 1);
    for (let i = interval; i < content.length; i += interval) {
      placements.push({
        position: Math.floor(i),
        type: 'mid-roll',
        duration: 15
      });
    }
  }
  
  return placements;
}

function findAffiliateOpportunities(content: any) {
  return {
    products: identifyProductMentions(content),
    services: identifyServiceMentions(content),
    categories: identifyAffiliateCategories(content)
  };
}

function evaluateSponsorshipPotential(content: any) {
  return {
    brandSuitability: calculateBrandSuitability(content),
    integrationPoints: identifyIntegrationPoints(content),
    audienceMatch: evaluateAudienceMatch(content)
  };
}

function identifyProductPlacement(content: any) {
  return {
    naturalPoints: findNaturalPlacements(content),
    productTypes: identifyRelevantProducts(content),
    integrationStyle: recommendIntegrationStyle(content)
  };
}

function calculateAdRevenue(content: any, platform: string) {
  const viewEstimate = estimateViews(content, platform);
  const cpmRate = calculateCPM(content, platform);
  return (viewEstimate * cpmRate) / 1000;
}

function calculateAffiliateRevenue(content: any, niche: string) {
  const conversionRate = estimateConversionRate(content, niche);
  const averageOrderValue = estimateOrderValue(niche);
  const commissionRate = getCommissionRate(niche);
  return conversionRate * averageOrderValue * commissionRate;
}

function calculateSponsorshipRevenue(content: any, niche: string) {
  const audienceValue = calculateAudienceValue(content, niche);
  const engagementRate = estimateEngagementRate(content);
  return audienceValue * engagementRate;
}

function calculateOptimizationScore(content: any, platform: string, niche: string) {
  const scores = {
    contentQuality: evaluateContentQuality(content),
    platformFit: evaluatePlatformFit(content, platform),
    nicheAlignment: evaluateNicheAlignment(content, niche),
    monetizationOptimization: evaluateMonetizationOptimization(content)
  };
  
  return Object.values(scores).reduce((sum: number, score: number) => sum + score, 0) / 4;
}

function recommendContentStructure(forecast: any) {
  return {
    format: recommendFormat(forecast),
    length: recommendLength(forecast),
    elements: recommendElements(forecast),
    hooks: recommendHooks(forecast)
  };
}

function recommendMonetizationStrategy(forecast: any) {
  return {
    primary: identifyPrimaryStream(forecast),
    secondary: identifySecondaryStreams(forecast),
    implementation: createImplementationPlan(forecast)
  };
}

function recommendPlatformOptimizations(forecast: any) {
  return {
    timing: optimizePostingTime(forecast),
    frequency: optimizePostingFrequency(forecast),
    crossPlatform: recommendCrossPlatformStrategy(forecast)
  };
}

function identifyGrowthOpportunities(forecast: any) {
  return {
    audience: identifyAudienceGrowth(forecast),
    revenue: identifyRevenueGrowth(forecast),
    platforms: identifyPlatformGrowth(forecast)
  };
}
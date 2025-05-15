import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { content } = await req.json();

    // Validate content data
    if (!content || !content.id || !content.vertical || !content.platform) {
      throw new Error('Invalid content data');
    }

    // Simulate ML model prediction
    const predictions = simulatePredictions(content);
    
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
    const reasoning = generateReasoning(content, bestSource.source);

    // Store result
    const { data, error } = await supabaseClient
      .from('optimization_results')
      .insert({
        content_id: content.id,
        recommended_source: bestSource.source,
        confidence,
        expected_revenue: bestSource.value,
        reasoning
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          content_id: content.id,
          recommended_source: bestSource.source,
          confidence,
          expected_revenue: bestSource.value,
          predictions,
          reasoning,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
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

function simulatePredictions(content) {
  // Base revenue values
  const baseRevenue = {
    ai_only: 25,
    human_ai: 45,
    human_only: 65
  };

  // Adjust based on complexity
  const complexityFactor = {
    ai_only: 1 - content.complexity_score * 0.5, // AI performs worse as complexity increases
    human_ai: 1 + content.complexity_score * 0.3, // Human-AI improves with complexity
    human_only: 1 + content.complexity_score * 0.5 // Human-only improves more with complexity
  };

  // Adjust based on vertical
  const verticalFactor = {
    tech: { ai_only: 1.2, human_ai: 1.1, human_only: 1.0 },
    finance: { ai_only: 0.8, human_ai: 1.2, human_only: 1.3 },
    lifestyle: { ai_only: 1.1, human_ai: 1.1, human_only: 1.0 },
    health: { ai_only: 0.9, human_ai: 1.2, human_only: 1.2 }
  };

  // Calculate predictions
  const predictions = {};
  for (const source of Object.keys(baseRevenue)) {
    const verticalMult = verticalFactor[content.vertical]?.[source] || 1;
    predictions[source] = baseRevenue[source] * complexityFactor[source] * verticalMult;
    
    // Add some randomness
    predictions[source] *= (0.9 + Math.random() * 0.2);
    
    // Round to 2 decimal places
    predictions[source] = Math.round(predictions[source] * 100) / 100;
  }

  return predictions;
}

function generateReasoning(content, bestSource) {
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
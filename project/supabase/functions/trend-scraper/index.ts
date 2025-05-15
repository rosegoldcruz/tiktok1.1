import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Trend {
  title: string;
  platform: string;
  category: string;
  growth: number;
  engagement: number;
  revenue: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Simulate trend scraping (replace with actual API calls)
    const mockTrends: Trend[] = [
      {
        title: 'Morning Productivity Hacks',
        platform: 'TikTok',
        category: 'Productivity',
        growth: 84.2,
        engagement: 7.8,
        revenue: 45.20
      },
      {
        title: '5-Minute Healthy Breakfast',
        platform: 'Instagram',
        category: 'Food',
        growth: 76.8,
        engagement: 6.2,
        revenue: 38.50
      }
    ];

    // Store trends in database
    const { data, error } = await supabaseClient
      .from('trends')
      .insert(mockTrends)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
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
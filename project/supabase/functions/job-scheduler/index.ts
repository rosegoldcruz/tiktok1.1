import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scheduler configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [5, 15, 30]; // minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get failed jobs
    const { data: failedJobs, error: jobsError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('status', 'failed')
      .lt('retry_count', MAX_RETRIES);

    if (jobsError) throw jobsError;

    // Process failed jobs
    for (const job of failedJobs) {
      const retryDelay = RETRY_DELAYS[job.retry_count || 0];
      const nextRetryTime = new Date(job.last_retry || job.created_at);
      nextRetryTime.setMinutes(nextRetryTime.getMinutes() + retryDelay);

      if (new Date() >= nextRetryTime) {
        // Retry the job
        await supabaseClient
          .from('videos')
          .update({
            status: 'queued',
            retry_count: (job.retry_count || 0) + 1,
            last_retry: new Date().toISOString(),
            progress: 0
          })
          .eq('id', job.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        retriedJobs: failedJobs.length
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
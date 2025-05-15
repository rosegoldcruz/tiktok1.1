import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { z } from 'npm:zod@3.22.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const VideoJobSchema = z.object({
  videoId: z.string().uuid(),
  priority: z.number().min(1).max(5).default(3),
  settings: z.object({
    resolution: z.string(),
    format: z.string(),
    quality: z.string()
  }).optional()
});

// Queue management
const jobQueue = new Map();
const maxConcurrentJobs = 10;
let activeJobs = 0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { videoId, priority, settings } = VideoJobSchema.parse(await req.json());

    // Add job to queue with priority
    jobQueue.set(videoId, { priority, settings, timestamp: Date.now() });

    // Process queue if capacity available
    if (activeJobs < maxConcurrentJobs) {
      await processQueue(supabaseClient);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Video added to processing queue',
        position: jobQueue.size,
        estimatedWaitTime: jobQueue.size * 2 // 2 minutes per job estimate
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

async function processQueue(supabaseClient) {
  if (jobQueue.size === 0 || activeJobs >= maxConcurrentJobs) return;

  // Sort jobs by priority and timestamp
  const sortedJobs = Array.from(jobQueue.entries())
    .sort(([, a], [, b]) => {
      if (a.priority === b.priority) {
        return a.timestamp - b.timestamp;
      }
      return b.priority - a.priority;
    });

  for (const [videoId, job] of sortedJobs) {
    if (activeJobs >= maxConcurrentJobs) break;

    activeJobs++;
    jobQueue.delete(videoId);

    try {
      // Update video status to processing
      await supabaseClient
        .from('videos')
        .update({ status: 'rendering', progress: 0 })
        .eq('id', videoId);

      // Simulate video processing with progress updates
      for (let progress = 0; progress <= 100; progress += 20) {
        await supabaseClient
          .from('videos')
          .update({ progress })
          .eq('id', videoId);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mark video as completed
      await supabaseClient
        .from('videos')
        .update({
          status: 'completed',
          progress: 100,
          duration: '3:45',
          thumbnail_url: 'https://images.pexels.com/photos/2544554/pexels-photo-2544554.jpeg'
        })
        .eq('id', videoId);

    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      
      await supabaseClient
        .from('videos')
        .update({
          status: 'failed',
          progress: 0
        })
        .eq('id', videoId);

    } finally {
      activeJobs--;
      // Process next job if available
      if (jobQueue.size > 0) {
        await processQueue(supabaseClient);
      }
    }
  }
}
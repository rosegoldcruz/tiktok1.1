import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLEANUP_THRESHOLD = 7; // days
const MAX_STORAGE_SIZE = 1000 * 1024 * 1024 * 1024; // 1TB in bytes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get storage usage
    const { data: storageData, error: storageError } = await supabaseClient
      .storage
      .getBucket('videos');

    if (storageError) throw storageError;

    const currentUsage = storageData.size;
    const usagePercentage = (currentUsage / MAX_STORAGE_SIZE) * 100;

    // Cleanup old files if storage usage is high
    if (usagePercentage > 80) {
      const { data: oldFiles } = await supabaseClient
        .storage
        .from('videos')
        .list();

      const cleanupDate = new Date();
      cleanupDate.setDate(cleanupDate.getDate() - CLEANUP_THRESHOLD);

      const filesToDelete = oldFiles.filter(file => 
        new Date(file.created_at) < cleanupDate
      );

      for (const file of filesToDelete) {
        await supabaseClient
          .storage
          .from('videos')
          .remove([file.name]);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        currentUsage,
        usagePercentage,
        filesDeleted: usagePercentage > 80 ? filesToDelete.length : 0
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
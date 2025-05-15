import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { SignJWT, jwtVerify } from 'npm:jose@5.2.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const platformConfigs = {
  tiktok: {
    baseUrl: 'https://open.tiktokapis.com/v2',
    rateLimit: 10000,
    ratePeriod: 'day',
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    rateLimit: 10000,
    ratePeriod: 'day',
  },
  instagram: {
    baseUrl: 'https://graph.instagram.com/v12.0',
    rateLimit: 200,
    ratePeriod: 'hour',
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
      case 'connect':
        return handleAccountConnection(req, supabaseClient);
      case 'distribute':
        return handleContentDistribution(req, supabaseClient);
      case 'analyze':
        return handleAccountAnalytics(req, supabaseClient);
      case 'schedule':
        return handlePostScheduling(req, supabaseClient);
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

async function handleAccountConnection(req: Request, supabaseClient) {
  const { platform, code, redirectUri } = await req.json();
  const config = platformConfigs[platform];

  if (!config) {
    throw new Error('Unsupported platform');
  }

  // Exchange authorization code for tokens
  const tokens = await exchangeAuthCode(platform, code, redirectUri);

  // Store account credentials
  const { data, error } = await supabaseClient
    .from('creator_accounts')
    .insert({
      platform_name: platform,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      auth_status: 'connected'
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleContentDistribution(req: Request, supabaseClient) {
  const { contentId, accounts, scheduledTime } = await req.json();

  // Check rate limits for each account
  for (const accountId of accounts) {
    const { data: limits } = await supabaseClient
      .from('rate_limits')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (limits && limits.requests_made >= limits.requests_limit) {
      throw new Error(`Rate limit exceeded for account ${accountId}`);
    }
  }

  // Create distribution records
  const distributions = accounts.map(accountId => ({
    content_id: contentId,
    account_id: accountId,
    scheduled_time: scheduledTime,
    status: 'scheduled'
  }));

  const { data, error } = await supabaseClient
    .from('content_distribution')
    .insert(distributions)
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

async function handleAccountAnalytics(req: Request, supabaseClient) {
  const { accountId, dateRange } = await req.json();

  // Fetch account metrics
  const { data: account } = await supabaseClient
    .from('creator_accounts')
    .select('platform_name, access_token')
    .eq('id', accountId)
    .single();

  if (!account) throw new Error('Account not found');

  // Fetch platform-specific analytics
  const metrics = await fetchPlatformMetrics(
    account.platform_name,
    account.access_token,
    dateRange
  );

  // Store analytics data
  const { data, error } = await supabaseClient
    .from('account_analytics')
    .insert({
      account_id: accountId,
      date: new Date().toISOString().split('T')[0],
      ...metrics
    })
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

async function handlePostScheduling(req: Request, supabaseClient) {
  const { accountId, schedule } = await req.json();

  // Validate schedule entries
  for (const entry of schedule) {
    if (entry.day_of_week < 0 || entry.day_of_week > 6) {
      throw new Error('Invalid day of week');
    }
  }

  // Update posting schedule
  const { data, error } = await supabaseClient
    .from('posting_schedules')
    .upsert(
      schedule.map(entry => ({
        account_id: accountId,
        ...entry
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

async function exchangeAuthCode(platform: string, code: string, redirectUri: string) {
  const config = platformConfigs[platform];
  const tokenEndpoint = `${config.baseUrl}/oauth/token`;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      client_id: Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`),
      client_secret: Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`),
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange auth code: ${await response.text()}`);
  }

  return response.json();
}

async function fetchPlatformMetrics(platform: string, accessToken: string, dateRange: { start: string, end: string }) {
  const config = platformConfigs[platform];
  const metricsEndpoint = `${config.baseUrl}/analytics`;

  const response = await fetch(metricsEndpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${await response.text()}`);
  }

  return response.json();
}
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Stripe } from 'npm:stripe@14.18.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

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
      case 'join':
        return handleMembershipJoin(req, supabaseClient);
      case 'access-content':
        return handleContentAccess(req, supabaseClient);
      case 'track-engagement':
        return handleEngagementTracking(req, supabaseClient);
      case 'manage-subscription':
        return handleSubscriptionManagement(req, supabaseClient);
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

async function handleMembershipJoin(req: Request, supabaseClient) {
  const { user_id, tier, payment_method_id } = await req.json();

  // Create Stripe customer and subscription
  const customer = await stripe.customers.create({
    metadata: { user_id }
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getPriceIdForTier(tier) }],
    payment_method: payment_method_id,
    expand: ['latest_invoice.payment_intent']
  });

  // Create community member record
  const { data, error } = await supabaseClient
    .from('community_members')
    .insert({
      user_id,
      membership_tier: tier,
      status: 'active',
      profile_data: {
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id
      }
    })
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      member: data[0],
      subscription_status: subscription.status
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleContentAccess(req: Request, supabaseClient) {
  const { member_id, content_id } = await req.json();

  // Check access permissions
  const { data: member, error: memberError } = await supabaseClient
    .from('community_members')
    .select('membership_tier')
    .eq('id', member_id)
    .single();

  if (memberError) throw memberError;

  // Get content details
  const { data: content, error: contentError } = await supabaseClient
    .from('exclusive_content')
    .select('*')
    .eq('id', content_id)
    .single();

  if (contentError) throw contentError;

  // Check if member has access
  if (!hasAccessToContent(member.membership_tier, content.access_tier)) {
    throw new Error('Insufficient access level');
  }

  // Track content access
  await supabaseClient
    .from('member_engagement')
    .insert({
      member_id,
      content_id,
      engagement_type: 'content_access',
      engagement_data: {
        accessed_at: new Date().toISOString()
      }
    });

  return new Response(
    JSON.stringify({
      success: true,
      content
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleEngagementTracking(req: Request, supabaseClient) {
  const { member_id, content_id, engagement_type, engagement_data } = await req.json();

  // Track engagement
  const { data, error } = await supabaseClient
    .from('member_engagement')
    .insert({
      member_id,
      content_id,
      engagement_type,
      engagement_data
    })
    .select();

  if (error) throw error;

  // Update engagement metrics
  await updateEngagementMetrics(member_id, content_id, engagement_type, supabaseClient);

  return new Response(
    JSON.stringify({
      success: true,
      engagement: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleSubscriptionManagement(req: Request, supabaseClient) {
  const { member_id, action, payment_method_id } = await req.json();

  // Get member details
  const { data: member, error: memberError } = await supabaseClient
    .from('community_members')
    .select('profile_data')
    .eq('id', member_id)
    .single();

  if (memberError) throw memberError;

  const stripe_subscription_id = member.profile_data.stripe_subscription_id;

  switch (action) {
    case 'update_payment':
      await stripe.subscriptions.update(stripe_subscription_id, {
        payment_method: payment_method_id
      });
      break;

    case 'cancel':
      await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: true
      });
      break;

    case 'reactivate':
      await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: false
      });
      break;

    default:
      throw new Error('Invalid subscription action');
  }

  return new Response(
    JSON.stringify({
      success: true,
      action
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Helper functions
function getPriceIdForTier(tier: string): string {
  const priceIds = {
    basic: 'price_basic',
    pro: 'price_pro',
    enterprise: 'price_enterprise'
  };
  return priceIds[tier] || priceIds.basic;
}

function hasAccessToContent(memberTier: string, contentTier: string): boolean {
  const tiers = ['basic', 'pro', 'enterprise'];
  return tiers.indexOf(memberTier) >= tiers.indexOf(contentTier);
}

async function updateEngagementMetrics(
  member_id: string,
  content_id: string,
  engagement_type: string,
  supabaseClient
): Promise<void> {
  // Get current metrics
  const { data: metrics, error: metricsError } = await supabaseClient
    .from('member_engagement')
    .select('engagement_type, engagement_data')
    .eq('member_id', member_id)
    .eq('content_id', content_id);

  if (metricsError) throw metricsError;

  // Calculate new metrics
  const updatedMetrics = calculateEngagementMetrics(metrics);

  // Update content with new metrics
  await supabaseClient
    .from('exclusive_content')
    .update({
      engagement_metrics: updatedMetrics
    })
    .eq('id', content_id);
}

function calculateEngagementMetrics(engagements: any[]): any {
  return {
    total_engagements: engagements.length,
    engagement_types: countEngagementTypes(engagements),
    average_duration: calculateAverageDuration(engagements)
  };
}

function countEngagementTypes(engagements: any[]): Record<string, number> {
  return engagements.reduce((counts, engagement) => {
    counts[engagement.engagement_type] = (counts[engagement.engagement_type] || 0) + 1;
    return counts;
  }, {});
}

function calculateAverageDuration(engagements: any[]): number {
  const durations = engagements
    .filter(e => e.engagement_data.duration)
    .map(e => e.engagement_data.duration);

  if (durations.length === 0) return 0;
  return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
}
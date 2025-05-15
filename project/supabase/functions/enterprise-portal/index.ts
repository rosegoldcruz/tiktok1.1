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
      case 'onboard-client':
        return handleClientOnboarding(req, supabaseClient);
      case 'manage-users':
        return handleUserManagement(req, supabaseClient);
      case 'content-workflow':
        return handleContentWorkflow(req, supabaseClient);
      case 'analytics':
        return handleAnalytics(req, supabaseClient);
      case 'brand-voice':
        return handleBrandVoice(req, supabaseClient);
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

async function handleClientOnboarding(req: Request, supabaseClient) {
  const { name, domain, subscription_tier, billing_details } = await req.json();

  // Create Stripe customer
  const customer = await stripe.customers.create({
    name,
    email: billing_details.email,
    metadata: { domain }
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getPriceIdForTier(subscription_tier) }],
    payment_method: billing_details.payment_method_id,
    expand: ['latest_invoice.payment_intent']
  });

  // Create enterprise client record
  const { data: client, error: clientError } = await supabaseClient
    .from('enterprise_clients')
    .insert({
      name,
      domain,
      subscription_tier,
      billing_details: {
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        ...billing_details
      }
    })
    .select()
    .single();

  if (clientError) throw clientError;

  // Generate API key
  const apiKey = await generateApiKey(client.id);

  // Update client with API key
  const { error: updateError } = await supabaseClient
    .from('enterprise_clients')
    .update({ api_key: apiKey })
    .eq('id', client.id);

  if (updateError) throw updateError;

  return new Response(
    JSON.stringify({
      success: true,
      client: {
        ...client,
        api_key: apiKey
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleUserManagement(req: Request, supabaseClient) {
  const { action, user_data } = await req.json();

  switch (action) {
    case 'invite':
      return await inviteUser(user_data, supabaseClient);
    case 'update':
      return await updateUser(user_data, supabaseClient);
    case 'remove':
      return await removeUser(user_data, supabaseClient);
    default:
      throw new Error('Invalid user management action');
  }
}

async function handleContentWorkflow(req: Request, supabaseClient) {
  const { action, content_data } = await req.json();

  switch (action) {
    case 'create_request':
      return await createContentRequest(content_data, supabaseClient);
    case 'update_status':
      return await updateRequestStatus(content_data, supabaseClient);
    case 'submit_approval':
      return await submitApproval(content_data, supabaseClient);
    default:
      throw new Error('Invalid content workflow action');
  }
}

async function handleAnalytics(req: Request, supabaseClient) {
  const { client_id, date_range } = await req.json();

  // Get client analytics
  const { data: analytics, error: analyticsError } = await supabaseClient
    .from('client_analytics')
    .select('*')
    .eq('client_id', client_id)
    .gte('date', date_range.start)
    .lte('date', date_range.end)
    .order('date', { ascending: true });

  if (analyticsError) throw analyticsError;

  // Calculate metrics
  const metrics = calculateClientMetrics(analytics);

  return new Response(
    JSON.stringify({
      success: true,
      analytics,
      metrics
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleBrandVoice(req: Request, supabaseClient) {
  const { action, voice_data } = await req.json();

  switch (action) {
    case 'create':
      return await createBrandVoice(voice_data, supabaseClient);
    case 'train':
      return await trainBrandVoice(voice_data, supabaseClient);
    case 'generate':
      return await generateVoiceContent(voice_data, supabaseClient);
    default:
      throw new Error('Invalid brand voice action');
  }
}

// Helper functions
function getPriceIdForTier(tier: string): string {
  const priceIds = {
    standard: 'price_enterprise_standard',
    professional: 'price_enterprise_professional',
    enterprise: 'price_enterprise_custom'
  };
  return priceIds[tier] || priceIds.standard;
}

async function generateApiKey(clientId: string): Promise<string> {
  const key = crypto.randomUUID().replace(/-/g, '');
  return `ent_${clientId.slice(0, 8)}_${key}`;
}

async function inviteUser(userData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('enterprise_users')
    .insert({
      user_id: userData.user_id,
      client_id: userData.client_id,
      role: userData.role,
      permissions: userData.permissions
    })
    .select();

  if (error) throw error;

  // Send invitation email
  await sendInvitationEmail(userData.email, data[0]);

  return new Response(
    JSON.stringify({
      success: true,
      user: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function updateUser(userData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('enterprise_users')
    .update({
      role: userData.role,
      permissions: userData.permissions
    })
    .eq('id', userData.id)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      user: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function removeUser(userData: any, supabaseClient): Promise<Response> {
  const { error } = await supabaseClient
    .from('enterprise_users')
    .delete()
    .eq('id', userData.id);

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function createContentRequest(contentData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('content_requests')
    .insert({
      client_id: contentData.client_id,
      requester_id: contentData.requester_id,
      title: contentData.title,
      description: contentData.description,
      content_type: contentData.content_type,
      requirements: contentData.requirements,
      deadline: contentData.deadline,
      priority: contentData.priority
    })
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      request: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function updateRequestStatus(contentData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('content_requests')
    .update({
      status: contentData.status,
      assigned_to: contentData.assigned_to
    })
    .eq('id', contentData.id)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      request: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function submitApproval(contentData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('content_approvals')
    .insert({
      request_id: contentData.request_id,
      reviewer_id: contentData.reviewer_id,
      status: contentData.status,
      feedback: contentData.feedback,
      approved_version: contentData.version
    })
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      approval: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function createBrandVoice(voiceData: any, supabaseClient): Promise<Response> {
  const { data, error } = await supabaseClient
    .from('brand_voices')
    .insert({
      client_id: voiceData.client_id,
      name: voiceData.name,
      description: voiceData.description,
      parameters: voiceData.parameters,
      training_data: voiceData.training_data
    })
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      voice: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function trainBrandVoice(voiceData: any, supabaseClient): Promise<Response> {
  // Update voice status to training
  const { error: updateError } = await supabaseClient
    .from('brand_voices')
    .update({ status: 'training' })
    .eq('id', voiceData.id);

  if (updateError) throw updateError;

  // Start training process
  const modelPath = await trainVoiceModel(voiceData);

  // Update voice with model path
  const { data, error } = await supabaseClient
    .from('brand_voices')
    .update({
      status: 'ready',
      model_path: modelPath
    })
    .eq('id', voiceData.id)
    .select();

  if (error) throw error;

  return new Response(
    JSON.stringify({
      success: true,
      voice: data[0]
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function generateVoiceContent(voiceData: any, supabaseClient): Promise<Response> {
  // Get voice model
  const { data: voice, error: voiceError } = await supabaseClient
    .from('brand_voices')
    .select('*')
    .eq('id', voiceData.voice_id)
    .single();

  if (voiceError) throw voiceError;

  // Generate content using voice model
  const generatedContent = await generateContent(voice, voiceData.text);

  return new Response(
    JSON.stringify({
      success: true,
      content: generatedContent
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

function calculateClientMetrics(analytics: any[]): any {
  return {
    total_content: analytics.reduce((sum, day) => sum + day.content_count, 0),
    average_approval_rate: analytics.reduce((sum, day) => sum + day.approval_rate, 0) / analytics.length,
    average_turnaround: analytics.reduce((sum, day) => sum + day.average_turnaround, 0) / analytics.length,
    total_revenue: analytics.reduce((sum, day) => sum + day.revenue_metrics.total, 0)
  };
}

async function sendInvitationEmail(email: string, user: any): Promise<void> {
  // Implement email sending logic
  console.log(`Sending invitation email to ${email}`);
}

async function trainVoiceModel(voiceData: any): Promise<string> {
  // Implement voice model training logic
  return `models/voice_${voiceData.id}.bin`;
}

async function generateContent(voice: any, text: string): Promise<string> {
  // Implement content generation logic
  return `Generated content using ${voice.name} voice model`;
}
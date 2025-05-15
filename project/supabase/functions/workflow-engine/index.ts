import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      case 'process-batch':
        return handleBatchProcessing(req, supabaseClient);
      case 'assign-tasks':
        return handleTaskAssignment(req, supabaseClient);
      case 'track-progress':
        return handleProgressTracking(req, supabaseClient);
      case 'generate-reports':
        return handleReportGeneration(req, supabaseClient);
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

async function handleBatchProcessing(req: Request, supabaseClient) {
  const { client_id, requests } = await req.json();

  // Process batch of requests
  const processedRequests = [];
  for (const request of requests) {
    const { data, error } = await supabaseClient
      .from('content_requests')
      .insert({
        client_id,
        ...request,
        status: 'processing'
      })
      .select();

    if (error) throw error;
    processedRequests.push(data[0]);
  }

  // Update analytics
  await updateBatchAnalytics(client_id, processedRequests.length, supabaseClient);

  return new Response(
    JSON.stringify({
      success: true,
      processed: processedRequests
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleTaskAssignment(req: Request, supabaseClient) {
  const { tasks } = await req.json();

  const assignments = [];
  for (const task of tasks) {
    // Find best available team member
    const assignee = await findBestAssignee(task, supabaseClient);

    // Assign task
    const { data, error } = await supabaseClient
      .from('content_requests')
      .update({
        assigned_to: assignee.id,
        status: 'assigned'
      })
      .eq('id', task.id)
      .select();

    if (error) throw error;
    assignments.push(data[0]);
  }

  return new Response(
    JSON.stringify({
      success: true,
      assignments
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleProgressTracking(req: Request, supabaseClient) {
  const { client_id, date_range } = await req.json();

  // Get all requests in date range
  const { data: requests, error: requestsError } = await supabaseClient
    .from('content_requests')
    .select(`
      *,
      content_approvals (*)
    `)
    .eq('client_id', client_id)
    .gte('created_at', date_range.start)
    .lte('created_at', date_range.end);

  if (requestsError) throw requestsError;

  // Calculate progress metrics
  const metrics = calculateProgressMetrics(requests);

  // Store metrics
  const { error: metricsError } = await supabaseClient
    .from('client_analytics')
    .upsert({
      client_id,
      date: new Date().toISOString().split('T')[0],
      ...metrics
    });

  if (metricsError) throw metricsError;

  return new Response(
    JSON.stringify({
      success: true,
      metrics
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleReportGeneration(req: Request, supabaseClient) {
  const { client_id, report_type, date_range } = await req.json();

  // Get relevant data
  const data = await getReportData(client_id, report_type, date_range, supabaseClient);

  // Generate report
  const report = generateReport(data, report_type);

  return new Response(
    JSON.stringify({
      success: true,
      report
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Helper functions
async function updateBatchAnalytics(clientId: string, count: number, supabaseClient) {
  const date = new Date().toISOString().split('T')[0];

  const { error } = await supabaseClient
    .from('client_analytics')
    .upsert({
      client_id: clientId,
      date,
      content_count: count
    });

  if (error) throw error;
}

async function findBestAssignee(task: any, supabaseClient) {
  // Get available team members
  const { data: team, error } = await supabaseClient
    .from('enterprise_users')
    .select('*')
    .eq('client_id', task.client_id)
    .eq('role', 'content_creator');

  if (error) throw error;

  // Calculate workload for each team member
  const workloads = await Promise.all(
    team.map(async (member) => {
      const { count } = await supabaseClient
        .from('content_requests')
        .select('*', { count: 'exact' })
        .eq('assigned_to', member.id)
        .eq('status', 'in_progress');

      return {
        member,
        workload: count
      };
    })
  );

  // Find member with lowest workload
  return workloads.sort((a, b) => a.workload - b.workload)[0].member;
}

function calculateProgressMetrics(requests: any[]) {
  const total = requests.length;
  const completed = requests.filter(r => r.status === 'completed').length;
  const approved = requests.filter(r => 
    r.content_approvals?.some(a => a.status === 'approved')
  ).length;

  const turnaroundTimes = requests
    .filter(r => r.status === 'completed')
    .map(r => {
      const start = new Date(r.created_at);
      const end = new Date(r.updated_at);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    });

  return {
    content_count: total,
    completion_rate: total ? (completed / total) * 100 : 0,
    approval_rate: completed ? (approved / completed) * 100 : 0,
    average_turnaround: turnaroundTimes.length 
      ? turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length 
      : 0
  };
}

async function getReportData(clientId: string, reportType: string, dateRange: any, supabaseClient) {
  switch (reportType) {
    case 'performance':
      return await getPerformanceData(clientId, dateRange, supabaseClient);
    case 'quality':
      return await getQualityData(clientId, dateRange, supabaseClient);
    case 'efficiency':
      return await getEfficiencyData(clientId, dateRange, supabaseClient);
    default:
      throw new Error('Invalid report type');
  }
}

async function getPerformanceData(clientId: string, dateRange: any, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('client_analytics')
    .select('*')
    .eq('client_id', clientId)
    .gte('date', dateRange.start)
    .lte('date', dateRange.end);

  if (error) throw error;
  return data;
}

async function getQualityData(clientId: string, dateRange: any, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('content_approvals')
    .select(`
      *,
      content_requests!inner (
        client_id
      )
    `)
    .eq('content_requests.client_id', clientId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  if (error) throw error;
  return data;
}

async function getEfficiencyData(clientId: string, dateRange: any, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('content_requests')
    .select('*')
    .eq('client_id', clientId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  if (error) throw error;
  return data;
}

function generateReport(data: any[], reportType: string) {
  switch (reportType) {
    case 'performance':
      return generatePerformanceReport(data);
    case 'quality':
      return generateQualityReport(data);
    case 'efficiency':
      return generateEfficiencyReport(data);
    default:
      throw new Error('Invalid report type');
  }
}

function generatePerformanceReport(data: any[]) {
  return {
    type: 'performance',
    metrics: {
      total_content: data.reduce((sum, day) => sum + day.content_count, 0),
      average_approval_rate: data.reduce((sum, day) => sum + day.approval_rate, 0) / data.length,
      revenue_growth: calculateRevenueGrowth(data)
    },
    trends: {
      daily_content: data.map(day => ({
        date: day.date,
        count: day.content_count
      })),
      approval_rates: data.map(day => ({
        date: day.date,
        rate: day.approval_rate
      }))
    }
  };
}

function generateQualityReport(data: any[]) {
  const approvals = data.length;
  const firstTimeApprovals = data.filter(a => a.revision_number === 1).length;

  return {
    type: 'quality',
    metrics: {
      total_approvals: approvals,
      first_time_approval_rate: approvals ? (firstTimeApprovals / approvals) * 100 : 0,
      average_revisions: calculateAverageRevisions(data)
    },
    feedback_analysis: analyzeFeedbackThemes(data)
  };
}

function generateEfficiencyReport(data: any[]) {
  return {
    type: 'efficiency',
    metrics: {
      average_turnaround: calculateAverageTurnaround(data),
      resource_utilization: calculateResourceUtilization(data),
      workflow_efficiency: calculateWorkflowEfficiency(data)
    },
    bottlenecks: identifyBottlenecks(data)
  };
}

function calculateRevenueGrowth(data: any[]): number {
  if (data.length < 2) return 0;
  
  const firstDay = data[0].revenue_metrics.total;
  const lastDay = data[data.length - 1].revenue_metrics.total;
  
  return ((lastDay - firstDay) / firstDay) * 100;
}

function calculateAverageRevisions(data: any[]): number {
  return data.reduce((sum, item) => sum + item.revision_number, 0) / data.length;
}

function analyzeFeedbackThemes(data: any[]): any {
  const themes: Record<string, number> = {};
  
  data.forEach(item => {
    const feedback = item.feedback.toLowerCase();
    if (feedback.includes('clarity')) themes['clarity'] = (themes['clarity'] || 0) + 1;
    if (feedback.includes('tone')) themes['tone'] = (themes['tone'] || 0) + 1;
    if (feedback.includes('structure')) themes['structure'] = (themes['structure'] || 0) + 1;
  });
  
  return themes;
}

function calculateAverageTurnaround(data: any[]): number {
  const turnaroundTimes = data
    .filter(item => item.status === 'completed')
    .map(item => {
      const start = new Date(item.created_at);
      const end = new Date(item.updated_at);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
    });
    
  return turnaroundTimes.reduce((sum, time) => sum + time, 0) / turnaroundTimes.length;
}

function calculateResourceUtilization(data: any[]): number {
  const totalCapacity = data.length * 8; // 8 hours per request capacity
  const totalHoursUsed = data.reduce((sum, item) => {
    const start = new Date(item.created_at);
    const end = new Date(item.updated_at);
    return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }, 0);
  
  return (totalHoursUsed / totalCapacity) * 100;
}

function calculateWorkflowEfficiency(data: any[]): number {
  const completedOnTime = data.filter(item => {
    if (!item.deadline) return true;
    const completion = new Date(item.updated_at);
    const deadline = new Date(item.deadline);
    return completion <= deadline;
  }).length;
  
  return (completedOnTime / data.length) * 100;
}

function identifyBottlenecks(data: any[]): any[] {
  const stageDelays: Record<string, number> = {};
  
  data.forEach(item => {
    const stage = item.status;
    const duration = new Date(item.updated_at).getTime() - new Date(item.created_at).getTime();
    stageDelays[stage] = (stageDelays[stage] || 0) + duration;
  });
  
  return Object.entries(stageDelays)
    .map(([stage, totalDelay]) => ({
      stage,
      average_delay: totalDelay / data.filter(item => item.status === stage).length
    }))
    .sort((a, b) => b.average_delay - a.average_delay);
}
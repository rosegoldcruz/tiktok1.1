import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import { Matrix } from 'npm:ml-matrix@6.11.0';
import { SimpleLinearRegression } from 'npm:ml-regression@5.0.0';
import { RandomForestRegression } from 'npm:ml-random-forest@2.1.0';

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
      case 'performance':
        return handlePerformanceAnalytics(req, supabaseClient);
      case 'predictions':
        return handlePredictions(req, supabaseClient);
      case 'optimization':
        return handleOptimization(req, supabaseClient);
      case 'reports':
        return handleReports(req, supabaseClient);
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

async function handlePerformanceAnalytics(req: Request, supabaseClient) {
  const { client_id, date_range } = await req.json();

  // Get client data
  const [requests, approvals, analytics] = await Promise.all([
    getContentRequests(client_id, date_range, supabaseClient),
    getContentApprovals(client_id, date_range, supabaseClient),
    getClientAnalytics(client_id, date_range, supabaseClient)
  ]);

  // Calculate performance metrics
  const metrics = calculatePerformanceMetrics(requests, approvals, analytics);

  // Generate insights
  const insights = generateInsights(metrics);

  return new Response(
    JSON.stringify({
      success: true,
      metrics,
      insights
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handlePredictions(req: Request, supabaseClient) {
  const { client_id, prediction_type } = await req.json();

  // Get historical data
  const historicalData = await getHistoricalData(client_id, supabaseClient);

  // Generate predictions
  const predictions = await generatePredictions(historicalData, prediction_type);

  // Calculate confidence intervals
  const confidence = calculateConfidenceIntervals(predictions);

  return new Response(
    JSON.stringify({
      success: true,
      predictions,
      confidence
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleOptimization(req: Request, supabaseClient) {
  const { client_id, optimization_target } = await req.json();

  // Get current performance data
  const performanceData = await getPerformanceData(client_id, supabaseClient);

  // Generate optimization recommendations
  const recommendations = generateOptimizationRecommendations(
    performanceData,
    optimization_target
  );

  // Calculate impact estimates
  const impact = calculateImpactEstimates(recommendations);

  return new Response(
    JSON.stringify({
      success: true,
      recommendations,
      impact
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleReports(req: Request, supabaseClient) {
  const { client_id, report_type, date_range } = await req.json();

  // Get report data
  const data = await getReportData(client_id, report_type, date_range, supabaseClient);

  // Generate report
  const report = generateReport(data, report_type);

  // Add benchmarks
  const benchmarks = await calculateBenchmarks(client_id, report_type, supabaseClient);

  return new Response(
    JSON.stringify({
      success: true,
      report,
      benchmarks
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Data fetching functions
async function getContentRequests(clientId: string, dateRange: any, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('content_requests')
    .select('*')
    .eq('client_id', clientId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end);

  if (error) throw error;
  return data;
}

async function getContentApprovals(clientId: string, dateRange: any, supabaseClient) {
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

async function getClientAnalytics(clientId: string, dateRange: any, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('client_analytics')
    .select('*')
    .eq('client_id', clientId)
    .gte('date', dateRange.start)
    .lte('date', dateRange.end);

  if (error) throw error;
  return data;
}

async function getHistoricalData(clientId: string, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('client_analytics')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

async function getPerformanceData(clientId: string, supabaseClient) {
  const { data, error } = await supabaseClient
    .from('client_analytics')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data;
}

// Analysis functions
function calculatePerformanceMetrics(requests: any[], approvals: any[], analytics: any[]) {
  return {
    content_metrics: calculateContentMetrics(requests),
    approval_metrics: calculateApprovalMetrics(approvals),
    efficiency_metrics: calculateEfficiencyMetrics(analytics),
    revenue_metrics: calculateRevenueMetrics(analytics)
  };
}

function calculateContentMetrics(requests: any[]) {
  const total = requests.length;
  const completed = requests.filter(r => r.status === 'completed').length;
  
  return {
    total_requests: total,
    completion_rate: total ? (completed / total) * 100 : 0,
    average_complexity: calculateAverageComplexity(requests),
    content_distribution: calculateContentDistribution(requests)
  };
}

function calculateApprovalMetrics(approvals: any[]) {
  const total = approvals.length;
  const firstApprovals = approvals.filter(a => a.revision_number === 1).length;
  
  return {
    total_approvals: total,
    first_time_approval_rate: total ? (firstApprovals / total) * 100 : 0,
    average_revisions: calculateAverageRevisions(approvals),
    feedback_themes: analyzeFeedbackThemes(approvals)
  };
}

function calculateEfficiencyMetrics(analytics: any[]) {
  return {
    average_turnaround: calculateAverageTurnaround(analytics),
    resource_utilization: calculateResourceUtilization(analytics),
    bottlenecks: identifyBottlenecks(analytics),
    optimization_opportunities: findOptimizationOpportunities(analytics)
  };
}

function calculateRevenueMetrics(analytics: any[]) {
  return {
    total_revenue: calculateTotalRevenue(analytics),
    revenue_growth: calculateRevenueGrowth(analytics),
    revenue_per_content: calculateRevenuePerContent(analytics),
    projected_revenue: projectRevenue(analytics)
  };
}

// Prediction functions
async function generatePredictions(historicalData: any[], predictionType: string) {
  switch (predictionType) {
    case 'revenue':
      return predictRevenue(historicalData);
    case 'content_volume':
      return predictContentVolume(historicalData);
    case 'efficiency':
      return predictEfficiency(historicalData);
    default:
      throw new Error('Invalid prediction type');
  }
}

function predictRevenue(data: any[]) {
  const X = data.map((_, i) => [i]);
  const y = data.map(d => d.revenue_metrics.total);
  
  const regression = new SimpleLinearRegression(X, y);
  
  return {
    next_30_days: regression.predict([data.length + 30]),
    next_90_days: regression.predict([data.length + 90]),
    next_180_days: regression.predict([data.length + 180])
  };
}

function predictContentVolume(data: any[]) {
  const features = data.map(d => [
    d.content_count,
    d.approval_rate,
    d.average_turnaround
  ]);
  
  const target = data.map(d => d.content_count);
  
  const rf = new RandomForestRegression({
    nEstimators: 10,
    maxDepth: 3
  });
  
  rf.train(features, target);
  
  return {
    next_month: rf.predict([features[features.length - 1]]),
    confidence: rf.score(features, target)
  };
}

function predictEfficiency(data: any[]) {
  const matrix = new Matrix(data.map(d => [
    d.average_turnaround,
    d.content_count,
    d.approval_rate
  ]));
  
  const [U, S, V] = matrix.svd();
  
  return {
    efficiency_score: calculateEfficiencyScore(U, S),
    improvement_potential: calculateImprovementPotential(V)
  };
}

// Optimization functions
function generateOptimizationRecommendations(data: any[], target: string) {
  const metrics = analyzePerformanceMetrics(data);
  const bottlenecks = identifyProcessBottlenecks(data);
  const opportunities = findOptimizationOpportunities(data);
  
  return prioritizeRecommendations(metrics, bottlenecks, opportunities, target);
}

function analyzePerformanceMetrics(data: any[]) {
  return {
    content_efficiency: calculateContentEfficiency(data),
    resource_allocation: analyzeResourceAllocation(data),
    quality_metrics: calculateQualityMetrics(data)
  };
}

function calculateContentEfficiency(data: any[]) {
  return {
    throughput: calculateThroughput(data),
    turnaround_time: calculateAverageTurnaround(data),
    resource_utilization: calculateResourceUtilization(data)
  };
}

function analyzeResourceAllocation(data: any[]) {
  return {
    team_utilization: calculateTeamUtilization(data),
    capacity_planning: analyzeCapacityNeeds(data),
    workload_distribution: analyzeWorkloadDistribution(data)
  };
}

function calculateQualityMetrics(data: any[]) {
  return {
    approval_rate: calculateApprovalRate(data),
    revision_rate: calculateRevisionRate(data),
    client_satisfaction: calculateClientSatisfaction(data)
  };
}

// Report generation functions
function generateReport(data: any[], reportType: string) {
  switch (reportType) {
    case 'performance':
      return generatePerformanceReport(data);
    case 'financial':
      return generateFinancialReport(data);
    case 'operational':
      return generateOperationalReport(data);
    case 'client':
      return generateClientReport(data);
    default:
      throw new Error('Invalid report type');
  }
}

function generatePerformanceReport(data: any[]) {
  return {
    summary: generateExecutiveSummary(data),
    metrics: calculatePerformanceMetrics(data),
    trends: analyzePerformanceTrends(data),
    recommendations: generateRecommendations(data)
  };
}

function generateFinancialReport(data: any[]) {
  return {
    revenue: analyzeRevenue(data),
    costs: analyzeCosts(data),
    profitability: analyzeProfitability(data),
    projections: generateFinancialProjections(data)
  };
}

function generateOperationalReport(data: any[]) {
  return {
    efficiency: analyzeOperationalEfficiency(data),
    resources: analyzeResourceUtilization(data),
    quality: analyzeQualityMetrics(data),
    improvements: identifyOperationalImprovements(data)
  };
}

function generateClientReport(data: any[]) {
  return {
    satisfaction: analyzeClientSatisfaction(data),
    engagement: analyzeClientEngagement(data),
    retention: analyzeClientRetention(data),
    growth: analyzeClientGrowth(data)
  };
}

// Utility functions
function calculateAverageComplexity(requests: any[]): number {
  return requests.reduce((sum, req) => {
    const complexity = req.requirements ? Object.keys(req.requirements).length : 1;
    return sum + complexity;
  }, 0) / requests.length;
}

function calculateContentDistribution(requests: any[]): Record<string, number> {
  return requests.reduce((dist, req) => {
    dist[req.content_type] = (dist[req.content_type] || 0) + 1;
    return dist;
  }, {});
}

function calculateAverageRevisions(approvals: any[]): number {
  return approvals.reduce((sum, approval) => sum + approval.revision_number, 0) / approvals.length;
}

function analyzeFeedbackThemes(approvals: any[]): Record<string, number> {
  return approvals.reduce((themes, approval) => {
    const feedback = approval.feedback.toLowerCase();
    if (feedback.includes('quality')) themes['quality'] = (themes['quality'] || 0) + 1;
    if (feedback.includes('style')) themes['style'] = (themes['style'] || 0) + 1;
    if (feedback.includes('content')) themes['content'] = (themes['content'] || 0) + 1;
    return themes;
  }, {});
}

function calculateAverageTurnaround(analytics: any[]): number {
  return analytics.reduce((sum, day) => sum + day.average_turnaround, 0) / analytics.length;
}

function calculateResourceUtilization(analytics: any[]): number {
  return analytics.reduce((sum, day) => sum + day.content_count, 0) / (analytics.length * 10); // Assuming 10 content pieces per day capacity
}

function calculateTotalRevenue(analytics: any[]): number {
  return analytics.reduce((sum, day) => sum + day.revenue_metrics.total, 0);
}

function calculateRevenueGrowth(analytics: any[]): number {
  if (analytics.length < 2) return 0;
  const first = analytics[0].revenue_metrics.total;
  const last = analytics[analytics.length - 1].revenue_metrics.total;
  return ((last - first) / first) * 100;
}

function calculateRevenuePerContent(analytics: any[]): number {
  const totalRevenue = calculateTotalRevenue(analytics);
  const totalContent = analytics.reduce((sum, day) => sum + day.content_count, 0);
  return totalRevenue / totalContent;
}

function projectRevenue(analytics: any[]): number {
  const regression = new SimpleLinearRegression(
    analytics.map((_, i) => [i]),
    analytics.map(day => day.revenue_metrics.total)
  );
  return regression.predict([analytics.length + 30]); // Project 30 days ahead
}

function calculateEfficiencyScore(U: Matrix, S: number[]): number {
  return S.reduce((sum, s) => sum + s, 0) / S.length;
}

function calculateImprovementPotential(V: Matrix): number {
  const components = V.to2DArray();
  return Math.abs(components[0][components[0].length - 1]);
}

function calculateThroughput(data: any[]): number {
  return data.reduce((sum, day) => sum + day.content_count, 0) / data.length;
}

function calculateTeamUtilization(data: any[]): number {
  return data.reduce((sum, day) => sum + day.content_count / day.team_capacity, 0) / data.length * 100;
}

function analyzeCapacityNeeds(data: any[]): any {
  const trend = new SimpleLinearRegression(
    data.map((_, i) => [i]),
    data.map(day => day.content_count)
  );
  
  return {
    current_capacity: data[data.length - 1].team_capacity,
    projected_need: trend.predict([data.length + 30]),
    growth_rate: trend.slope * 100
  };
}

function analyzeWorkloadDistribution(data: any[]): any {
  const workloads = data.reduce((acc, day) => {
    day.team_workload.forEach((load: number, team: string) => {
      acc[team] = (acc[team] || 0) + load;
    });
    return acc;
  }, {});
  
  return Object.entries(workloads).map(([team, load]) => ({
    team,
    average_load: load / data.length,
    utilization: (load / data.length) / 8 * 100 // Assuming 8-hour workday
  }));
}

function calculateApprovalRate(data: any[]): number {
  const approvals = data.reduce((sum, day) => sum + day.approvals, 0);
  const submissions = data.reduce((sum, day) => sum + day.submissions, 0);
  return submissions ? (approvals / submissions) * 100 : 0;
}

function calculateRevisionRate(data: any[]): number {
  const revisions = data.reduce((sum, day) => sum + day.revisions, 0);
  const content = data.reduce((sum, day) => sum + day.content_count, 0);
  return content ? revisions / content : 0;
}

function calculateClientSatisfaction(data: any[]): number {
  return data.reduce((sum, day) => sum + day.client_satisfaction, 0) / data.length;
}

function generateExecutiveSummary(data: any[]): string {
  const metrics = calculatePerformanceMetrics(data);
  const trends = analyzePerformanceTrends(data);
  
  return `
    Performance Summary for ${data[0].date} to ${data[data.length - 1].date}
    - Content Production: ${metrics.content_metrics.total_requests} pieces
    - Approval Rate: ${metrics.approval_metrics.first_time_approval_rate.toFixed(1)}%
    - Average Turnaround: ${metrics.efficiency_metrics.average_turnaround.toFixed(1)} hours
    - Revenue Growth: ${metrics.revenue_metrics.revenue_growth.toFixed(1)}%
    
    Key Trends:
    ${trends.map(trend => `- ${trend.description}`).join('\n')}
  `;
}

function analyzePerformanceTrends(data: any[]): any[] {
  return [
    analyzeContentTrend(data),
    analyzeApprovalTrend(data),
    analyzeEfficiencyTrend(data),
    analyzeRevenueTrend(data)
  ];
}

function analyzeContentTrend(data: any[]): any {
  const trend = new SimpleLinearRegression(
    data.map((_, i) => [i]),
    data.map(day => day.content_count)
  );
  
  return {
    metric: 'content_production',
    slope: trend.slope,
    description: `Content production is ${trend.slope > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(trend.slope).toFixed(1)} pieces per day`
  };
}

function analyzeApprovalTrend(data: any[]): any {
  const trend = new SimpleLinearRegression(
    data.map((_, i) => [i]),
    data.map(day => day.approval_rate)
  );
  
  return {
    metric: 'approval_rate',
    slope: trend.slope,
    description: `Approval rate is ${trend.slope > 0 ? 'improving' : 'declining'} by ${Math.abs(trend.slope).toFixed(1)}% per day`
  };
}

function analyzeEfficiencyTrend(data: any[]): any {
  const trend = new SimpleLinearRegression(
    data.map((_, i) => [i]),
    data.map(day => day.average_turnaround)
  );
  
  return {
    metric: 'efficiency',
    slope: trend.slope,
    description: `Turnaround time is ${trend.slope < 0 ? 'improving' : 'increasing'} by ${Math.abs(trend.slope).toFixed(1)} hours per day`
  };
}

function analyzeRevenueTrend(data: any[]): any {
  const trend = new SimpleLinearRegression(
    data.map((_, i) => [i]),
    data.map(day => day.revenue_metrics.total)
  );
  
  return {
    metric: 'revenue',
    slope: trend.slope,
    description: `Revenue is ${trend.slope > 0 ? 'growing' : 'declining'} by $${Math.abs(trend.slope).toFixed(2)} per day`
  };
}
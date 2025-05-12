import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import SubscriptionManager from './SubscriptionManager';
import logger from './logger';

export class ApiGateway {
  private static instance: ApiGateway;
  private app;
  private supabase;
  
  private constructor() {
    this.app = express();
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    
    this.configureMiddleware();
    this.setupRoutes();
  }
  
  public static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }
  
  private configureMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    
    // Rate limiting based on subscription tier
    this.app.use(async (req, res, next) => {
      try {
        const apiKey = req.headers['x-api-key'] as string;
        if (!apiKey) {
          return res.status(401).json({ error: 'API key required' });
        }
        
        // Get user from API key
        const { data: { user }, error } = await this.supabase.auth.getUser(apiKey);
        if (error || !user) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        
        // Get subscription tier
        const { data: subscription } = await this.supabase
          .from('subscriptions')
          .select()
          .eq('user_id', user.id)
          .single();
        
        if (!subscription) {
          return res.status(403).json({ error: 'No active subscription' });
        }
        
        // Apply rate limits based on tier
        const limiter = rateLimit({
          windowMs: 60 * 1000, // 1 minute
          max: subscription.tier === 'enterprise' ? 500 :
               subscription.tier === 'pro' ? 100 : 30
        });
        
        // Add user and subscription to request
        req.user = user;
        req.subscription = subscription;
        
        limiter(req, res, next);
      } catch (error) {
        logger.error('Rate limiting error:', error);
        next(error);
      }
    });
  }
  
  private setupRoutes() {
    // API endpoints
    this.app.get('/api/analytics/revenue', async (req, res) => {
      try {
        const { user, subscription } = req;
        
        // Log API usage
        await SubscriptionManager.getInstance().logUsage(user.id, 'api_calls');
        
        // Get revenue data
        const revenueData = await this.getRevenueData(user.id);
        
        // Apply white-label if enabled
        if (subscription.tier === 'enterprise' && req.query.whiteLabel === 'true') {
          revenueData.branding = {
            color: req.query.brandColor || '#2563eb',
            logo: req.query.logo || null,
            companyName: req.query.companyName || null
          };
        }
        
        // Set proper content type header
        res.setHeader('Content-Type', 'application/json');
        res.json(revenueData);
      } catch (error) {
        logger.error('Revenue API error:', error);
        // Ensure error response is also JSON
        res.status(500).json({ error: 'Failed to fetch revenue data' });
      }
    });
  }
  
  private async getRevenueData(userId: string) {
    // Implementation of revenue data fetching
    // This would pull from your actual data sources
    return {
      totalRevenue: 500000,
      targetRevenue: 10000000,
      dailyRevenue: [
        { date: '2025-01-01', revenue: 10000 },
        { date: '2025-01-02', revenue: 12000 },
        { date: '2025-01-03', revenue: 15000 }
      ],
      projectedDate: new Date().toISOString(),
      topPerformers: [
        { accountId: 'acc1', revenue: 50000, roi: 2.5 },
        { accountId: 'acc2', revenue: 45000, roi: 2.2 },
        { accountId: 'acc3', revenue: 40000, roi: 2.0 }
      ]
    };
  }
  
  public start(port: number) {
    this.app.listen(port, () => {
      logger.info(`API Gateway running on port ${port}`);
    });
  }
}

export default ApiGateway.getInstance();
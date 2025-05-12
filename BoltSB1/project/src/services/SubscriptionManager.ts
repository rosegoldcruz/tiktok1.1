import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { z } from 'zod';
import logger from './logger';

// Validation schemas
const TierSchema = z.enum(['free', 'pro', 'enterprise']);

const SubscriptionSchema = z.object({
  userId: z.string().uuid(),
  tier: TierSchema,
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional()
});

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private supabase;
  private stripe;
  
  private constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }
  
  public static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }
  
  async createSubscription(data: z.infer<typeof SubscriptionSchema>) {
    try {
      const { userId, tier, stripeCustomerId } = SubscriptionSchema.parse(data);
      
      // Get price ID for tier
      const priceId = this.getPriceIdForTier(tier);
      
      // Create or update Stripe customer
      let customerId = stripeCustomerId;
      if (!customerId) {
        const { data: user } = await this.supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();
        
        const customer = await this.stripe.customers.create({
          email: user.email,
          metadata: {
            userId
          }
        });
        customerId = customer.id;
      }
      
      // Create Stripe subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          userId,
          tier
        }
      });
      
      // Store subscription in database
      const { data: dbSubscription, error } = await this.supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        subscription: dbSubscription,
        stripeSubscription: subscription
      };
    } catch (error) {
      logger.error('Failed to create subscription:', error);
      throw error;
    }
  }
  
  async updateSubscription(subscriptionId: string, tier: z.infer<typeof TierSchema>) {
    try {
      // Get subscription
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select()
        .eq('id', subscriptionId)
        .single();
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Update Stripe subscription
      const priceId = this.getPriceIdForTier(tier);
      
      await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{
          id: subscription.stripe_subscription_id,
          price: priceId
        }],
        metadata: {
          tier
        }
      });
      
      // Update database
      const { data: updatedSubscription, error } = await this.supabase
        .from('subscriptions')
        .update({
          tier,
          updated_at: new Date()
        })
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) throw error;
      
      return updatedSubscription;
    } catch (error) {
      logger.error('Failed to update subscription:', error);
      throw error;
    }
  }
  
  async cancelSubscription(subscriptionId: string) {
    try {
      // Get subscription
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select()
        .eq('id', subscriptionId)
        .single();
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Cancel Stripe subscription
      await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });
      
      // Update database
      const { data: updatedSubscription, error } = await this.supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date()
        })
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) throw error;
      
      return updatedSubscription;
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }
  
  async logUsage(userId: string, feature: string) {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select()
        .eq('user_id', userId)
        .single();
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }
      
      // Log usage
      const { error } = await this.supabase
        .from('usage_logs')
        .insert({
          user_id: userId,
          subscription_id: subscription.id,
          feature
        });
      
      if (error) throw error;
      
      // Check usage limits
      const { count } = await this.getUsageCount(userId, feature);
      const limit = this.getUsageLimit(subscription.tier, feature);
      
      return {
        current: count,
        limit,
        remaining: limit === -1 ? -1 : limit - count
      };
    } catch (error) {
      logger.error('Failed to log usage:', error);
      throw error;
    }
  }
  
  async getUsageCount(userId: string, feature: string): Promise<{ count: number }> {
    const { data, error } = await this.supabase
      .from('usage_logs')
      .select('count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (error) throw error;
    
    return {
      count: data.reduce((sum, log) => sum + log.count, 0)
    };
  }
  
  private getPriceIdForTier(tier: string): string {
    switch (tier) {
      case 'pro':
        return process.env.STRIPE_PRO_PRICE_ID!;
      case 'enterprise':
        return process.env.STRIPE_ENTERPRISE_PRICE_ID!;
      default:
        return process.env.STRIPE_FREE_PRICE_ID!;
    }
  }
  
  private getUsageLimit(tier: string, feature: string): number {
    const limits = {
      free: {
        requests: 1000,
        accounts: 1
      },
      pro: {
        requests: 5000,
        accounts: 25
      },
      enterprise: {
        requests: -1, // unlimited
        accounts: -1 // unlimited
      }
    };
    
    return limits[tier as keyof typeof limits][feature as keyof typeof limits['free']] ?? 0;
  }
}

export default SubscriptionManager.getInstance();
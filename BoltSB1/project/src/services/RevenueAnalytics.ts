import logger from './logger';

interface AccountRevenue {
  accountId: string;
  revenue: number;
  posts: number;
  views: number;
  engagement: number;
  conversionRate: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  dailyRevenue: { date: string; revenue: number }[];
  accountRevenues: AccountRevenue[];
  projectedCompletion: string;
  weeklyGrowthRate: number;
}

class RevenueAnalytics {
  private static instance: RevenueAnalytics;
  private TARGET_REVENUE = 10000000; // $10M target
  private metrics: RevenueMetrics = {
    totalRevenue: 0,
    dailyRevenue: [],
    accountRevenues: [],
    projectedCompletion: '',
    weeklyGrowthRate: 0
  };

  private constructor() {
    this.initializeMetrics();
  }

  public static getInstance(): RevenueAnalytics {
    if (!RevenueAnalytics.instance) {
      RevenueAnalytics.instance = new RevenueAnalytics();
    }
    return RevenueAnalytics.instance;
  }

  private async initializeMetrics(): Promise<void> {
    try {
      // Initialize with empty metrics
      this.updateMetrics({
        totalRevenue: 0,
        dailyRevenue: [],
        accountRevenues: [],
        projectedCompletion: this.calculateProjectedCompletion(0, 0),
        weeklyGrowthRate: 0
      });
    } catch (error) {
      logger.error(`Failed to initialize metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async trackRevenue(data: {
    accountId: string;
    revenue: number;
    posts: number;
    views: number;
    engagement: number;
  }): Promise<void> {
    try {
      // Update account metrics
      const accountIndex = this.metrics.accountRevenues.findIndex(
        a => a.accountId === data.accountId
      );

      if (accountIndex >= 0) {
        this.metrics.accountRevenues[accountIndex] = {
          ...this.metrics.accountRevenues[accountIndex],
          revenue: this.metrics.accountRevenues[accountIndex].revenue + data.revenue,
          posts: data.posts,
          views: data.views,
          engagement: data.engagement,
          conversionRate: data.revenue / data.views
        };
      } else {
        this.metrics.accountRevenues.push({
          ...data,
          conversionRate: data.revenue / data.views
        });
      }

      // Update daily revenue
      const today = new Date().toISOString().split('T')[0];
      const dailyIndex = this.metrics.dailyRevenue.findIndex(d => d.date === today);

      if (dailyIndex >= 0) {
        this.metrics.dailyRevenue[dailyIndex].revenue += data.revenue;
      } else {
        this.metrics.dailyRevenue.push({
          date: today,
          revenue: data.revenue
        });
      }

      // Update total revenue
      this.metrics.totalRevenue += data.revenue;

      // Calculate weekly growth rate
      this.metrics.weeklyGrowthRate = this.calculateWeeklyGrowthRate();

      // Update projected completion
      this.metrics.projectedCompletion = this.calculateProjectedCompletion(
        this.metrics.totalRevenue,
        this.metrics.weeklyGrowthRate
      );

      logger.info('Revenue metrics updated', {
        accountId: data.accountId,
        revenue: data.revenue,
        totalRevenue: this.metrics.totalRevenue
      });
    } catch (error) {
      logger.error(`Failed to track revenue: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private calculateWeeklyGrowthRate(): number {
    const recentRevenue = this.metrics.dailyRevenue.slice(-7);
    const previousRevenue = this.metrics.dailyRevenue.slice(-14, -7);

    if (previousRevenue.length === 0) return 0;

    const recentTotal = recentRevenue.reduce((sum, day) => sum + day.revenue, 0);
    const previousTotal = previousRevenue.reduce((sum, day) => sum + day.revenue, 0);

    return previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;
  }

  private calculateProjectedCompletion(currentRevenue: number, weeklyGrowthRate: number): string {
    if (currentRevenue >= this.TARGET_REVENUE) {
      return new Date().toISOString().split('T')[0];
    }

    const remaining = this.TARGET_REVENUE - currentRevenue;
    const weeklyRevenue = this.getAverageWeeklyRevenue();
    const weeksToTarget = weeklyGrowthRate > 0 
      ? this.calculateWeeksWithGrowth(remaining, weeklyRevenue, weeklyGrowthRate)
      : remaining / weeklyRevenue;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (weeksToTarget * 7));
    
    return projectedDate.toISOString().split('T')[0];
  }

  private getAverageWeeklyRevenue(): number {
    const recentRevenue = this.metrics.dailyRevenue.slice(-7);
    return recentRevenue.reduce((sum, day) => sum + day.revenue, 0);
  }

  private calculateWeeksWithGrowth(
    remaining: number,
    weeklyRevenue: number,
    growthRate: number
  ): number {
    let weeks = 0;
    let accumulated = 0;
    let currentWeeklyRevenue = weeklyRevenue;

    while (accumulated < remaining && weeks < 520) { // Cap at 10 years
      accumulated += currentWeeklyRevenue;
      currentWeeklyRevenue *= (1 + (growthRate / 100));
      weeks++;
    }

    return weeks;
  }

  public getRevenueMetrics(): RevenueMetrics {
    return {
      ...this.metrics,
      accountRevenues: this.metrics.accountRevenues.sort((a, b) => b.revenue - a.revenue)
    };
  }

  public getTopPerformers(limit: number = 5): AccountRevenue[] {
    return this.metrics.accountRevenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  public getProgressToTarget(): number {
    return (this.metrics.totalRevenue / this.TARGET_REVENUE) * 100;
  }

  private updateMetrics(metrics: RevenueMetrics): void {
    this.metrics = metrics;
  }
}

export default RevenueAnalytics.getInstance();
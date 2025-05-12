import { Worker } from 'worker_threads';
import Piscina from 'piscina';
import { Queue, QueueScheduler, Worker as BullWorker } from 'bullmq';
import { register, Gauge, Counter } from 'prometheus-client';
import logger from './logger';
import ConfigManager from './ConfigManager';

interface AccountMetrics {
  id: string;
  username: string;
  postsProcessed: number;
  avgEngagement: number;
  revenueGenerated: number;
  processingTime: number;
}

interface OptimizationMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeWorkers: number;
  queueLength: number;
  processedPosts: number;
  averageProcessingTime: number;
  revenuePerPost: number;
}

class PerformanceOptimizer {
  private config = ConfigManager.getInstance().getConfig();
  private threadPool: Piscina;
  private contentQueue: Queue;
  private metrics: OptimizationMetrics = {
    cpuUsage: 0,
    memoryUsage: 0,
    activeWorkers: 0,
    queueLength: 0,
    processedPosts: 0,
    averageProcessingTime: 0,
    revenuePerPost: 0
  };
  private accountMetrics: Map<string, AccountMetrics> = new Map();
  
  // Prometheus metrics
  private processedPostsCounter: Counter;
  private queueLengthGauge: Gauge;
  private processingTimeGauge: Gauge;
  private revenueGauge: Gauge;

  constructor() {
    // Initialize thread pool for parallel processing
    this.threadPool = new Piscina({
      filename: './workers/ContentWorker.js',
      minThreads: 4,
      maxThreads: 16,
      idleTimeout: 30000
    });

    // Initialize queue for content processing
    this.contentQueue = new Queue('content-processing', {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });

    // Initialize Prometheus metrics
    this.processedPostsCounter = new Counter({
      name: 'processed_posts_total',
      help: 'Total number of posts processed'
    });

    this.queueLengthGauge = new Gauge({
      name: 'queue_length',
      help: 'Current length of content processing queue'
    });

    this.processingTimeGauge = new Gauge({
      name: 'average_processing_time',
      help: 'Average time to process content'
    });

    this.revenueGauge = new Gauge({
      name: 'revenue_per_post',
      help: 'Average revenue generated per post'
    });

    // Start metrics collection
    this.startMetricsCollection();
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 5000);
  }

  private async updateMetrics(): Promise<void> {
    const metrics = await this.collectMetrics();
    
    this.queueLengthGauge.set(metrics.queueLength);
    this.processingTimeGauge.set(metrics.averageProcessingTime);
    this.revenueGauge.set(metrics.revenuePerPost);
    
    logger.info('Performance metrics updated', { metrics });
  }

  private async collectMetrics(): Promise<OptimizationMetrics> {
    const queueLength = await this.contentQueue.count();
    const memUsage = process.memoryUsage();

    this.metrics = {
      ...this.metrics,
      cpuUsage: process.cpuUsage().user / 1000000,
      memoryUsage: memUsage.heapUsed / 1024 / 1024,
      queueLength,
      activeWorkers: this.threadPool.threads.length
    };

    return this.metrics;
  }

  async processContent(content: any, accountId: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Add to processing queue with priority based on account performance
      const accountMetrics = this.accountMetrics.get(accountId);
      const priority = this.calculatePriority(accountMetrics);

      await this.contentQueue.add('process-content', {
        content,
        accountId,
        priority
      });

      // Update metrics
      this.processedPostsCounter.inc();
      this.updateAccountMetrics(accountId, Date.now() - startTime);

    } catch (error) {
      logger.error(`Content processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private calculatePriority(metrics?: AccountMetrics): number {
    if (!metrics) return 1;

    // Priority formula based on account performance
    const engagementFactor = metrics.avgEngagement / 100;
    const revenueFactor = metrics.revenueGenerated / 1000;
    
    return Math.min(10, (engagementFactor + revenueFactor) * 5);
  }

  private updateAccountMetrics(accountId: string, processingTime: number): void {
    const metrics = this.accountMetrics.get(accountId) || {
      id: accountId,
      username: '',
      postsProcessed: 0,
      avgEngagement: 0,
      revenueGenerated: 0,
      processingTime: 0
    };

    metrics.postsProcessed++;
    metrics.processingTime = (metrics.processingTime + processingTime) / 2;

    this.accountMetrics.set(accountId, metrics);
  }

  async optimizePostSchedule(accountId: string): Promise<any> {
    const metrics = this.accountMetrics.get(accountId);
    if (!metrics) return null;

    // Calculate optimal posting times based on engagement data
    const postingTimes = await this.threadPool.run({
      type: 'calculate-schedule',
      metrics
    });

    return postingTimes;
  }

  async getPerformanceReport(): Promise<any> {
    const metrics = await this.collectMetrics();
    const accountStats = Array.from(this.accountMetrics.values());

    return {
      systemMetrics: metrics,
      accountPerformance: accountStats,
      optimization: {
        recommendedWorkers: this.calculateOptimalWorkers(),
        queueHealth: this.assessQueueHealth(),
        resourceUtilization: this.calculateResourceUtilization()
      }
    };
  }

  private calculateOptimalWorkers(): number {
    const queueLength = this.metrics.queueLength;
    const processingTime = this.metrics.averageProcessingTime;
    const currentWorkers = this.metrics.activeWorkers;

    // Calculate optimal number of workers based on load
    const targetProcessingTime = 1000; // 1 second target
    const optimalWorkers = Math.ceil(
      (queueLength * processingTime) / targetProcessingTime
    );

    return Math.min(16, Math.max(4, optimalWorkers));
  }

  private assessQueueHealth(): string {
    const queueLength = this.metrics.queueLength;
    const processRate = this.metrics.processedPosts / 3600; // Posts per hour

    if (queueLength === 0) return 'Healthy';
    if (queueLength > processRate * 2) return 'Overloaded';
    return 'Busy';
  }

  private calculateResourceUtilization(): number {
    const cpuUtil = this.metrics.cpuUsage / 100;
    const memUtil = this.metrics.memoryUsage / 1024; // GB
    
    return ((cpuUtil + memUtil) / 2) * 100;
  }

  async shutdown(): Promise<void> {
    await this.threadPool.destroy();
    await this.contentQueue.close();
    logger.info('Performance optimizer shutdown complete');
  }
}

export default new PerformanceOptimizer();
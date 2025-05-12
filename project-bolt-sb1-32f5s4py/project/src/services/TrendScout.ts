import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import logger from './logger';
import ConfigManager from './ConfigManager';

interface Trend {
  id: string;
  platform: string;
  type: 'hashtag' | 'topic' | 'post';
  title: string;
  description?: string;
  url: string;
  metrics: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
  timestamp: string;
  velocity: number;
  growthRate: number;
  score: number;
}

export class TrendScout {
  private browser: puppeteer.Browser | null = null;
  private config = ConfigManager.getInstance().getConfig();
  private platforms = ['tiktok', 'instagram', 'twitter'];
  private trends: Trend[] = [];
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'data', 'trends');
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      await fs.mkdir(this.outputDir, { recursive: true });
      logger.info('TrendScout initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize TrendScout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async scanPlatform(platform: string): Promise<Trend[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    await page.setViewport(this.config.scraper.viewport);
    await page.setUserAgent(this.config.scraper.userAgent);

    try {
      switch (platform) {
        case 'tiktok':
          return await this.scanTikTok(page);
        case 'instagram':
          return await this.scanInstagram(page);
        case 'twitter':
          return await this.scanTwitter(page);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } finally {
      await page.close();
    }
  }

  private async scanTikTok(page: puppeteer.Page): Promise<Trend[]> {
    await page.goto('https://www.tiktok.com/explore', {
      waitUntil: 'networkidle0',
      timeout: this.config.scraper.timeout
    });

    return await page.evaluate(() => {
      const trends: Trend[] = [];
      const trendElements = document.querySelectorAll('[data-e2e="explore-item"]');

      trendElements.forEach((element, index) => {
        const titleElement = element.querySelector('strong');
        const statsElement = element.querySelector('.video-count');

        if (titleElement && statsElement) {
          trends.push({
            id: `tiktok-${Date.now()}-${index}`,
            platform: 'tiktok',
            type: 'hashtag',
            title: titleElement.textContent || '',
            url: element.querySelector('a')?.href || '',
            metrics: {
              views: parseInt(statsElement.textContent?.replace(/[^0-9]/g, '') || '0', 10)
            },
            timestamp: new Date().toISOString(),
            velocity: 0,
            growthRate: 0,
            score: 0
          });
        }
      });

      return trends;
    });
  }

  private async scanInstagram(page: puppeteer.Page): Promise<Trend[]> {
    // Implementation similar to TikTok but for Instagram
    return [];
  }

  private async scanTwitter(page: puppeteer.Page): Promise<Trend[]> {
    // Implementation similar to TikTok but for Twitter
    return [];
  }

  private calculateTrendMetrics(trend: Trend, previousTrend?: Trend): void {
    const now = Date.now();
    const trendTime = new Date(trend.timestamp).getTime();
    const timeDiff = (now - trendTime) / (1000 * 60 * 60); // Hours

    if (previousTrend) {
      const prevViews = previousTrend.metrics.views || 0;
      const currentViews = trend.metrics.views || 0;
      const viewDiff = currentViews - prevViews;

      trend.velocity = viewDiff / timeDiff;
      trend.growthRate = prevViews > 0 ? (viewDiff / prevViews) * 100 : 0;
    }

    // Calculate trend score (0-100)
    trend.score = Math.min(100, Math.max(0,
      (trend.velocity * 0.4) +
      (trend.growthRate * 0.3) +
      (this.calculateEngagementScore(trend) * 0.3)
    ));
  }

  private calculateEngagementScore(trend: Trend): number {
    const { views = 0, likes = 0, shares = 0, comments = 0 } = trend.metrics;
    const totalEngagements = likes + shares + comments;
    return views > 0 ? (totalEngagements / views) * 100 : 0;
  }

  async saveTrends(trends: Trend[]): Promise<void> {
    const filename = `trends-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(this.outputDir, filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(trends, null, 2));
      logger.info(`Saved ${trends.length} trends to ${filepath}`);
    } catch (error) {
      logger.error(`Failed to save trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async scanAll(): Promise<Trend[]> {
    const allTrends: Trend[] = [];

    for (const platform of this.platforms) {
      try {
        const platformTrends = await this.scanPlatform(platform);
        allTrends.push(...platformTrends);
      } catch (error) {
        logger.error(`Failed to scan ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Process and sort trends
    allTrends.forEach(trend => this.calculateTrendMetrics(trend));
    allTrends.sort((a, b) => b.score - a.score);

    await this.saveTrends(allTrends);
    return allTrends;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default new TrendScout();
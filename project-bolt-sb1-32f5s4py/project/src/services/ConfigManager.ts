import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import logger from './logger';

export interface Config {
  version: string;
  environment: string;
  scraper: {
    userAgent: string;
    viewport: {
      width: number;
      height: number;
      deviceScaleFactor: number;
    };
    output: {
      format: string;
      quality: string;
      directory: string;
    };
    timeout: number;
    retries: number;
    retryDelay: number;
  };
  api: {
    port: number;
    maxRequestSize: string;
    rateLimit: {
      tiers: {
        [key: string]: {
          requestsPerMinute: number;
          requestsPerDay: number | string;
        };
      };
    };
    features: {
      tiers: {
        [key: string]: {
          concurrentRequests: number;
          priorityQueue: boolean;
          customHeaders: boolean;
        };
      };
    };
  };
  monetization: {
    plans: {
      [key: string]: {
        price: number;
        features: string[];
      };
    };
  };
  monitoring: {
    enabled: boolean;
    logLevel: string;
    metrics: {
      enabled: boolean;
      interval: number;
    };
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;
  private configPath: string;

  private constructor() {
    this.configPath = path.resolve(__dirname, '../../config/config.json');
    this.config = this.loadConfig();
    this.parseCommandLine();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): Config {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      logger.error(`Failed to load config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private parseCommandLine(): void {
    const argv = yargs(hideBin(process.argv))
      .option('port', {
        type: 'number',
        description: 'API server port'
      })
      .option('output-format', {
        type: 'string',
        choices: ['pdf', 'png', 'jpeg'],
        description: 'Output format for scraped content'
      })
      .option('quality', {
        type: 'string',
        choices: ['low', 'medium', 'high'],
        description: 'Output quality'
      })
      .option('timeout', {
        type: 'number',
        description: 'Scraper timeout in milliseconds'
      })
      .help()
      .argv;

    // Override config with command line arguments
    if (typeof argv.port === 'number') {
      this.config.api.port = argv.port;
    }
    if (argv.outputFormat) {
      this.config.scraper.output.format = argv.outputFormat as string;
    }
    if (argv.quality) {
      this.config.scraper.output.quality = argv.quality as string;
    }
    if (typeof argv.timeout === 'number') {
      this.config.scraper.timeout = argv.timeout;
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public updateConfig(newConfig: Partial<Config>): Config {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    return this.config;
  }

  public getUserTier(userId: string): string {
    // In a real implementation, this would fetch the user's tier from a database
    return 'free';
  }

  public canProcessRequest(userId: string, requestType: string): boolean {
    const tier = this.getUserTier(userId);
    const tierConfig = this.config.api.features.tiers[tier];
    
    if (!tierConfig) {
      return false;
    }

    // Check if the feature is available for the user's tier
    return tierConfig[requestType as keyof typeof tierConfig] || false;
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      logger.info('Configuration saved successfully');
    } catch (error) {
      logger.error(`Failed to save config: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

export default ConfigManager.getInstance();
import express from 'express';
import { TrendScout } from './TrendScout';
import logger from './logger';
import cron from 'node-cron';

const router = express.Router();
const scout = new TrendScout();

// Initialize scout and schedule scans
let initialized = false;
async function initializeScout() {
  if (!initialized) {
    await scout.initialize();
    initialized = true;

    // Schedule scans every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      try {
        await scout.scanAll();
      } catch (error) {
        logger.error(`Scheduled scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }
}

// Get trends endpoint
router.get('/trends', async (req, res) => {
  try {
    await initializeScout();
    
    const limit = parseInt(req.query.limit as string) || 20;
    const platform = req.query.platform as string;
    
    if (req.query.fresh === 'true') {
      const trends = await scout.scanAll();
      const filtered = platform ? trends.filter(t => t.platform === platform) : trends;
      return res.json({ success: true, trends: filtered.slice(0, limit) });
    }

    // Read from latest saved trends
    const trends = await scout.scanAll(); // This would actually read from saved file
    const filtered = platform ? trends.filter(t => t.platform === platform) : trends;
    res.json({ success: true, trends: filtered.slice(0, limit) });
  } catch (error) {
    logger.error(`Error getting trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ success: false, error: 'Failed to get trends' });
  }
});

// Manual scan endpoint
router.post('/scan', async (req, res) => {
  try {
    await initializeScout();
    
    const platform = req.body.platform as string;
    if (platform) {
      const trends = await scout.scanPlatform(platform);
      res.json({ success: true, trends });
    } else {
      const trends = await scout.scanAll();
      res.json({ success: true, trends });
    }
  } catch (error) {
    logger.error(`Error during scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ success: false, error: 'Scan failed' });
  }
});

export default router;
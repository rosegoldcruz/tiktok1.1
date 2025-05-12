const express = require('express');
const bodyParser = require('body-parser');
const expressWinston = require('express-winston');
const { downloadPDF } = require('./helpers');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const outputDir = './tiktok-docs';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true
}));

app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

app.post('/download', async (req, res) => {
  const { url, outputName } = req.body;
  
  if (!url) {
    logger.warn('Missing URL in request', { body: req.body });
    return res.status(400).json({ 
      error: 'Missing URL',
      message: 'The URL parameter is required'
    });
  }

  try {
    const success = await downloadPDF(url, outputDir, outputName);
    
    if (success) {
      res.json({ 
        message: 'PDF saved successfully',
        outputName: outputName || `${path.basename(url)}.pdf`
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to download PDF',
        message: 'The PDF could not be generated after multiple attempts'
      });
    }
  } catch (err) {
    logger.error('Error processing download request', {
      url,
      outputName,
      error: err.message,
      stack: err.stack
    });

    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    });
  }
});

app.listen(port, () => {
  logger.info(`API server running at http://localhost:${port}`);
});
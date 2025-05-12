const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 100);
}

async function downloadPDF(url, outputDir, outputName, retries = 3) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let attempt = 0;

  while (attempt < retries) {
    try {
      logger.info(`Attempting to download PDF for URL: ${url}`, {
        attempt: attempt + 1,
        url,
        outputName
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      const filename = sanitizeFilename(outputName || url.split('/').pop().split('?')[0]) + '.pdf';
      const pdfPath = path.join(outputDir, filename);
      
      await page.pdf({ 
        path: pdfPath, 
        format: 'A4', 
        printBackground: true 
      });

      logger.info(`Successfully downloaded PDF`, {
        url,
        pdfPath,
        attempt: attempt + 1
      });

      await browser.close();
      return true;
    } catch (err) {
      attempt++;
      logger.error(`Failed to download PDF`, {
        url,
        error: err.message,
        attempt,
        remainingRetries: retries - attempt
      });

      if (attempt >= retries) {
        logger.error(`All retry attempts failed`, {
          url,
          totalAttempts: retries
        });
        await browser.close();
        return false;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

function readUrlsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    logger.error(`Failed to read URLs file`, {
      filePath,
      error: err.message
    });
    throw err;
  }
}

module.exports = { sanitizeFilename, downloadPDF, readUrlsFromFile };
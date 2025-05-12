import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';
import { generatePDF } from '../services/pdfService.js';
import { retryOperation } from '../utils/retry.js';

// Read configuration from the JSON file
const loadConfig = () => {
  try {
    const configPath = path.resolve('urls.json');
    if (!fs.existsSync(configPath)) {
      console.error('Error: urls.json file not found. Please create one.');
      process.exit(1);
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!Array.isArray(config.urls) || config.urls.length === 0) {
      console.error('Error: urls.json must contain a non-empty "urls" array.');
      process.exit(1);
    }
    
    return config;
  } catch (error) {
    console.error('Error loading configuration:', error.message);
    process.exit(1);
  }
};

// Process URLs in batch mode
const processBatch = async () => {
  const config = loadConfig();
  const { urls, outputDir = 'pdfs', maxRetries = 3 } = config;
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Starting batch processing of ${urls.length} URLs...`);
  
  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Progress |{bar}| {percentage}% | {value}/{total} URLs | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  
  progressBar.start(urls.length, 0);
  
  const results = {
    successful: [],
    failed: []
  };
  
  for (let i = 0; i < urls.length; i++) {
    const urlConfig = typeof urls[i] === 'string' 
      ? { url: urls[i] } 
      : urls[i];
      
    const { url, outputName } = urlConfig;
    
    try {
      // Use the retry utility for robustness
      await retryOperation(
        async () => {
          const defaultName = url.replace(/https?:\/\//, '').replace(/\W+/g, '-');
          const fileName = outputName || `${defaultName}.pdf`;
          const outputPath = path.join(outputDir, fileName);
          
          await generatePDF(url, outputPath);
          results.successful.push({ url, outputPath });
        },
        maxRetries
      );
    } catch (error) {
      results.failed.push({ url, error: error.message });
    }
    
    progressBar.update(i + 1);
  }
  
  progressBar.stop();
  
  console.log('\nBatch processing completed!');
  console.log(`Successfully processed: ${results.successful.length}/${urls.length}`);
  
  if (results.failed.length > 0) {
    console.log(`Failed to process: ${results.failed.length}/${urls.length}`);
    console.log('Failed URLs:');
    results.failed.forEach(({ url, error }) => {
      console.log(`- ${url}: ${error}`);
    });
  }
};

// Execute the batch processing
processBatch().catch(error => {
  console.error('Batch processing failed:', error);
  process.exit(1);
});
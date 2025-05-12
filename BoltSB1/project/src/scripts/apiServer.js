import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { generatePDF } from '../services/pdfService.js';
import { retryOperation } from '../utils/retry.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = 'pdfs';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/download', async (req, res) => {
  const { url, outputName } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      message: 'URL is required' 
    });
  }
  
  try {
    const defaultName = url.replace(/https?:\/\//, '').replace(/\W+/g, '-');
    const fileName = outputName || `${defaultName}.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);
    
    // Use retry utility for robustness
    await retryOperation(
      async () => await generatePDF(url, outputPath),
      3 // Max retries
    );
    
    return res.json({
      success: true,
      file: fileName,
      message: 'PDF created successfully'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    return res.status(500).json({
      success: false,
      message: `Failed to generate PDF: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`PDF Scraper API running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- POST /download - Download a URL as PDF');
  console.log('- GET /health - Check server health');
});
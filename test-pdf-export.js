const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const PUPPETEER_SERVICE_URL = 'http://localhost:3500'; // Updated to use port 3500
const TEST_SERVER_URL = 'http://localhost:3002';
const OUTPUT_FILE = 'test-presentation.pdf';

// Start the test server if not already running
const startTestServer = async () => {
  try {
    // Check if test server is already running
    const response = await axios.get(`${TEST_SERVER_URL}/health`);
    console.log('Test server is already running');
  } catch (error) {
    console.log('Starting test server...');
    require('./test-server');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Test server started');
  }
};

// Test the PDF generation
const testPdfExport = async () => {
  try {
    // First, start the test server if it's not running
    await startTestServer();
    
    // Prepare the slides payload
    const slides = [
      `${TEST_SERVER_URL}/slide/1`,
      `${TEST_SERVER_URL}/slide/2`,
      `${TEST_SERVER_URL}/slide/3`,
      `${TEST_SERVER_URL}/slide/4`
    ];
    
    console.log('Testing PDF export with the following slides:');
    slides.forEach((slide, index) => {
      console.log(`Slide ${index + 1}: ${slide}`);
    });
    
    // Prepare the export request payload
    const requestPayload = {
      urls: slides,
      dimensions: {
        width: 1920,
        height: 1080
      },
      quality: 100
    };
    
    console.log(`Sending request to Puppeteer service at ${PUPPETEER_SERVICE_URL}/export-slides`);
    
    // Send request to puppeteer service
    const response = await axios.post(
      `${PUPPETEER_SERVICE_URL}/export-slides`,
      requestPayload,
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      }
    );
    
    // Save the PDF to file
    const pdfData = response.data;
    fs.writeFileSync(OUTPUT_FILE, Buffer.from(pdfData));
    
    console.log(`PDF successfully generated and saved to ${OUTPUT_FILE}`);
    console.log(`File size: ${Buffer.from(pdfData).length} bytes`);
    
    // Also save a copy to the output directory with a unique name
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const uniqueFileName = `presentation-${uuidv4()}.pdf`;
    const outputPath = path.join(outputDir, uniqueFileName);
    fs.writeFileSync(outputPath, Buffer.from(pdfData));
    
    console.log(`Additional copy saved to ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error('Error during PDF export test:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    return false;
  }
};

// Run the test
testPdfExport()
  .then(success => {
    if (success) {
      console.log('PDF export test completed successfully');
    } else {
      console.error('PDF export test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error during test:', error);
    process.exit(1);
  }); 
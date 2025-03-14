const fs = require('fs');
const path = require('path');
const http = require('http');
const { generateTestHtml } = require('./test-html');

// Configuration
const SERVICE_HOST = 'localhost';
const SERVICE_PORT = 3001;

// Helper function to make HTTP requests
const makeRequest = (endpoint, data) => {
  return new Promise((resolve, reject) => {
    // Convert data to JSON string
    const postData = JSON.stringify(data);
    
    // Request options
    const options = {
      hostname: SERVICE_HOST,
      port: SERVICE_PORT,
      path: `/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    // Make the request
    const req = http.request(options, (res) => {
      let responseData = '';
      
      // Collect response data
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      // Handle response completion
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    // Send the request data
    req.write(postData);
    req.end();
  });
};

// Test screenshot generation
const testScreenshot = async () => {
  console.log('Testing screenshot generation...');
  
  try {
    // Generate test HTML
    const html = generateTestHtml();
    
    // Options for the screenshot
    const options = {
      width: 1920,
      height: 1080,
      scale: 1
    };
    
    // Make request to the screenshot endpoint
    const result = await makeRequest('screenshot', { html, options });
    
    console.log('Screenshot generated successfully:');
    console.log(result);
    console.log(`Full URL: http://${SERVICE_HOST}:${SERVICE_PORT}${result.url}`);
    console.log('-----------------------------------');
    
    return result;
  } catch (error) {
    console.error('Screenshot test failed:', error.message);
    return null;
  }
};

// Test PDF generation
const testPdf = async () => {
  console.log('Testing PDF generation...');
  
  try {
    // Generate test HTML
    const html = generateTestHtml();
    
    // Options for the PDF
    const options = {
      format: 'A4',
      landscape: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };
    
    // Make request to the PDF endpoint
    const result = await makeRequest('pdf', { html, options });
    
    console.log('PDF generated successfully:');
    console.log(result);
    console.log(`Full URL: http://${SERVICE_HOST}:${SERVICE_PORT}${result.url}`);
    console.log('-----------------------------------');
    
    return result;
  } catch (error) {
    console.error('PDF test failed:', error.message);
    return null;
  }
};

// Test custom size PDF generation
const testCustomSizePdf = async () => {
  console.log('Testing custom size PDF generation...');
  
  try {
    // Generate test HTML
    const html = generateTestHtml();
    
    // Options for the PDF with custom dimensions (16:9 presentation size)
    const options = {
      width: '1600px',
      height: '900px',
      printBackground: true
    };
    
    // Make request to the PDF endpoint
    const result = await makeRequest('pdf', { html, options });
    
    console.log('Custom size PDF generated successfully:');
    console.log(result);
    console.log(`Full URL: http://${SERVICE_HOST}:${SERVICE_PORT}${result.url}`);
    console.log('-----------------------------------');
    
    return result;
  } catch (error) {
    console.error('Custom size PDF test failed:', error.message);
    return null;
  }
};

// Run all tests
const runAllTests = async () => {
  try {
    console.log('Running all Puppeteer service tests...');
    console.log('===================================');
    
    await testScreenshot();
    await testPdf();
    await testCustomSizePdf();
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
};

// Execute all tests if this file is run directly
if (require.main === module) {
  runAllTests();
}

// Export test functions
module.exports = {
  testScreenshot,
  testPdf,
  testCustomSizePdf,
  runAllTests
};
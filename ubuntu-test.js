const http = require('http');
const fs = require('fs');
const path = require('path');

// Generate a simple HTML for testing
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Ubuntu Puppeteer Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(45deg, #f3f4f6, #dbeafe);
    }
    .slide {
      width: 1600px;
      height: 900px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    h1 {
      color: #1e40af;
      font-size: 48px;
      margin-bottom: 20px;
    }
    p {
      color: #4b5563;
      font-size: 24px;
      max-width: 80%;
      text-align: center;
    }
    .timestamp {
      margin-top: 40px;
      font-size: 18px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="slide">
    <h1>Ubuntu Puppeteer Test</h1>
    <p>This is a test of the Puppeteer service running on Ubuntu.</p>
    <p class="timestamp">Generated at: ${new Date().toISOString()}</p>
  </div>
</body>
</html>
`;

// Options for the screenshot
const screenshotOptions = {
  width: 1600,
  height: 900,
  scale: 1
};

// Options for the PDF
const pdfOptions = {
  format: 'A4',
  landscape: true
};

// Helper function to make HTTP requests
function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
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
    
    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

// Run the tests
async function runTests() {
  try {
    console.log('Testing the Puppeteer service on Ubuntu...');
    
    // Test screenshot generation
    console.log('\nGenerating screenshot...');
    const screenshotResult = await makeRequest('screenshot', {
      html,
      options: screenshotOptions
    });
    console.log('Screenshot generated successfully:');
    console.log(screenshotResult);
    
    // Test PDF generation
    console.log('\nGenerating PDF...');
    const pdfResult = await makeRequest('pdf', {
      html,
      options: pdfOptions
    });
    console.log('PDF generated successfully:');
    console.log(pdfResult);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the tests
runTests();
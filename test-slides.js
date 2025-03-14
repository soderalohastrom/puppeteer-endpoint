const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const axios = require('axios');

// Create a simple Express app to serve test slide pages
const app = express();
const PORT = 3002;
const PUPPETEER_SERVICE_URL = 'http://localhost:3001';

// Create directory for test files
const testDir = path.join(__dirname, 'test-slides');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Generate sample slide HTML files
const generateTestSlides = () => {
  const colors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#f368e0'];
  const titles = ['First Slide', 'Second Slide', 'Third Slide', 'Fourth Slide'];
  
  for (let i = 0; i < 4; i++) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Slide ${i+1}</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${colors[i]};
            color: white;
            font-family: Arial, sans-serif;
          }
          .slide {
            width: 768px;
            height: 1024px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
          }
          h1 {
            font-size: 60px;
            margin-bottom: 30px;
          }
          p {
            font-size: 30px;
            max-width: 80%;
            line-height: 1.4;
          }
          .slide-number {
            position: absolute;
            bottom: 30px;
            right: 30px;
            font-size: 24px;
            opacity: 0.8;
          }
          .image-container {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .image-container img {
            max-width: 200px;
            border: 2px solid white;
            border-radius: 5px;
            margin-bottom: 10px;
          }
          .bg-image-test {
            width: 200px;
            height: 100px;
            margin-top: 15px;
            background-image: url('https://picsum.photos/seed/${i+10}/200/100');
            background-size: cover;
            background-position: center;
            border: 2px solid white;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="slide">
          <h1>${titles[i]}</h1>
          <p>This is a test slide for the Puppeteer service. This slide demonstrates the appearance and layout of a slide with the dimensions 768×1024 pixels (3:4 aspect ratio).</p>
          
          <div class="image-container">
            <img src="https://picsum.photos/seed/${i+1}/200/300" alt="Test image" />
            <span>Regular IMG tag (200×300)</span>
            
            <div class="bg-image-test"></div>
            <span>CSS Background Image (200×100)</span>
          </div>
          
          <div class="slide-number">Slide ${i+1}/4</div>
        </div>
      </body>
      </html>
    `;
    
    const filePath = path.join(testDir, `slide-${i+1}.html`);
    fs.writeFileSync(filePath, html);
    console.log(`Created test slide: ${filePath}`);
  }
};

// Serve the static slides
app.use('/slides', express.static(testDir));

// Start the test server
const startTestServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Test server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
};

// Test the screenshots endpoint
const testScreenshots = async () => {
  console.log('\n--- Testing Screenshots Endpoint ---');
  
  const slideUrls = [
    `http://localhost:${PORT}/slides/slide-1.html`,
    `http://localhost:${PORT}/slides/slide-2.html`,
    `http://localhost:${PORT}/slides/slide-3.html`,
    `http://localhost:${PORT}/slides/slide-4.html`
  ];
  
  try {
    console.log(`Making request to ${PUPPETEER_SERVICE_URL}/screenshots with 4 slides...`);
    const response = await axios.post(`${PUPPETEER_SERVICE_URL}/screenshots`, {
      urls: slideUrls,
      dimensions: {
        width: 768,
        height: 1024
      }
    });
    
    console.log('Screenshots generated successfully:');
    console.log(response.data);
    
    return response.data.imagePaths;
  } catch (error) {
    console.error('Error testing screenshot endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

// Test the PDF generation endpoint
const testPdfGeneration = async (imagePaths) => {
  console.log('\n--- Testing PDF Generation Endpoint ---');
  
  if (!imagePaths || imagePaths.length === 0) {
    console.log('No image paths provided. Skipping PDF test.');
    return;
  }
  
  try {
    console.log(`Making request to ${PUPPETEER_SERVICE_URL}/generate-pdf...`);
    const response = await axios.post(
      `${PUPPETEER_SERVICE_URL}/generate-pdf`,
      {
        imagePaths,
        dimensions: {
          width: 768,
          height: 1024
        }
      },
      {
        responseType: 'arraybuffer'
      }
    );
    
    const pdfPath = path.join(__dirname, 'test-output.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(response.data));
    
    console.log(`PDF generated successfully and saved to: ${pdfPath}`);
    console.log(`PDF size: ${response.data.byteLength} bytes`);
    
    // Try to open the PDF with the default viewer
    try {
      let command = '';
      switch (process.platform) {
        case 'darwin':
          command = `open "${pdfPath}"`;
          break;
        case 'win32':
          command = `start "" "${pdfPath}"`;
          break;
        default:
          command = `xdg-open "${pdfPath}"`;
      }
      
      exec(command, (error) => {
        if (error) {
          console.log(`Note: Could not automatically open the PDF file. Please open manually: ${pdfPath}`);
        }
      });
    } catch (openError) {
      console.log(`Note: Could not automatically open the PDF file. Please open manually: ${pdfPath}`);
    }
  } catch (error) {
    console.error('Error testing PDF generation endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

// Test the combined endpoint
const testExportSlides = async () => {
  console.log('\n--- Testing Export Slides Endpoint (Combined) ---');
  
  const slideUrls = [
    `http://localhost:${PORT}/slides/slide-1.html`,
    `http://localhost:${PORT}/slides/slide-2.html`,
    `http://localhost:${PORT}/slides/slide-3.html`,
    `http://localhost:${PORT}/slides/slide-4.html`
  ];
  
  try {
    console.log(`Making request to ${PUPPETEER_SERVICE_URL}/export-slides...`);
    const response = await axios.post(
      `${PUPPETEER_SERVICE_URL}/export-slides`,
      {
        urls: slideUrls,
        dimensions: {
          width: 768,
          height: 1024
        }
      },
      {
        responseType: 'arraybuffer'
      }
    );
    
    const pdfPath = path.join(__dirname, 'test-export.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(response.data));
    
    console.log(`Export PDF generated successfully and saved to: ${pdfPath}`);
    console.log(`PDF size: ${response.data.byteLength} bytes`);
    
    // Try to open the PDF with the default viewer
    try {
      let command = '';
      switch (process.platform) {
        case 'darwin':
          command = `open "${pdfPath}"`;
          break;
        case 'win32':
          command = `start "" "${pdfPath}"`;
          break;
        default:
          command = `xdg-open "${pdfPath}"`;
      }
      
      exec(command, (error) => {
        if (error) {
          console.log(`Note: Could not automatically open the PDF file. Please open manually: ${pdfPath}`);
        }
      });
    } catch (openError) {
      console.log(`Note: Could not automatically open the PDF file. Please open manually: ${pdfPath}`);
    }
  } catch (error) {
    console.error('Error testing export slides endpoint:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
};

// Run all tests sequentially
const runTests = async () => {
  try {
    // Generate test slides
    generateTestSlides();
    
    // Start the test server
    const server = await startTestServer();
    
    // Check if Puppeteer service is running
    try {
      await axios.get(`${PUPPETEER_SERVICE_URL}/health`);
      console.log('Puppeteer service is up and running.');
    } catch (error) {
      console.error('Error: Puppeteer service does not appear to be running. Please start it before running tests.');
      console.log('To start the service, run: node index.js');
      server.close();
      return;
    }
    
    // Run tests
    console.log('\nStarting tests...');
    
    // Test the screenshots endpoint
    const imagePaths = await testScreenshots();
    
    // Test the PDF generation endpoint
    if (imagePaths) {
      await testPdfGeneration(imagePaths);
    }
    
    // Test the combined endpoint
    await testExportSlides();
    
    console.log('\nAll tests completed.');
    
    // Keep the server running so screenshots can be viewed
    console.log('\nTest server will remain running. Press Ctrl+C to stop.');
    console.log('You can view the test slides at:');
    for (let i = 1; i <= 4; i++) {
      console.log(`- http://localhost:${PORT}/slides/slide-${i}.html`);
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
};

// Run the tests
runTests(); 
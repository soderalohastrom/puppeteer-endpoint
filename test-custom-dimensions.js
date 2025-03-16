// Test script to verify custom dimensions work properly
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PUPPETEER_SERVICE_URL = 'http://localhost:3500';

async function testCustomDimensions() {
  console.log('=== Testing Custom Dimensions ===');
  
  try {
    // Test with default dimensions (should use 768x1024)
    console.log('\n1. Testing default dimensions (should use 768x1024)');
    const defaultResponse = await axios.post(`${PUPPETEER_SERVICE_URL}/export-slides`, {
      urls: ['http://localhost:3006/slides/slide-1.html']
    }, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(path.join(__dirname, 'test-default.pdf'), Buffer.from(defaultResponse.data));
    console.log(`Default dimensions PDF saved to test-default.pdf (${defaultResponse.data.byteLength} bytes)`);
    
    // Test with custom dimensions
    console.log('\n2. Testing custom dimensions (1000x800)');
    const customResponse = await axios.post(`${PUPPETEER_SERVICE_URL}/export-slides`, {
      urls: ['http://localhost:3006/slides/slide-1.html'],
      dimensions: {
        width: 1000,
        height: 800
      }
    }, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(path.join(__dirname, 'test-custom.pdf'), Buffer.from(customResponse.data));
    console.log(`Custom dimensions PDF saved to test-custom.pdf (${customResponse.data.byteLength} bytes)`);
    
    // Test with only width specified
    console.log('\n3. Testing partial dimensions (width only: 500px)');
    const partialResponse = await axios.post(`${PUPPETEER_SERVICE_URL}/export-slides`, {
      urls: ['http://localhost:3006/slides/slide-1.html'],
      dimensions: {
        width: 500
      }
    }, { responseType: 'arraybuffer' });
    
    fs.writeFileSync(path.join(__dirname, 'test-partial.pdf'), Buffer.from(partialResponse.data));
    console.log(`Partial dimensions PDF saved to test-partial.pdf (${partialResponse.data.byteLength} bytes)`);
    
    console.log('\nAll tests completed.');
    console.log('Use pdfinfo test-*.pdf to verify the dimensions of each PDF.');
    
  } catch (error) {
    console.error('Error in testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Make sure test-slides server is running first
axios.get('http://localhost:3006/slides/slide-1.html')
  .then(() => {
    console.log('Test slides server is running. Starting tests...');
    testCustomDimensions();
  })
  .catch(error => {
    console.error('Error: Test slides server is not running.');
    console.error('Please run "node test-slides.js" in another terminal first.');
    process.exit(1);
  }); 
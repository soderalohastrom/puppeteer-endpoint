const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test URLs - replace with your actual test URLs
const testUrls = [
  'https://next-dev.kelleher-international.com/test-slides/slide1.html',
  'https://next-dev.kelleher-international.com/test-slides/slide2.html',
  'https://next-dev.kelleher-international.com/test-slides/slide3.html'
];

// Test the export-slides endpoint
async function testExportSlides() {
  try {
    console.log('Testing /export-slides endpoint...');
    
    const response = await axios.post('http://localhost:3500/export-slides', {
      urls: testUrls,
      dimensions: {
        width: 800,
        height: 600
      },
      format: 'jpeg',
      quality: 90
    }, {
      responseType: 'arraybuffer'
    });
    
    // Save the PDF
    const outputPath = path.join(__dirname, 'test-export-slides.pdf');
    fs.writeFileSync(outputPath, response.data);
    
    console.log('PDF saved to ' + outputPath);
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data.toString());
    }
  }
}

testExportSlides();

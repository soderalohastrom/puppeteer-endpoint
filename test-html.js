const fs = require('fs');
const path = require('path');

// Generate a simple HTML with current timestamp for testing
const generateTestHtml = () => {
  const timestamp = new Date().toISOString();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Puppeteer Test - ${timestamp}</title>
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
        <h1>Puppeteer Service Test</h1>
        <p>This is a test HTML page generated to test the Puppeteer service.</p>
        <p class="timestamp">Generated at: ${timestamp}</p>
      </div>
    </body>
    </html>
  `;
};

// Save the test HTML to a file
const saveTestHtml = () => {
  const html = generateTestHtml();
  const filePath = path.join(__dirname, 'test.html');
  fs.writeFileSync(filePath, html);
  console.log(`Test HTML saved to ${filePath}`);
  return html;
};

// Export functions
module.exports = {
  generateTestHtml,
  saveTestHtml
};

// If run directly
if (require.main === module) {
  saveTestHtml();
}
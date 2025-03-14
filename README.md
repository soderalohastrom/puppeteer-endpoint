# Puppeteer Endpoint Service

A microservice for generating screenshots and PDFs from web pages using Puppeteer. This service is designed to work with slide presentation applications to facilitate exporting slide decks as PDFs.

## Features

- Convert web pages (slides) to high-quality screenshots
- Generate PDFs from screenshots with precise dimensions
- Support for 768×1024 pixel slides (3:4 aspect ratio)
- Handle CSS background images with improved wait strategies
- High-resolution output with deviceScaleFactor: 2
- Customizable dimensions and quality settings

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/puppeteer-endpoint.git
cd puppeteer-endpoint

# Install dependencies
npm install
```

## Prerequisites

For Linux environments (e.g., Ubuntu), you'll need to install the following dependencies:

```bash
sudo apt-get update
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## Usage

### Starting the service

```bash
# Start the service
npm start

# The service will be available at http://localhost:3500
```

### API Endpoints

#### 1. Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Puppeteer service is running"
}
```

#### 2. Screenshots Endpoint

```
POST /screenshots
```

**Required Parameters:**
```json
{
  "urls": ["http://example.com/slide1", "http://example.com/slide2", ...]
}
```

**Optional Parameters:**
```json
{
  "dimensions": {
    "width": 768, 
    "height": 1024
  },
  "format": "jpeg", // Default is "jpeg". Can use "png" for lossless compression
  "quality": 85     // Default is 85. Range: 0-100, higher means better quality but larger files
}
```

**Response:**
```json
{
  "imagePaths": [
    "/path/to/slide-1-uuid.jpg",
    "/path/to/slide-2-uuid.jpg",
    ...
  ],
  "message": "Successfully captured X screenshots"
}
```

#### 3. PDF Generation Endpoint

```
POST /generate-pdf
```

**Required Parameters:**
```json
{
  "imagePaths": [
    "/path/to/slide-1-uuid.jpg",
    "/path/to/slide-2-uuid.jpg",
    ...
  ]
}
```

**Optional Parameters:**
```json
{
  "dimensions": {
    "width": 768,
    "height": 1024
  }
}
```

**Response:**
Binary PDF data with content-type `application/pdf`

**Important Note:** The `imagePaths` must be valid server-side paths from a previous call to the `/screenshots` endpoint.

#### 4. Combined Export Endpoint (Recommended)

```
POST /export-slides
```

**Required Parameters:**
```json
{
  "urls": ["http://example.com/slide1", "http://example.com/slide2", ...]
}
```

**Optional Parameters:**
```json
{
  "dimensions": {
    "width": 768,
    "height": 1024
  },
  "format": "jpeg", // Default is "jpeg"
  "quality": 85     // Default is 85
}
```

**Response:**
Binary PDF data with content-type `application/pdf`

## Testing

You can test the service using the included test scripts:

```bash
# Run the test server and generate test slides
node test-slides.js
```

This will:
1. Create sample HTML slide files
2. Start a local server on port 3002 to serve these files
3. Use the Puppeteer service to generate screenshots and PDFs
4. Save test output in the local directory

## Integration Example

Here's a simple example of using the service from a React application:

```javascript
const exportToPDF = async () => {
  try {
    // 1. Get the URLs of your slides
    const slideUrls = [
      "http://localhost:3000/slides/1/render",
      "http://localhost:3000/slides/2/render",
      "http://localhost:3000/slides/3/render",
      "http://localhost:3000/slides/4/render"
    ];
    
    // 2. Call the export-slides endpoint
    const response = await axios.post(
      "http://localhost:3500/export-slides",
      {
        urls: slideUrls,
        dimensions: {
          width: 768, 
          height: 1024
        },
        quality: 90 // Optional: increase quality
      },
      {
        responseType: 'blob' // Important for binary data
      }
    );
    
    // 3. Create download for the user
    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(pdfBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'presentation.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error exporting PDF:", error);
  }
};
```

## Production Deployment

For production deployment, we recommend:

1. **Using PM2 to manage the Node.js process:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "puppeteer-endpoint"
   ```

2. **Setting up a reverse proxy with Nginx:**
   See the included `nginx-config-ubuntu.conf` file for an example configuration.

3. **Environment Variables:**
   - `PORT`: The port on which the service will run (default: 3500)

## Troubleshooting

If background images aren't appearing in PDFs:

1. Ensure images are fully loaded on the source page before calling the API
2. Use absolute URLs for CSS background images
3. Check network requests in the browser console for any failed image loads
4. Consider adding custom image loading detection in your slides

For more detailed troubleshooting information, see the `make_pdf_from_slides_howto.md` file.

## License

MIT

---

Made with ❤️ for slide presentation applications
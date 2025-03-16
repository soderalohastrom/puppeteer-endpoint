# Technical Context: Puppeteer PDF Service

## Technologies used

### Core Technologies

1. **Node.js** - Server-side JavaScript runtime
   - Version: Latest LTS (based on package.json dependencies)
   - Used for the main application logic and API server

2. **Express.js** (v4.21.2)
   - Web framework for building the API endpoints
   - Handles routing, middleware, and HTTP responses

3. **Puppeteer** (v24.4.0)
   - Headless Chrome browser automation library
   - Used for rendering web pages and taking screenshots
   - Controls viewport sizes, scaling, and screenshot options

4. **PDF-lib** (v1.17.1)
   - PDF generation and manipulation library
   - Used to create multi-page PDFs from image files
   - Supports embedding JPEG images into PDF documents

### Supporting Libraries

1. **cors** (v2.8.5)
   - Middleware for enabling Cross-Origin Resource Sharing
   - Allows API access from different origins

2. **body-parser** (v1.20.3)
   - Middleware for parsing request bodies
   - Handles JSON and URL-encoded data

3. **uuid** (v11.1.0)
   - Generates unique identifiers
   - Used for creating unique filenames for screenshots and PDFs

4. **axios** (v1.8.3)
   - Promise-based HTTP client
   - Used in test scripts for making requests to the service

### Development Tools

1. **Postman**
   - API testing tool
   - Collection provided in `Puppeteer-Service-Postman.json`

2. **PM2**
   - Process manager for Node.js applications
   - Used for production deployment and management

## Development setup

### Local Development Environment

1. **Prerequisites**:
   - Node.js (latest LTS version recommended)
   - npm (comes with Node.js)
   - Chromium or Chrome browser installed

2. **Installation**:
   ```bash
   # Clone the repository (or copy files)
   git clone <repository-url>
   cd puppeteer-service
   
   # Install dependencies
   npm install
   ```

3. **Running the service**:
   ```bash
   # Start the main service (runs on port 3500)
   node index.js
   
   # Start the test server (runs on port 3002)
   node test-server.js
   ```

4. **Testing**:
   - Import the Postman collection for API testing
   - Use test scripts:
     - `node test-pdf-export.js` - Tests PDF export functionality
     - `node test-custom-dimensions.js` - Tests custom dimension support
     - `node test-slides.js` - Tests slide handling

### Production Deployment

1. **Using PM2**:
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start the service with PM2
   pm2 start index.js --name puppeteer-service
   
   # Save the PM2 configuration
   pm2 save
   
   # Set up PM2 to start on system boot
   pm2 startup
   ```

2. **Nginx Configuration**:
   - Nginx is used as a reverse proxy
   - Configuration files are provided: `nginx-config.conf`, `nginx-config-ubuntu.conf`

## Technical constraints

### EC2 Environment

1. **Platform**:
   - Linux (Ubuntu)
   - Limited memory and CPU resources
   - Server runs in UTC timezone (UTC+0:00)

2. **Puppeteer on Linux**:
   - Requires additional Chrome dependencies
   - Uses specific launch arguments:
     - `--no-sandbox`
     - `--disable-setuid-sandbox`
     - `--disable-dev-shm-usage`
     - `--disable-gpu`
     - `--disable-web-security`
     - `--font-render-hinting=none`

3. **Filesystem Constraints**:
   - Files are stored in the local filesystem
   - Output directory: `/home/ubuntu/puppeteer-service/output`
   - Public directory: `/home/ubuntu/puppeteer-service/public`

4. **Networking**:
   - The service runs on port 3500
   - Test server runs on port 3002
   - Production URL: `https://next-dev.kelleher-international.com/puppeteer`

5. **Performance Considerations**:
   - Puppeteer is memory-intensive
   - Screenshots of large pages may require more memory
   - Multiple concurrent requests may impact performance
   - PDF generation with many pages can be resource-intensive

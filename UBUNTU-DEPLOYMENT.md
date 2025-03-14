# Puppeteer Service Deployment on Ubuntu EC2

This document outlines the successful deployment of the Puppeteer Express.js microservice on the Ubuntu EC2 instance.

## What We've Done

1. **Created the Puppeteer Microservice**:
   - Express.js app with screenshot and PDF generation endpoints
   - Direct HTML content handling (no URL navigation)
   - Platform-specific configuration for Ubuntu Chromium
   - Robust error handling and logging

2. **Deployed to Ubuntu EC2 Instance**:
   - Set up the service at `/home/ubuntu/puppeteer-service/`
   - Installed necessary dependencies for Chromium on Ubuntu
   - Configured PM2 for process management
   - Set up Nginx for proxying requests and serving static files

3. **Configured Ubuntu-Specific Settings**:
   - Used existing Chromium browser: `/usr/bin/chromium-browser`
   - Applied special launch arguments:
     - `--no-sandbox`
     - `--disable-setuid-sandbox`
     - `--disable-dev-shm-usage`
     - `--disable-gpu`
     - `--disable-web-security`
     - `--font-render-hinting=none`

4. **Set Up Nginx Configuration**:
   - Added proxy configuration for the service
   - Configured static file serving for output files
   - Set up proper permissions for file access

5. **Tested the Service**:
   - Successfully generated screenshots
   - Successfully generated PDFs
   - Verified file accessibility through Nginx

## Access Points

- **Service Base URL**: `https://next-dev.kelleher-international.com/puppeteer-service/`
- **Health Check**: `https://next-dev.kelleher-international.com/puppeteer-service/health`
- **Output Files**: `https://next-dev.kelleher-international.com/puppeteer-service/output/`

## API Endpoints

### Screenshot Generation
```
POST /puppeteer-service/screenshot
```

Request body:
```json
{
  "html": "<html>...</html>",
  "options": {
    "width": 1920,
    "height": 1080,
    "scale": 1,
    "fullPage": false
  }
}
```

Response:
```json
{
  "success": true,
  "filename": "screenshot-1234567890.png",
  "url": "/puppeteer-service/output/screenshot-1234567890.png"
}
```

### PDF Generation
```
POST /puppeteer-service/pdf
```

Request body:
```json
{
  "html": "<html>...</html>",
  "options": {
    "format": "A4",
    "landscape": true,
    "margin": {
      "top": "0.4in",
      "right": "0.4in",
      "bottom": "0.4in",
      "left": "0.4in"
    }
  }
}
```

or with custom dimensions:

```json
{
  "html": "<html>...</html>",
  "options": {
    "width": "1600px",
    "height": "900px",
    "printBackground": true
  }
}
```

Response:
```json
{
  "success": true,
  "filename": "pdf-1234567890.pdf",
  "url": "/puppeteer-service/output/pdf-1234567890.pdf"
}
```

## Management

- **Starting/Stopping the Service**:
  ```bash
  pm2 start puppeteer-service   # Start the service
  pm2 stop puppeteer-service    # Stop the service
  pm2 restart puppeteer-service # Restart the service
  pm2 logs puppeteer-service    # View logs
  ```

- **Updating the Service**:
  1. Upload new files to `/home/ubuntu/puppeteer-service/`
  2. Run `pm2 restart puppeteer-service`

## Next Steps

1. Update the Next.js API routes to call this microservice:
   - `/pages/api/export-screenshot.ts`
   - `/pages/api/export-pdf.ts`

2. Test the end-to-end flow with the main application

3. Add monitoring and alerting for the service

## Troubleshooting

If you encounter issues with the service:
1. Check the service logs: `pm2 logs puppeteer-service`
2. Verify Chromium is installed: `which chromium-browser`
3. Check output directory permissions: `ls -la ~/puppeteer-service/output`
4. Test the service directly on the server: `cd ~/puppeteer-service && node ubuntu-test.js`
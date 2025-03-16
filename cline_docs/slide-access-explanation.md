# Understanding Slide Access in the Puppeteer PDF Service

## The URL Access Issue

When running the test scripts, you've noticed that we see URLs like:
- `http://localhost:3006/slides/slide-1.html`
- `http://localhost:3002/slide/1`

However, these aren't accessible externally for several important reasons:

## Why This Happens

1. **SSH Session Isolation**: When connected via SSH to the EC2 instance, any local servers running on ports (3002, 3006, 3500) are only accessible from within the server itself. The `localhost` reference is relative to the server, not your local machine.

2. **Multiple Test Servers**:
   - The main Puppeteer service runs on port 3500
   - `test-server.js` runs a test server on port 3002 (serves slides at `/slide/{number}`)
   - `test-slides.js` creates its own temporary server on port 3006 (serves slides at `/slides/slide-{number}.html`)

3. **Nginx Configuration**: When trying to access `https://next-dev.kelleher-international.com/slides/slide-1.html`, you get a 502 Bad Gateway error because Nginx isn't configured to proxy these specific paths to the appropriate internal server.

## How the System Actually Works

The key insight is that the **Puppeteer service doesn't need you to access the slides directly**. Here's how it works:

1. The Puppeteer service itself is the one accessing the slide URLs via its internal browser
2. When you make a request to `/export-slides`, the service:
   - Launches Puppeteer (headless Chrome)
   - Navigates to each slide URL internally (within the server)
   - Takes screenshots and creates the PDF
   - Returns the final PDF to you

This is exactly why the service exists - to access web content that might not be directly accessible to the client.

## Production Configuration

In a production environment, the recommended setup is:

1. Configure Nginx to expose the Puppeteer service at:
   ```
   https://next-dev.kelleher-international.com/puppeteer/
   ```

2. Configure Nginx to serve the actual slide HTML files at:
   ```
   https://next-dev.kelleher-international.com/slide/1
   https://next-dev.kelleher-international.com/slide/2
   etc.
   ```

3. Then your client application can call:
   ```
   POST /puppeteer/export-slides
   ```
   with the slide URLs, and the Puppeteer service handles the rest

## For Testing Purposes

For testing on the EC2 instance:
1. The test scripts will continue to work because they're running on the server and can access localhost
2. You can view the generated PDFs which should contain the correctly rendered slides
3. You don't need to directly access the slide HTML files unless you're debugging slide content

## Next Steps for Production

1. Update the Nginx configuration to properly proxy requests:
   ```
   # Proxy Puppeteer service
   location /puppeteer/ {
     proxy_pass http://localhost:3500/;
     # Additional proxy settings...
   }

   # Serve slide HTML files
   location /slide/ {
     root /home/ubuntu/puppeteer-service/test-slides/;
     rewrite ^/slide/(.*)$ /slide$1.html break;
   }
   ```

2. Ensure the Puppeteer service is properly calling the correct URLs in production (using the full hostname rather than localhost)

# Understanding test-server.js in the Puppeteer PDF Service

## What test-server.js Does

`test-server.js` is a simple Express server designed for internal testing of the Puppeteer PDF service. Its main functions are:

1. Runs a server on port 3002 that serves:
   - Static files from the `/test-slides` directory
   - Static files from the `/public` directory
   - A `/health` endpoint for checking server status
   - Individual slides via `/slide/{number}` routes

2. When run, it outputs:
   ```
   Test server running at http://localhost:3002
   Access slides at:
   - http://localhost:3002/slide/1
   - http://localhost:3002/slide/2
   - http://localhost:3002/slide/3
   - http://localhost:3002/slide/4
   ```

## Why It's Needed

The `test-server.js` script serves as a **test content provider** for the actual Puppeteer service. It creates a server that:

1. Holds the test slide HTML files that the Puppeteer service will access
2. Provides URLs that can be used in tests with the `/export-slides` endpoint
3. Allows for internal testing without requiring external web servers

## How To Verify It's Working

There are two ways to verify `test-server.js` is working:

1. **Direct method** (on the EC2 instance only):
   - Run `curl http://localhost:3002/health` and you should get an "OK" response
   - Run `curl http://localhost:3002/slide/1` and you should see HTML content

2. **Indirect method** (what you should use):
   - Run `node test-server.js` to start the server
   - Run `node test-pdf-export.js` to test the PDF export functionality
   - Examine the generated PDF file that should contain the test slides

## External Access Note

You're correct that you don't need to access this test server directly from outside the EC2 instance. It's purely for internal testing purposes:

1. The Puppeteer service itself accesses the test server via localhost
2. When you call the Puppeteer service endpoints, it interacts with the test server internally
3. You can simply examine the final PDF output to verify everything is working

In a production environment, you'd replace these test slides with actual web content, but the Puppeteer service would still handle accessing that content and generating the PDFs.

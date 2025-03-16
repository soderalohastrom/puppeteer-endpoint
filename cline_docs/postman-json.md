# Puppeteer PDF Service - Postman Collection

This Markdown file contains the Postman Collection JSON for testing all endpoints of the Puppeteer PDF Service. The collection has been updated to reflect the correct URL patterns and parameters for all endpoints.

## How to Use This Collection

1. Copy the JSON content below
2. In Postman, click "Import" > "Raw text" and paste the JSON
3. The collection will be imported with all endpoints ready to use

## Collection JSON

```json
{
  "info": {
    "name": "Puppeteer PDF Service (Production)",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "description": "API collection for the Puppeteer service running at https://next-dev.kelleher-international.com/puppeteer"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/health",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "health"
          ]
        },
        "description": "Check if the Puppeteer service is running"
      },
      "response": []
    },
    {
      "name": "Root Endpoint",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer"
          ]
        },
        "description": "Root endpoint for basic testing"
      },
      "response": []
    },
    {
      "name": "Get Latest PDF",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/get-latest-pdf",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "get-latest-pdf"
          ]
        },
        "description": "Get the URL of the most recently generated PDF"
      },
      "response": []
    },
    {
      "name": "Screenshot from HTML",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"html\": \"<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test Screenshot</h1><p>This is a test screenshot from HTML content.</p></body></html>\",\n    \"options\": {\n        \"width\": 1024,\n        \"height\": 768,\n        \"scale\": 2,\n        \"fullPage\": false\n    }\n}"
        },
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/screenshot",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "screenshot"
          ]
        },
        "description": "Generate a screenshot from raw HTML content"
      },
      "response": []
    },
    {
      "name": "Screenshots from URLs",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"urls\": [\n        \"https://next-dev.kelleher-international.com/slide/1\",\n        \"https://next-dev.kelleher-international.com/slide/2\"\n    ],\n    \"dimensions\": {\n        \"width\": 1920,\n        \"height\": 1080\n    },\n    \"format\": \"jpeg\",\n    \"quality\": 90\n}"
        },
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/screenshots",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "screenshots"
          ]
        },
        "description": "Generate screenshots from multiple URLs"
      },
      "response": []
    },
    {
      "name": "Generate PDF from Images",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"imagePaths\": [\n        \"/home/ubuntu/puppeteer-service/output/slide-1-8355b6da-fe5e-4e59-9e90-6ccf4bb53e7b.jpg\",\n        \"/home/ubuntu/puppeteer-service/output/slide-2-8e191299-49ac-4676-90c7-868f89ee7451.jpg\"\n    ],\n    \"dimensions\": {\n        \"width\": 1920,\n        \"height\": 1080\n    }\n}"
        },
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/generate-pdf",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "generate-pdf"
          ]
        },
        "description": "Generate a PDF from a list of image paths (Note: This requires actual server-side file paths)"
      },
      "response": []
    },
    {
      "name": "Export Slides to PDF",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/pdf"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n    \"urls\": [\n        \"https://next-dev.kelleher-international.com/slide/1\",\n        \"https://next-dev.kelleher-international.com/slide/2\",\n        \"https://next-dev.kelleher-international.com/slide/3\",\n        \"https://next-dev.kelleher-international.com/slide/4\"\n    ],\n    \"dimensions\": {\n        \"width\": 1920,\n        \"height\": 1080\n    },\n    \"quality\": 100\n}"
        },
        "url": {
          "raw": "https://next-dev.kelleher-international.com/puppeteer/export-slides",
          "protocol": "https",
          "host": [
            "next-dev",
            "kelleher-international",
            "com"
          ],
          "path": [
            "puppeteer",
            "export-slides"
          ]
        },
        "description": "Generate a PDF from slide URLs (one-step process)"
      },
      "response": []
    }
  ]
}
```

## Local Development Version

For local testing, use the following modifications:
- Replace the base URL with `http://localhost:3500`
- For the Export Slides endpoint, use slides from the test server: `http://localhost:3002/slide/1`, etc.
- For the Generate PDF endpoint, use your local file paths

## Notes
- The `Generate PDF from Images` endpoint requires actual file paths on the server
- The `Export Slides to PDF` endpoint has been updated to use the correct URL format (`/slide/{number}`)
- All endpoints now work as expected after the fixes

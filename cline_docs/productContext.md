# Product Context: Puppeteer PDF Service

## Why this project exists

The Puppeteer PDF Service exists as a standalone microservice to handle browser-based operations that are difficult to implement within a standard web application. It specifically addresses the challenges of:

1. Generating high-quality screenshots from HTML content or URLs
2. Converting these screenshots into professional PDFs
3. Providing a consistent, scalable approach to creating presentation materials
4. Enabling slide-based presentations to be exported as PDF documents

By isolating these operations in a separate microservice, the main application can offload resource-intensive browser automation tasks to a dedicated service optimized for these operations.

## What problems it solves

1. **Cross-platform consistency**: Ensures PDFs and screenshots look identical regardless of the client's device or browser
2. **Resource isolation**: Prevents the main application from being slowed down by resource-intensive browser operations
3. **Performance optimization**: Dedicated service optimized for Puppeteer operations
4. **Scalability**: Can be scaled independently based on screenshot/PDF generation needs
5. **API simplification**: Complex browser automation operations exposed through simple API endpoints
6. **Multi-step processing**: Handles the complete pipeline from HTML content to screenshots to final PDF assembly

## How it should work

The service operates through several key endpoints:

1. **Health Check (`/health`)**: Verifies the service is operational
2. **Root Endpoint (`/`)**: Simple verification the service is running
3. **Screenshot Generation (`/screenshot`)**: Converts HTML content to a screenshot with configurable options
4. **Batch Screenshots (`/screenshots`)**: Generates screenshots from multiple URLs with consistent dimensions
5. **PDF Generation (`/generate-pdf`)**: Creates a PDF from existing images/screenshots
6. **One-Step PDF Export (`/export-slides`)**: Streamlined process that handles URL fetching, screenshot generation, and PDF compilation
7. **Latest PDF Access (`/get-latest-pdf`)**: Retrieves the URL of the most recently generated PDF

The typical workflow involves:
1. Client sends a request to one of the endpoints with the required parameters
2. Service launches a headless browser using Puppeteer
3. For screenshots, it navigates to URLs or renders HTML content and captures images
4. For PDFs, it either compiles existing images or captures screenshots first then creates a PDF
5. The service returns the path to the generated files or the PDF binary data

Currently, there are issues with the PDF generation endpoints that need to be resolved to ensure the service functions as expected.

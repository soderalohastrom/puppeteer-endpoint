# System Patterns: Puppeteer PDF Service

## How the system is built

The Puppeteer PDF Service is built as a standalone Express.js microservice with a straightforward API-based architecture. The system follows these key architectural patterns:

1. **Microservice Architecture**: Isolates the PDF and screenshot generation functionality into a dedicated service that can be scaled independently.

2. **RESTful API Design**: Exposes functionality through HTTP endpoints following REST principles:
   - GET endpoints for retrieving information (`/health`, `/`, `/get-latest-pdf`)
   - POST endpoints for operations that create resources (`/screenshot`, `/screenshots`, `/generate-pdf`, `/export-slides`)

3. **Stateless Processing**: Each request is handled independently, with no session state maintained between requests.

4. **File-based Storage**: Generated assets (screenshots, PDFs) are stored in the local filesystem:
   - Screenshots and PDFs are saved to the `/output` directory
   - Static files are served from the `/public` directory

5. **Service-Oriented Design**: Clear separation of concerns with dedicated endpoints for specific operations.

## Key technical decisions

1. **Express.js for API Framework**:
   - Lightweight, flexible web framework
   - Easy to set up middleware for CORS, body parsing, etc.
   - Static file serving capabilities

2. **Puppeteer for Browser Automation**:
   - Headless Chrome control for consistent rendering
   - Platform-specific configurations to handle different OS environments
   - Advanced screenshot capabilities with customizable viewports

3. **PDF-lib for PDF Generation**:
   - JavaScript library for PDF manipulation
   - Embeds images into PDF documents
   - Configurable page size and layout options

4. **UUID for File Naming**:
   - Ensures unique filenames for generated assets
   - Prevents collisions in high-volume scenarios

5. **Filesystem for Storage**:
   - Simple, direct storage of generated files
   - Accessible via URL for client retrieval

6. **Error Handling Strategy**:
   - Structured error responses with status codes
   - Detailed error messages in development, limited details in production
   - Proper logging of errors for debugging

## Architecture patterns

1. **Request Processing Pipeline**:
   ```
   Client Request → Express Router → Endpoint Handler → Puppeteer Processing → File Storage → Response
   ```

2. **Screenshot Generation Workflow**:
   ```
   Launch Browser → Configure Viewport → Load Content → Wait for Rendering → Capture Screenshot → Save File → Return URL
   ```

3. **PDF Generation Workflow**:
   ```
   Create PDF Document → For Each Image: Read File → Embed in PDF → Add Page → Draw Image → Save PDF → Return File
   ```

4. **Composite Endpoint Pattern** (for `/export-slides`):
   ```
   Process URLs → Generate Screenshots → Create PDF → Return PDF Binary
   ```

5. **Resource Cleanup**:
   - Temporary screenshots are deleted after PDF generation in one-step processes
   - Browser instances are closed after use to free memory

6. **Configuration Management**:
   - Platform-specific browser settings (Linux vs macOS vs Windows)
   - Environment variable-based configuration (PORT, NODE_ENV)
   - Default values provided for missing configurations

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3500;

// Platform-specific Puppeteer configurations
const getPuppeteerConfig = () => {
  const platform = os.platform();
  const baseConfig = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  // Add platform-specific configurations
  if (platform === 'linux') {
    // Linux needs these additional arguments based on Ubuntu guide
    baseConfig.args.push(
      '--disable-dev-shm-usage',  // Use /tmp instead of /dev/shm
      '--disable-gpu',            // Disable GPU hardware acceleration
      '--disable-web-security',   // Disable CORS for local testing
      '--font-render-hinting=none' // Better font rendering
    );
    
    // Use the detected Chromium browser
    baseConfig.executablePath = '/usr/bin/chromium-browser';
  } else if (platform === 'darwin') {
    // macOS specific settings if needed
    console.log('Running on macOS');
  } else if (platform === 'win32') {
    // Windows specific settings if needed
    console.log('Running on Windows');
  }

  console.log(`Configured Puppeteer for platform: ${platform}`, baseConfig);
  return baseConfig;
};

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure public directory exists for static files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the public directory
app.use('/public', express.static(publicDir));

// Serve static files from output directory
app.use('/output', express.static(outputDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Puppeteer service is running' });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Puppeteer service root' });
});

// Get latest PDF endpoint
app.get('/get-latest-pdf', (req, res) => {
  try {
    // Get all PDFs in the output directory
    const pdfFiles = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        name: file,
        path: `/output/${file}`,
        time: fs.statSync(path.join(outputDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by modification time, newest first
    
    if (pdfFiles.length > 0) {
      return res.status(200).json({ latestPdf: pdfFiles[0].path });
    } else {
      return res.status(404).json({ message: 'No PDF files found' });
    }
  } catch (error) {
    console.error('Error getting latest PDF:', error);
    return res.status(500).json({ message: 'Error getting latest PDF', error: error.message });
  }
});

// Screenshot endpoint for HTML content
app.post('/screenshot', async (req, res) => {
  const { html, options = {} } = req.body;
  
  if (!html) {
    return res.status(400).json({ message: 'HTML content is required' });
  }
  
  // Set default options
  const width = options.width || 768;
  const height = options.height || 1024;
  const scale = options.scale || 1;
  const fullPage = options.fullPage || false;
  
  try {
    console.log(`Processing screenshot with dimensions: ${width}x${height}, scale: ${scale}`);
    
    // Launch browser with appropriate settings
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: width,
      height: height,
      deviceScaleFactor: scale * 2 // Higher resolution
    });
    
    // Create a unique filename
    const filename = `screenshot-${uuidv4()}.png`;
    const outputPath = path.join(outputDir, filename);
    
    // Set content directly instead of navigating to a URL
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the custom event that signals all content is loaded
    try {
      await page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.allContentLoaded) return resolve();
          document.addEventListener('AllContentLoaded', resolve, { once: true });
          setTimeout(resolve, 5000); // Fallback timeout of 5 seconds
        });
      });
    } catch (eventError) { console.log('Error waiting for AllContentLoaded event:', eventError); }
    
    // Add a small delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: fullPage,
      clip: fullPage ? undefined : {
        x: 0,
        y: 0,
        width: width,
        height: height
      }
    });
    
    // Close browser
    await browser.close();
    
    return res.status(200).json({ success: true, url: `/output/${filename}` });
  } catch (error) {
    console.error('Screenshot generation error:', error);
    return res.status(500).json({ message: 'Error generating screenshot', error: error.message });
  }
});

// Screenshot endpoint
app.post('/screenshots', async (req, res) => {
  const { urls, dimensions = {}, format = 'jpeg', quality = 85 } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ message: 'Valid URLs array is required' });
  }
  
  // Define default values for dimensions
  const width = dimensions.width || 768;
  const height = dimensions.height || 1024;
  
  try {
    console.log(`Processing ${urls.length} screenshots with dimensions: ${width}x${height} (custom: ${!!dimensions.width})`);
    
    // Launch browser with appropriate settings
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null // We'll set this per page
    });
    
    const imagePaths = [];
    
    // Process each URL sequentially for stability
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Taking screenshot ${i+1}/${urls.length} from URL: ${url}`);
      
      const page = await browser.newPage();
      
      // Set viewport to desired dimensions
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 2 // Creates higher resolution images
      });
      
      // Create a unique filename
      const filename = `slide-${i+1}-${uuidv4()}.jpg`;
      const outputPath = path.join(outputDir, filename);
      
      // Navigation options with generous timeout
      const navigationOptions = { 
        waitUntil: 'networkidle2', 
        timeout: 30000 // 30 second timeout for complex slides
      };
      
      try {
        // Navigate to URL
        await page.goto(url, navigationOptions);
        
        // Add a small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms
        
        // Enhanced wait for all images and background images to load and be visible
        await page.evaluate(async () => {
          // Wait for all <img> elements to load
          const imgElements = document.querySelectorAll('img');
          console.log(`Found ${imgElements.length} <img> elements on the page`);
          const imgPromises = [];
          
          for (const img of imgElements) {
            if (img.complete && img.naturalWidth !== 0) continue;
            const imgPromise = new Promise(resolve => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve); // Also handle error case
            });
            imgPromises.push(imgPromise);
          }
          
          // Wait for CSS background images
          console.log('Checking for CSS background images...');
          const elements = [...document.querySelectorAll('*')];
          const backgroundElements = elements.filter(el => {
            const style = window.getComputedStyle(el);
            const backgroundImage = style.backgroundImage;
            return backgroundImage && backgroundImage !== 'none';
          });
          
          console.log(`Found ${backgroundElements.length} elements with CSS background images`);
          
          // For each element with a background image, create a promise that resolves when the image loads
          const backgroundImagePromises = backgroundElements.map(el => {
            const style = window.getComputedStyle(el);
            const backgroundImage = style.backgroundImage;
            
            // Extract URL from the backgroundImage property
            const match = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (!match) return Promise.resolve();
            
            const url = match[1];
            console.log(`Loading background image: ${url}`);
            
            return new Promise(resolve => {
              const img = new Image();
              img.onload = () => {
                console.log(`Background image loaded: ${url}`);
                resolve();
              };
              img.onerror = () => {
                console.log(`Failed to load background image: ${url}`);
                resolve();
              };
              img.src = url;
            });
          });
          
          console.log(`Waiting for ${backgroundImagePromises.length} background images to load`);
          
          // Wait for all regular images and background images
          const allPromises = [...imgPromises, ...backgroundImagePromises];
          console.log(`Waiting for ${allPromises.length} images to load...`);
          
          if (allPromises.length > 0) {
            await Promise.all(allPromises);
            console.log('All images loaded successfully');
          } else {
            console.log('No images to wait for');
          }
        });
        
        // Take a longer additional pause for CSS rendering and animations
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take screenshot
        await page.screenshot({
          path: outputPath,
          type: format,
          quality: quality,
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: width,
            height: height
          }
        });
        
        // Store the path for later PDF generation
        imagePaths.push(outputPath);
        console.log(`Screenshot saved to ${outputPath}`);
      } catch (pageError) {
        console.error(`Error processing screenshot for URL ${url}:`, pageError);
        // Continue with other screenshots
      }
      
      // Close the page to free memory
      await page.close();
    }
    
    // Close the browser
    await browser.close();
    
    if (imagePaths.length === 0) {
      return res.status(500).json({ message: 'Failed to generate any screenshots' });
    }
    
    return res.status(200).json({ imagePaths, message: `Successfully captured ${imagePaths.length} screenshots` });
  } catch (error) {
    console.error('Screenshot generation error:', error);
    return res.status(500).json({ message: 'Error generating screenshots', error: error.message });
  }
});

// PDF endpoint
app.post('/generate-pdf', async (req, res) => {
  const { imagePaths, dimensions = {} } = req.body;
  
  if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
    return res.status(400).json({ message: 'Valid imagePaths array is required' });
  }
  
  // Define default values for dimensions
  const width = dimensions.width || 768;
  const height = dimensions.height || 1024;
  
  try {
    console.log(`Generating PDF from ${imagePaths.length} images with dimensions: ${width}x${height} (custom: ${!!dimensions.width})`);
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add each image as a page
    for (const imagePath of imagePaths) {
      if (!fs.existsSync(imagePath)) {
        console.warn(`Warning: Image file ${imagePath} not found, skipping`);
        continue;
      }
      
      // Read the image file
      const imageBytes = fs.readFileSync(imagePath);
      
      try {
        // Embed the JPEG image in the PDF
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        
        // Add a page with the same dimensions as the image
        const page = pdfDoc.addPage([width, height]);
        
        // Draw the image on the page
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: width,
          height: height
        });
        
        console.log(`Added image ${imagePath} to PDF`);
      } catch (embedError) {
        console.error(`Error embedding image ${imagePath}:`, embedError);
      }
    }
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    
    // Generate a unique filename for the PDF
    const pdfFilename = `presentation-${uuidv4()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
    
    // Save a copy of the PDF locally for debugging
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`PDF saved to ${pdfPath}`);
    
    // Send the PDF bytes
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    
    // Clean up image files (can be done asynchronously)
    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error(`Error deleting file ${imagePath}:`, err);
        });
      }
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
});

// Route for combined screenshot and PDF generation
app.post('/export-slides', async (req, res) => {
  const { urls, dimensions = {}, format = 'jpeg', quality = 85 } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ message: 'Valid URLs array is required' });
  }
  
  // Define default values for dimensions
  const width = dimensions.width || 1920;
  const height = dimensions.height || 1080;
  
  try {
    console.log(`Processing export request for ${urls.length} slides with dimensions: ${width}x${height} (custom: ${!!dimensions.width})`);
    
    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: null
    });
    
    const imagePaths = [];
    
    // Take screenshots
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const page = await browser.newPage();
      
      await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 2
      });
      
      const filename = `slide-${i+1}-${uuidv4()}.jpg`;
      const outputPath = path.join(outputDir, filename);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        // Replace waitForTimeout with a manual delay using setTimeout wrapped in a Promise
        
        // Wait for the custom event that signals all content is loaded
        try {
          await page.evaluate(() => {
            return new Promise((resolve) => {
              if (window.allContentLoaded) return resolve();
              document.addEventListener('AllContentLoaded', resolve, { once: true });
              setTimeout(resolve, 5000); // Fallback timeout of 5 seconds
            });
          });
        } catch (eventError) { console.log('Error waiting for AllContentLoaded event:', eventError); }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased from 500ms to 2000ms
        
        // Enhanced wait for all images and background images to load and be visible
        await page.evaluate(async () => {
          // Wait for all <img> elements to load
          const imgElements = document.querySelectorAll('img');
          console.log(`Found ${imgElements.length} <img> elements on the page`);
          const imgPromises = [];
          
          for (const img of imgElements) {
            if (img.complete && img.naturalWidth !== 0) continue;
            const imgPromise = new Promise(resolve => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve); // Also handle error case
            });
            imgPromises.push(imgPromise);
          }
          
          // Wait for CSS background images
          console.log('Checking for CSS background images...');
          const elements = [...document.querySelectorAll('*')];
          const backgroundElements = elements.filter(el => {
            const style = window.getComputedStyle(el);
            const backgroundImage = style.backgroundImage;
            return backgroundImage && backgroundImage !== 'none';
          });
          
          console.log(`Found ${backgroundElements.length} elements with CSS background images`);
          
          // For each element with a background image, create a promise that resolves when the image loads
          const backgroundImagePromises = backgroundElements.map(el => {
            const style = window.getComputedStyle(el);
            const backgroundImage = style.backgroundImage;
            
            // Extract URL from the backgroundImage property
            const match = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (!match) return Promise.resolve();
            
            const url = match[1];
            console.log(`Loading background image: ${url}`);
            
            return new Promise(resolve => {
              const img = new Image();
              img.onload = () => {
                console.log(`Background image loaded: ${url}`);
                resolve();
              };
              img.onerror = () => {
                console.log(`Failed to load background image: ${url}`);
                resolve();
              };
              img.src = url;
            });
          });
          
          console.log(`Waiting for ${backgroundImagePromises.length} background images to load`);
          
          // Wait for all regular images and background images
          const allPromises = [...imgPromises, ...backgroundImagePromises];
          console.log(`Waiting for ${allPromises.length} images to load...`);
          
          if (allPromises.length > 0) {
            await Promise.all(allPromises);
            console.log('All images loaded successfully');
          } else {
            console.log('No images to wait for');
          }
        });
        
        // Take a longer additional pause for CSS rendering and animations
        await new Promise(resolve => setTimeout(resolve, 5000)); // Increased from 3000ms to 5000ms
        
        await page.screenshot({
          path: outputPath,
          type: format,
          quality: quality,
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: width,
            height: height
          }
        });
        
        imagePaths.push(outputPath);
        console.log(`Screenshot saved to ${outputPath}`);
      } catch (pageError) {
        console.error(`Error taking screenshot for URL ${url}:`, pageError);
      }
      
      await page.close();
    }
    
    await browser.close();
    
    if (imagePaths.length === 0) {
      return res.status(500).json({ message: 'Failed to generate any screenshots' });
    }
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    
    for (const imagePath of imagePaths) {
      if (!fs.existsSync(imagePath)) continue;
      
      const imageBytes = fs.readFileSync(imagePath);
      
      try {
        const jpgImage = await pdfDoc.embedJpg(imageBytes);
        
        const page = pdfDoc.addPage([width, height]);
        
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: width,
          height: height
        });
      } catch (embedError) {
        console.error(`Error embedding image ${imagePath}:`, embedError);
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    
    // Generate a unique filename for the PDF
    const pdfFilename = `presentation-${uuidv4()}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
    
    // Save a copy locally
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`PDF saved to ${pdfPath}`);
    
    // Send PDF
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    
    // Clean up
    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, err => {
          if (err) console.error(`Error deleting file ${imagePath}:`, err);
        });
      }
    }
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ message: 'Error exporting slides', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Puppeteer service running on port ${PORT}`);
  console.log(`Platform: ${os.platform()}, Arch: ${os.arch()}, Node: ${process.version}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
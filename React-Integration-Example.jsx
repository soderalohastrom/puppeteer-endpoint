import React, { useState } from 'react';
import axios from 'axios';

const PuppeteerIntegration = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Function to generate slide URLs based on the current presentation state
  const generateSlideUrls = () => {
    // In a real app, this would be based on your application's state
    // This is a simplified example assuming slide IDs 1-4
    
    // Base URL would typically come from your environment configuration
    const baseUrl = process.env.REACT_APP_SLIDE_RENDERER_URL || 'http://localhost:3000';
    
    // Get the current slide IDs from your application state
    // For example: const slideIds = useSelector(state => state.presentation.slideIds);
    const slideIds = [1, 2, 3, 4]; // Example: hardcoded for demonstration
    
    // Convert slide IDs to full URLs for rendering
    return slideIds.map(id => `${baseUrl}/slides/${id}/render`);
  };

  // This function is called when the user clicks the "Export" button
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(10);
      
      // Generate URLs for each slide to be exported
      const slideUrls = generateSlideUrls();
      
      // Dimensions for the slides (3:4 aspect ratio)
      const dimensions = {
        width: 768,
        height: 1024
      };
      
      // API endpoint for the Puppeteer service
      const puppeteerServiceUrl = process.env.REACT_APP_PUPPETEER_SERVICE_URL || 'http://localhost:3001';
      
      // Option 1: Use separate calls for screenshots and PDF generation
      // This gives more control over the process and allows showing progress between steps
      
      setProgress(20);
      console.log('Taking screenshots of slides...');
      
      // Step 1: Request screenshots from Puppeteer service
      const screenshotResponse = await axios.post(`${puppeteerServiceUrl}/screenshots`, {
        urls: slideUrls,
        dimensions,
        format: 'jpeg',
        quality: 85
      });
      
      setProgress(60);
      console.log('Screenshots generated, creating PDF...');
      
      // Step 2: Request PDF generation from the screenshots
      const pdfResponse = await axios.post(`${puppeteerServiceUrl}/generate-pdf`, {
        imagePaths: screenshotResponse.data.imagePaths,
        dimensions
      }, {
        responseType: 'blob' // Important for handling binary data
      });
      
      setProgress(90);
      console.log('PDF generated, preparing download...');
      
      // Step 3: Create a download link for the PDF
      const pdfBlob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      
      // Trigger browser download dialog
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'presentation.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the URL object
      URL.revokeObjectURL(downloadUrl);
      
      setProgress(100);
      console.log('PDF downloaded successfully');
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsExporting(false);
      }, 1500);
    } catch (error) {
      console.error('Error exporting slides:', error);
      setError('Failed to export slides. Please try again.');
      setIsExporting(false);
    }
  };

  // Alternative method using the combined endpoint
  const exportToPDFAlternative = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress(10);
      
      // Generate URLs for each slide to be exported
      const slideUrls = generateSlideUrls();
      
      // Dimensions for the slides (3:4 aspect ratio)
      const dimensions = {
        width: 768,
        height: 1024
      };
      
      // API endpoint for the Puppeteer service
      const puppeteerServiceUrl = process.env.REACT_APP_PUPPETEER_SERVICE_URL || 'http://localhost:3001';
      
      // Option 2: Use the combined export-slides endpoint
      // This is simpler but provides less visibility into the process
      
      setProgress(30);
      console.log('Exporting slides to PDF...');
      
      // One-step request for the entire process
      const response = await axios.post(`${puppeteerServiceUrl}/export-slides`, {
        urls: slideUrls,
        dimensions,
        format: 'jpeg',
        quality: 85
      }, {
        responseType: 'blob', // Important for handling binary data
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(30 + percentCompleted * 0.6); // Map to 30-90% progress
        }
      });
      
      setProgress(90);
      console.log('PDF generated, preparing download...');
      
      // Create a download link for the PDF
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      
      // Trigger browser download dialog
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'presentation.pdf';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the URL object
      URL.revokeObjectURL(downloadUrl);
      
      setProgress(100);
      console.log('PDF downloaded successfully');
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
        setIsExporting(false);
      }, 1500);
    } catch (error) {
      console.error('Error exporting slides:', error);
      setError('Failed to export slides. Please try again.');
      setIsExporting(false);
    }
  };
  
  return (
    <div className="slide-exporter">
      <h2>Slide Exporter</h2>
      
      <div className="button-group">
        <button 
          className="export-button" 
          onClick={exportToPDF} 
          disabled={isExporting}
        >
          {isExporting ? `Exporting PDF (${Math.round(progress)}%)` : 'Export to PDF (Two Steps)'}
        </button>
        
        <button 
          className="export-button alternative" 
          onClick={exportToPDFAlternative} 
          disabled={isExporting}
        >
          {isExporting ? `Exporting PDF (${Math.round(progress)}%)` : 'Export to PDF (Combined)'}
        </button>
      </div>
      
      {isExporting && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
      )}
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <style jsx>{`
        .slide-exporter {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          max-width: 600px;
          margin: 20px auto;
        }
        
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .button-group {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .export-button {
          background-color: #4a90e2;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          flex: 1;
          margin: 0 5px;
        }
        
        .export-button:disabled {
          background-color: #a0c5f2;
          cursor: not-allowed;
        }
        
        .export-button.alternative {
          background-color: #6c5ce7;
        }
        
        .progress-container {
          margin-top: 20px;
        }
        
        .progress-bar {
          height: 10px;
          background-color: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #4a90e2;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          text-align: center;
          margin-top: 5px;
          font-size: 14px;
          color: #666;
        }
        
        .error-message {
          color: #e74c3c;
          margin-top: 10px;
          padding: 10px;
          background-color: #fadbd8;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default PuppeteerIntegration; 
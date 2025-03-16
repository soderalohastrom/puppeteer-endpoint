const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002;

// Serve static files from the test-slides directory
app.use('/test-slides', express.static(path.join(__dirname, 'test-slides')));
app.use(express.static(path.join(__dirname, 'public')));

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve individual slides
app.get('/slide/:number', (req, res) => {
  const slideNumber = req.params.number;
  res.sendFile(path.join(__dirname, 'test-slides', `slide${slideNumber}.html`));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Access slides at:`);
  console.log(`- http://localhost:${PORT}/slide/1`);
  console.log(`- http://localhost:${PORT}/slide/2`);
  console.log(`- http://localhost:${PORT}/slide/3`);
  console.log(`- http://localhost:${PORT}/slide/4`);
}); 
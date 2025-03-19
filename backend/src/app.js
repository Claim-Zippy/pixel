const express = require('express');
const cors = require('cors');
const path = require('path');
const pdfProcessingRouter = require('./routes/api/process-pdf');

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/processed', express.static(path.join(process.cwd(), 'public', 'processed')));

// Routes
app.use('/api', pdfProcessingRouter);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

module.exports = app; 
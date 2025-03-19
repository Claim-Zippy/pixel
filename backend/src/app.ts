import express from 'express';
import cors from 'cors';
import rescanImageRouter from './routes/api/rescan-image';

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use('/processed', express.static('public/processed'));

// Mount the rescan route
app.use('/api/rescan-image', rescanImageRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

export default app; 
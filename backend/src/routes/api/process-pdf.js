const express = require('express');
const multer = require('multer');
const path = require('path');
const { Poppler } = require('node-poppler');
const fs = require('fs').promises;
const OpenAIService = require('../../services/openaiService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const openAI = new OpenAIService();

// Configure path to node-poppler binaries
const popplerPath = path.join(
  process.cwd(),
  'node_modules',
  'node-poppler',
  'src',
  'lib',
  'win32',
  'poppler-24.07.0',
  'Library',
  'bin'
);

// Initialize Poppler with the correct path
const poppler = new Poppler();
poppler.popplerPath = popplerPath;

// Helper function to create directories
const createRequiredDirectories = async () => {
  const processedDir = path.join(process.cwd(), 'public', 'processed');
  await fs.mkdir(processedDir, { recursive: true });
  return { processedDir };
};

router.post('/process-pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('Starting PDF processing...');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { processedDir } = await createRequiredDirectories();
    const uniqueId = Date.now();
    const pdfPath = path.resolve(req.file.path);
    const outputBaseName = path.join(processedDir, `page-${uniqueId}`);

    console.log('Converting PDF to images...');
    await poppler.pdfToCairo(pdfPath, outputBaseName, {
      jpegFile: true,
      singleFile: false
    });

    // Get list of generated images
    const files = await fs.readdir(processedDir);
    const imageFiles = files.filter(file => 
      file.startsWith(`page-${uniqueId}`) && file.endsWith('.jpg')
    ).sort();

    if (imageFiles.length === 0) {
      throw new Error('No images were generated from PDF');
    }

    console.log('Generated image files:', imageFiles);

    // Process each image with Gemini
    const processedImages = await Promise.all(
      imageFiles.map(async (filename, index) => {
        const imagePath = path.join(processedDir, filename);
        console.log(`Processing image ${index + 1}/${imageFiles.length}:`, imagePath);
        
        try {
          // Handle potential errors from extractTextFromImage without crashing
          let extractedData;
          try {
            extractedData = await openAI.extractTextFromImage(imagePath, 'default');
            console.log(`AI analysis completed for image ${index + 1}:`, filename);
          } catch (aiError) {
            console.error(`AI processing error for file ${filename}:`, aiError);
            extractedData = [{
              text: "|Error|Failed to process image|0|0|0",
              confidence_score: 0.1,
              bbox: [[0, 0], [100, 0], [100, 100], [0, 100]]
            }];
          }
          
          return {
            imageUrl: `/processed/${filename}`,
            extractedData: extractedData || [] // Ensure we always have an array
          };
        } catch (error) {
          console.error(`Processing failed for file ${filename}:`, error);
          // Return a fallback object that won't break the frontend
          return {
            imageUrl: `/processed/${filename}`,
            extractedData: [{
              text: "|Error|Internal processing error|0|0|0",
              confidence_score: 0.1,
              bbox: [[0, 0], [100, 0], [100, 100], [0, 100]]
            }]
          };
        }
      })
    );

    console.log('All images processed successfully');
    res.json({ 
      success: true,
      images: processedImages
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'PDF processing failed',
      details: error.message 
    });
  } finally {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }
  }
});

// Helper function to get image dimensions
async function getImageDimensions(imagePath) {
  const { createCanvas, loadImage } = require('canvas');
  const image = await loadImage(imagePath);
  return {
    width: image.width,
    height: image.height
  };
}

module.exports = router; 
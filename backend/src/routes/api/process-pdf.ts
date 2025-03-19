import express from 'express';
import multer from 'multer';
import path from 'path';
import { Poppler } from 'node-poppler';
import cors from 'cors';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Enable CORS for your frontend domain
router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

router.post('/process-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Save the uploaded PDF
    const pdfPath = req.file.path;
    const outputDir = path.join('public', 'processed');
    
    // 2. Use node-poppler to split PDF into images
    const poppler = new Poppler();
    await poppler.pdfToCairo(pdfPath, path.join(outputDir, 'page'), {
      jpegFile: true,
      singleFile: false
    });

    const processedImages = await Promise.all(
      pages.map(async (page, index) => {
        const imagePath = path.join(outputDir, `page-${index + 1}.jpg`);
        let documentType = 'default';
        
        // First pass to detect document type
        const initialData = await openAI.extractTextFromImage(imagePath, 'default');
        documentType = detectDocumentType(initialData);
        
        // Second pass with specific document type
        const extractedData = await openAI.extractTextFromImage(imagePath, documentType);
        
        return {
          imageUrl: `/processed/page-${index + 1}.jpg`,
          documentType,
          extractedData
        };
      })
    );

    // 4. Return the processed data
    res.json({
      images: processedImages
    });

  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ error: 'PDF processing failed' });
  }
});

export default router; 
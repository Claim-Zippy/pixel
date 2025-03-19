import { Router } from 'express';
import { OpenAIService } from '../../services/openaiService';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import url from 'url';

const router = Router();
const openAI = new OpenAIService();

router.post('/', async (req, res) => {
  try {
    const { imageUrl, rotation, imageIndex, documentType } = req.body;
    
    // Extract the filename from the URL properly
    const filename = imageUrl.split('/').pop();
    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    console.log('Processing image:', { imagePath, documentType, rotation });

    // Verify file exists
    if (!(await fs.access(imagePath).then(() => true).catch(() => false))) {
      console.error('File not found:', imagePath);
      return res.status(404).json({
        error: 'Image not found',
        path: imagePath
      });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const rotatedImagePath = path.join(tempDir, `rotated_${filename}`);

    // Rotate and save image
    await sharp(imagePath)
      .rotate(rotation)
      .toFile(rotatedImagePath);

    // Process with document type context
    const extractedData = await openAI.extractTextFromImage(rotatedImagePath, documentType);

    // Cleanup temp file
    await fs.unlink(rotatedImagePath).catch(console.error);

    res.json({
      success: true,
      extractedData,
      documentType
    });
  } catch (error) {
    console.error('Rescan error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
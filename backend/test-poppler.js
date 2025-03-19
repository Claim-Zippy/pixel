const { Poppler } = require('node-poppler');
const path = require('path');

const popplerPath = path.join(process.cwd(), 'bin', 'poppler', 'Library', 'bin');

console.log('Checking Poppler path:', popplerPath);
const poppler = new Poppler();
poppler.popplerPath = popplerPath;

// Test if Poppler is working
async function testPoppler() {
  try {
    const version = await poppler.version();
    console.log('Poppler version:', version);
    
    // Test PDF to image conversion
    const testPdfPath = path.join(process.cwd(), 'test.pdf');
    const outputPath = path.join(process.cwd(), 'test-output');
    
    console.log('Testing PDF conversion...');
    const result = await poppler.pdfToCairo(testPdfPath, outputPath, {
      jpegFile: true,
      singleFile: true
    });
    console.log('Conversion result:', result);
  } catch (error) {
    console.error('Poppler error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: error.path
    });
  }
}

testPoppler(); 
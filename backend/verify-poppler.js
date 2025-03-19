const { Poppler } = require('node-poppler');
const path = require('path');
const fs = require('fs').promises;

async function verifyPoppler() {
  try {
    const popplerPath = path.join(process.cwd(), 'bin', 'poppler', 'Library', 'bin');
    console.log('Checking Poppler path:', popplerPath);

    // Verify directory exists
    const dirExists = await fs.access(popplerPath)
      .then(() => true)
      .catch(() => false);

    if (!dirExists) {
      console.error('Poppler directory not found!');
      console.log('Running setup script...');
      require('./setup-poppler');
      return;
    }

    // Check for pdftocairo executable
    const pdftocairoPath = path.join(popplerPath, 'pdftocairo.exe');
    const exeExists = await fs.access(pdftocairoPath)
      .then(() => true)
      .catch(() => false);

    if (!exeExists) {
      console.error('pdftocairo.exe not found!');
      return;
    }

    // Initialize Poppler
    const poppler = new Poppler({
      popplerPath: popplerPath
    });

    // Get version
    const version = await poppler.version();
    console.log('Poppler version:', version);

    // Create test directories
    const testDir = path.join(process.cwd(), 'test-output');
    await fs.mkdir(testDir, { recursive: true });

    // Create a simple test PDF
    const testPdfPath = path.join(testDir, 'test.pdf');
    // You can copy a sample PDF here for testing

    if (await fs.access(testPdfPath).catch(() => false)) {
      console.log('Converting test PDF...');
      const result = await poppler.pdfToCairo(testPdfPath, path.join(testDir, 'output'), {
        jpegFile: true,
        singleFile: false,
        resolution: 300
      });
      console.log('Conversion result:', result);
    } else {
      console.log('No test PDF found at:', testPdfPath);
    }

  } catch (error) {
    console.error('Verification error:', error);
  }
}

verifyPoppler(); 
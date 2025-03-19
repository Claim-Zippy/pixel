const { Poppler } = require('node-poppler');
const path = require('path');
const fs = require('fs').promises;

async function testPdfConversion() {
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

  console.log('Testing Poppler path:', popplerPath);

  try {
    const poppler = new Poppler();
    poppler.popplerPath = popplerPath;

    // Test Poppler version
    const version = await poppler.version();
    console.log('Poppler version:', version);

    return true;
  } catch (error) {
    console.error('Poppler test failed:', error);
    return false;
  }
}

testPdfConversion(); 
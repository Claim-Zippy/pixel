const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const POPPLER_VERSION = '24.02.0';
const POPPLER_URL = `https://github.com/oschwartz10612/poppler-windows/releases/download/v${POPPLER_VERSION}/Release-${POPPLER_VERSION}.zip`;
const DOWNLOAD_PATH = path.join(__dirname, 'poppler.zip');
const EXTRACT_PATH = path.join(__dirname, 'bin', 'poppler');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function setup() {
  try {
    console.log('Setting up Poppler...');
    
    // Create directories
    await fs.promises.mkdir(path.dirname(EXTRACT_PATH), { recursive: true });
    
    // Download Poppler
    console.log('Downloading Poppler...');
    await downloadFile(POPPLER_URL, DOWNLOAD_PATH);
    
    // Extract ZIP
    console.log('Extracting Poppler...');
    await execAsync(`powershell Expand-Archive -Path "${DOWNLOAD_PATH}" -DestinationPath "${EXTRACT_PATH}" -Force`);
    
    // Cleanup
    await fs.promises.unlink(DOWNLOAD_PATH);
    
    console.log('Poppler setup completed successfully!');
    console.log('Poppler binaries location:', path.join(EXTRACT_PATH, 'Library', 'bin'));
  } catch (error) {
    console.error('Error setting up Poppler:', error);
    process.exit(1);
  }
}

setup(); 
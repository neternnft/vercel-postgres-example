const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [32, 96, 100, 192, 512];
const inputFile = path.join(process.cwd(), 'public', 'GLURB coin.png');

async function generateFavicons() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      console.error(`Input file not found: ${inputFile}`);
      return;
    }
    console.log(`Found input file: ${inputFile}`);

    for (const size of sizes) {
      const outputFile = path.join(process.cwd(), 'public', `favicon-${size}x${size}.png`);
      console.log(`Generating ${size}x${size} favicon to: ${outputFile}`);
      
      await sharp(inputFile)
        .resize(size, size)
        .toFile(outputFile);
      console.log(`Generated ${size}x${size} favicon`);
    }
    
    // Generate apple-touch-icon (180x180)
    const appleIconPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
    console.log(`Generating apple-touch-icon to: ${appleIconPath}`);
    
    await sharp(inputFile)
      .resize(180, 180)
      .toFile(appleIconPath);
    console.log('Generated apple-touch-icon');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons(); 
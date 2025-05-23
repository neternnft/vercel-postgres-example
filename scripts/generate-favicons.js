const sharp = require('sharp');
const path = require('path');

const sizes = [32, 96, 100, 192];
const inputFile = path.join(process.cwd(), 'public', 'GLURB coin.png');

async function generateFavicons() {
  try {
    for (const size of sizes) {
      await sharp(inputFile)
        .resize(size, size)
        .toFile(path.join(process.cwd(), 'public', `favicon-${size}x${size}.png`));
      console.log(`Generated ${size}x${size} favicon`);
    }
    
    // Generate apple-touch-icon (180x180)
    await sharp(inputFile)
      .resize(180, 180)
      .toFile(path.join(process.cwd(), 'public', 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons(); 
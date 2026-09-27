import sharp from 'sharp';
import fs from 'fs';

async function processLogo() {
  const inputPath = 'C:/Users/athil/.gemini/antigravity-ide/brain/77e4b37e-a590-4a5e-be28-ecb07f51f4eb/.user_uploaded/media_1790490548939.jpg';
  const outputPath = 'c:/Users/athil/OneDrive/Desktop/7days/public/7days-logo.png';

  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Let's sample points around the perimeter of the golden ring to find the true circle center and radius.
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });

  function getPixel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    const idx = (y * width + x) * info.channels;
    return (data[idx] + data[idx+1] + data[idx+2]) / 3;
  }

  // Find top edge at x = width / 2
  let topY = 0;
  for (let y = 0; y < height / 2; y++) {
    if (getPixel(Math.floor(width/2), y) > 40) { topY = y; break; }
  }

  // Find bottom edge at x = width / 2
  let bottomY = height - 1;
  for (let y = height - 1; y > height / 2; y--) {
    // Look for gold rim (gold has r > 120, g > 90)
    const idx = (y * width + Math.floor(width/2)) * info.channels;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if (r > 100 && g > 70) { bottomY = y; break; }
  }

  // Find left edge at y = height / 2
  let leftX = 0;
  for (let x = 0; x < width / 2; x++) {
    if (getPixel(x, Math.floor(height/2)) > 40) { leftX = x; break; }
  }

  // Find right edge at y = height / 2
  let rightX = width - 1;
  for (let x = width - 1; x > width / 2; x--) {
    const idx = (Math.floor(height/2) * width + x) * info.channels;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    if (r > 100 && g > 70) { rightX = x; break; }
  }

  console.log(`Bounds: Top=${topY}, Bottom=${bottomY}, Left=${leftX}, Right=${rightX}`);

  const cx = (leftX + rightX) / 2;
  const cy = (topY + bottomY) / 2;
  // Radius strictly inside the outer gold rim edge to eliminate any dark outer rim or shadow
  const r = Math.min((rightX - leftX) / 2, (bottomY - topY) / 2) - 4;

  console.log(`True Center: (${cx.toFixed(1)}, ${cy.toFixed(1)}), Radius: ${r.toFixed(1)}`);

  // Build an antialiased SVG circular clipping mask
  const circleMask = Buffer.from(`
    <svg width="${width}" height="${height}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="white" />
    </svg>
  `);

  await sharp(inputPath)
    .composite([{
      input: circleMask,
      blend: 'dest-in'
    }])
    .png({ quality: 100 })
    .toFile(outputPath);

  console.log(`Saved pristine transparent logo to ${outputPath}`);
  fs.copyFileSync(outputPath, 'c:/Users/athil/OneDrive/Desktop/7days/public/logo.png');
}

processLogo().catch(console.error);

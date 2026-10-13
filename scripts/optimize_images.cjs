const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeImages() {
  const publicDir = path.resolve(__dirname, '../public');

  console.log('--- OPTIMIZING LOGO ---');
  const logoPath = path.join(publicDir, '7days-logo.png');
  const logoWebpPath = path.join(publicDir, '7days-logo.webp');
  if (fs.existsSync(logoPath)) {
    const origSize = fs.statSync(logoPath).size;
    
    // Create optimized WebP
    await sharp(logoPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(logoWebpPath);
    const webpSize = fs.statSync(logoWebpPath).size;

    // Create optimized PNG in-place (compressed with pngquant-like palette if beneficial or standard sharp png)
    const pngBuffer = await sharp(logoPath)
      .png({ quality: 85, compressionLevel: 9, palette: true })
      .toBuffer();
    
    // Backup original if needed
    if (!fs.existsSync(path.join(publicDir, '7days-logo-orig.png'))) {
      fs.copyFileSync(logoPath, path.join(publicDir, '7days-logo-orig.png'));
    }
    fs.writeFileSync(logoPath, pngBuffer);
    const newPngSize = fs.statSync(logoPath).size;

    console.log(`Logo PNG: ${(origSize / 1024).toFixed(1)} KB -> ${(newPngSize / 1024).toFixed(1)} KB (-${((1 - newPngSize / origSize) * 100).toFixed(1)}%)`);
    console.log(`Logo WebP: ${(webpSize / 1024).toFixed(1)} KB (-${((1 - webpSize / origSize) * 100).toFixed(1)}%)`);
  }

  console.log('\n--- OPTIMIZING STORE IMAGES ---');
  const storeDir = path.join(publicDir, 'store');
  if (fs.existsSync(storeDir)) {
    const storeFiles = fs.readdirSync(storeDir).filter(f => f.endsWith('.png'));
    for (const file of storeFiles) {
      const filePath = path.join(storeDir, file);
      const webpFileName = file.replace('.png', '.webp');
      const webpPath = path.join(storeDir, webpFileName);
      const origSize = fs.statSync(filePath).size;

      // Create WebP version
      await sharp(filePath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(webpPath);
      const webpSize = fs.statSync(webpPath).size;

      // Compress existing PNG in-place as fallback
      const optimizedPng = await sharp(filePath)
        .resize({ width: 800, withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9, palette: true })
        .toBuffer();
      fs.writeFileSync(filePath, optimizedPng);
      const newPngSize = fs.statSync(filePath).size;

      console.log(`${file}: ${(origSize / 1024).toFixed(1)} KB -> PNG: ${(newPngSize / 1024).toFixed(1)} KB, WebP: ${(webpSize / 1024).toFixed(1)} KB (-${((1 - webpSize / origSize) * 100).toFixed(1)}%)`);
    }
  }

  console.log('\n--- OPTIMIZING HERO IMAGES ---');
  const baybeeDir = path.join(publicDir, 'products/baybee');
  const heroImages = [
    'baybee-copster-electric-jeep.jpg',
    'baybee-velzo-battery-bike.jpg',
    'baybee-nova-baby-tricycle.jpg'
  ];
  for (const imgName of heroImages) {
    const imgPath = path.join(baybeeDir, imgName);
    if (fs.existsSync(imgPath)) {
      const origSize = fs.statSync(imgPath).size;
      const webpName = imgName.replace('.jpg', '.webp');
      const webpPath = path.join(baybeeDir, webpName);

      await sharp(imgPath)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 82, effort: 6 })
        .toFile(webpPath);
      const webpSize = fs.statSync(webpPath).size;

      console.log(`${imgName}: ${(origSize / 1024).toFixed(1)} KB -> WebP: ${(webpSize / 1024).toFixed(1)} KB (-${((1 - webpSize / origSize) * 100).toFixed(1)}%)`);
    }
  }
}

optimizeImages().catch(console.error);

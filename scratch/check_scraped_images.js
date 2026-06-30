const fs = require('fs');
const path = require('path');

function getWebpSize(buffer) {
  try {
    const signature = buffer.toString('ascii', 0, 4);
    if (signature !== 'RIFF') return null;
    const type = buffer.toString('ascii', 12, 16);
    if (type === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { width, height };
    } else if (type === 'VP8L') {
      const b0 = buffer.readUInt8(21);
      const b1 = buffer.readUInt8(22);
      const b2 = buffer.readUInt8(23);
      const b3 = buffer.readUInt8(24);
      const width = 1 + (((b1 & 0x3F) << 8) | b0);
      const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
      return { width, height };
    } else if (type === 'VP8X') {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
  } catch (e) {}
  return null;
}

const dirPath = path.join(__dirname, '..', 'public', 'images', 'scraped');
if (fs.existsSync(dirPath)) {
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  console.log(`Found ${files.length} images in public/images/scraped`);
  files.slice(0, 5).forEach(f => {
    const filePath = path.join(dirPath, f);
    const stat = fs.statSync(filePath);
    console.log(`File: ${f}, Size: ${stat.size} bytes`);
    if (f.endsWith('.webp')) {
      const buffer = fs.readFileSync(filePath);
      const size = getWebpSize(buffer);
      if (size) {
        console.log(`- Dimensions: ${size.width}x${size.height}, Aspect Ratio: ${size.width / size.height}`);
      }
    }
  });
} else {
  console.log('scraped directory not found at', dirPath);
}

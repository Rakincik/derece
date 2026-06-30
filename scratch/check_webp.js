const fs = require('fs');
const path = require('path');

function getWebpSize(buffer) {
  // Simple parser for WebP width/height
  const signature = buffer.toString('ascii', 0, 4);
  const webpSign = buffer.toString('ascii', 8, 12);
  if (signature !== 'RIFF' || webpSign !== 'WEBP') {
    throw new Error('Not a valid WebP/RIFF file');
  }

  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8 ') {
    // Lossy WebP
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height, type: 'lossy' };
  } else if (type === 'VP8L') {
    // Lossless WebP
    const b0 = buffer.readUInt8(21);
    const b1 = buffer.readUInt8(22);
    const b2 = buffer.readUInt8(23);
    const b3 = buffer.readUInt8(24);
    const width = 1 + (((b1 & 0x3F) << 8) | b0);
    const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
    return { width, height, type: 'lossless' };
  } else if (type === 'VP8X') {
    // Extended WebP
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height, type: 'extended' };
  }
  
  // Try checking raw chunks if standard header signature starts differently
  // VP8X is often preceded by other headers. Let's scan for 'VP8 ', 'VP8L', 'VP8X'
  const indexVP8 = buffer.indexOf('VP8 ');
  if (indexVP8 !== -1) {
    const width = buffer.readUInt16LE(indexVP8 + 14) & 0x3fff;
    const height = buffer.readUInt16LE(indexVP8 + 16) & 0x3fff;
    return { width, height, type: 'lossy-scan' };
  }
  const indexVP8L = buffer.indexOf('VP8L');
  if (indexVP8L !== -1) {
    const b0 = buffer.readUInt8(indexVP8L + 9);
    const b1 = buffer.readUInt8(indexVP8L + 10);
    const b2 = buffer.readUInt8(indexVP8L + 11);
    const b3 = buffer.readUInt8(indexVP8L + 12);
    const width = 1 + (((b1 & 0x3F) << 8) | b0);
    const height = 1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6));
    return { width, height, type: 'lossless-scan' };
  }
  const indexVP8X = buffer.indexOf('VP8X');
  if (indexVP8X !== -1) {
    const width = 1 + buffer.readUIntLE(indexVP8X + 12, 3);
    const height = 1 + buffer.readUIntLE(indexVP8X + 15, 3);
    return { width, height, type: 'extended-scan' };
  }

  throw new Error('Unsupported WebP format/chunks');
}

try {
  const filePath = path.join(__dirname, '..', 'product_836.webp');
  const buffer = fs.readFileSync(filePath);
  const size = getWebpSize(buffer);
  console.log('Image dimensions:', size);
  console.log('Aspect ratio (W/H):', size.width / size.height);
} catch (err) {
  console.error('Error reading WebP:', err.message);
}

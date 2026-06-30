const fs = require('fs');

const content = fs.readFileSync('src/data/products.js', 'utf8');

// Find product entries in products.js content for products with ID 867, 836, etc.
// We can just regex extract them or print the lines.
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('????') || line.includes('???')) {
    console.log(`Line ${idx+1}: ${JSON.stringify(line)}`);
  }
});

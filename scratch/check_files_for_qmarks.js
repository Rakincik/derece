const fs = require('fs');

function checkFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const matches = content.match(/\?{3,}/g);
    console.log(`${filepath}: matches found:`, matches ? matches.length : 0);
    if (matches) {
      console.log('Sample match lines:');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('???')) {
          console.log(`Line ${idx+1}: ${line.trim().substring(0, 100)}`);
        }
      });
    }
  } catch (err) {
    console.error('Error reading', filepath, err.message);
  }
}

checkFile('src/data/products.js');
checkFile('src/data/scraped-data.json');

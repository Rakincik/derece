const fs = require('fs');
const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));

dump.products.forEach(p => {
  const fields = ['title', 'description'];
  fields.forEach(f => {
    const val = p[f] || '';
    if (val.includes('?') || val.includes('\uFFFD') || val.includes('&zwj;')) {
      console.log(`Product ID: ${p.id}, Field: ${f}`);
      console.log(`Value snippet: ${val.substring(0, 150)}...`);
      console.log('---');
    }
  });
});

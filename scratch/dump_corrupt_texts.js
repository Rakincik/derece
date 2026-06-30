const fs = require('fs');
const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));

dump.products.forEach(p => {
  if (p.description.includes('???') || (p.shortDescription && p.shortDescription.includes('???'))) {
    console.log(`=== Product: ${p.title} (ID: ${p.id}) ===`);
    console.log(`Description:\n${p.description}\n`);
    console.log('--------------------------------------------------');
  }
});

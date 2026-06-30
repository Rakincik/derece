const fs = require('fs');
const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));
console.log('Categories count:', dump.categories.length);
console.log('Products count:', dump.products.length);
console.log('Sample product titles:');
dump.products.slice(0, 10).forEach(p => {
  console.log(`- ID: ${p.id}, Title: ${p.title}`);
});

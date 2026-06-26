const fs = require('fs');

async function main() {
  const htaccessPath = '/home/dereceuzem.com/public_html/.htaccess';
  console.log(`Checking ${htaccessPath}...`);
  if (fs.existsSync(htaccessPath)) {
    const content = fs.readFileSync(htaccessPath, 'utf8');
    console.log('\n--- .htaccess İçeriği ---');
    console.log(content);
  } else {
    console.log('.htaccess dosyası bulunamadı.');
  }
}

main().catch(console.error);

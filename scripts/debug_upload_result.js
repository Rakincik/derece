const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fiziksel Dosya Kontrolü:');
  const fileName = '1782493807598-Gemini_Generated_Image_yjn3v8yjn3v8yjn3.png';
  
  const pathsToCheck = [
    path.join('/home/dereceuzem.com/public_html/uploads', fileName),
    path.join('/var/www/dereceuzem/public/uploads', fileName),
    path.join(process.cwd(), 'public', 'uploads', fileName)
  ];

  pathsToCheck.forEach(p => {
    console.log(`\nKontrol edilen yol: ${p}`);
    try {
      const exists = fs.existsSync(p);
      console.log(`Mevcut mu?: ${exists}`);
      if (exists) {
        const stat = fs.statSync(p);
        console.log(`Boyut: ${stat.size} byte`);
        console.log(`İzinler (octal): ${(stat.mode & 0o777).toString(8)}`);
        console.log(`Sahibi (UID/GID): ${stat.uid}/${stat.gid}`);
      }
    } catch (e) {
      console.log(`Hata: ${e.message}`);
    }
  });

  // Genel klasör sahipliği ve izinlerini de kontrol edelim
  console.log('\n--- Klasör Bilgileri ---');
  ['/home/dereceuzem.com/public_html/uploads', '/var/www/dereceuzem/public/uploads'].forEach(p => {
    try {
      if (fs.existsSync(p)) {
        const stat = fs.lstatSync(p);
        console.log(`${p} -> Link mi?: ${stat.isSymbolicLink()}, Sahibi: ${stat.uid}/${stat.gid}, İzinler: ${(stat.mode & 0o777).toString(8)}`);
        if (stat.isSymbolicLink()) {
          console.log(`   Hedef: ${fs.readlinkSync(p)}`);
        }
      } else {
        console.log(`${p} mevcut değil.`);
      }
    } catch (e) {
      console.log(`${p} hatası: ${e.message}`);
    }
  });
}

main().catch(console.error);

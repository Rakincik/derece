const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkPath(p) {
  console.log(`\n--- Bilgi: ${p} ---`);
  try {
    const exists = fs.existsSync(p);
    console.log(`Var mı?: ${exists}`);
    if (exists) {
      const stat = fs.lstatSync(p);
      console.log(`Tipi: ${stat.isSymbolicLink() ? 'Sembolik Link' : stat.isDirectory() ? 'Klasör' : 'Dosya'}`);
      console.log(`İzinleri (octal): ${(stat.mode & 0o777).toString(8)}`);
      console.log(`Sahibi (UID/GID): ${stat.uid}/${stat.gid}`);
      if (stat.isSymbolicLink()) {
        console.log(`İşaret ettiği hedef: ${fs.readlinkSync(p)}`);
      }
    }
  } catch (e) {
    console.error(`Hata oluştu: ${e.message}`);
  }
}

async function main() {
  console.log('Sunucu Yükleme Hata Ayıklama Raporu:');
  
  // 1. Klasör yollarını kontrol edelim
  checkPath('/home/dereceuzem.com/public_html/uploads');
  checkPath('/var/www/dereceuzem/public/uploads');

  // 2. /home/dereceuzem.com/public_html/uploads içindeki son 5 dosyayı listeleyelim
  console.log('\n--- /home/dereceuzem.com/public_html/uploads Klasör İçeriği (Son 5 Dosya) ---');
  try {
    const dir = '/home/dereceuzem.com/public_html/uploads';
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).map(f => {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        return { name: f, time: stat.mtimeMs, size: stat.size, mode: (stat.mode & 0o777).toString(8), uid: stat.uid, gid: stat.gid };
      });
      files.sort((a, b) => b.time - a.time);
      files.slice(0, 5).forEach(f => {
        console.log(`- ${f.name} (Boyut: ${f.size} byte, İzin: ${f.mode}, UID/GID: ${f.uid}/${f.gid})`);
      });
    } else {
      console.log('Klasör mevcut değil.');
    }
  } catch (e) {
    console.error(`Listeleme hatası: ${e.message}`);
  }

  // 3. OpenLiteSpeed sürecini kimin çalıştırdığını bulmaya çalışalım
  console.log('\n--- Web Sunucusu Süreç Bilgisi ---');
  try {
    const ps = execSync('ps aux | grep -E "openlitespeed|lsws|httpd|nginx" | grep -v grep').toString();
    console.log(ps);
  } catch (e) {
    console.log('Süreç bilgisi alınamadı (grep/ps hatası).');
  }
}

main().catch(console.error);

const fs = require('fs');
const path = require('path');

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch (e) {
    return false;
  }
}

function exists(p) {
  return fs.existsSync(p);
}

async function main() {
  if (process.platform === 'win32') {
    console.log('Windows ortamındasınız. Bu betik sadece Linux sunucuda çalıştırılmalıdır.');
    return;
  }

  const realDir = path.join(process.cwd(), 'public', 'uploads');
  const linkDir = '/home/dereceuzem.com/public_html/uploads';

  console.log(`Hedef gerçek dizin: ${realDir}`);
  console.log(`Sembolik link dizini: ${linkDir}`);

  // 1. public/uploads sembolik link ise silelim
  if (exists(realDir) && isSymlink(realDir)) {
    console.log(`${realDir} bir sembolik link. Siliniyor...`);
    fs.unlinkSync(realDir);
  }

  // 2. public/uploads gerçek klasör olarak oluşturalım
  if (!exists(realDir)) {
    console.log(`${realDir} gerçek klasör olarak oluşturuluyor...`);
    fs.mkdirSync(realDir, { recursive: true });
  }

  // 3. /home/dereceuzem.com/public_html/uploads klasöründeki dosyaları public/uploads altına taşıyalım
  if (exists(linkDir) && !isSymlink(linkDir)) {
    console.log(`${linkDir} altındaki dosyalar gerçek uploads klasörüne kopyalanıyor...`);
    const files = fs.readdirSync(linkDir);
    for (const file of files) {
      const srcFile = path.join(linkDir, file);
      const destFile = path.join(realDir, file);
      try {
        fs.renameSync(srcFile, destFile);
        console.log(`Taşındı: ${file}`);
      } catch (e) {
        console.error(`Dosya taşınamadı ${file}:`, e.message);
      }
    }
    // Klasörü silelim
    try {
      fs.rmdirSync(linkDir);
      console.log(`Geçici klasör silindi: ${linkDir}`);
    } catch (e) {
      console.error(`Geçici klasör silinemedi: ${linkDir}`, e.message);
    }
  } else if (isSymlink(linkDir)) {
    console.log(`${linkDir} sembolik linki siliniyor...`);
    fs.unlinkSync(linkDir);
  }

  // 4. Sembolik linki oluşturuyoruz: /home/dereceuzem.com/public_html/uploads -> /var/www/dereceuzem/public/uploads
  console.log(`Sembolik link oluşturuluyor: ${linkDir} -> ${realDir}`);
  try {
    fs.symlinkSync(realDir, linkDir);
    console.log('Sembolik link başarıyla oluşturuldu.');
  } catch (e) {
    console.error('Sembolik link oluşturulurken hata:', e.message);
  }

  // 5. İzinleri ve geçiş yetkilerini (traversal) ayarlayalım
  try {
    // Klasör izinlerini 755 yapalım
    fs.chmodSync(realDir, 0o755);
    
    // Üst dizinlerin de girilebilir (traversable) olmasını sağlayalım (755)
    const dirsToChmod = [
      path.join(process.cwd(), 'public'),
      process.cwd(),
      '/var/www'
    ];
    
    for (const d of dirsToChmod) {
      if (exists(d)) {
        fs.chmodSync(d, 0o755);
        console.log(`İzinler güncellendi (755): ${d}`);
      }
    }

    // Klasörün içindeki tüm dosyaların izinlerini 644 yapalım
    const files = fs.readdirSync(realDir);
    for (const file of files) {
      fs.chmodSync(path.join(realDir, file), 0o644);
    }
    console.log('Dosya izinleri 644 olarak ayarlandı.');

  } catch (e) {
    console.error('İzin ayarları güncellenirken hata oluştu:', e.message);
  }

  console.log('Tüm işlemler başarıyla tamamlandı!');
}

main().catch(console.error);

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

  const targetRealDir = '/home/dereceuzem.com/public_html/uploads';
  const sourceLinkDir = path.join(process.cwd(), 'public', 'uploads');

  console.log(`Hedef gerçek dizin: ${targetRealDir}`);
  console.log(`Kaynak link dizini: ${sourceLinkDir}`);

  // 1. /home/dereceuzem.com/public_html sahibi ve grubunu öğrenelim
  let uid = process.getuid ? process.getuid() : 0;
  let gid = process.getgid ? process.getgid() : 0;
  try {
    const parentStat = fs.statSync('/home/dereceuzem.com/public_html');
    uid = parentStat.uid;
    gid = parentStat.gid;
    console.log(`public_html sahibi: UID=${uid}, GID=${gid}`);
  } catch (e) {
    console.warn('public_html stat bilgisi alınamadı, mevcut süreç sahibinin UID/GID bilgileri kullanılacak.', e.message);
  }

  // 2. /home/dereceuzem.com/public_html/uploads link ise silelim
  if (exists(targetRealDir)) {
    if (isSymlink(targetRealDir)) {
      console.log(`${targetRealDir} bir sembolik link. Siliniyor...`);
      fs.unlinkSync(targetRealDir);
    } else {
      console.log(`${targetRealDir} zaten gerçek bir klasör.`);
    }
  }

  // 3. Gerçek klasörü oluşturalım
  if (!exists(targetRealDir)) {
    console.log(`${targetRealDir} oluşturuluyor...`);
    fs.mkdirSync(targetRealDir, { recursive: true });
  }

  // İzinleri ve sahipliği ayarlayalım
  try {
    fs.chmodSync(targetRealDir, 0o755);
    fs.chownSync(targetRealDir, uid, gid);
    console.log(`${targetRealDir} izinleri 755 ve sahibi UID=${uid}, GID=${gid} olarak ayarlandı.`);
  } catch (e) {
    console.error('İzin/Sahiplik ayarlama hatası:', e.message);
  }

  // 4. Mevcut public/uploads içeriğini kopyalayalım
  if (exists(sourceLinkDir) && !isSymlink(sourceLinkDir)) {
    console.log(`${sourceLinkDir} gerçek bir klasör. İçindeki dosyalar hedefe taşınıyor...`);
    const files = fs.readdirSync(sourceLinkDir);
    for (const file of files) {
      const srcFile = path.join(sourceLinkDir, file);
      const destFile = path.join(targetRealDir, file);
      try {
        fs.renameSync(srcFile, destFile);
        // İzinleri 644 yapalım
        fs.chmodSync(destFile, 0o644);
        fs.chownSync(destFile, uid, gid);
        console.log(`Taşındı: ${file}`);
      } catch (e) {
        console.error(`Dosya taşınamadı ${file}:`, e.message);
      }
    }
    // Eski klasörü silelim
    try {
      fs.rmdirSync(sourceLinkDir);
      console.log(`Eski klasör silindi: ${sourceLinkDir}`);
    } catch (e) {
      console.error(`Eski klasör silinemedi: ${sourceLinkDir}`, e.message);
    }
  } else if (isSymlink(sourceLinkDir)) {
    console.log(`${sourceLinkDir} zaten bir sembolik link. Siliniyor...`);
    fs.unlinkSync(sourceLinkDir);
  }

  // 5. Sembolik linki tersten oluşturalım: public/uploads -> /home/dereceuzem.com/public_html/uploads
  console.log(`Yeni sembolik link oluşturuluyor: ${sourceLinkDir} -> ${targetRealDir}`);
  fs.symlinkSync(targetRealDir, sourceLinkDir);
  console.log('Sembolik link başarıyla oluşturuldu.');

  console.log('Tüm işlemler tamamlandı!');
}

main().catch(console.error);

const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
  console.log('Sunucu İzin Analizi:');

  // 1. Üst klasörlerin durumunu detaylı inceleyelim
  const paths = [
    '/home',
    '/home/dereceuzem.com',
    '/home/dereceuzem.com/public_html',
    '/home/dereceuzem.com/public_html/uploads'
  ];

  paths.forEach(p => {
    try {
      const stat = fs.statSync(p);
      console.log(`\nKlasör: ${p}`);
      console.log(`  Sahibi (UID/GID): ${stat.uid}/${stat.gid}`);
      console.log(`  İzinler: ${(stat.mode & 0o777).toString(8)}`);
    } catch (e) {
      console.error(`  Hata (${p}): ${e.message}`);
    }
  });

  // 2. "nobody" kullanıcısının bu klasöre girip giremediğini test edelim
  console.log('\n--- Web Sunucusu (nobody) Erişim Testi ---');
  try {
    const output = execSync('sudo -u nobody ls -la /home/dereceuzem.com/public_html/uploads 2>&1').toString();
    console.log('nobody kullanıcısının ls çıktısı:\n', output);
  } catch (e) {
    console.error('nobody erişim testi hatası:', e.message);
    if (e.stdout) console.log('stdout:', e.stdout.toString());
    if (e.stderr) console.log('stderr:', e.stderr.toString());
  }
}

main().catch(console.error);

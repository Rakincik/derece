const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'src', 'data', 'products.js'),
  path.join(__dirname, '..', 'src', 'data', 'scraped-data.json'),
  path.join(__dirname, '..', 'db_dump.json')
];

function cleanText(text) {
  if (!text) return text;
  return text
    .replace(/\?{4} 2027 AGS Hazırlık Programı \?{4}/g, '🚀 2027 MEB AGS Hazırlık Programı 🚀')
    .replace(/\?{4} 2027 Türk Dili ve Edebiyatı ÖABT Hazırlık Programı \?{4}/g, '🚀 2027 Türk Dili ve Edebiyatı ÖABT Hazırlık Programı 🚀')
    .replace(/- \?{4} Konu anlatımı/g, '- 📖 Konu anlatımı')
    .replace(/- \?{4}️ Soru kampı/g, '- 📝 Soru kampı')
    .replace(/- \?{4} Genel tekrar kampı/g, '- 🔄 Genel tekrar kampı')
    .replace(/- \?{4} 1000 kavrama sorusu/g, '- 🎯 1000 kavrama sorusu')
    .replace(/- \?{4} Metin tahlili/g, '- 🔍 Metin tahlili')
    .replace(/- \?{4} 5 TG deneme/g, '- ✍️ 5 TG deneme')
    .replace(/- \?{4} 1500 soru kampı/g, '- ⚡ 1500 soru kampı')
    .replace(/- \?{4}(?:&zwj;|\u200d)\?{4} Uzman kadro/g, '- 👨‍🏫 Uzman kadro')
    .replace(/- \?{4} Güncel içerik/g, '- 📅 Güncel içerik')
    .replace(/- \?{4} Planlı program/g, '- 📅 Planlı program')
    .replace(/- \?{4} Sürekli destek/g, '- 🤝 Sürekli destek')
    .replace(/- \?{4} Atamaya hazırlık/g, '- 🎓 Atamaya hazırlık')
    .replace(/\?{4}️ Yönetim ve Organizasyon/g, '📚 Yönetim ve Organizasyon')
    .replace(/\?{4} Eğitim Yönetimi ve Denetimi/g, '🎓 Eğitim Yönetimi ve Denetimi')
    .replace(/\?{4} İnsan Kaynakları ve İletişim/g, '👥 İnsan Kaynakları ve İletişim')
    .replace(/\?{4} Güncel Konular/g, '📰 Güncel Konular')
    .replace(/\?{4} Ders Modülleri/g, '📘 Ders Modülleri')
    .replace(/\?{4} Bu kamp ile:/g, '💡 Bu kamp ile:')
    // Catch-all for remaining standalone ???? sequence
    .replace(/\?{4,}/g, '•');
}

filePaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const original = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanText(original);
    if (original !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`Successfully cleaned file: ${path.basename(filePath)}`);
    } else {
      console.log(`No corruptions found in file: ${path.basename(filePath)}`);
    }
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
    .replace(/\?{4,}/g, '•');
}

async function main() {
  console.log('Fetching products from database...');
  const products = await prisma.product.findMany({});
  console.log(`Found ${products.length} products.`);

  let updatedCount = 0;
  for (const p of products) {
    const originalDesc = p.description || '';
    const cleanedDesc = cleanText(originalDesc);

    if (originalDesc !== cleanedDesc) {
      console.log(`Updating product: ${p.title} (${p.id})`);
      await prisma.product.update({
        where: { id: p.id },
        data: { description: cleanedDesc }
      });
      updatedCount++;
    }
  }

  console.log(`Finished database updates. Updated ${updatedCount} products.`);
}

main()
  .catch(err => {
    console.error('Error updating database:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

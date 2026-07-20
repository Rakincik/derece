const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Yeni eklenen ürünü bul
    const product = await prisma.product.findFirst({
      where: { title: { contains: 'ekys akademi', mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' }
    });

    if (!product) {
      console.log('HATA: "ekys akademi" isminde bir ürün bulunamadı. Lütfen ürün isminin doğru olduğundan emin olun.');
      return;
    }

    console.log('====================================');
    console.log(`HEDEF ÜRÜN BULUNDU: ${product.title}`);
    console.log(`ÜRÜN ID: ${product.id}`);
    console.log(`FİYAT (Kayıtlara eklenecek tutar): 1499 TL`);
    console.log('====================================\n');

    // 2. Excel dosyasını oku
    const workbook = xlsx.readFile('Öğrenci_Listesi.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Verileri JSON dizisine çevir
    const rawData = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Excel dosyasında toplam ${rawData.length} satır bulundu. Veriler işleniyor...`);

    let successCount = 0;
    let notFoundCount = 0;
    let alreadyExistsCount = 0;

    for (const row of rawData) {
      let email = null;
      for (const key of Object.keys(row)) {
        if (key.toLowerCase().includes('email') || key.toLowerCase().includes('e-posta') || key.toLowerCase().includes('mail')) {
          email = row[key];
          break;
        }
      }

      if (!email) {
        continue;
      }

      email = email.toString().trim().toLowerCase();

      // Kullanıcıyı veritabanında ara
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        notFoundCount++;
        continue;
      }

      // Bu kullanıcı için bu ürüne ait önceden eklenmiş başarılı bir sipariş var mı kontrol et
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          productId: product.id,
          paymentStatus: 'SUCCESS'
        }
      });

      if (existingOrder) {
        alreadyExistsCount++;
        continue;
      }

      // Siparişi veritabanına "Başarılı" ve "1499 TL" olarak kaydet
      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          amount: 1499,
          paymentStatus: 'SUCCESS',
          paymentId: `RESTORE_MANUAL_${Date.now()}_${user.id.substring(0, 5)}`,
        }
      });

      successCount++;
    }

    console.log('\n================ SONUÇ RAPORU ================');
    console.log(`Toplam İncelenen Kayıt: ${rawData.length}`);
    console.log(`Veritabanında Bulunamayan Kayıtsız Kullanıcı: ${notFoundCount}`);
    console.log(`Zaten Eklenmiş (Mükerrer) Sipariş: ${alreadyExistsCount}`);
    console.log(`YENİ EKLENEN VE KURTARILAN SİPARİŞ (CİRO): ${successCount} kişi`);
    console.log(`Toplam Eklenen Ciro: ${successCount * 1499} TL`);
    console.log('==============================================\n');
    console.log('Kurtarma işlemi TAMAMLANDI! Paneli yenileyip kontrol edebilirsiniz.');

  } catch (error) {
    console.error('Kurtarma scriptinde bir hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

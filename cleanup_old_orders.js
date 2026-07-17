const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('Eski PENDING/FAILED sipariş temizliği başlıyor...');
  
  // 1. Tüm başarılı siparişleri çekelim
  const successOrders = await prisma.order.findMany({
    where: { paymentStatus: 'SUCCESS' },
    select: { id: true, userId: true, productId: true }
  });
  
  console.log(`Toplam ${successOrders.length} başarılı sipariş bulundu.`);
  let totalDeleted = 0;

  // 2. Her başarılı sipariş için, aynı kullanıcı ve ürün kombinasyonuna sahip diğer BAŞARISIZ/BEKLEYEN siparişleri silelim
  for (const order of successOrders) {
    const deleted = await prisma.order.deleteMany({
      where: {
        userId: order.userId,
        productId: order.productId,
        id: { not: order.id }, // Kendisini silmemek için
        paymentStatus: { in: ['PENDING', 'FAILED'] }
      }
    });
    
    if (deleted.count > 0) {
      console.log(`Kullanıcı (${order.userId.slice(-6)}) - Ürün (${order.productId.slice(-6)}): ${deleted.count} eski çöp kayıt silindi.`);
      totalDeleted += deleted.count;
    }
  }

  console.log('-----------------------------------');
  console.log(`Temizlik tamamlandı! Toplam silinen çöp sipariş sayısı: ${totalDeleted}`);
  await prisma.$disconnect();
}

cleanup().catch(e => {
  console.error(e);
  prisma.$disconnect();
});

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const emailsToRecover = require('./emails.json');

async function main() {
  try {
    const product = await prisma.product.findFirst({
      where: { title: { contains: 'ekys akademi', mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' }
    });

    if (!product) {
      console.log('HATA: Yeni eklenen ürün bulunamadı!');
      return;
    }

    console.log('Ürün ID:', product.id, 'Fiyat: 1499 TL');
    
    let successCount = 0;
    
    for (const email of emailsToRecover) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) continue;

      const existing = await prisma.order.findFirst({
        where: { userId: user.id, productId: product.id, paymentStatus: 'SUCCESS' }
      });

      if (existing) continue;

      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          amount: 1499,
          paymentStatus: 'SUCCESS',
          paymentId: 'RESTORE_MANUAL_' + Date.now() + '_' + user.id.substring(0,5),
        }
      });
      successCount++;
    }

    console.log('KURTARILAN SİPARİŞ SAYISI:', successCount);
    console.log('TOPLAM EKLENEN CİRO:', successCount * 1499, 'TL');
    console.log('İŞLEM TAMAMLANDI!');
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCoupons() {
  try {
    const coupons = await prisma.coupon.findMany();
    
    console.log("=== KUPON KULLANIM RAPORU ===");
    for (const coupon of coupons) {
      const successfulOrders = await prisma.order.count({
        where: {
          paymentStatus: 'SUCCESS',
          paymentId: { endsWith: `_${coupon.code}` }
        }
      });

      const failedOrders = await prisma.order.count({
        where: {
          paymentStatus: 'FAILED',
          paymentId: { endsWith: `_${coupon.code}` }
        }
      });

      console.log(`\nKupon: ${coupon.code}`);
      console.log(`- Mevcut Kayıtlı Kullanım (Veritabanında Yazan): ${coupon.uses} / ${coupon.maxUses}`);
      console.log(`- BAŞARILI Siparişlerde Kullanım: ${successfulOrders}`);
      console.log(`- BAŞARISIZ Siparişlerde Kullanım (Bug yüzünden başarısız görünenler olabilir): ${failedOrders}`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCoupons();

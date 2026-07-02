const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncCoupons() {
  try {
    const coupons = await prisma.coupon.findMany();
    
    for (const coupon of coupons) {
      // Find successful orders where paymentId ends with the coupon code
      // We need to use findMany and filter in JS or use Prisma's string filters
      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: 'SUCCESS',
          paymentId: {
            endsWith: `_${coupon.code}`
          }
        },
        select: {
          paymentId: true
        }
      });

      // Get unique paymentIds (one checkout session = 1 usage)
      const uniquePaymentIds = new Set(orders.map(o => o.paymentId));
      const actualUses = uniquePaymentIds.size;

      if (coupon.uses !== actualUses) {
        console.log(`Coupon ${coupon.code}: Updating uses from ${coupon.uses} to ${actualUses}`);
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { uses: actualUses }
        });
      } else {
        console.log(`Coupon ${coupon.code}: Uses are correct (${actualUses})`);
      }
    }
    
    console.log('Done syncing coupons.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

syncCoupons();

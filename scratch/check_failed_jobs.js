const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allOrders = await prisma.order.findMany({
    include: {
      user: true,
      product: true,
      lmsQueue: true
    }
  });

  console.log(`Total orders in DB: ${allOrders.length}`);
  
  const paymentStatuses = {};
  allOrders.forEach(o => {
    paymentStatuses[o.paymentStatus] = (paymentStatuses[o.paymentStatus] || 0) + 1;
  });
  console.log('Payment status counts:', paymentStatuses);

  // Group by having lmsQueue or not
  const withQueue = allOrders.filter(o => o.lmsQueue !== null);
  const withoutQueue = allOrders.filter(o => o.lmsQueue === null);

  console.log(`Orders with lmsQueue: ${withQueue.length}`);
  console.log(`Orders without lmsQueue: ${withoutQueue.length}`);

  if (withoutQueue.length > 0) {
    console.log('\n--- Orders without LmsQueue ---');
    withoutQueue.forEach(o => {
      console.log(`Order ID: ${o.id}, Payment Status: ${o.paymentStatus}, Date: ${o.createdAt}`);
      if (o.user) {
        console.log(`  User: ${o.user.name} (${o.user.email}) - Phone: ${o.user.phone}`);
      }
      if (o.product) {
        console.log(`  Product: ${o.product.title}`);
      }
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

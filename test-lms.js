const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const user = await prisma.user.findFirst();
  const product = await prisma.product.findFirst({ where: { lmsCourseId: { not: null } } });
  if (!user || !product) {
    console.log('User or Product with lmsCourseId not found!');
    return;
  }
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: product.id,
      amount: 10,
      paymentStatus: 'SUCCESS',
      paymentId: 'test_payment_' + Date.now()
    }
  });
  await prisma.lmsQueue.create({
    data: { orderId: order.id, status: 'PENDING' }
  });
  console.log('Test Order and Queue created successfully!');
}
test().finally(() => prisma.$disconnect());

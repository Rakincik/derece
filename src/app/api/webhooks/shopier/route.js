import { ShopierWebhookRouter, handleWebhookRequest } from '@nopeion/shopier';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!process.env.SHOPIER_WEBHOOK_TOKEN) {
    console.error('SHOPIER_WEBHOOK_TOKEN eksik! Lütfen .env dosyanıza ekleyin.');
    return new Response('Webhook Token Config Error', { status: 500 });
  }

  const router = new ShopierWebhookRouter(process.env.SHOPIER_WEBHOOK_TOKEN);

  router.on('order.created', async (event) => {
    const orderData = event.data;
    
    // Webhook order.created payload'ında ürün verileri lineItems içerisindedir
    if (!orderData || !orderData.lineItems || orderData.lineItems.length === 0) {
      console.warn('Webhook: order.created payload missing lineItems', orderData);
      return;
    }

    // İlk ürünün productId bilgisini alarak veritabanındaki siparişi eşleştiriyoruz
    const shopierProductId = orderData.lineItems[0].productId?.toString();
    if (!shopierProductId) {
      console.warn('Webhook: No productId in lineItems', orderData.lineItems);
      return;
    }

    console.log(`Shopier REST Webhook received - Product ID: ${shopierProductId}`);

    // Bekleyen siparişlerimizi sorgula
    const orders = await prisma.order.findMany({
      where: { 
        paymentId: { startsWith: shopierProductId },
        paymentStatus: 'PENDING'
      },
      include: { product: true }
    });

    if (orders.length === 0) {
      console.warn(`Webhook: No pending orders found starting with productId: ${shopierProductId}`);
      return;
    }

    const exactPaymentId = orders[0].paymentId;

    // Siparişleri SUCCESS'e çevir
    await prisma.order.updateMany({
      where: { paymentId: exactPaymentId },
      data: { paymentStatus: 'SUCCESS' }
    });
    console.log(`Webhook: Marked ${orders.length} orders as SUCCESS for transaction: ${exactPaymentId}`);

    // Terk edilmiş sepeti temizle
    const userId = orders[0].userId;
    try {
      await prisma.abandonedCart.deleteMany({
        where: { userId }
      });
    } catch (cartErr) {
      console.error('Webhook: Abandoned cart clear error:', cartErr);
    }

    // Eski başarısız / bekleyen (PENDING/FAILED) sipariş çöplerini temizle
    for (const dbOrder of orders) {
      try {
        const deleted = await prisma.order.deleteMany({
          where: {
            userId: dbOrder.userId,
            productId: dbOrder.productId,
            id: { not: dbOrder.id }, // Mevcut başarılı siparişi silme
            paymentStatus: { in: ['PENDING', 'FAILED'] }
          }
        });
        if (deleted.count > 0) {
          console.log(`Webhook: Cleaned up ${deleted.count} old pending/failed orders for user ${dbOrder.userId}, product ${dbOrder.productId}`);
        }
      } catch (cleanupErr) {
        console.error('Webhook: Cleanup old orders error:', cleanupErr);
      }
    }

    // LMS sırasına ekle
    for (const dbOrder of orders) {
      if (dbOrder.product?.lmsCourseId) {
        try {
          const existingJob = await prisma.lmsQueue.findUnique({
            where: { orderId: dbOrder.id }
          });
          
          if (!existingJob) {
            await prisma.lmsQueue.create({
              data: {
                orderId: dbOrder.id,
                status: 'PENDING'
              }
            });
            console.log(`Webhook: LMS Queue added for Order: ${dbOrder.id}`);
          }
        } catch (qErr) {
          console.error('Webhook: LMS Queue create error:', qErr);
        }
      }
    }

    // Kupon kodunu bulup kullanım hakkını eksilt
    const parts = exactPaymentId.split('_');
    if (parts.length > 1) {
      const couponCode = parts[parts.length - 1];
      if (couponCode && couponCode.length > 0 && exactPaymentId.includes('_')) {
        try {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { uses: { increment: 1 } }
          });
          console.log(`Webhook: Coupon usage incremented: ${couponCode}`);
        } catch (couponErr) {
          console.error(`Webhook: Coupon (${couponCode}) update error:`, couponErr);
        }
      }
    }
  });

  // Shopier'den gelen isteği router ile yakala ve doğrula
  return handleWebhookRequest(request, router);
}

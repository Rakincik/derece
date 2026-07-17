import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyOsb, parseOsbPayload } from '@nopeion/shopier';

export const dynamic = 'force-dynamic';

// Handle server-to-server POST Webhook (Shopier OSB)
export async function POST(request) {
  let orderId = '';
  
  try {
    const formData = await request.formData();
    const res = formData.get('res') || '';
    const hash = formData.get('hash') || '';

    if (!res || !hash) {
      console.warn('Shopier Webhook callback received empty payload.');
      return new Response('Invalid Payload', { status: 400 });
    }

    // 1. Signature Verification
    const verification = verifyOsb({
      username: process.env.SHOPIER_OSB_USERNAME || '',
      password: process.env.SHOPIER_OSB_PASSWORD || '',
      res,
      hash
    });

    if (!verification.verified) {
      console.error(`Shopier Webhook: Signature verification failed! Error: ${verification.error}`);
      return new Response('Invalid Signature', { status: 400 });
    }

    // 2. Parse payload
    const payload = parseOsbPayload(res);
    orderId = payload.orderId || ''; // Our transaction/paymentId
    
    console.log(`Shopier OSB Callback received for Order ID (paymentId): ${orderId}`);

    if (!orderId) {
      return new Response('Missing Order ID', { status: 400 });
    }

    // 3. Process payment status update in database
    // Fetch all pending orders for this transaction
    const orders = await prisma.order.findMany({
      where: { paymentId: orderId },
      include: { product: true }
    });

    if (orders.length === 0) {
      console.warn(`Shopier Callback: No pending orders found for paymentId: ${orderId}`);
      return new Response('success', { status: 200 }); // Return success so Shopier stops retrying
    }

    // 4. Update order statuses to SUCCESS
    await prisma.order.updateMany({
      where: { paymentId: orderId },
      data: { paymentStatus: 'SUCCESS' }
    });

    console.log(`Shopier Callback: Marked ${orders.length} orders as SUCCESS for transaction: ${orderId}`);

    // Clear user's abandoned cart
    const userId = orders[0].userId;
    try {
      await prisma.abandonedCart.deleteMany({
        where: { userId }
      });
      console.log(`Abandoned cart cleared for user: ${userId}`);
    } catch (cartErr) {
      console.error('Failed to delete abandoned cart in callback:', cartErr);
    }

    // 5. Queue LMS registration for each product that has an lmsCourseId
    for (const order of orders) {
      if (order.product?.lmsCourseId) {
        try {
          // Check if already queued to prevent duplicate runs
          const existingJob = await prisma.lmsQueue.findUnique({
            where: { orderId: order.id }
          });
          
          if (!existingJob) {
            await prisma.lmsQueue.create({
              data: {
                orderId: order.id,
                status: 'PENDING'
              }
            });
            console.log(`LMS Queue added for Order: ${order.id}, Course: ${order.product.lmsCourseId}`);
          }
        } catch (qErr) {
          console.error('LMS Queue create error:', qErr);
        }
      }
    }

    // 6. Parse coupon code from paymentId and increment its use count
    // Format is tr_[random]_[couponCode]
    const parts = orderId.split('_');
    if (parts.length > 2) {
      const couponCode = parts[2];
      try {
        await prisma.coupon.update({
          where: { code: couponCode },
          data: { uses: { increment: 1 } }
        });
        console.log(`Shopier Callback: Coupon usage incremented: ${couponCode}`);
      } catch (couponErr) {
        console.error(`Shopier Callback: Coupon (${couponCode}) update error:`, couponErr);
      }
    }

    return new Response('success', { status: 200 });

  } catch (error) {
    console.error('Shopier Callback General Error:', error);
    
    // Fallback: mark orders as FAILED if we have orderId and error happens
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: { paymentId: orderId, paymentStatus: 'PENDING' },
          data: { paymentStatus: 'FAILED' }
        });
      } catch (dbErr) {
        console.error('Callback error db update fallback failed:', dbErr);
      }
    }

    return new Response('Internal Server Error', { status: 500 });
  }
}

// Defensive GET handler if the user's browser is redirected here
export async function GET(request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dereceuzem.com';
  return NextResponse.redirect(`${siteUrl}/hesabim?success=true`, 303);
}

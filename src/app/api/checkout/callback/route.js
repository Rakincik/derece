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
    const shopierOrderId = payload.orderId || ''; // Shopier's auto-generated Order ID
    const shopierProductId = payload.productId ? payload.productId.toString() : ''; // The product ID we created
    
    // DEBUG: Write payload to a public file so we can inspect it live!
    try {
      const fs = require('fs');
      const path = require('path');
      const debugPath = path.join(process.cwd(), 'public', 'osb_debug.json');
      fs.appendFileSync(debugPath, JSON.stringify({
        time: new Date().toISOString(),
        payload: payload,
        shopierOrderId,
        shopierProductId
      }) + '\n');
    } catch (e) {
      console.error('Debug write failed', e);
    }
    
    // We use the productId for tracking because we bypassed the checkoutHtml form.
    // If productId is not found in the payload, fallback to orderId for compatibility
    orderId = shopierProductId || shopierOrderId; 
    
    console.log(`Shopier OSB Callback received - Shopier Order ID: ${shopierOrderId}, Product ID: ${shopierProductId}`);

    if (!orderId) {
      return new Response('Missing Order/Product ID', { status: 400 });
    }

    // 3. Process payment status update in database
    // Because we might have appended the coupon code (e.g. 49052613_YAZ20), we use startsWith
    const orders = await prisma.order.findMany({
      where: { 
        paymentId: { startsWith: orderId },
        paymentStatus: 'PENDING'
      },
      include: { product: true }
    });

    if (orders.length === 0) {
      console.warn(`Shopier Callback: No pending orders found starting with paymentId: ${orderId}`);
      return new Response('success', { status: 200 }); // Return success so Shopier stops retrying
    }

    // Since startsWith can match multiple if not careful, we get the exact paymentId from the first match
    const exactPaymentId = orders[0].paymentId;

    // 4. Update order statuses to SUCCESS
    await prisma.order.updateMany({
      where: { paymentId: exactPaymentId },
      data: { paymentStatus: 'SUCCESS' }
    });

    console.log(`Shopier Callback: Marked ${orders.length} orders as SUCCESS for transaction: ${exactPaymentId}`);

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

    // 6. Parse coupon code from exactPaymentId and increment its use count
    // Format is [productId]_[couponCode] or tr_[random]_[couponCode]
    const parts = exactPaymentId.split('_');
    if (parts.length > 1) {
      // The coupon code is always the last part after the underscore
      const couponCode = parts[parts.length - 1];
      // Only process if it actually looks like a coupon (e.g. length > 0)
      if (couponCode && couponCode.length > 0 && exactPaymentId.includes('_')) {
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

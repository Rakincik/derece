import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateCallbackHash, completePayment } from '@/lib/paramPos';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let orderId = '';
  
  try {
    const formData = await request.formData();
    
    // Param POS POST parameters returned from bank redirect
    const islemGUID = formData.get('islemGUID') || '';
    const md = formData.get('md') || '';
    const mdStatus = formData.get('mdStatus') || '';
    orderId = formData.get('orderId') || ''; // Our paymentId
    const islemHash = formData.get('islemHash') || '';

    console.log(`Param POS Callback received for Order ID: ${orderId}, mdStatus: ${mdStatus}`);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // 1. Signature Verification (SHA-1)
    // Formula: islemGUID + md + mdStatus + orderId + Lowercase(PARAM_GUID)
    const guid = (process.env.PARAM_GUID || '').toLowerCase();
    const expectedHashString = `${islemGUID}${md}${mdStatus}${orderId}${guid}`;
    const calculatedHash = generateCallbackHash(expectedHashString);

    if (calculatedHash !== islemHash) {
      console.error(`Param Callback: İmza doğrulama hatası! Beklenen: ${calculatedHash}, Gelen: ${islemHash}`);
      return NextResponse.redirect(`${siteUrl}/urunler?error=invalid_signature`, 303);
    }

    // 2. Check 3D validation status (1, 2, 3, 4 are successful validation values)
    const is3dSuccess = ['1', '2', '3', '4'].includes(mdStatus);

    if (!is3dSuccess) {
      console.warn(`Param Callback: 3D Doğrulama Başarısız. mdStatus: ${mdStatus}`);
      await prisma.order.updateMany({
        where: { paymentId: orderId },
        data: { paymentStatus: 'FAILED' }
      });
      return NextResponse.redirect(`${siteUrl}/urunler?error=3d_failed`, 303);
    }

    // 3. Step 2: Complete Payment / Capture (TP_WMD_Pay)
    const captureResult = await completePayment({
      orderId,
      islemGuid: islemGUID,
      ucdMd: md
    });

    if (captureResult.success) {
      console.log(`Param POS Capture Successful for Order ID: ${orderId}`);

      // 4. Update order status to SUCCESS and fetch product details
      const existingOrder = await prisma.order.findFirst({
        where: { paymentId: orderId }
      });

      let updatedOrder = null;
      if (existingOrder) {
        updatedOrder = await prisma.order.update({
          where: { id: existingOrder.id },
          data: { paymentStatus: 'SUCCESS' },
          include: { product: true }
        });
      }

      // 4.1 Queue LMS registration if product has lmsCourseId
      if (updatedOrder && updatedOrder.product?.lmsCourseId) {
        try {
          await prisma.lmsQueue.create({
            data: {
              orderId: updatedOrder.id,
              status: 'PENDING'
            }
          });
          console.log(`LMS Queue added for Order: ${updatedOrder.id}, Course: ${updatedOrder.product.lmsCourseId}`);
        } catch (qErr) {
          console.error('LMS Queue create error:', qErr);
        }
      }

      // 5. Parse coupon code from paymentId and increment its use count
      // Format is tr_[random]_[couponCode]
      const parts = orderId.split('_');
      if (parts.length > 2) {
        const couponCode = parts[2];
        try {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { uses: { increment: 1 } }
          });
          console.log(`Param Callback: Kupon kullanım sayısı arttırıldı: ${couponCode}`);
        } catch (couponErr) {
          console.error(`Param Callback: Kupon (${couponCode}) güncelleme hatası:`, couponErr);
        }
      }

      return NextResponse.redirect(`${siteUrl}/hesabim?success=true`, 303);
    } else {
      console.error(`Param POS Capture Failed for Order ID: ${orderId}, Reason: ${captureResult.aciklama}`);
      
      // Update order status to FAILED
      await prisma.order.updateMany({
        where: { paymentId: orderId },
        data: { paymentStatus: 'FAILED' }
      });

      return NextResponse.redirect(`${siteUrl}/urunler?error=payment_failed&reason=${encodeURIComponent(captureResult.aciklama)}`, 303);
    }

  } catch (error) {
    console.error('Param POS Callback Genel Hatası:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: { paymentId: orderId },
          data: { paymentStatus: 'FAILED' }
        });
      } catch (dbErr) {
        console.error('Callback error db update fallback failed:', dbErr);
      }
    }

    return NextResponse.redirect(`${siteUrl}/urunler?error=system_error`, 303);
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { init3DPayment, queryBIN, queryInstallmentRates, getNormalizedBrandName } from '@/lib/paramPos';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 1. Authenticate user from cookie
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Satın alma işlemi için lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 2. Parse request body
    const body = await request.json();
    const { items, couponCode, cardName, cardNumber, expiryMonth, expiryYear, cvv, installmentCount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Sepetiniz boş.' },
        { status: 400 }
      );
    }

    // 3. Retrieve and validate products from Database to prevent client price-tampering
    const productIds = items.map(item => item.id.toString());
    
    // Check if all IDs are valid UUID format to prevent database type casting crashes
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hasInvalidId = productIds.some(id => !uuidRegex.test(id));
    if (hasInvalidId) {
      return NextResponse.json(
        { error: 'Sepetinizde eski/geçersiz ürünler bulunuyor. Lütfen sepetinizi boşaltıp ürünleri tekrar ekleyin.' },
        { status: 400 }
      );
    }

    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Sepetinizdeki bazı ürünler sistemde bulunamadı.' },
        { status: 400 }
      );
    }

    // 4. Check if the user already owns any of these products
    const existingSuccessfulOrders = await prisma.order.findMany({
      where: {
        userId,
        productId: { in: productIds },
        paymentStatus: 'SUCCESS'
      }
    });

    if (existingSuccessfulOrders.length > 0) {
      const ownedProductIds = existingSuccessfulOrders.map(o => o.productId);
      const ownedProducts = dbProducts.filter(p => ownedProductIds.includes(p.id));
      const ownedTitles = ownedProducts.map(p => p.title).join(', ');
      
      return NextResponse.json(
        { error: `Zaten şu ürünlere sahipsiniz: ${ownedTitles}. Tekrar satın alamazsınız.` },
        { status: 400 }
      );
    }

    // Calculate subtotal from DB prices (respecting discounted price if set)
    const subtotal = dbProducts.reduce((sum, p) => sum + (p.discountedPrice || p.price), 0);

    // 5. Coupon validation
    let discount = 0;
    let coupon = null;

    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      coupon = await prisma.coupon.findUnique({
        where: { code: upperCode }
      });

      if (coupon && coupon.isActive) {
        const isNotExpired = !coupon.expiryDate || new Date() <= new Date(coupon.expiryDate);
        const hasUsesLeft = coupon.uses < coupon.maxUses;

        if (isNotExpired && hasUsesLeft) {
          if (coupon.productIds && coupon.productIds.length > 0) {
            // Apply discount to any products in the cart that match the restricted IDs list
            const targetProducts = dbProducts.filter(p => coupon.productIds.includes(p.id));
            if (targetProducts.length > 0) {
              const targetSubtotal = targetProducts.reduce((sum, p) => sum + (p.discountedPrice || p.price), 0);
              if (coupon.discountType === 'PERCENTAGE') {
                discount = (targetSubtotal * coupon.discountValue) / 100;
              } else if (coupon.discountType === 'FIXED') {
                discount = Math.min(coupon.discountValue, targetSubtotal);
              }
            }
          } else {
            // Apply globally to the subtotal
            if (coupon.discountType === 'PERCENTAGE') {
              discount = (subtotal * coupon.discountValue) / 100;
            } else if (coupon.discountType === 'FIXED') {
              discount = Math.min(coupon.discountValue, subtotal);
            }
          }
        }
      }
    }

    const baseTotal = Math.max(0, subtotal - discount);

    // 5b. Installment and commission rate calculations
    const finalInstallmentCount = installmentCount ? parseInt(installmentCount, 10) : 1;
    let commissionRate = 0;

    if (baseTotal > 0 && finalInstallmentCount > 1) {
      const cleanCardNumber = (cardNumber || '').replace(/\s+/g, '');
      if (cleanCardNumber.length < 6) {
        return NextResponse.json(
          { error: 'Geçersiz kart numarası.' },
          { status: 400 }
        );
      }
      const bin = cleanCardNumber.substring(0, 6);
      
      const { brand, isCredit } = await queryBIN(bin);
      if (!isCredit) {
        return NextResponse.json(
          { error: 'Banka kartlarına taksit yapılamaz. Lütfen tek çekim deneyin.' },
          { status: 400 }
        );
      }

      const rates = await queryInstallmentRates();
      const normalizedBrand = getNormalizedBrandName(brand);
      
      let bankRates = rates.find(r => r.bankName.toLowerCase().trim() === normalizedBrand.toLowerCase().trim());
      if (!bankRates) {
        bankRates = rates.find(r => r.bankName.includes('Diğer Banka Kartları'));
      }

      if (bankRates && bankRates.installments && bankRates.installments[finalInstallmentCount] !== undefined) {
        commissionRate = bankRates.installments[finalInstallmentCount];
        if (commissionRate < 0) {
          return NextResponse.json(
            { error: `Seçtiğiniz kart için ${finalInstallmentCount} taksit seçeneği aktif değildir.` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Seçtiğiniz kart için taksit seçeneği bulunamadı.` },
          { status: 400 }
        );
      }
    }

    const total = Math.max(0, baseTotal + (baseTotal * commissionRate) / 100);
    const isFreeCheckout = total === 0;

    if (!isFreeCheckout) {
      if (!cardName || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
        return NextResponse.json(
          { error: 'Lütfen kredi kartı bilgilerini eksiksiz doldurun.' },
          { status: 400 }
        );
      }
    }

    // 6. Generate a transaction payment ID (Must be unique and fit inside Param's Siparis_ID length <= 50)
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timePart = Date.now().toString(36);
    const paymentId = coupon 
      ? `tr_${randomPart}${timePart}_${coupon.code.toUpperCase().trim()}`.substring(0, 50)
      : `tr_${randomPart}${timePart}`;

    // 7. Create orders in database with status PENDING (we'll approve them in the callback)
    const createdOrders = [];

    await prisma.$transaction(async (tx) => {
      for (const product of dbProducts) {
        // Calculate proportional amount for this item
        const itemPrice = product.discountedPrice || product.price;
        let amount = itemPrice;
        if (discount > 0 && subtotal > 0) {
          const itemProportion = itemPrice / subtotal;
          const itemDiscount = discount * itemProportion;
          amount = Math.max(0, itemPrice - itemDiscount);
        }

        // Apply installment commission if applicable
        if (commissionRate > 0) {
          amount = amount + (amount * commissionRate) / 100;
        }

        const order = await tx.order.create({
          data: {
            userId,
            productId: product.id,
            amount: parseFloat(amount.toFixed(2)),
            paymentStatus: 'PENDING',
            paymentId
          }
        });

        createdOrders.push(order);
      }
    });

    // 8. Initiate 3D Secure payment with Param POS (or bypass if 0 TL)
    try {
      if (isFreeCheckout) {
        // --- 0 TL BYPASS LOGIC ---
        // 1. Mark orders as SUCCESS
        await prisma.order.updateMany({
          where: { paymentId },
          data: { paymentStatus: 'SUCCESS' }
        });

        // Delete the user's abandoned cart since the purchase is successful
        try {
          await prisma.abandonedCart.deleteMany({
            where: { userId }
          });
          console.log(`Abandoned cart cleared for free checkout user: ${userId}`);
        } catch (cartErr) {
          console.error('Failed to delete abandoned cart in free checkout:', cartErr);
        }

        // 2. Add to LMS Queue for each product that has lmsCourseId
        for (const product of dbProducts) {
          if (product.lmsCourseId) {
            const order = createdOrders.find(o => o.productId === product.id);
            if (order) {
              await prisma.lmsQueue.create({
                data: {
                  orderId: order.id,
                  lmsCourseId: product.lmsCourseId,
                  status: 'PENDING'
                }
              });
            }
          }
        }

        // 3. Increment coupon usage if used
        if (coupon) {
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { uses: { increment: 1 } }
          });
        }

        return NextResponse.json({
          message: 'Ücretsiz işlem başarıyla tamamlandı.',
          freeCheckout: true,
          paymentId
        }, { status: 200 });

      } else {
        // --- NORMAL PARAM POS 3D SECURE FLOW ---
        const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
        
        // Success/Fail Redirect endpoints
        const host = request.headers.get('host') || 'dereceuzem.com';
        const proto = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        const siteUrl = `${proto}://${host}`;
        const successUrl = `${siteUrl}/api/checkout/callback`;
        const failUrl = `${siteUrl}/api/checkout/callback`;

        const redirectFormHtml = await init3DPayment({
          orderId: paymentId,
          amount: total,
          cardHolderName: cardName,
          cardNumber: cardNumber.replace(/\s+/g, ''),
          expireMonth: expiryMonth.toString().padStart(2, '0'),
          expireYear: expiryYear.toString().length === 2 ? '20' + expiryYear : expiryYear.toString(),
          cvv: cvv.toString(),
          successUrl,
          failUrl,
          clientIp,
          installmentCount: finalInstallmentCount,
          // Send coupon details in Data1 metadata field so we can increment coupon count in the callback route
          data1: coupon ? coupon.code : ''
        });

        return NextResponse.json({
          message: '3D Secure başlatıldı.',
          '3dForm': redirectFormHtml,
          paymentId
        }, { status: 201 });
      }

    } catch (paramErr) {
      console.error('Param POS 3D Init Hatası:', paramErr);
      
      // Mark orders as FAILED in database
      await prisma.order.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'FAILED' }
      });

      return NextResponse.json(
        { error: paramErr.message || 'Sanal POS ödemesi başlatılamadı.' },
        { status: 502 }
      );
    }

  } catch (error) {
    console.error('Checkout processing error:', error);
    return NextResponse.json(
      { error: 'Ödeme işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

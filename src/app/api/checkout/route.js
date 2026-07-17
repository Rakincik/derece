import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { ShopierApiClient, ShopierPaymentFlow } from '@nopeion/shopier';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Initialize Shopier Client & Payment Flow dynamically inside the request handler to prevent build-time crashes when env keys are blank
  const shopierClient = new ShopierApiClient({
    pat: process.env.SHOPIER_PAT || ''
  });
  const shopierPayments = new ShopierPaymentFlow({
    client: shopierClient
  });
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
    const { items, couponCode } = body;

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

    const total = Math.max(0, subtotal - discount);
    const isFreeCheckout = total === 0;

    // 6. Generate a transaction payment ID (Must be unique and fit inside Shopier's Order ID limit)
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

    // 8. Initiate payment (or bypass if 0 TL)
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
        // --- NORMAL SHOPIER HOSTED CHECKOUT FLOW ---
        // Retrieve full user record to populate buyer information
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          return NextResponse.json(
            { error: 'Kullanıcı bulunamadı.' },
            { status: 404 }
          );
        }

        const nameParts = (user.name || 'Değerli Öğrenci').trim().split(/\s+/);
        const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || 'Değerli';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Öğrenci';
        const email = user.email || 'ogrenci@dereceuzem.com';
        const phone = user.phone || '05555555555';

        // Since it's a digital package/training pack, address fields can be filled with dummy info
        const billingAddress = user.city ? `${user.district || ''} ${user.city}` : 'Online Eğitim';
        const billingCity = user.city || 'Istanbul';
        const billingCountry = 'Turkiye';
        const billingPostcode = '34000';

        const rawImage = dbProducts[0]?.coverImage;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dereceuzem.com';
        const validImageUrl = rawImage 
          ? (rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`)
          : `${siteUrl}/logo.png`;

        const paymentResult = await shopierPayments.createPaymentLink({
          title: dbProducts.map(p => p.title).join(', ').substring(0, 100),
          amount: parseFloat(total.toFixed(2)),
          currency: 'TRY',
          imageUrl: validImageUrl,
          orderId: paymentId,
          hostedCheckout: true,
          shopSlug: process.env.SHOPIER_SHOP_SLUG || 'dereceuzem',
        });

        // The SDK returns checkoutHtml which is an auto-submitting POST form to Shopier
        return NextResponse.json({
          message: 'Shopier ödemesi başlatıldı.',
          '3dForm': paymentResult.checkoutHtml,
          paymentId
        }, { status: 201 });
      }

    } catch (shopierErr) {
      console.error('Shopier Ödeme Başlatma Hatası:', shopierErr);
      console.error('Shopier Error Details:', shopierErr.details);
      
      const errorDetails = shopierErr.details ? JSON.stringify(shopierErr.details) : shopierErr.message;

      // Mark orders as FAILED in database
      await prisma.order.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'FAILED' }
      });

      return NextResponse.json(
        { error: `Shopier API Error: ${errorDetails} | Msg: ${shopierErr.message}` },
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

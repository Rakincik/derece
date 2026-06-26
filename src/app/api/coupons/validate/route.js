import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Kupon kodu belirtilmedi.' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // Kuponu veritabanında ara
    const coupon = await prisma.coupon.findUnique({
      where: { code: upperCode },
    });

    // Kupon bulunamadıysa
    if (!coupon) {
      return NextResponse.json(
        { error: 'Geçersiz kupon kodu.' },
        { status: 404 }
      );
    }

    // Kupon pasif durumdaysa
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Bu kupon kodu artık aktif değil.' },
        { status: 400 }
      );
    }

    // Kuponun kullanım limiti dolmuşsa
    if (coupon.uses >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Bu kuponun kullanım limiti doldu.' },
        { status: 400 }
      );
    }

    // Kuponun süresi geçmişse
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json(
        { error: 'Bu kuponun geçerlilik süresi dolmuş.' },
        { status: 400 }
      );
    }

    // Kupon geçerliyse
    let restrictedProducts = [];
    if (coupon.productIds && coupon.productIds.length > 0) {
      restrictedProducts = await prisma.product.findMany({
        where: { id: { in: coupon.productIds } },
        select: { id: true, title: true }
      });
    }

    return NextResponse.json({
      message: 'Kupon kodu başarıyla uygulandı.',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        productIds: coupon.productIds,
        restrictedProducts: restrictedProducts
      },
    });
  } catch (error) {
    console.error('Kupon doğrulama hatası:', error);
    return NextResponse.json(
      { error: 'Kupon doğrulanırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

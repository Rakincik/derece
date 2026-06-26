import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function GET(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Kupon listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kuponlar yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, maxUses, expiryDate, productIds } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: 'Lütfen zorunlu alanları doldurun (Kod, İndirim Tipi, İndirim Değeri).' },
        { status: 400 }
      );
    }

    if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
      return NextResponse.json(
        { error: 'Geçersiz indirim tipi.' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // Kupon kodunun benzersiz olup olmadığını kontrol ediyoruz
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: upperCode },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Bu indirim kodu zaten mevcut.' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: upperCode,
        discountType,
        discountValue: parseFloat(discountValue),
        maxUses: maxUses !== undefined ? parseInt(maxUses) : 100,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        productIds: Array.isArray(productIds) ? productIds : [],
      },
    });

    return NextResponse.json(
      { message: 'İndirim kuponu başarıyla oluşturuldu.', coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kupon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kupon oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

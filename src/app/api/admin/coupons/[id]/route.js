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

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isActive, maxUses, expiryDate, discountValue } = body;

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Kupon bulunamadı.' }, { status: 404 });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (maxUses !== undefined) updateData.maxUses = parseInt(maxUses);
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: 'İndirim kuponu başarıyla güncellendi.',
      coupon,
    });
  } catch (error) {
    console.error('Kupon güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kupon güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return NextResponse.json({ error: 'Kupon bulunamadı.' }, { status: 404 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'İndirim kuponu başarıyla silindi.',
    });
  } catch (error) {
    console.error('Kupon silme hatası:', error);
    return NextResponse.json(
      { error: 'Kupon silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function checkAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { orders } = body; // Expected format: Array of { id: string, sortOrder: number }

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı. Bir ürün listesi bekleniyor.' },
        { status: 400 }
      );
    }

    // Perform updates inside a transaction
    await prisma.$transaction(
      orders.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { sortOrder: parseInt(item.sortOrder) },
        })
      )
    );

    revalidatePath('/');
    revalidatePath('/urunler');

    return NextResponse.json({ message: 'Ürün sıralaması başarıyla güncellendi.' });
  } catch (error) {
    console.error('Ürün sıralama güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün sıralaması güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

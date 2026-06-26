import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { mapProduct } from '@/lib/productHelper';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Ürün slug değeri belirtilmedi.' },
        { status: 400 }
      );
    }

    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { category: true }
    });

    if (!dbProduct) {
      return NextResponse.json(
        { error: 'Eğitim paketi bulunamadı.' },
        { status: 404 }
      );
    }

    const product = mapProduct(dbProduct);

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Ürün detay yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün detayı yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

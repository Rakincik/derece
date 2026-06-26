import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { mapProduct } from '@/lib/productHelper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    const products = dbProducts.map(mapProduct);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Katalog listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün kataloğu yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Map _count.products to count for frontend compatibility
    const mappedCategories = categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      count: cat._count.products,
      dbId: cat.id,
      showInNavbar: cat.showInNavbar
    }));

    return NextResponse.json({ categories: mappedCategories });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

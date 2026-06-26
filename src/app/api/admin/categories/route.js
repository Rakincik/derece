import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to convert Turkish characters for slugs
function slugify(text) {
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };
  
  let slug = text.toString().toLowerCase().trim();
  
  Object.keys(trMap).forEach((key) => {
    slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
  });

  return slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu.' },
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
    const { name, description, icon, color, sortOrder, showInNavbar } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Lütfen kategori adını belirtin.' },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Check slug uniqueness
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu isme benzer bir kategori zaten mevcut. Lütfen başka bir isim girin.' },
        { status: 400 }
      );
    }

    // Auto-calculate the next sortOrder if not provided
    let finalSortOrder = 0;
    if (sortOrder !== undefined) {
      finalSortOrder = parseInt(sortOrder);
    } else {
      const maxCategory = await prisma.category.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = maxCategory ? maxCategory.sortOrder + 1 : 0;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || 'BookOpen',
        color: color || 'from-blue-500 to-indigo-600',
        sortOrder: finalSortOrder,
        showInNavbar: showInNavbar !== undefined ? Boolean(showInNavbar) : true,
      },
    });

    return NextResponse.json(
      { message: 'Kategori başarıyla oluşturuldu.', category },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

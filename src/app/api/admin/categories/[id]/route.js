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

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, icon, color, sortOrder, showInNavbar } = body;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategori bulunamadı.' }, { status: 404 });
    }

    const updateData = {};

    if (name !== undefined && name !== existingCategory.name) {
      updateData.name = name;
      const slug = slugify(name);

      // Check slug uniqueness
      const slugCheck = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });

      if (slugCheck) {
        return NextResponse.json(
          { error: 'Bu isme benzer bir başka kategori zaten mevcut. Farklı bir isim girin.' },
          { status: 400 }
        );
      }
      updateData.slug = slug;
    }

    if (description !== undefined) updateData.description = description || null;
    if (icon !== undefined) updateData.icon = icon || 'BookOpen';
    if (color !== undefined) updateData.color = color || 'from-blue-500 to-indigo-600';
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (showInNavbar !== undefined) updateData.showInNavbar = Boolean(showInNavbar);

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Kategori başarıyla güncellendi.', category: updatedCategory });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori güncellenirken bir hata oluştu.' },
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

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Kategori bulunamadı.' }, { status: 404 });
    }

    // Delete category. Linked products will have their categoryId set to NULL automatically by Prisma (onDelete: SetNull relation rule)
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Kategori başarıyla silindi.' });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json(
      { error: 'Kategori silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

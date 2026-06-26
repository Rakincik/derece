import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
    const { name, role, comment, rating, avatar } = body;

    if (!name || !role || !comment) {
      return NextResponse.json(
        { error: 'Lütfen isim, rol ve yorum alanlarını doldurun.' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        role,
        comment,
        rating: rating ? parseInt(rating) : 5,
        avatar: avatar || name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
      }
    });

    revalidatePath('/');

    return NextResponse.json({ message: 'Yorum başarıyla güncellendi.', testimonial });
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum güncellenirken bir hata oluştu.' },
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

    await prisma.testimonial.delete({
      where: { id }
    });

    revalidatePath('/');

    return NextResponse.json({ message: 'Yorum başarıyla silindi.' });
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

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

export async function GET(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Yorum listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken bir hata oluştu.' },
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
    const { name, role, comment, rating, avatar } = body;

    if (!name || !role || !comment) {
      return NextResponse.json(
        { error: 'Lütfen isim, rol ve yorum alanlarını doldurun.' },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        comment,
        rating: rating ? parseInt(rating) : 5,
        avatar: avatar || name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
      }
    });

    revalidatePath('/');

    return NextResponse.json(
      { message: 'Yorum başarıyla eklendi.', testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Yorum kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

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

    let testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (testimonials.length === 0) {
      const defaults = [
        {
          name: 'Elif Kaya',
          role: 'YKS Öğrencisi',
          avatar: 'EK',
          rating: 5,
          comment: 'Dereceuzem sayesinde TYT netlerim 40\'tan 85\'e çıktı. Video dersler ve deneme sınavları mükemmel hazırlanmış!'
        },
        {
          name: 'Mehmet Arslan',
          role: 'KPSS Adayı',
          avatar: 'MA',
          rating: 5,
          comment: 'Dijital kitapların kalitesi çok yüksek. Görsel ve interaktif anlatım sayesinde konuları çok kolay kavrıyorum.'
        },
        {
          name: 'Zeynep Demir',
          role: 'Lise Öğrencisi',
          avatar: 'ZD',
          rating: 5,
          comment: 'Kombo paketler çok avantajlı! Hem kitap hem video hem deneme bir arada. Ayrı almaya gerek kalmadı.'
        }
      ];

      await prisma.testimonial.createMany({
        data: defaults
      });

      testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

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

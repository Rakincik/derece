import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Çerezlerden token'ı al
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Oturum açılmamış.' },
        { status: 401 }
      );
    }

    // Token doğrulaması
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi geçmiş oturum.' },
        { status: 401 }
      );
    }

    // Veritabanından en güncel kullanıcı bilgisini al (şifre ve salt alanlarını hariç tut)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        district: true,
        createdAt: true,
        orders: {
          where: {
            paymentStatus: 'SUCCESS',
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                type: true,
                coverImage: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Oturum bilgisi alma hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

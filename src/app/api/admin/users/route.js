import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    // Tüm kullanıcıları listeliyoruz (Şifre ve salt alanlarını hariç tutarak)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        district: true,
        createdAt: true,
        _count: {
          select: {
            orders: {
              where: {
                paymentStatus: 'SUCCESS',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

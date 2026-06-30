import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const abandonedCarts = await prisma.abandonedCart.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      abandonedCarts
    });
  } catch (error) {
    console.error('Abandoned Carts fetch error:', error);
    return NextResponse.json(
      { error: 'Terkedilmiş sepetler alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

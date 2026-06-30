import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // User is not logged in, syncing is only for logged-in users.
      // We don't return an error to avoid noise, just a successful no-op.
      return NextResponse.json({ success: true, message: 'Not logged in, skipped.' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: true, message: 'Invalid token, skipped.' });
    }

    const body = await request.json();
    const { items, subtotal } = body;

    if (!items || items.length === 0) {
      // Cart is empty, delete abandoned cart if exists
      await prisma.abandonedCart.deleteMany({
        where: { userId: decoded.id }
      });
      return NextResponse.json({ success: true, message: 'Cart empty, abandoned cart removed.' });
    }

    // Cart has items, update or create abandoned cart
    await prisma.abandonedCart.upsert({
      where: { userId: decoded.id },
      update: {
        items: items,
        subtotal: subtotal
      },
      create: {
        userId: decoded.id,
        items: items,
        subtotal: subtotal
      }
    });

    return NextResponse.json({ success: true, message: 'Abandoned cart synced.' });
  } catch (error) {
    console.error('Cart sync hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  return NextResponse.json(orders);
}

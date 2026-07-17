import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  let osbLogs = null;
  try {
    const fs = require('fs');
    const path = require('path');
    const debugPath = path.join(process.cwd(), 'public', 'osb_debug.json');
    if (fs.existsSync(debugPath)) {
      const fileContent = fs.readFileSync(debugPath, 'utf8');
      osbLogs = fileContent.split('\n').filter(Boolean).map(line => JSON.parse(line));
    }
  } catch (e) {
    osbLogs = { error: e.message };
  }

  return NextResponse.json({ orders, osbLogs });
}

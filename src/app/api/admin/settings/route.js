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

    const rawSettings = await prisma.setting.findMany();
    const settings = rawSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Ayarlar yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken bir hata oluştu.' },
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
    const { settings } = body; // Expected format: { "hero_title": "...", ... }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz ayarlar formatı.' },
        { status: 400 }
      );
    }

    // Upsert each setting key-value pair
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) => {
        return prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      })
    );

    revalidatePath('/');
    revalidatePath('/hakkimizda');

    return NextResponse.json({ message: 'Ayarlar başarıyla kaydedildi.' });
  } catch (error) {
    console.error('Ayarlar kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Ayarlar kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

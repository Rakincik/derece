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

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    if (!status || (status !== 'READ' && status !== 'RESOLVED' && status !== 'UNREAD')) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj durumu.' },
        { status: 400 }
      );
    }

    const messageDetail = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: 'Mesaj durumu başarıyla güncellendi.',
      messageDetail,
    });
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj güncellenirken bir hata oluştu.' },
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

    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Mesaj başarıyla silindi.',
    });
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

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
    const { status, reply } = body;

    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!existingMessage) {
      return NextResponse.json({ error: 'Mesaj bulunamadı.' }, { status: 404 });
    }

    const updateData = {};

    if (status !== undefined) {
      if (status !== 'READ' && status !== 'RESOLVED' && status !== 'UNREAD') {
        return NextResponse.json(
          { error: 'Geçersiz mesaj durumu.' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (reply !== undefined) {
      updateData.reply = reply;
      updateData.repliedAt = reply ? new Date() : null;
      if (reply && (!status || status === 'UNREAD')) {
        updateData.status = 'RESOLVED';
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Güncellenecek veri sağlanmadı.' },
        { status: 400 }
      );
    }

    const messageDetail = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: reply ? 'Cevabınız başarıyla kaydedildi.' : 'Mesaj durumu başarıyla güncellendi.',
      messageDetail,
    });
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    return NextResponse.json(
      { 
        error: 'Mesaj güncellenirken bir hata oluştu.', 
        details: error.message,
        stack: error.stack
      },
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

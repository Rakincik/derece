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
    const { role } = body;

    // Yöneticinin kendi yetkilerini elinden almasını engelliyoruz
    if (admin.id === id) {
      return NextResponse.json(
        { error: 'Kendi yöneticilik yetkinizi değiştiremezsiniz.' },
        { status: 400 }
      );
    }

    if (!role || (role !== 'ADMIN' && role !== 'STUDENT')) {
      return NextResponse.json(
        { error: 'Geçersiz rol seçimi.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Kullanıcı yetkisi başarıyla güncellendi.',
      user,
    });
  } catch (error) {
    console.error('Kullanıcı yetki güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Yetki güncellenirken bir sunucu hatası oluştu.' },
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

    // Yöneticinin kendi hesabını silmesini engelliyoruz
    if (admin.id === id) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz.' },
        { status: 400 }
      );
    }

    // İlişkisel bütünlüğü korumak için öncelikle kullanıcının sipariş geçmişini siliyoruz
    await prisma.order.deleteMany({
      where: { userId: id },
    });

    // Kullanıcıyı siliyoruz
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Kullanıcı hesabı ve ilişkili tüm veriler silindi.',
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı silinirken bir sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

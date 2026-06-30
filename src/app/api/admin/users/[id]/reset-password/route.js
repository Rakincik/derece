import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request, { params }) {
  try {
    const adminToken = request.cookies.get('auth_token')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const decodedAdmin = verifyToken(adminToken);
    if (!decodedAdmin || decodedAdmin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { id: targetUserId } = params;
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha512').toString('hex');

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hash,
        salt: salt
      }
    });

    return NextResponse.json({
      message: 'Kullanıcı şifresi başarıyla güncellendi.',
    });
  } catch (error) {
    console.error('Reset password hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

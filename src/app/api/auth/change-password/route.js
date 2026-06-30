import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Geçersiz veya süresi geçmiş oturum.' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun ve yeni şifrenizin en az 6 karakter olduğuna emin olun.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const isPasswordValid = verifyPassword(oldPassword, user.salt, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mevcut şifreniz yanlış.' }, { status: 400 });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha512').toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHash,
        salt: newSalt
      }
    });

    return NextResponse.json({
      message: 'Şifreniz başarıyla değiştirildi.',
    });
  } catch (error) {
    console.error('Change password hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre alanları zorunludur.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı veritabanında bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre.' },
        { status: 401 }
      );
    }

    // Şifreyi doğrula
    const isPasswordValid = verifyPassword(password, user.salt, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre.' },
        { status: 401 }
      );
    }

    // JWT Token oluştur
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Başarılı yanıt hazırla
    const response = NextResponse.json({
      message: 'Giriş işlemi başarıyla gerçekleştirildi.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // JWT token'ı HTTP-Only cookie olarak kaydet
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 gün
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

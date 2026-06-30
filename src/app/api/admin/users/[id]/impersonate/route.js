import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, generateToken } from '@/lib/auth';

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

    const user = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Generate new token for the target user
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: 'Kullanıcı hesabına başarıyla geçiş yapıldı.',
    });

    // Replace auth_token with user's token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Store admin's original token securely
    response.cookies.set('admin_return_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Client-side flag to show the "Return to Admin" banner
    response.cookies.set('is_impersonating', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Impersonate hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

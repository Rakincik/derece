import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Oturum başarıyla kapatıldı.',
    });

    // auth_token çerezini sil
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return NextResponse.json(
      { error: 'Çıkış işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

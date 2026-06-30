import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const adminReturnToken = request.cookies.get('admin_return_token')?.value;

    if (!adminReturnToken) {
      return NextResponse.json({ error: 'Geri dönülecek admin oturumu bulunamadı' }, { status: 400 });
    }

    const response = NextResponse.json({
      message: 'Admin paneline geri dönüldü.',
    });

    // Restore the admin token
    response.cookies.set('auth_token', adminReturnToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Clear the return tokens
    response.cookies.delete('admin_return_token');
    response.cookies.delete('is_impersonating');

    return response;
  } catch (error) {
    console.error('Revert impersonate hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

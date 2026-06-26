import { NextResponse } from 'next/server';

/**
 * Base64 URL Kodunu çözmek için yardımcı fonksiyon (Edge Uyumlu)
 */
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Base64URL to Base64
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Sadece admin rotasını koruyoruz
  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    const token = request.cookies.get('auth_token')?.value;
    
    // 1. Giriş yapılmamışsa anasayfaya yönlendir
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    const payload = decodeJwt(token);
    
    // 2. Token geçersizse veya süresi dolmuşsa yönlendir
    if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    
    // 3. Admin rotası koruması (Sadece ADMIN rolündeki kullanıcılar girebilir)
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Hangi rotalarda middleware'in çalışacağını belirtiyoruz
export const config = {
  matcher: ['/admin/:path*'],
};

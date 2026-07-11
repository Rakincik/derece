import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function GET(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // Tüm kullanıcıları listeliyoruz (Şifre ve salt alanlarını hariç tutarak)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        city: true,
        district: true,
        tcNo: true,
        createdAt: true,
        _count: {
          select: {
            orders: {
              where: {
                paymentStatus: 'SUCCESS',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { email, password, name, phone, city, district, role = 'STUDENT' } = await request.json();

    // Temel girdi kontrolleri
    if (!email || !password || !name || !phone || !city || !district) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun (Ad Soyad, E-posta, Şifre, Telefon, İl, İlçe).' },
        { status: 400 }
      );
    }

    // Telefon Numarası Kontrolü ve Temizliği (Başında 0 olmamalı ve 10 haneli olmalı)
    const phoneStr = String(phone).trim();
    const cleanPhone = phoneStr.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      return NextResponse.json(
        { error: 'Telefon numarasının başı sıfır (0) olamaz.' },
        { status: 400 }
      );
    }
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Telefon numarası 10 haneli olmalıdır (örn: 5xx xxx xx xx).' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakterden oluşmalıdır.' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz email formatı.' },
        { status: 400 }
      );
    }

    // Email'in daha önce kullanılıp kullanılmadığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda.' },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const { hash, salt } = hashPassword(password);

    // Kullanıcıyı veritabanına kaydet
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        salt,
        name,
        role,
        phone: cleanPhone,
        city,
        district,
      },
    });

    return NextResponse.json(
      {
        message: 'Kullanıcı kaydı başarıyla oluşturuldu.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          city: user.city,
          district: user.district,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

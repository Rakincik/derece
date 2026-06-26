import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name, phone, city, district } = await request.json();

    // Temel girdi kontrolleri
    if (!email || !password || !name || !phone || !city || !district) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun (Ad Soyad, E-posta, Şifre, Telefon, İl, İlçe).' },
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

    // Şifreyi yerel crypto modülü ile hash'le
    const { hash, salt } = hashPassword(password);

    // İlk kayıt olan kullanıcıyı veya özel email adresini ADMIN yapabiliriz.
    // Diğer tüm kullanıcılar STUDENT (Öğrenci) rolü ile başlar.
    const isFirstUser = (await prisma.user.count()) === 0;
    const role = isFirstUser ? 'ADMIN' : 'STUDENT';

    // Kullanıcıyı veritabanına kaydet
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        salt,
        name: name,
        role,
        phone: phone,
        city: city,
        district: district,
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
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
}

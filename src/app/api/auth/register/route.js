import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name, phone, city, district, tcNo } = await request.json();

    // Temel girdi kontrolleri
    if (!email || !password || !name || !phone || !city || !district || !tcNo) {
      return NextResponse.json(
        { error: 'Lütfen tüm alanları doldurun (Ad Soyad, T.C. Kimlik No, E-posta, Şifre, Telefon, İl, İlçe).' },
        { status: 400 }
      );
    }

    // Ad Soyad Kontrolü (En az iki kelime olmalı)
    const nameStr = String(name).trim();
    if (nameStr.split(/\s+/).length < 2) {
      return NextResponse.json(
        { error: 'Lütfen hem adınızı hem de soyadınızı girin (örn: Ahmet Yılmaz).' },
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

    // T.C. Kimlik Numarası Algoritmik Doğrulama
    const tcStr = String(tcNo).trim();
    if (tcStr.length !== 11 || tcStr[0] === '0' || !/^\d+$/.test(tcStr)) {
      return NextResponse.json(
        { error: 'Geçersiz T.C. Kimlik Numarası formatı.' },
        { status: 400 }
      );
    }
    
    let oddSum = 0;
    let evenSum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(tcStr[i], 10);
      if (i % 2 === 0) oddSum += digit;
      else evenSum += digit;
    }
    const calculated10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
    if (parseInt(tcStr[9], 10) !== calculated10) {
      return NextResponse.json(
        { error: 'Geçersiz T.C. Kimlik Numarası.' },
        { status: 400 }
      );
    }
    
    let totalSum = 0;
    for (let i = 0; i < 10; i++) {
      totalSum += parseInt(tcStr[i], 10);
    }
    if (parseInt(tcStr[10], 10) !== totalSum % 10) {
      return NextResponse.json(
        { error: 'Geçersiz T.C. Kimlik Numarası.' },
        { status: 400 }
      );
    }

    // T.C. Kimlik Numarasının daha önce kullanılıp kullanılmadığını kontrol et
    const existingTcUser = await prisma.user.findUnique({
      where: { tcNo: tcStr },
    });
    if (existingTcUser) {
      return NextResponse.json(
        { error: 'Bu T.C. Kimlik Numarası zaten kullanımda.' },
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
        phone: cleanPhone,
        city: city,
        district: district,
        tcNo: tcStr,
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
          tcNo: user.tcNo,
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

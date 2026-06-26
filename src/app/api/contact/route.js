import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Zorunlu alan kontrolü
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Lütfen zorunlu alanları doldurun (İsim, E-posta, Mesaj).' },
        { status: 400 }
      );
    }

    // E-posta format doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi.' },
        { status: 400 }
      );
    }

    // Mesajı veritabanına kaydediyoruz
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase(),
        subject: subject || null,
        message,
        status: 'UNREAD', // Varsayılan durum: Okunmadı
      },
    });

    return NextResponse.json(
      { 
        message: 'Mesajınız başarıyla iletildi. En kısa sürede dönüş yapacağız.', 
        contactMessage 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mesaj kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Mesajınız iletilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

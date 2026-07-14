import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getStudent(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });

  return user;
}

export async function GET(request) {
  try {
    const student = await getStudent(request);
    if (!student) {
      return NextResponse.json({ error: 'Oturum açmanız gerekmektedir.' }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      where: {
        email: student.email.toLowerCase()
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Öğrenci destek mesajları listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Destek talepleri yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const student = await getStudent(request);
    if (!student) {
      return NextResponse.json({ error: 'Oturum açmanız gerekmektedir.' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Lütfen mesajınızı yazın.' }, { status: 400 });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: student.name || 'Öğrenci',
        email: student.email.toLowerCase(),
        subject: subject ? subject.trim() : 'Destek Talebi',
        message: message.trim(),
        status: 'UNREAD'
      }
    });

    return NextResponse.json({
      message: 'Destek talebiniz başarıyla oluşturuldu.',
      newMessage
    }, { status: 201 });
  } catch (error) {
    console.error('Öğrenci destek mesajı oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Destek talebi oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

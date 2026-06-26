import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Dosya seçilmedi.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/uploads klasörünün yolunu belirliyoruz
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Klasör yoksa oluşturulmasını sağlıyoruz
    await mkdir(uploadDir, { recursive: true });

    // Dosya adını güvenli hale getirmek için temizliyoruz
    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filename = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // Dosyayı diske yazıyoruz
    await writeFile(filePath, buffer);

    // Sitenin erişebileceği public url
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
      message: 'Görsel başarıyla yüklendi.',
      url: fileUrl 
    });
  } catch (error) {
    console.error('Görsel yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Dosya yüklenirken sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

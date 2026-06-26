import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    
    // public/uploads altındaki gerçek dosya yolunu belirliyoruz
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('Dosya bulunamadı', { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Uzantıya göre Content-Type belirliyoruz
    let contentType = 'application/octet-stream';
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Dosya okuma hatası:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}

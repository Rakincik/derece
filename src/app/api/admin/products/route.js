import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Helper to convert Turkish characters for slugs
function slugify(text) {
  const trMap = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };
  
  let slug = text.toString().toLowerCase().trim();
  
  // Replace Turkish characters
  Object.keys(trMap).forEach((key) => {
    slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
  });

  return slug
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Middleware helper to check admin role
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

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenirken bir hata oluştu.' },
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

    const body = await request.json();
    const { 
      title, price, discountedPrice, isFeatured, isBestseller, type, coverImage, description, contents, outcomes,
      pages, videoCount, duration, examCount,
      showDemo, demoUrl, showFaq, faqs,
      showOutcomes, categoryId,
      showInstructor, instructorName, instructorExperience, instructorDescription, instructorAvatar, instructorImage,
      sortOrder
    } = body;

    // Validation
    if (!title || price === undefined || !coverImage || !description) {
      return NextResponse.json(
        { error: 'Lütfen zorunlu alanları doldurun (Başlık, Fiyat, Kapak Resmi, Açıklama).' },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    // Check slug uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Bu başlığa benzer bir ürün zaten mevcut. Lütfen başlığı değiştirin.' },
        { status: 400 }
      );
    }

    let finalType = type || 'Dijital Kitap';
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      if (category) {
        finalType = category.name;
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        slug,
        price: parseFloat(price),
        discountedPrice: discountedPrice !== undefined && discountedPrice !== '' && discountedPrice !== null ? parseFloat(discountedPrice) : null,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
        isBestseller: isBestseller !== undefined ? Boolean(isBestseller) : false,
        type: finalType,
        coverImage,
        description,
        contents: Array.isArray(contents) ? contents : [],
        outcomes: Array.isArray(outcomes) ? outcomes : [],
        pages: pages !== undefined && pages !== '' && pages !== null ? parseInt(pages) : null,
        videoCount: videoCount !== undefined && videoCount !== '' && videoCount !== null ? parseInt(videoCount) : null,
        duration: duration !== undefined && duration !== '' && duration !== null ? duration : null,
        examCount: examCount !== undefined && examCount !== '' && examCount !== null ? parseInt(examCount) : null,
        showDemo: showDemo !== undefined ? Boolean(showDemo) : true,
        demoUrl: demoUrl || null,
        showFaq: showFaq !== undefined ? Boolean(showFaq) : true,
        faqs: faqs ? faqs : null,
        showOutcomes: showOutcomes !== undefined ? Boolean(showOutcomes) : true,
        showInstructor: showInstructor !== undefined ? Boolean(showInstructor) : true,
        instructorName: instructorName !== undefined && instructorName !== null && instructorName !== '' ? instructorName : "Uzman Eğitmen Kadrosu",
        instructorExperience: instructorExperience !== undefined && instructorExperience !== null && instructorExperience !== '' ? instructorExperience : "10+ Yıl Deneyim",
        instructorDescription: instructorDescription !== undefined && instructorDescription !== null && instructorDescription !== '' ? instructorDescription : "DereceUzem eğitmenleri, alanında uzman, binlerce öğrencinin derece yapmasına rehberlik etmiş tecrübeli öğretmenlerden oluşur. Müfredata tam hakimiyet ve yeni nesil soru tarzlarına yönelik özel taktiklerle dersleri işlerler. Video içeriklerimizde konular akılda kalıcı yöntemlerle ve sınav odaklı püf noktalarıyla aktarılır.",
        instructorAvatar: instructorAvatar !== undefined && instructorAvatar !== null && instructorAvatar !== '' ? instructorAvatar : "E",
        instructorImage: instructorImage || null,
        categoryId: categoryId || null,
        sortOrder: sortOrder !== undefined && sortOrder !== '' && sortOrder !== null ? parseInt(sortOrder) : 0,
      },
    });

    revalidatePath('/');
    revalidatePath('/urunler');

    return NextResponse.json(
      { message: 'Ürün başarıyla eklendi.', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün eklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

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
  
  Object.keys(trMap).forEach((key) => {
    slug = slug.replace(new RegExp(key, 'g'), trMap[key]);
  });

  return slug
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function checkAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { 
      title, price, discountedPrice, isFeatured, isBestseller, type, coverImage, description, contents, outcomes,
      pages, videoCount, duration, examCount,
      showDemo, demoUrl, showFaq, faqs, showOutcomes, categoryId,
      showInstructor, instructorName, instructorExperience, instructorDescription, instructorAvatar, instructorImage,
      sortOrder
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    const updateData = {};

    if (title !== undefined && title !== existingProduct.title) {
      updateData.title = title;
      const slug = slugify(title);
      
      // Ensure new slug is unique
      const slugCheck = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });

      if (slugCheck) {
        return NextResponse.json(
          { error: 'Bu başlığa benzer bir başka ürün zaten mevcut. Başlığı değiştirin.' },
          { status: 400 }
        );
      }
      updateData.slug = slug;
    }

    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice !== undefined && discountedPrice !== '' && discountedPrice !== null ? parseFloat(discountedPrice) : null;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isBestseller !== undefined) updateData.isBestseller = Boolean(isBestseller);
    if (type !== undefined) updateData.type = type;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (description !== undefined) updateData.description = description;
    if (contents !== undefined) updateData.contents = Array.isArray(contents) ? contents : [];
    if (outcomes !== undefined) updateData.outcomes = Array.isArray(outcomes) ? outcomes : [];
    if (pages !== undefined) updateData.pages = pages !== '' && pages !== null ? parseInt(pages) : null;
    if (videoCount !== undefined) updateData.videoCount = videoCount !== '' && videoCount !== null ? parseInt(videoCount) : null;
    if (duration !== undefined) updateData.duration = duration !== '' && duration !== null ? duration : null;
    if (examCount !== undefined) updateData.examCount = examCount !== '' && examCount !== null ? parseInt(examCount) : null;
    if (showDemo !== undefined) updateData.showDemo = Boolean(showDemo);
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl || null;
    if (showFaq !== undefined) updateData.showFaq = Boolean(showFaq);
    if (faqs !== undefined) updateData.faqs = faqs ? faqs : null;
    if (showOutcomes !== undefined) updateData.showOutcomes = Boolean(showOutcomes);
    if (showInstructor !== undefined) updateData.showInstructor = Boolean(showInstructor);
    if (instructorName !== undefined) updateData.instructorName = instructorName || "Uzman Eğitmen Kadrosu";
    if (instructorExperience !== undefined) updateData.instructorExperience = instructorExperience || "10+ Yıl Deneyim";
    if (instructorDescription !== undefined) updateData.instructorDescription = instructorDescription || "";
    if (instructorAvatar !== undefined) updateData.instructorAvatar = instructorAvatar || "E";
    if (instructorImage !== undefined) updateData.instructorImage = instructorImage || null;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder !== '' && sortOrder !== null ? parseInt(sortOrder) : 0;

    if (categoryId !== undefined) {
      updateData.categoryId = categoryId || null;
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        });
        if (category) {
          updateData.type = category.name;
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    revalidatePath('/');
    revalidatePath('/urunler');
    revalidatePath(`/urun/${updatedProduct.slug}`);
    if (existingProduct.slug !== updatedProduct.slug) {
      revalidatePath(`/urun/${existingProduct.slug}`);
    }

    return NextResponse.json({ message: 'Ürün başarıyla güncellendi.', product: updatedProduct });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    // Delete associated orders first to avoid foreign key constraint errors
    await prisma.order.deleteMany({
      where: { productId: id },
    });

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/urunler');
    revalidatePath(`/urun/${existingProduct.slug}`);

    return NextResponse.json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    return NextResponse.json(
      { error: 'Ürün silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

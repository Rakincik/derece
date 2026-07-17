import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Sipariş listeleme hatası:', error);
    return NextResponse.json(
      { error: 'Siparişler yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Manually grant access to a user for a product
export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { email, productId, amount } = body;

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Lütfen kullanıcı e-postası ve ürün seçimi yapın.' },
        { status: 400 }
      );
    }

    // 1. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
    }

    // 2. Check if user exists, otherwise fail (or admin has to register them first)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Bu e-postaya sahip bir kullanıcı bulunamadı. Lütfen önce kullanıcının kayıt olduğundan emin olun.' },
        { status: 404 }
      );
    }

    // 3. Check if user already has access to this product
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
        paymentStatus: 'SUCCESS',
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Kullanıcı bu ürüne zaten erişim hakkına sahip.' },
        { status: 400 }
      );
    }

    // 4. Create successful manual order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        amount: amount !== undefined ? parseFloat(amount) : product.price,
        paymentStatus: 'SUCCESS',
        paymentId: 'MANUAL_GRANT_BY_ADMIN',
      },
    });

    // Delete the user's abandoned cart since they now have access to the product
    try {
      await prisma.abandonedCart.deleteMany({
        where: { userId: user.id }
      });
      console.log(`Abandoned cart cleared for manual grant user: ${user.id}`);
    } catch (cartErr) {
      console.error('Failed to delete abandoned cart in manual grant:', cartErr);
    }

    // 5. Add to LMS Queue if the product has an lmsCourseId
    if (product.lmsCourseId) {
      try {
        await prisma.lmsQueue.create({
          data: {
            orderId: order.id,
            status: 'PENDING'
          }
        });
        console.log(`Manual Grant: LMS Queue added for Order: ${order.id}, Course: ${product.lmsCourseId}`);
      } catch (qErr) {
        console.error('Manual Grant: LMS Queue create error:', qErr);
      }
    }

    return NextResponse.json(
      { message: 'Ürün erişimi kullanıcıya başarıyla tanımlandı.', order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erişim tanımlama hatası:', error);
    return NextResponse.json(
      { error: 'Erişim tanımlama işlemi başarısız oldu.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const rawCarts = await prisma.abandonedCart.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const validCarts = [];
    const cartsToDelete = [];

    // Tembel temizlik (Lazy Cleanup): Eğer sepetteki tüm ürünleri kullanıcı daha önce
    // başarılı şekilde satın almışsa, o sepet terkedilmiş sayılmaz!
    for (const cart of rawCarts) {
      const cartItems = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
      
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        cartsToDelete.push(cart.id);
        continue;
      }

      // Kullanıcının Başarılı siparişlerini getir
      const userOrders = await prisma.order.findMany({
        where: {
          userId: cart.userId,
          paymentStatus: 'SUCCESS'
        },
        select: { productId: true }
      });

      const purchasedProductIds = new Set(userOrders.map(o => o.productId));

      // Zaten satın alınmış olanları sepetten çıkar
      const remainingItems = cartItems.filter(item => !purchasedProductIds.has(item.id));

      if (remainingItems.length === 0) {
        // Tüm ürünler çoktan satın alınmış, bu sahte bir terkedilmiş sepet (frontend sync gecikmesi vs)
        cartsToDelete.push(cart.id);
      } else {
        cart.items = remainingItems; // Admin paneline sadece kalanları gönder
        validCarts.push(cart);
      }
    }

    // Çöp sepetleri veritabanından arka planda temizle
    if (cartsToDelete.length > 0) {
      prisma.abandonedCart.deleteMany({
        where: { id: { in: cartsToDelete } }
      }).catch(err => console.error('Çöp sepetleri temizlerken hata:', err));
    }

    return NextResponse.json({
      success: true,
      abandonedCarts: validCarts
    });
  } catch (error) {
    console.error('Abandoned Carts fetch error:', error);
    return NextResponse.json(
      { error: 'Terkedilmiş sepetler alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

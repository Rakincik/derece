import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { cartItemIds } = await request.json();

    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    // Get the products currently in the cart to read their crossSellIds and categories
    const cartProducts = await prisma.product.findMany({
      where: { 
        id: { in: cartItemIds },
        isActive: true 
      },
      select: { id: true, categoryId: true, crossSellIds: true }
    });

    let manualCrossSellIds = [];
    let cartCategoryIds = new Set();

    cartProducts.forEach(product => {
      if (product.categoryId) {
        cartCategoryIds.add(product.categoryId);
      }
      if (product.crossSellIds && Array.isArray(product.crossSellIds)) {
        manualCrossSellIds.push(...product.crossSellIds);
      }
    });

    // Remove duplicates and items already in the cart from manual cross-sells
    manualCrossSellIds = [...new Set(manualCrossSellIds)].filter(id => !cartItemIds.includes(id));

    let recommendedProducts = [];

    // Step 1: Manual Cross Sells
    if (manualCrossSellIds.length > 0) {
      recommendedProducts = await prisma.product.findMany({
        where: { 
          id: { in: manualCrossSellIds },
          isActive: true
        },
        select: {
          id: true,
          title: true,
          price: true,
          discountedPrice: true,
          coverImage: true,
          slug: true
        },
        take: 2 // Recommend up to 2 manual items
      });
    }

    // Step 2: Fallback to Category Logic
    if (recommendedProducts.length < 2 && cartCategoryIds.size > 0) {
      // Find up to 2 additional products from the same categories, excluding cart items and already recommended items
      const excludeIds = [...cartItemIds, ...recommendedProducts.map(p => p.id)];
      
      const categoryFallbackProducts = await prisma.product.findMany({
        where: {
          categoryId: { in: Array.from(cartCategoryIds) },
          id: { notIn: excludeIds },
          isActive: true
        },
        select: {
          id: true,
          title: true,
          price: true,
          discountedPrice: true,
          coverImage: true,
          slug: true
        },
        take: 2 - recommendedProducts.length,
        orderBy: {
          sortOrder: 'asc' // Prioritize those with lower sortOrder or could be randomized
        }
      });

      recommendedProducts = [...recommendedProducts, ...categoryFallbackProducts];
    }

    return NextResponse.json({ success: true, products: recommendedProducts });
  } catch (error) {
    console.error('Cross-sells API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}

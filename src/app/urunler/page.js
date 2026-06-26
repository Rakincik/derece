import prisma from '@/lib/db';
import { mapProduct } from '@/lib/productHelper';
import ProductsClient from './ProductsClient';
import { Suspense } from 'react';

export const revalidate = 60; // Cache for 60 seconds

async function ProductsListLoader() {
  let initialProducts = [];
  try {
    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });
    initialProducts = dbProducts.map(mapProduct);
  } catch (err) {
    console.error('Error loading products on server:', err);
  }

  return <ProductsClient initialProducts={initialProducts} />;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Ürünler Yükleniyor...</div>}>
      <ProductsListLoader />
    </Suspense>
  );
}

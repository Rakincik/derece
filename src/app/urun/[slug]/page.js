import prisma from '@/lib/db';
import { mapProduct } from '@/lib/productHelper';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Cache for 60 seconds

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true }
    });
    return products.map(p => ({ slug: p.slug }));
  } catch (err) {
    console.error('generateStaticParams error:', err);
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = params;

  let dbProduct = null;
  try {
    dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { category: true }
    });
  } catch (err) {
    console.error('Error fetching product in Server Component page.js:', err);
  }

  if (!dbProduct) {
    notFound();
  }

  const product = mapProduct(dbProduct);

  return <ProductDetailClient product={product} />;
}

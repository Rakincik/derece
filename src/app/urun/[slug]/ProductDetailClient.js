'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductInfo from '@/components/product-detail/ProductInfo';
import ReviewSection from '@/components/product-detail/ReviewSection';
import SimilarProducts from '@/components/product-detail/SimilarProducts';
import ProductTabs from '@/components/product-detail/ProductTabs';

export default function ProductDetailClient({ product }) {
  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-b from-slate-100 to-transparent py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-accent-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Ürünlere Dön
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.cover}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ProductInfo product={product} />
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <ProductTabs product={product} />
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Değerlendirmeler
          </h2>
          <ReviewSection
            reviews={product.reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </motion.div>

        {/* Similar Products */}
        <SimilarProducts productId={product.id} category={product.category} />
      </div>
    </div>
  );
}

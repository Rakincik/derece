'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, TrendingUp } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import useCartStore from '@/store/cartStore';
import { formatPrice } from '@/lib/productHelper';


export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link href={`/urun/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card overflow-hidden group cursor-pointer h-full flex flex-col"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={product.cover}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge variant="discount">%{discountPercentage} İndirim</Badge>
            )}
            {product.isNew && <Badge variant="new">Yeni</Badge>}
            {product.isBestseller && (
              <Badge variant="bestseller" icon={TrendingUp}>Çok Satan</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="p-2.5 rounded-xl bg-accent-400 text-white shadow-lg shadow-accent-400/30 hover:bg-accent-500 transition-colors"
              title="Sepete Ekle"
            >
              <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-xl bg-slate-800/80 text-white border border-slate-700/50 hover:bg-slate-700 transition-colors"
              title="İncele"
            >
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 flex-1 flex flex-col">
          {/* Category */}
          <Badge variant="category" className="self-start mb-2">
            {product.type}
          </Badge>

          {/* Name */}
          <h3 className="font-semibold text-slate-900 text-sm mb-1.5 group-hover:text-accent-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 mb-3 line-clamp-2 flex-1">
            {product.shortDescription}
          </p>

          {/* Rating */}
          <div className="mb-3">
            <StarRating
              rating={product.rating}
              size="xs"
              showCount
              count={product.reviewCount}
            />
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-lg font-bold font-mono text-accent-600">
                    {formatPrice(product.discountedPrice)}
                  </span>
                  <span className="text-xs text-slate-500 line-through font-mono">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold font-mono text-slate-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="px-3 py-1.5 rounded-lg bg-accent-400/10 text-accent-400 text-xs font-semibold hover:bg-accent-400/20 transition-all border border-accent-400/20"
            >
              Sepete Ekle
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

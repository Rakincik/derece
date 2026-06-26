'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, CheckCircle2, Download, Play, FileCheck, Users, Clock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import useCartStore from '@/store/cartStore';
import { formatPrice } from '@/lib/productHelper';


export default function ProductInfo({ product }) {
  const { addItem } = useCartStore();
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const typeIcons = {
    'Dijital Kitap': Download,
    'Video Ders Seti': Play,
    'Deneme Paketi': FileCheck,
    'Kombo Paket': CheckCircle2,
  };
  const TypeIcon = typeIcons[product.type] || Download;

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="category" icon={TypeIcon}>{product.type}</Badge>
        {product.isNew && <Badge variant="new">Yeni</Badge>}
        {product.isBestseller && <Badge variant="bestseller">Çok Satan</Badge>}
        {hasDiscount && <Badge variant="discount">%{discountPercentage} İndirim</Badge>}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
        {product.name}
      </h1>

      {/* Rating & Sales */}
      <div className="flex items-center gap-4 flex-wrap">
        <StarRating
          rating={product.rating}
          size="md"
          showCount
          count={product.reviewCount}
        />
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
          {product.salesCount.toLocaleString('tr-TR')} satış
        </span>
        {product.duration && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            {product.duration}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-slate-600 leading-relaxed">
        {product.description}
      </p>

      {/* Format Info */}
      <div className="flex flex-wrap gap-3">
        {product.format && (
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-medium">
            {product.format}
          </div>
        )}
        {product.pages && (
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-medium">
            {product.pages} sayfa
          </div>
        )}
        {product.videoCount && (
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-medium">
            {product.videoCount} ders
          </div>
        )}
        {product.examCount && (
          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 shadow-sm font-medium">
            {product.examCount} deneme
          </div>
        )}
      </div>

      {/* Price */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
        <div className="flex items-baseline gap-3 mb-4">
          {hasDiscount ? (
            <>
              <span className="text-3xl font-bold font-mono text-accent-600">
                {formatPrice(product.discountedPrice)}
              </span>
              <span className="text-lg text-slate-500 line-through font-mono">
                {formatPrice(product.price)}
              </span>
              <Badge variant="discount">%{discountPercentage} İndirim</Badge>
            </>
          ) : (
            <span className="text-3xl font-bold font-mono text-slate-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={ShoppingCart}
            className="flex-1"
            onClick={() => addItem(product)}
          >
            Sepete Ekle
          </Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl border border-slate-300 text-slate-600 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all bg-white"
          >
            <Heart className="w-5 h-5" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl border border-slate-300 text-slate-600 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all bg-white"
          >
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
          </motion.button>
        </div>

        <p className="text-[11px] text-slate-600 text-center mt-3 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" strokeWidth={2} />
          Satın aldığınız anda dijital ürününüze anında erişim sağlayabilirsiniz
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { categories as staticCategories } from '@/data/products';
import Dropdown from '@/components/ui/Dropdown';

const priceRanges = [
  { label: 'Tümü', min: 0, max: Infinity },
  { label: '₺0 - ₺1.000', min: 0, max: 1000 },
  { label: '₺1.000 - ₺3.000', min: 1000, max: 3000 },
  { label: '₺3.000 - ₺5.000', min: 3000, max: 5000 },
  { label: '₺5.000 - ₺10.000', min: 5000, max: 10000 },
  { label: '₺10.000+', min: 10000, max: Infinity },
];

const sortOptions = [
  { value: 'popular', label: 'Popüler' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'En Yüksek Puan' },
];

export default function FilterSidebar({
  products = [],
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  sortBy,
  setSortBy,
  productCount,
}) {
  const [categoriesList, setCategoriesList] = useState(staticCategories);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategoriesList(data.categories);
          }
        }
      } catch (err) {
        console.error('Filtre Sidebar kategoriler fetch hatası:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-accent-600" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Filtreler
        </h3>
        <span className="ml-auto text-xs text-slate-500">
          {productCount} ürün
        </span>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
          Kategori
        </h4>
        <div className="space-y-1.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              selectedCategory === 'all'
                ? 'bg-accent-50 text-accent-700 border border-accent-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tüm Ürünler
          </motion.button>
          {categoriesList.map((cat) => {
            const catKey = cat.slug || cat.id;
            const count = products.length > 0
              ? products.filter(p => p.category === catKey || p.categoryId === cat.id).length
              : cat.count;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(catKey)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCategory === catKey
                    ? 'bg-accent-50 text-accent-700 border border-accent-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.name}
                <span className="text-xs text-slate-600 ml-1">({count})</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
          Fiyat Aralığı
        </h4>
        <div className="space-y-1.5">
          {priceRanges.map((range, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPriceRange(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedPriceRange === i
                  ? 'bg-accent-50 text-accent-700 border border-accent-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
          Sıralama
        </h4>
        <Dropdown
          value={sortBy}
          onChange={setSortBy}
          options={sortOptions}
          className="w-full"
        />
      </div>
    </div>
  );
}

export { priceRanges };


'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, LayoutGrid, Search } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import FilterSidebar, { priceRanges } from '@/components/products/FilterSidebar';
import Dropdown from '@/components/ui/Dropdown';

const sortOptions = [
  { value: 'popular', label: 'Popüler' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'rating', label: 'En Yüksek Puan' },
];

export default function ProductsClient({ initialProducts }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState(initialProducts || []);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search query filter (Turkish case-insensitive with fallback)
    if (searchQuery.trim()) {
      const matchSearch = (text, query) => {
        if (!text || !query) return false;
        
        const textLower = text.toLocaleLowerCase('tr-TR');
        const queryLower = query.toLocaleLowerCase('tr-TR');
        if (textLower.includes(queryLower)) return true;

        const normalize = (s) => s
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c');
        
        return normalize(textLower).includes(normalize(queryLower));
      };

      filtered = filtered.filter((p) => matchSearch(p.name, searchQuery));
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    const range = priceRanges[selectedPriceRange];
    if (range) {
      filtered = filtered.filter((p) => {
        const price = p.discountedPrice || p.price;
        return price >= range.min && price <= range.max;
      });
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.salesCount - a.salesCount);
        break;
    }

    return filtered;
  }, [products, selectedCategory, selectedPriceRange, sortBy, searchQuery]);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-slate-100 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              Tüm Ürünler
            </h1>
            <p className="text-slate-600">
              Dijital eğitim ürünlerini keşfedin ve hemen öğrenmeye başlayın
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto glass-card p-5 pr-4">
              <FilterSidebar
                products={products}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                sortBy={sortBy}
                setSortBy={setSortBy}
                productCount={filteredProducts.length}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="relative flex-1 max-w-md w-full">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  placeholder="Paket ara... (örn: HAKİMLİK)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 rounded-xl text-sm placeholder-slate-400 text-slate-700 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:justify-end">
                <span className="text-sm font-medium text-slate-600 order-last md:order-first">
                  {isLoading ? 'Yükleniyor...' : `${filteredProducts.length} ürün bulundu`}
                </span>
                
                <div className="flex items-center gap-3 flex-1 md:flex-initial justify-between md:justify-end">
                  <Dropdown
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                    className="w-48 sm:w-56"
                  />
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                    Filtrele
                  </motion.button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="glass-card overflow-hidden h-full animate-pulse flex flex-col">
                    <div className="bg-slate-850 aspect-[5/7] w-full" />
                    <div className="p-4 flex-1 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-800 rounded-md w-1/4" />
                        <div className="h-6 bg-slate-800 rounded-md w-2/3" />
                        <div className="h-4 bg-slate-800 rounded-md w-full" />
                      </div>
                      <div className="h-8 bg-slate-800 rounded-md w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <LayoutGrid className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Ürün bulunamadı
                </h3>
                <p className="text-sm text-slate-600">
                  Filtreleri değiştirerek yeniden deneyebilirsiniz
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 rounded-t-2xl max-h-[80vh] overflow-y-auto lg:hidden shadow-2xl"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Filtreler</h3>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </motion.button>
                </div>
                <FilterSidebar
                  products={products}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={(v) => { setSelectedCategory(v); setIsMobileFilterOpen(false); }}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={(v) => { setSelectedPriceRange(v); setIsMobileFilterOpen(false); }}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  productCount={filteredProducts.length}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

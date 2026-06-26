'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, LayoutGrid, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import FilterSidebar, { priceRanges } from '@/components/products/FilterSidebar';
import { products as staticProducts } from '@/data/products';

export default function FeaturedProducts({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setIsLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          } else {
            setProducts(staticProducts);
          }
        } else {
          setProducts(staticProducts);
        }
      } catch (err) {
        console.error('Katalog ürünleri API hatası, static fallback yükleniyor:', err);
        setProducts(staticProducts);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    const range = priceRanges[selectedPriceRange];
    if (range) {
      filtered = filtered.filter((p) => {
        const price = p.discountedPrice || p.price;
        return price >= range.min && price <= range.max;
      });
    }

    // Sort
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
  }, [products, selectedCategory, selectedPriceRange, sortBy]);

  return (
    <section className="py-16 relative bg-slate-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Eğitim Paketlerimiz
            </h2>
            <p className="text-slate-600 max-w-2xl">
              İhtiyacınıza uygun eğitimleri filtreleyin ve hızlıca keşfedin.
            </p>
          </div>
          <div className="flex justify-center md:justify-start">
            <Link 
              href="/urunler" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-accent-500/20 active:scale-[0.98] transition-all duration-200 group"
            >
              Tümünü Gör
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
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

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar for Mobile Filter Toggle & Count */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <span className="text-sm font-medium text-slate-600">
                {isLoading ? 'Yükleniyor...' : `${filteredProducts.length} eğitim paketi bulundu`}
              </span>
              
              {/* Mobile Filter Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-700 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-accent-600" strokeWidth={1.5} />
                Filtrele
              </motion.button>
            </div>

            {/* Products Grid / Skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="glass-card overflow-hidden h-[400px] animate-pulse flex flex-col">
                    <div className="bg-slate-200 aspect-[16/10]" />
                    <div className="p-4 flex-1 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                        <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                        <div className="h-4 bg-slate-200 rounded-md w-full" />
                      </div>
                      <div className="h-8 bg-slate-200 rounded-md w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-white/40 border border-slate-200 rounded-3xl p-12">
                <LayoutGrid className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Eğitim bulunamadı
                </h3>
                <p className="text-sm text-slate-600">
                  Filtreleri değiştirerek yeniden aramayı deneyebilirsiniz.
                </p>
              </div>
            )}

            {/* Bottom CTA to View All Products */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="mt-12 text-center">
                <Link 
                  href="/urunler" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200/80 hover:border-accent-500/40 text-slate-800 hover:text-accent-600 font-bold text-base shadow-sm hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5"
                >
                  Tüm Eğitimleri Listele
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-slate-400 group-hover:text-accent-500" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-slate-200 rounded-t-2xl max-h-[80vh] overflow-y-auto lg:hidden shadow-2xl"
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
    </section>
  );
}

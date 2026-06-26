'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/products/ProductCard';

export default function SimilarProducts({ productId, category }) {
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSimilar() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          const filtered = data.products
            .filter((p) => p.category === category && p.id !== productId)
            .slice(0, 4);
          setSimilar(filtered);
        }
      } catch (err) {
        console.error('Benzer ürünler yüklenemedi:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSimilar();
  }, [productId, category]);

  if (isLoading || similar.length === 0) return null;

  return (
    <section className="mt-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl font-bold text-slate-900 mb-8"
      >
        Benzer Ürünler
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

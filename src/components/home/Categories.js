'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Play, FileCheck, Package,
  GraduationCap, Award, Calculator, Compass, Languages, Cpu, Sparkles, PenTool, History, FlaskConical 
} from 'lucide-react';
import { categories as staticCategories } from '@/data/products';

const iconMap = {
  BookOpen,
  Play,
  FileCheck,
  Package,
  GraduationCap,
  Award,
  Calculator,
  Compass,
  Languages,
  Cpu,
  Sparkles,
  PenTool,
  History,
  FlaskConical
};

export default function Categories() {
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
        console.error('Kategoriler dynamic fetch hatası, statik veri kullanılıyor:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Ürün Kategorileri
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            İhtiyacına uygun dijital eğitim ürününü seç, anında öğrenmeye başla
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categoriesList.map((category, i) => {
            const Icon = iconMap[category.icon] || BookOpen;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/urunler?category=${category.id}`}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="glass-card p-6 h-full cursor-pointer group"
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-semibold text-slate-900 mb-1.5 group-hover:text-accent-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Count */}
                    <span className="text-xs font-medium text-slate-500">
                      {category.count} ürün
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


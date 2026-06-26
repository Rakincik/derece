'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';

export default function Testimonials({ testimonials }) {
  const [current, setCurrent] = useState(0);

  // Fallback if empty
  const list = (testimonials && testimonials.length > 0) ? testimonials : [
    {
      id: 1,
      name: 'Elif Kaya',
      role: 'YKS Öğrencisi',
      avatar: 'EK',
      rating: 5,
      comment: 'Dereceuzem sayesinde TYT netlerim 40\'tan 85\'e çıktı. Video dersler ve deneme sınavları mükemmel hazırlanmış!'
    },
    {
      id: 2,
      name: 'Mehmet Arslan',
      role: 'KPSS Adayı',
      avatar: 'MA',
      rating: 5,
      comment: 'Dijital kitapların kalitesi çok yüksek. Görsel ve interaktif anlatım sayesinde konuları çok kolay kavrıyorum.'
    },
    {
      id: 3,
      name: 'Zeynep Demir',
      role: 'Lise Öğrencisi',
      avatar: 'ZD',
      rating: 5,
      comment: 'Kombo paketler çok avantajlı! Hem kitap hem video hem deneme bir arada. Ayrı almaya gerek kalmadı.'
    }
  ];

  const next = () => setCurrent((prev) => (prev + 1) % list.length);
  const prev = () => setCurrent((prev) => (prev - 1 + list.length) % list.length);

  return (
    <section className="py-20 relative overflow-hidden">
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
            Öğrencilerimiz Ne Diyor?
          </h2>
          <p className="text-slate-600">
            Binlerce öğrencinin başarı hikayesinden bazıları
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 sm:p-10"
              >
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-accent-400/30 mb-4" strokeWidth={1} />

                {/* Content */}
                <p className="text-lg text-slate-700 leading-relaxed mb-6 italic">
                  &ldquo;{list[current]?.comment}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-accent-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {list[current]?.avatar && (list[current].avatar.startsWith('/') || list[current].avatar.startsWith('http')) ? (
                      <img src={list[current].avatar} alt={list[current].name} className="w-full h-full object-cover" />
                    ) : (
                      list[current]?.avatar || list[current]?.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {list[current]?.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {list[current]?.role}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={list[current]?.rating || 5} size="sm" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prev}
                className="p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>

              <div className="flex gap-2">
                {list.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? 'w-6 bg-accent-600'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={next}
                className="p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

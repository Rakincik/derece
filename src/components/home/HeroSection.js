'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection({ settings }) {
  const title = settings?.hero_title || 'Başarıya Giden Yolda **Dijital Eğitim** Platformu';
  const subtitle = settings?.hero_subtitle || 'Yeni nesil dijital kitaplar, yüksek kaliteli video dersler ve Türkiye geneli online denemeler ile hedeflerine bir adım daha yaklaş.';
  const btn1Text = settings?.hero_btn1_text || 'Ürünleri Keşfet';
  const btn1Link = settings?.hero_btn1_link || '/urunler';
  const btn2Text = settings?.hero_btn2_text || 'Kombo Paketler';
  const btn2Link = settings?.hero_btn2_link || '/urunler?category=kombo';

  const renderTitle = (text) => {
    const parts = text.split('**');
    if (parts.length >= 3) {
      return (
        <>
          {parts[0]}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-orange-500">
            {parts[1]}
          </span>
          {parts[2]}
        </>
      );
    }
    return text;
  };

  return (
    <section className="relative flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-slate-50">
      
      {/* Dynamic Mesh / Aurora Background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-40 z-0 pointer-events-none">
        <div className="absolute top-10 left-20 w-[400px] h-[400px] bg-accent-400 rounded-full blur-[100px] mix-blend-multiply animate-pulse-soft" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-orange-400 rounded-full blur-[120px] mix-blend-multiply animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-10 left-1/3 w-[600px] h-[400px] bg-rose-300 rounded-full blur-[120px] mix-blend-multiply animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black tracking-tight text-slate-900 leading-[1.1] mb-5 max-w-5xl"
        >
          {renderTitle(title)}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg text-slate-600 font-medium leading-relaxed mb-8 max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-30 relative"
        >
          <Link href={btn1Link} className="w-full sm:w-auto">
            <button className="relative group px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-lg font-bold overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 w-full flex items-center justify-center gap-2">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-2">
                {btn1Text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
          <Link href={btn2Link} className="w-full sm:w-auto">
            <button className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl text-lg font-bold shadow-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all w-full flex items-center justify-center gap-2">
              {btn2Text}
            </button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

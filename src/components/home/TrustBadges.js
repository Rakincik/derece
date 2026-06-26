'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Headphones, RotateCcw } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Güvenli Ödeme',
    description: '256-bit SSL şifrelemeli güvenli ödeme altyapısı',
  },
  {
    icon: Zap,
    title: 'Anında Erişim',
    description: 'Satın aldığın anda dijital ürünlere erişim sağla',
  },
  {
    icon: Headphones,
    title: '7/24 Destek',
    description: 'Teknik destek ekibimiz her zaman yanınızda',
  },
  {
    icon: RotateCcw,
    title: 'İade Garantisi',
    description: '14 gün içinde koşulsuz iade garantisi',
  },
];

export default function TrustBadges() {
  return (
    <section className="py-16 border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-accent-200 group-hover:bg-accent-50 transition-all duration-300">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:text-accent-600 transition-colors" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Clock } from 'lucide-react';
import CountUpNumber from '@/components/ui/CountUpNumber';

const iconMap = [Users, BookOpen, Clock];

export default function StatsCounter({ settings }) {
  // Try to parse stats from settings
  let statsList = [];
  try {
    if (settings?.stats) {
      statsList = JSON.parse(settings.stats);
    }
  } catch (err) {
    console.error('Stats parsing error:', err);
  }

  // Fallback if not set
  if (!statsList || statsList.length === 0) {
    statsList = [
      { label: 'Aktif Öğrenci', value: 25000, suffix: '+' },
      { label: 'Dijital Ürün', value: 150, suffix: '+' },
      { label: 'Video Ders Saati', value: 500, suffix: '+' }
    ];
  }

  return (
    <section className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-100 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {statsList.slice(0, 3).map((stat, i) => {
            const Icon = iconMap[i] || Users;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="glass-card p-6 lg:p-8">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-accent-400/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent-400" strokeWidth={1.5} />
                  </div>
                  <div className="text-3xl lg:text-4xl mb-2">
                    <CountUpNumber
                      end={stat.value}
                      suffix={stat.suffix}
                      className="text-slate-900"
                    />
                  </div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CampaignBanner({ settings }) {
  const title = settings?.campaign_title || 'Kombo Paketlerde %40\'a Varan İndirim!';
  const subtitle = settings?.campaign_subtitle || 'Kitap + Video + Deneme paketlerini birlikte al, ekstra indirim kazan. Bu fırsat kaçmaz!';
  const btnText = settings?.campaign_btn_text || 'Kampanyayı Gör';
  const btnLink = settings?.campaign_btn_link || '/urunler?category=kombo';
  const hoursConfig = settings?.campaign_hours ? parseInt(settings.campaign_hours) : 48;

  const [timeLeft, setTimeLeft] = useState({ hours: hoursConfig - 1, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Reset timer when configuration changes
    setTimeLeft({ hours: hoursConfig - 1, minutes: 59, seconds: 59 });

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = hoursConfig - 1; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hoursConfig]);

  const pad = (n) => n.toString().padStart(2, '0');

  const renderTitle = (text) => {
    const parts = text.split('**');
    if (parts.length >= 3) {
      return (
        <>
          {parts[0]}
          <span className="text-gradient">
            {parts[1]}
          </span>
          {parts[2]}
        </>
      );
    }
    return text;
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-800 via-primary-900 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400/10 via-transparent to-violet-500/10" />
          
          {/* Decorative Circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-accent-400/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                {renderTitle(title)}
              </h2>
              <p className="text-slate-300 mb-6 max-w-lg">
                {subtitle}
              </p>
              <Link href={btnLink}>
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  {btnText}
                </Button>
              </Link>
            </div>

            {/* Timer */}
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 justify-center mb-3">
                <Clock className="w-4 h-4 text-accent-400" strokeWidth={1.5} />
                <span className="text-sm text-slate-300 font-medium">
                  Kampanya bitimine kalan süre
                </span>
              </div>
              <div className="flex gap-3">
                {[
                  { value: pad(timeLeft.hours), label: 'Saat' },
                  { value: pad(timeLeft.minutes), label: 'Dakika' },
                  { value: pad(timeLeft.seconds), label: 'Saniye' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-center mb-1">
                      <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                        {item.value}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

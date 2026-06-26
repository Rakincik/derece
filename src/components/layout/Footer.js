'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Mail, Phone, MapPin, Globe, MessageCircle, Video, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [categoriesList, setCategoriesList] = useState([
    { href: '/urunler?category=dijital-kitap', label: 'Dijital Kitaplar' },
    { href: '/urunler?category=video-set', label: 'Video Ders Setleri' },
    { href: '/urunler?category=deneme-paketi', label: 'Deneme Paketleri' },
    { href: '/urunler?category=kombo', label: 'Kombo Paketler' },
  ]);

  useEffect(() => {
    async function loadFooterCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            const mapped = data.categories.map(cat => ({
              href: `/urunler?category=${cat.id}`,
              label: cat.name
            }));
            setCategoriesList(mapped);
          }
        }
      } catch (err) {
        console.error('Footer categories fetch error:', err);
      }
    }
    loadFooterCategories();
  }, []);

  const footerLinks = {
    urunler: categoriesList,
    destek: [
      { href: '/sss', label: 'Sıkça Sorulan Sorular' },
      { href: '#', label: 'İade Politikası' },
      { href: '#', label: 'Gizlilik Sözleşmesi' },
      { href: '#', label: 'Kullanım Koşulları' },
    ],
    iletisim: [
      { icon: Mail, label: 'info@dereceuzem.com' },
      { icon: Phone, label: '0543 521 06 34' },
      { icon: MapPin, label: 'İstanbul, Türkiye' },
    ],
  };

  return (
    <footer className="relative border-t border-slate-800/50 bg-slate-950/80">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo.png"
                alt="Dereceuzem"
                width={160}
                height={36}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Dijital eğitim dünyasında fark yaratan ürünlerle 
              başarınıza katkı sağlıyoruz. Kaliteli içerik, 
              anında erişim.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: Globe, href: 'https://www.instagram.com/dereceuzem/', label: 'Instagram' },
                { icon: MessageCircle, href: '#', label: 'Twitter' },
                { icon: Video, href: '#', label: 'YouTube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-accent-400 hover:bg-slate-800 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Ürünler
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.urunler.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-accent-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Destek
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.destek.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-accent-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              İletişim
            </h3>
            <ul className="space-y-3">
              {footerLinks.iletisim.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 text-accent-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm text-slate-400">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Dereceuzem. Tüm hakları saklıdır.
          </p>

        </div>
      </div>
    </footer>
  );
}

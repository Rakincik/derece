'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Search, Menu, X, User, ChevronDown, 
  BookOpen, PlayCircle, Layers, Library, Play, FileCheck, Package,
  GraduationCap, Award, Calculator, Compass, Languages, Cpu, Sparkles, PenTool, History, FlaskConical
} from 'lucide-react';
import useCartStore from '@/store/cartStore';

const iconMap = {
  BookOpen,
  Play,
  PlayCircle,
  FileCheck,
  Layers,
  Package,
  Library,
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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, getItemCount } = useCartStore();
  const itemCount = useCartStore((state) => state.items.reduce((c, i) => c + i.quantity, 0));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [categoriesSubItems, setCategoriesSubItems] = useState([
    { href: '/urunler?category=dijital-kitap', label: 'Dijital Kitaplar', desc: 'PDF ve ePub formatında', icon: BookOpen },
    { href: '/urunler?category=video-set', label: 'Video Dersler', desc: 'Kapsamlı video içerikler', icon: PlayCircle },
    { href: '/urunler?category=deneme-paketi', label: 'Deneme Paketleri', desc: 'Online deneme sınavları', icon: Layers },
    { href: '/urunler', label: 'Tüm Eğitimler', desc: 'Bütün kategoriler', icon: Library },
  ]);

  useEffect(() => {
    async function loadNavbarCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            const mapped = data.categories
              .filter(cat => cat.showInNavbar !== false)
              .map(cat => {
                const IconComp = iconMap[cat.icon] || BookOpen;
                return {
                  href: `/urunler?category=${cat.id}`,
                  label: cat.name,
                  desc: cat.description || '',
                  icon: IconComp
                };
              });
            mapped.push({
              href: '/urunler',
              label: 'Tüm Eğitimler',
              desc: 'Bütün kategoriler',
              icon: Library
            });
            setCategoriesSubItems(mapped);
          }
        }
      } catch (err) {
        console.error('Navbar categories fetch error:', err);
      }
    }
    loadNavbarCategories();
  }, []);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { 
      href: '/urunler', 
      label: 'Eğitimler',
      subItems: categoriesSubItems
    },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
    { href: '/sss', label: 'SSS' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logo.png"
              alt="Dereceuzem"
              width={180}
              height={40}
              className="h-8 lg:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                <Link
                  href={link.href}
                  className="relative flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 py-2"
                >
                  {link.label}
                  {link.subItems && <ChevronDown className="w-4 h-4" strokeWidth={1.5} />}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-400 transition-all duration-300 group-hover:w-full" />
                </Link>
                
                {link.subItems && (
                  <div className="absolute top-full left-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-50">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2">
                      {link.subItems.map(sub => {
                        const Icon = sub.icon;
                        return (
                          <Link 
                            key={sub.label} 
                            href={sub.href} 
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group/item"
                          >
                            <div className="mt-0.5 w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 group-hover/item:bg-white group-hover/item:border-accent-100 group-hover/item:text-accent-600 group-hover/item:shadow-sm flex items-center justify-center shrink-0 transition-all">
                              {Icon && <Icon className="w-5 h-5" strokeWidth={1.5} />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 group-hover/item:text-accent-600 transition-colors">
                                {sub.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {sub.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              aria-label="Ara"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>

            {/* Account */}
            <Link href="/hesabim">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </motion.div>
            </Link>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              aria-label="Sepet"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
              aria-label="Menü"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block overflow-hidden pb-4"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Ürün, kategori veya konu ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass border-t border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-accent-400 shadow-sm"
                />
              </div>

              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                  >
                    {link.label}
                    {link.subItems && <ChevronDown className="w-4 h-4 opacity-50" />}
                  </Link>
                  {link.subItems && (
                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-100 ml-4">
                      {link.subItems.map(sub => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-slate-500 hover:text-accent-600 transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href="/hesabim"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Hesabım
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, LayoutGrid, ShoppingCart, User, PlayCircle } from 'lucide-react';
import useCartStore from '@/store/cartStore';

const navItems = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/urunler', label: 'Ürünler', icon: LayoutGrid },
  { href: 'https://dereceuzem.okinar.com/account/login', label: 'Ders Paneli', icon: PlayCircle, isExternal: true },
  { href: '#cart', label: 'Sepet', icon: ShoppingCart, isCart: true },
  { href: '/hesabim', label: 'Hesabım', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { openCart } = useCartStore();
  const itemCount = useCartStore((state) => state.items.reduce((c, i) => c + i.quantity, 0));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-700/50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.9 }}
                onClick={openCart}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 text-slate-400`}
                    strokeWidth={1.5}
                  />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 w-4 h-4 bg-accent-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {item.label}
                </span>
              </motion.button>
            );
          }

          const innerContent = (
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-accent-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute bottom-0 w-8 h-0.5 bg-accent-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );

          if (item.isExternal) {
            return (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                {innerContent}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href}>
              {innerContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

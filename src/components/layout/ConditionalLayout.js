'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import SmoothScroll from '@/components/layout/SmoothScroll';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50/50">
        {children}
      </main>
    );
  }

  return (
    <SmoothScroll>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileNav />
    </SmoothScroll>
  );
}

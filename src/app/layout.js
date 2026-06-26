import './globals.css';
import { Inter } from 'next/font/google';
import ConditionalLayout from '@/components/layout/ConditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dereceuzem — Dijital Eğitim Ürünleri',
  description: 'Dijital kitaplar, video ders setleri, deneme sınavları ve kombo paketlerle başarıya giden yolda yanınızdayız. Anında dijital erişim.',
  keywords: 'dijital eğitim, online ders, video ders, deneme sınavı, dijital kitap, YKS, TYT, AYT, KPSS',
  openGraph: {
    title: 'Dereceuzem — Dijital Eğitim Ürünleri',
    description: 'Dijital kitaplar, video ders setleri, deneme sınavları ve kombo paketlerle başarıya giden yolda yanınızdayız.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={inter.className}>
      <body className="antialiased">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}

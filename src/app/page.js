import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CampaignBanner from '@/components/home/CampaignBanner';
import StatsCounter from '@/components/home/StatsCounter';
import Testimonials from '@/components/home/Testimonials';
import TrustBadges from '@/components/home/TrustBadges';
import prisma from '@/lib/db';
import { mapProduct } from '@/lib/productHelper';

export const revalidate = 60;

export default async function HomePage() {
  let settings = {};
  let testimonials = [];
  let products = [];

  try {
    const rawSettings = await prisma.setting.findMany();
    let dbTestimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (dbTestimonials.length === 0) {
      const defaults = [
        {
          name: 'Elif Kaya',
          role: 'YKS Öğrencisi',
          avatar: 'EK',
          rating: 5,
          comment: 'Dereceuzem sayesinde TYT netlerim 40\'tan 85\'e çıktı. Video dersler ve deneme sınavları mükemmel hazırlanmış!'
        },
        {
          name: 'Mehmet Arslan',
          role: 'KPSS Adayı',
          avatar: 'MA',
          rating: 5,
          comment: 'Dijital kitapların kalitesi çok yüksek. Görsel ve interaktif anlatım sayesinde konuları çok kolay kavrıyorum.'
        },
        {
          name: 'Zeynep Demir',
          role: 'Lise Öğrencisi',
          avatar: 'ZD',
          rating: 5,
          comment: 'Kombo paketler çok avantajlı! Hem kitap hem video hem deneme bir arada. Ayrı almaya gerek kalmadı.'
        }
      ];

      try {
        await prisma.testimonial.createMany({
          data: defaults
        });
        dbTestimonials = await prisma.testimonial.findMany({
          orderBy: { createdAt: 'desc' }
        });
      } catch (seedErr) {
        console.error('Testimonials auto-seed failed:', seedErr);
      }
    }

    const dbProducts = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    });

    settings = rawSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    testimonials = dbTestimonials;
    products = dbProducts.map(mapProduct);
  } catch (err) {
    console.warn('Anasayfa veritabanı bağlantı hatası, varsayılan statik verilerle yükleniyor:', err.message);
  }

  return (
    <>
      <HeroSection settings={settings} />
      <FeaturedProducts initialProducts={products} />
      <CampaignBanner settings={settings} />
      <StatsCounter settings={settings} />
      <Testimonials testimonials={testimonials} />
      <TrustBadges />
    </>
  );
}

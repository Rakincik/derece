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
    const dbTestimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' }
    });
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

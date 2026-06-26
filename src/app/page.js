import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CampaignBanner from '@/components/home/CampaignBanner';
import StatsCounter from '@/components/home/StatsCounter';
import Testimonials from '@/components/home/Testimonials';
import TrustBadges from '@/components/home/TrustBadges';
import Categories from '@/components/home/Categories';
import HomeSlider from '@/components/home/HomeSlider';
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

  const showHero = settings.show_hero === undefined ? true : settings.show_hero === 'true';
  const showBento = settings.show_bento === undefined ? true : settings.show_bento === 'true';
  const showCampaign = settings.show_campaign === undefined ? true : settings.show_campaign === 'true';
  const showStats = settings.show_stats === undefined ? true : settings.show_stats === 'true';
  const showTestimonials = settings.show_testimonials === undefined ? true : settings.show_testimonials === 'true';
  const showSlider = settings.show_slider === 'true';

  let sliders = [];
  if (settings.homepage_sliders) {
    try {
      sliders = JSON.parse(settings.homepage_sliders);
    } catch (e) {
      console.error('Sliders parse error:', e);
    }
  }

  const defaultOrder = ['slider', 'hero', 'bento', 'products', 'campaign', 'stats', 'testimonials', 'badges'];
  let sectionOrder = defaultOrder;
  if (settings.homepage_section_order) {
    try {
      sectionOrder = JSON.parse(settings.homepage_section_order);
      if (!sectionOrder.includes('slider')) {
        sectionOrder = ['slider', ...sectionOrder];
      }
    } catch (e) {
      sectionOrder = defaultOrder;
    }
  }

  const visibleSections = sectionOrder.filter(sec => {
    if (sec === 'slider') return showSlider;
    if (sec === 'hero') return showHero;
    if (sec === 'bento') return showBento;
    if (sec === 'campaign') return showCampaign;
    if (sec === 'stats') return showStats;
    if (sec === 'testimonials') return showTestimonials;
    return true;
  });
  const firstVisibleSection = visibleSections[0];

  return (
    <>
      {sectionOrder.map((section) => {
        switch (section) {
          case 'slider':
            return showSlider ? <HomeSlider key="slider" sliders={sliders} isFirst={firstVisibleSection === 'slider'} /> : null;
          case 'hero':
            return showHero ? <HeroSection key="hero" settings={settings} /> : null;
          case 'bento':
            return showBento ? <Categories key="bento" /> : null;
          case 'products':
            return <FeaturedProducts key="products" initialProducts={products} />;
          case 'campaign':
            return showCampaign ? <CampaignBanner key="campaign" settings={settings} /> : null;
          case 'stats':
            return showStats ? <StatsCounter key="stats" settings={settings} /> : null;
          case 'testimonials':
            return showTestimonials ? <Testimonials key="testimonials" testimonials={testimonials} /> : null;
          case 'badges':
            return <TrustBadges key="badges" />;
          default:
            return null;
        }
      })}
    </>
  );
}

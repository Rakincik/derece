const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const settings = [
  {
    key: 'hero_title',
    value: 'Başarıya Giden Yolda Dijital Eğitim Platformu'
  },
  {
    key: 'hero_subtitle',
    value: 'Yeni nesil dijital kitaplar, yüksek kaliteli video dersler ve Türkiye geneli online denemeler ile hedeflerine bir adım daha yaklaş.'
  },
  {
    key: 'hero_btn1_text',
    value: 'Ürünleri Keşfet'
  },
  {
    key: 'hero_btn1_link',
    value: '/urunler'
  },
  {
    key: 'hero_btn2_text',
    value: 'Kombo Paketler'
  },
  {
    key: 'hero_btn2_link',
    value: '/urunler?category=kombo'
  },
  {
    key: 'campaign_title',
    value: 'Kombo Paketlerde %40\'a Varan İndirim!'
  },
  {
    key: 'campaign_subtitle',
    value: 'Kitap + Video + Deneme paketlerini birlikte al, ekstra indirim kazan. Bu fırsat kaçmaz!'
  },
  {
    key: 'campaign_btn_text',
    value: 'Kampanyayı Gör'
  },
  {
    key: 'campaign_btn_link',
    value: '/urunler?category=kombo'
  },
  {
    key: 'campaign_hours',
    value: '48'
  },
  {
    key: 'stats',
    value: JSON.stringify([
      { label: 'Aktif Öğrenci', value: 25000, suffix: '+' },
      { label: 'Dijital Ürün', value: 150, suffix: '+' },
      { label: 'Video Ders Saati', value: 500, suffix: '+' }
    ])
  },
  {
    key: 'hero_card1_title',
    value: 'Dijital Kitaplar'
  },
  {
    key: 'hero_card1_subtitle',
    value: 'Yeni Nesil Sorular'
  },
  {
    key: 'hero_card1_image',
    value: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop'
  },
  {
    key: 'hero_card1_link',
    value: '/urunler?category=dijital-kitap'
  },
  {
    key: 'hero_card2_title',
    value: 'Video Dersler'
  },
  {
    key: 'hero_card2_subtitle',
    value: 'Alanında Uzman Kadro'
  },
  {
    key: 'hero_card2_image',
    value: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'
  },
  {
    key: 'hero_card2_badge',
    value: 'Stüdyo Çekimi'
  },
  {
    key: 'hero_card2_link',
    value: '/urunler?category=video-set'
  },
  {
    key: 'hero_card3_title',
    value: 'Online Denemeler'
  },
  {
    key: 'hero_card3_subtitle',
    value: 'Gerçek Sınav Deneyimi'
  },
  {
    key: 'hero_card3_image',
    value: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop'
  },
  {
    key: 'hero_card3_link',
    value: '/urunler?category=deneme-paketi'
  }
];

const testimonials = [
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
  },
  {
    name: 'Ali Yılmaz',
    role: 'Üniversite Öğrencisi',
    avatar: 'AY',
    rating: 4,
    comment: 'İngilizce video kursu harika. Native speaker eğitmenlerle pratik yapmak çok farklı bir deneyim.'
  },
  {
    name: 'Selin Öztürk',
    role: 'AYT Öğrencisi',
    avatar: 'SÖ',
    rating: 5,
    comment: 'Deneme sınavlarının analiz raporları çok detaylı. Zayıf konularımı tespit edip odaklanabiliyorum.'
  }
];

async function main() {
  console.log('Seeding Home settings...');
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    });
  }

  console.log('Seeding Testimonials...');
  const count = await prisma.testimonial.count();
  if (count === 0) {
    for (const t of testimonials) {
      await prisma.testimonial.create({
        data: t
      });
    }
  } else {
    console.log('Testimonials already exist, skipping to avoid duplicates.');
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

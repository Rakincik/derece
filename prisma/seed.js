const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockProducts = [
  {
    title: 'Matematik Konu Anlatımı',
    slug: 'matematik-konu-anlatimi',
    price: 149.90,
    discountedPrice: 99.90,
    coverImage: '/covers/matematik.png',
    type: 'Dijital Kitap',
    description: 'Sıfırdan ileri seviyeye kadar tüm matematik konularını kapsayan, görsellerle zenrichleştirilmiş dijital kitap. Her bölüm sonunda çözümlü sorular ve pratik testler içerir. 450+ sayfa, interaktif PDF formatında.',
    isFeatured: true,
    isBestseller: true,
    contents: [
      'Sayılar ve İşlemler (45 sayfa)',
      'Cebir ve Denklemler (62 sayfa)',
      'Geometri Temelleri (58 sayfa)',
      'Trigonometri (44 sayfa)',
      'Analitik Geometri (52 sayfa)',
      'Limit ve Türev (48 sayfa)',
      'İntegral (42 sayfa)',
      'Olasılık ve İstatistik (35 sayfa)',
      '500+ Çözümlü Soru',
      '10 Deneme Sınavı',
    ],
    outcomes: ['Matematik konularında tam hakimiyet', 'Netlerinizi artıracak pratikler', 'Sınav formatına uyum'],
  },
  {
    title: 'Türkçe Dil Bilgisi Rehberi',
    slug: 'turkce-dil-bilgisi',
    price: 129.90,
    discountedPrice: null,
    coverImage: '/covers/turkce.png',
    type: 'Dijital Kitap',
    description: 'Ses bilgisinden cümle analizine kadar Türk dili kurallarını öğreten, edebiyat akımlarını ve dönemlerini detaylıca inceleyen kapsamlı dijital kitap. Güncel sınav formatına uygun hazırlanmıştır.',
    isFeatured: true,
    isBestseller: false,
    contents: [
      'Ses Bilgisi (32 sayfa)',
      'Yapı Bilgisi (45 sayfa)',
      'Sözcük Türleri (68 sayfa)',
      'Cümle Bilgisi (55 sayfa)',
      'Anlatım Bozuklukları (28 sayfa)',
      'Paragraf ve Anlam (42 sayfa)',
      'Edebiyat Tarihi (58 sayfa)',
      'Edebi Türler (32 sayfa)',
      '400+ Çözümlü Soru',
    ],
    outcomes: ['Dil bilgisi kurallarını eksiksiz öğrenme', 'Paragraf sorularında hız kazanma', 'Edebiyat konularında başarı'],
  },
  {
    title: 'Fen Bilimleri Ansiklopedik Kitap',
    slug: 'fen-bilimleri-kitabi',
    price: 179.90,
    discountedPrice: 139.90,
    coverImage: '/covers/fen.png',
    type: 'Dijital Kitap',
    description: 'Fizik, Kimya ve Biyoloji derslerini tek bir kaynakta birleştiren, deneylerle ve görsellerle desteklenmiş kapsamlı dijital eğitim kitabı. Her konu sonunda mini testler ve değerlendirme soruları içerir.',
    isFeatured: false,
    isBestseller: false,
    contents: [
      'Fizik: Mekanik (65 sayfa)',
      'Fizik: Elektrik ve Manyetizma (55 sayfa)',
      'Fizik: Dalgalar ve Optik (40 sayfa)',
      'Kimya: Atom ve Periyodik Tablo (48 sayfa)',
      'Kimya: Kimyasal Tepkimeler (52 sayfa)',
      'Biyoloji: Hücre ve Canlılar (60 sayfa)',
      'Biyoloji: Genetik ve Evrim (45 sayfa)',
      'Laboratuvar Deneyleri (35 sayfa)',
      '600+ Çözümlü Soru',
    ],
    outcomes: ['Fizik, Kimya ve Biyoloji temelleri', 'Görsel deney anlatımları', 'Kapsamlı fen soru havuzu'],
  },
  {
    title: 'Tarih Kronolojik Rehber',
    slug: 'tarih-kronolojik-rehber',
    price: 119.90,
    discountedPrice: null,
    coverImage: '/covers/tarih.png',
    type: 'Dijital Kitap',
    description: 'Dünya ve Türk tarihini kronolojik sırayla ele alan, haritalar ve infografiklerle zenginleştirilmiş kapsamlı tarih kitap. İnkılap tarihi ve çağdaş dünya tarihi bölümleri güncel müfredata uygun hazırlanmıştır.',
    isFeatured: false,
    isBestseller: false,
    contents: [
      'İlk Çağ Uygarlıkları (35 sayfa)',
      'İslam Tarihi (40 sayfa)',
      'Türk-İslam Devletleri (48 sayfa)',
      'Osmanlı Devleti: Kuruluş-Yükseliş (55 sayfa)',
      'Osmanlı Devleti: Duraklama-Çöküş (45 sayfa)',
      'Kurtuluş Savaşı (52 sayfa)',
      'Atatürk İlkeleri ve İnkılapları (42 sayfa)',
      'Çağdaş Dünya Tarihi (38 sayfa)',
      '350+ Çözümlü Soru',
    ],
    outcomes: ['Tarihsel kronolojiye hakimiyet', 'Harita ve görsel analizler', 'Sınav odaklı tarih bilgisi'],
  },
  {
    title: 'Matematik Video Ders Seti',
    slug: 'matematik-video-seti',
    price: 349.90,
    discountedPrice: 249.90,
    coverImage: '/covers/matematik.png',
    type: 'Video Ders Seti',
    description: 'Alanında uzman eğitmenler tarafından hazırlanan, sıfırdan ileri seviyeye kadar tüm matematik konularını kapsayan HD video ders seti. Her ders sonunda interaktif quizler ve ödevler içerir.',
    isFeatured: true,
    isBestseller: true,
    contents: [
      'Temel Matematik (22 video, 18 saat)',
      'Cebir ve Denklemler (28 video, 20 saat)',
      'Geometri (32 video, 24 saat)',
      'Trigonometri (18 video, 14 saat)',
      'Analitik Geometri (22 video, 16 saat)',
      'Limit ve Süreklilik (16 video, 10 saat)',
      'Türev (24 video, 12 saat)',
      'İntegral (14 video, 6 saat)',
      'Olasılık (10 video, 4 saat)',
      '186 Quiz ve Ödev',
    ],
    outcomes: ['120+ saat konu anlatımı', 'Detaylı soru çözümleri', 'Pratik quiz ve ödevler'],
  },
  {
    title: 'Fen Bilimleri Video Seti',
    slug: 'fen-bilimleri-video-seti',
    price: 299.90,
    discountedPrice: 219.90,
    coverImage: '/covers/fen.png',
    type: 'Video Ders Seti',
    description: 'Fizik, Kimya ve Biyoloji derslerini tek bir sette birleştiren profesyonel video ders paketi. Animasyonlar ve 3D modeller ile desteklenmiş, görsel öğrenmeye odaklı interaktif dersler.',
    isFeatured: true,
    isBestseller: false,
    contents: [
      'Fizik: Mekanik (24 video, 18 saat)',
      'Fizik: Elektrik (20 video, 14 saat)',
      'Fizik: Dalgalar ve Optik (16 video, 10 saat)',
      'Kimya: Temel Kavramlar (22 video, 16 saat)',
      'Kimya: Organik Kimya (14 video, 8 saat)',
      'Biyoloji: Hücre ve Genetik (28 video, 18 saat)',
      'Biyoloji: Ekosistem (12 video, 6 saat)',
      'Deney Videoları (12 video, 6 saat)',
      '148 Konu Testi',
    ],
    outcomes: ['3D animasyonlu görsel anlatım', 'Ders notları ve çalışma dokümanları', 'Sınavda çıkabilecek soru tipleri'],
  },
  {
    title: 'İngilizce Kapsamlı Video Kursu',
    slug: 'ingilizce-video-kursu',
    price: 279.90,
    discountedPrice: null,
    coverImage: '/covers/ingilizce.png',
    type: 'Video Ders Seti',
    description: 'Başlangıçtan ileri seviyeye kadar İngilizce öğretim seti. Native speaker eğitmenlerle pratik konuşma, gramer, kelime hazinesi ve sınav hazırlığı videoları. Altyazılı ve interaktif.',
    isFeatured: false,
    isBestseller: false,
    contents: [
      'A1-A2: Temel İngilizce (30 video, 20 saat)',
      'B1: Orta Seviye (25 video, 18 saat)',
      'B2: Üst Orta (25 video, 18 saat)',
      'C1: İleri Seviye (20 video, 14 saat)',
      'Konuşma Pratikleri (10 video, 5 saat)',
      'YDS/YÖKDİL Hazırlık (10 video, 5 saat)',
      '1000+ Kelime Kartı',
      '120 Gramer Alıştırması',
    ],
    outcomes: ['A1-C1 arası tüm seviyeler', 'Akıcı İngilizce konuşma becerisi', 'Sınavlara hazırlık ve pratikler'],
  },
  {
    title: 'TYT Deneme Sınavı Paketi',
    slug: 'tyt-deneme-paketi',
    price: 199.90,
    discountedPrice: 149.90,
    coverImage: '/covers/deneme.png',
    type: 'Deneme Paketi',
    description: 'ÖSYM formatına birebir uygun, 30 adet kapsamlı TYT deneme sınavı. Otomatik puanlama, detaylı analiz raporu ve konu bazlı performans takibi. Her deneme 120 sorudan oluşur.',
    isFeatured: true,
    isBestseller: true,
    contents: [
      '30 Tam Deneme Sınavı (120 soru/deneme)',
      'Toplam 3.600 Soru',
      'Otomatik Puanlama Sistemi',
      'Detaylı Çözüm Videoları',
      'Konu Bazlı Performans Analizi',
      'Türkiye Geneli Sıralama',
      'Net Takip Grafiği',
      'Zayıf Konu Önerileri',
    ],
    outcomes: ['30 adet online TYT denemesi', 'Detaylı video çözümler', 'Konu bazlı başarı grafikleri'],
  },
  {
    title: 'AYT Deneme Sınavı Paketi',
    slug: 'ayt-deneme-paketi',
    price: 229.90,
    discountedPrice: 179.90,
    coverImage: '/covers/deneme.png',
    type: 'Deneme Paketi',
    description: 'AYT sınavına özel, alan bazlı deneme sınavları. Sayısal, Sözel ve Eşit Ağırlık alanları için ayrı deneme setleri. Detaylı analizler ve çözüm videoları dahil.',
    isFeatured: false,
    isBestseller: false,
    contents: [
      '10 Sayısal AYT Denemesi',
      '8 Sözel AYT Denemesi',
      '7 Eşit Ağırlık AYT Denemesi',
      'Toplam 4.000 Soru',
      'Otomatik Puanlama ve Net Hesaplama',
      'Konu Bazlı Analiz Raporu',
      'Video Çözümler',
      'Sıralama ve Karşılaştırma',
    ],
    outcomes: ['Alan bazlı denemeler', 'Hassas net hesaplamaları', 'Sıralama raporları'],
  },
  {
    title: 'Matematik Ultimate Kombo',
    slug: 'matematik-ultimate-kombo',
    price: 699.70,
    discountedPrice: 399.90,
    coverImage: '/covers/kombo.png',
    type: 'Kombo Paket',
    description: 'Matematik başarısı için ihtiyacınız olan her şey tek pakette! Dijital kitap, video ders seti ve deneme sınavları bir arada. Ayrı ayrı almaya göre %40 avantajlı.',
    isFeatured: true,
    isBestseller: true,
    contents: [
      '📚 Matematik Konu Anlatımı Kitabı (456 sayfa)',
      '🎬 Matematik Video Ders Seti (124 saat, 186 video)',
      '📝 30 Matematik Deneme Sınavı',
      '✅ 500+ Çözümlü Soru',
      '✅ Konu Bazlı Performans Analizi',
      '✅ Ömür Boyu Erişim',
      '🎁 Bonus: Formül Kartları PDF',
      '🎁 Bonus: Soru Çözüm Maratonu (10 saat)',
    ],
    outcomes: ['Tüm matematik kaynakları tek pakette', 'Yüksek indirim avantajı', 'Bonus içerikler ve soru maratonları'],
  },
];

async function main() {
  console.log('Seeding products...');
  for (const prod of mockProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }
  console.log('Products seeded successfully.');

  console.log('Seeding testimonials...');
  const mockTestimonials = [
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

  for (const test of mockTestimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: test.name, comment: test.comment }
    });
    if (!existing) {
      await prisma.testimonial.create({ data: test });
    }
  }
  console.log('Testimonials seeded.');

  console.log('Seeding settings...');
  const defaultSettings = {
    hero_title: 'Başarıya Giden Yolda **Dijital Eğitim** Platformu',
    hero_subtitle: 'Yeni nesil dijital kitaplar, yüksek kaliteli video dersler ve Türkiye geneli online denemeler ile hedeflerine bir adım daha yaklaş.',
    hero_btn1_text: 'Ürünleri Keşfet',
    hero_btn1_link: '/urunler',
    hero_btn2_text: 'Kombo Paketler',
    hero_btn2_link: '/urunler?category=kombo',
    
    hero_card1_title: 'Dijital Kitaplar',
    hero_card1_subtitle: 'Zengin Konu Anlatımlı PDF Setleri',
    hero_card1_image: '/covers/kitap.png',
    hero_card1_link: '/urunler?category=kitap',

    hero_card2_title: 'Video Ders Setleri',
    hero_card2_subtitle: 'Yüksek Çözünürlüklü Konu Anlatımları',
    hero_card2_image: '/covers/video.png',
    hero_card2_badge: 'Çok Satan',
    hero_card2_link: '/urunler?category=video',

    hero_card3_title: 'Online Denemeler',
    hero_card3_subtitle: 'Türkiye Geneli Derece Analizleri',
    hero_card3_image: '/covers/deneme.png',
    hero_card3_link: '/urunler?category=deneme',

    campaign_title: "Kombo Paketlerde %40'a Varan İndirim!",
    campaign_subtitle: "Kitap + Video + Deneme paketlerini birlikte al, ekstra indirim kazan. Bu fırsat kaçmaz!",
    campaign_btn_text: "Kampanyayı Gör",
    campaign_btn_link: "/urunler?category=kombo",
    campaign_hours: "48",

    about_title: 'Geleceğin Eğitim Standartlarını Bugün Keşfedin',
    about_subtitle: 'Dereceuzem olarak, adayların hedeflerine en verimli şekilde ulaşabilmeleri için modern dijital öğrenme araçları geliştiriyoruz.',
    about_mission_title: 'Misyonumuz',
    about_mission_text: 'Her adayın ihtiyacına özel, güncel müfredatla %100 uyumlu, yüksek kaliteli eğitim materyallerini en erişilebilir şekilde sunmak.',
    about_vision_title: 'Vizyonumuz',
    about_vision_text: 'Türkiye genelinde dijital eğitim denildiğinde ilk akla gelen, yenilikçi ve derece odaklı lider eğitim platformu olmak.',
    about_image: '/logo.png',

    stats: JSON.stringify([
      { label: 'Aktif Öğrenci', value: 15000, suffix: '+' },
      { label: 'Dijital Kitap', value: 50, suffix: '+' },
      { label: 'Ders Videosu', value: 1200, suffix: '+' }
    ])
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value }
    });
  }
  console.log('Settings seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

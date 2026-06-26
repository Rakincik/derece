/**
 * Helper to map Prisma Database Product models to Frontend-enriched Product structures.
 * This guarantees type compatibility and displays mock reviews & ratings for dynamic database products.
 */
export function mapProduct(p) {
  if (!p) return null;

  const isBook = p.type === 'Dijital Kitap' || p.category?.slug === 'dijital-kitap';
  const isVideo = p.type === 'Video Ders Seti' || p.category?.slug === 'video-set';
  const isExam = p.type === 'Deneme Sınavı Paketi' || p.type === 'Deneme Paketi' || p.category?.slug === 'deneme-paketi';
  const isCombo = p.type === 'Kombo Paket' || p.category?.slug === 'kombo';
 
  let category = p.category?.slug || 'dijital-kitap';
  if (!p.category) {
    if (isVideo) category = 'video-set';
    if (isExam) category = 'deneme-paketi';
    if (isCombo) category = 'kombo';
  }

  const defaultReviews = {
    'dijital-kitap': [
      { id: 1, author: 'Elif K.', rating: 5, date: '2026-05-15', comment: 'Kitap içeriği çok zengin. Özellikle konu özetleri ve pratik çözümler sınava hazırlıkta çok yardımcı oldu.', helpful: 45 },
      { id: 2, author: 'Mehmet A.', rating: 5, date: '2026-04-28', comment: 'PDF formatında olması her an yanımda taşıyabilmemi sağlıyor. Tablette harika çalışıyor.', helpful: 38 },
      { id: 3, author: 'Zeynep T.', rating: 4, date: '2026-04-10', comment: 'İçerik çok kapsamlı, sadece bazı bölümlerde daha fazla örnek olabilirdi.', helpful: 22 }
    ],
    'video-set': [
      { id: 1, author: 'Ali R.', rating: 5, date: '2026-06-05', comment: 'Hocamız konuları çok anlaşılır anlatmış. Soru çözüm videoları sayesinde eksiklerimi kapattım.', helpful: 89 },
      { id: 2, author: 'Deniz K.', rating: 5, date: '2026-05-22', comment: 'Anlatım hızı ve kalitesi çok iyi. İstediğim konuyu tekrar tekrar izleyebiliyorum.', helpful: 67 },
      { id: 3, author: 'Merve S.', rating: 4, date: '2026-05-10', comment: 'Çok kapsamlı bir set. Bazı videolar biraz uzun ama içerik kalitesi çok yüksek.', helpful: 34 }
    ],
    'deneme-paketi': [
      { id: 1, author: 'Beyza H.', rating: 5, date: '2026-06-12', comment: 'Soruların zorluk derecesi ÖSYM standartlarında. Sınav provası yapmak için birebir.', helpful: 78 },
      { id: 2, author: 'Cem V.', rating: 5, date: '2026-06-01', comment: 'Netlerimin artışını takip edebilmek harika. Sınav analizleri çok faydalı.', helpful: 55 },
      { id: 3, author: 'Nisa K.', rating: 4, date: '2026-05-15', comment: 'Zorluk seviyesi gerçek sınava çok yakın. Sıralama sistemi de motivasyon sağlıyor.', helpful: 42 }
    ],
    'kombo': [
      { id: 1, author: 'Hakan B.', rating: 5, date: '2026-06-10', comment: 'Hem konu anlatımlı kitap hem de videolar bir arada olunca tam set oldu. Tavsiye ederim!', helpful: 92 },
      { id: 2, author: 'İrem Ç.', rating: 5, date: '2026-05-28', comment: 'Fiyat/performans olarak harika bir paket. Tek tek almaya göre çok daha avantajlı.', helpful: 68 }
    ]
  };

  const reviews = defaultReviews[category] || defaultReviews['dijital-kitap'];
  const rating = parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) || 4.8;

  // Generate deterministic sales count based on the product title / ID
  let hash = 0;
  const key = p.id || p.title;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const salesCount = 120 + (Math.abs(hash) % 880);

  return {
    id: p.id,
    slug: p.slug,
    name: p.title,
    shortDescription: p.description.length > 120 ? p.description.substring(0, 120) + '...' : p.description,
    description: p.description,
    price: p.price,
    discountedPrice: p.discountedPrice,
    cover: p.coverImage,
    category,
    type: p.type,
    format: isBook ? 'PDF / ePub' : isVideo ? 'HD Video' : isExam ? 'Online Sınav' : 'Kitap + Video + Sınav',
    rating,
    reviewCount: reviews.length,
    salesCount,
    isNew: (new Date().getTime() - new Date(p.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    contents: p.contents && p.contents.length > 0 ? p.contents : ['Konu Anlatımı', 'Çözümlü Sorular', 'Mini Testler'],
    outcomes: p.outcomes && p.outcomes.length > 0 ? p.outcomes : ['Konuya tam hakimiyet', 'Net artışı', 'Sınav pratikleri'],
    reviews,
    pages: p.pages !== null && p.pages !== undefined ? p.pages : (isBook ? 450 : undefined),
    videoCount: p.videoCount !== null && p.videoCount !== undefined ? p.videoCount : (isVideo ? 120 : undefined),
    examCount: p.examCount !== null && p.examCount !== undefined ? p.examCount : (isExam ? 30 : undefined),
    duration: p.duration !== null && p.duration !== undefined ? p.duration : (isVideo ? '96 saat' : undefined),
    showDemo: p.showDemo !== undefined && p.showDemo !== null ? p.showDemo : true,
    demoUrl: p.demoUrl || null,
    showFaq: p.showFaq !== undefined && p.showFaq !== null ? p.showFaq : true,
    faqs: p.faqs || null,
    showOutcomes: p.showOutcomes !== undefined && p.showOutcomes !== null ? p.showOutcomes : true,
    categoryId: p.categoryId || null,
  };
}

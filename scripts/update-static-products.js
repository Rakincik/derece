const fs = require('fs');
const path = require('path');

const SCRAPED_DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'scraped-data.json');
const STATIC_PRODUCTS_FILE = path.join(__dirname, '..', 'src', 'data', 'products.js');

if (!fs.existsSync(SCRAPED_DATA_FILE)) {
  console.error(`Error: Scraped data not found at ${SCRAPED_DATA_FILE}`);
  process.exit(1);
}

const scrapedData = JSON.parse(fs.readFileSync(SCRAPED_DATA_FILE, 'utf8'));
const { products } = scrapedData;

const categories = [
  {
    id: 'dijital-kitap',
    name: 'Dijital Kitap',
    description: 'PDF ve ePub formatında interaktif eğitim kitapları',
    icon: 'BookOpen',
    color: 'from-blue-500 to-indigo-600',
    count: products.filter(p => p.name.toLowerCase().includes('kitap') || p.name.toLowerCase().includes('soru bankası') || p.name.toLowerCase().includes('atlas')).length
  },
  {
    id: 'video-set',
    name: 'Video Ders Seti',
    description: 'Uzman eğitmenlerden kapsamlı video dersleri',
    icon: 'Play',
    color: 'from-violet-500 to-purple-600',
    count: products.filter(p => !p.name.toLowerCase().includes('kitap') && !p.name.toLowerCase().includes('soru bankası') && !p.name.toLowerCase().includes('atlas') && !p.name.toLowerCase().includes('deneme') && !p.name.toLowerCase().includes('tam paket') && !p.name.toLowerCase().includes('kombo')).length
  },
  {
    id: 'deneme-paketi',
    name: 'Deneme Paketi',
    description: 'Gerçek sınav formatında online deneme sınavları',
    icon: 'FileCheck',
    color: 'from-emerald-500 to-teal-600',
    count: products.filter(p => p.name.toLowerCase().includes('deneme')).length
  },
  {
    id: 'kombo',
    name: 'Kombo Paket',
    description: 'Kitap + Video + Deneme bir arada avantajlı paketler',
    icon: 'Package',
    color: 'from-accent-400 to-orange-600',
    count: products.filter(p => p.name.toLowerCase().includes('tam paket') || p.name.toLowerCase().includes('kombo')).length
  }
];

const mappedProducts = products.map(prod => {
  let catSlug = 'video-set';
  let type = 'Video Ders Seti';
  let format = 'HD Video';

  const lowerName = prod.name.toLowerCase();
  if (lowerName.includes('deneme')) {
    catSlug = 'deneme-paketi';
    type = 'Deneme Paketi';
    format = 'Online Sınav';
  } else if (lowerName.includes('kitap') || lowerName.includes('soru bankası') || lowerName.includes('atlas') || lowerName.includes('notu')) {
    catSlug = 'dijital-kitap';
    type = 'Dijital Kitap';
    format = 'PDF / ePub';
  } else if (lowerName.includes('paket') || lowerName.includes('kombo') || lowerName.includes('programı')) {
    if (lowerName.includes('tam paket') || lowerName.includes('kombo')) {
      catSlug = 'kombo';
      type = 'Kombo Paket';
      format = 'Kitap + Video + Sınav';
    }
  }

  const contents = [
    'Canlı ve Kayıt Dersler',
    'Ders Notları PDF',
    'Soru Çözüm Videoları',
    'Sınava Kadar Panel Erişimi'
  ];

  const outcomes = [
    'Konularda tam hakimiyet',
    'Netlerinizi artıracak pratikler',
    'Sınav formatına birebir uyum'
  ];

  return {
    id: prod.id,
    slug: prod.slug,
    name: prod.name,
    shortDescription: prod.description.length > 120 ? prod.description.substring(0, 120) + '...' : prod.description,
    description: prod.description || prod.name,
    price: prod.price || 0,
    discountedPrice: null,
    cover: prod.cover || '/logo.png',
    category: catSlug,
    type: type,
    format: format,
    rating: 4.8,
    reviewCount: 12,
    salesCount: 150 + (prod.id % 200),
    isNew: prod.id % 2 === 0,
    isFeatured: prod.id % 2 === 0,
    isBestseller: prod.id % 3 === 0,
    contents,
    outcomes,
    reviews: []
  };
});

const fileContent = `export const categories = ${JSON.stringify(categories, null, 2)};

export const products = ${JSON.stringify(mappedProducts, null, 2)};

export function getProductBySlug(slug) {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category) {
  return products.filter(p => p.category === category);
}

export function getFeaturedProducts() {
  return products.filter(p => p.isFeatured);
}

export function getBestsellerProducts() {
  return products.filter(p => p.isBestseller);
}

export function getSimilarProducts(productId, category) {
  return products.filter(p => p.category === category && p.id !== productId).slice(0, 4);
}
`;

fs.writeFileSync(STATIC_PRODUCTS_FILE, fileContent, 'utf8');
console.log(`Successfully updated static file: ${STATIC_PRODUCTS_FILE}`);

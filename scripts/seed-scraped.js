const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const defaultCategories = [
  {
    id: 'dijital-kitap',
    name: 'Dijital Kitap',
    slug: 'dijital-kitap',
    description: 'PDF ve ePub formatında interaktif eğitim kitapları',
    icon: 'BookOpen',
    color: 'from-blue-500 to-indigo-600',
    sortOrder: 1
  },
  {
    id: 'video-set',
    name: 'Video Ders Seti',
    slug: 'video-set',
    description: 'Uzman eğitmenlerden kapsamlı video dersleri',
    icon: 'Play',
    color: 'from-violet-500 to-purple-600',
    sortOrder: 2
  },
  {
    id: 'deneme-paketi',
    name: 'Deneme Paketi',
    slug: 'deneme-paketi',
    description: 'Gerçek sınav formatında online deneme sınavları',
    icon: 'FileCheck',
    color: 'from-emerald-500 to-teal-600',
    sortOrder: 3
  },
  {
    id: 'kombo',
    name: 'Kombo Paket',
    slug: 'kombo',
    description: 'Kitap + Video + Deneme bir arada avantajlı paketler',
    icon: 'Package',
    color: 'from-accent-400 to-orange-600',
    sortOrder: 4
  }
];

async function main() {
  console.log('Seeding categories...');
  const categoryMap = {};
  for (const cat of defaultCategories) {
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder
      },
      create: cat
    });
    categoryMap[cat.slug] = dbCat.id;
    console.log(`Upserted Category: ${cat.name}`);
  }

  // Load scraped products
  const scrapedDataPath = path.join(__dirname, '..', 'src', 'data', 'scraped-data.json');
  if (!fs.existsSync(scrapedDataPath)) {
    console.error(`Error: Scraped data file not found at ${scrapedDataPath}`);
    process.exit(1);
  }

  const scrapedData = JSON.parse(fs.readFileSync(scrapedDataPath, 'utf8'));
  const { products } = scrapedData;

  console.log(`\nSeeding ${products.length} scraped products...`);

  // Clear existing mock products if they exist to avoid confusion
  // Wait, we won't delete them unless necessary, but upsert handles duplicates by slug.
  
  for (const prod of products) {
    // Determine category based on product name
    let catSlug = 'video-set';
    let type = 'Video Ders Seti';

    const lowerName = prod.name.toLowerCase();
    if (lowerName.includes('deneme')) {
      catSlug = 'deneme-paketi';
      type = 'Deneme Paketi';
    } else if (lowerName.includes('kitap') || lowerName.includes('soru bankası') || lowerName.includes('atlas') || lowerName.includes('notu')) {
      catSlug = 'dijital-kitap';
      type = 'Dijital Kitap';
    } else if (lowerName.includes('paket') || lowerName.includes('kombo') || lowerName.includes('programı')) {
      // Programs can be video-sets or combos. Let's make 'Tam Paket' a combo
      if (lowerName.includes('tam paket') || lowerName.includes('kombo')) {
        catSlug = 'kombo';
        type = 'Kombo Paket';
      }
    }

    const categoryId = categoryMap[catSlug];
    
    // Generate contents lists dynamically or from descriptions
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

    // Determine values for duration, pages etc.
    let pages = null;
    let videoCount = null;
    let duration = null;
    let examCount = null;

    if (type === 'Dijital Kitap') {
      pages = 250; // default mock
    } else if (type === 'Video Ders Seti') {
      videoCount = 100;
      duration = '80 saat';
    } else if (type === 'Deneme Paketi') {
      examCount = 5;
    } else if (type === 'Kombo Paket') {
      videoCount = 200;
      duration = '150 saat';
      examCount = 5;
    }

    // Upsert product
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        title: prod.name,
        price: prod.price || 0,
        coverImage: prod.cover || '/logo.png',
        description: prod.description || prod.name,
        type: type,
        categoryId: categoryId,
        contents: contents,
        outcomes: outcomes,
        pages,
        videoCount,
        duration,
        examCount
      },
      create: {
        title: prod.name,
        slug: prod.slug,
        price: prod.price || 0,
        coverImage: prod.cover || '/logo.png',
        description: prod.description || prod.name,
        type: type,
        categoryId: categoryId,
        isFeatured: prod.id % 2 === 0, // mock featured flag deterministically
        isBestseller: prod.id % 3 === 0, // mock bestseller flag
        contents: contents,
        outcomes: outcomes,
        pages,
        videoCount,
        duration,
        examCount
      }
    });

    console.log(`Upserted Product: ${prod.name} (Category: ${type})`);
  }

  console.log('\nSeed completed successfully with scraped data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

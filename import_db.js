const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  if (!fs.existsSync('db_dump.json')) {
    console.error('Error: db_dump.json not found!');
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync('db_dump.json', 'utf8'));

  console.log('Clearing existing database tables...');
  
  // Clean tables in reverse dependency order
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.testimonial.deleteMany({});

  console.log('Tables cleared.');

  console.log(`Importing ${dump.categories.length} categories...`);
  for (const cat of dump.categories) {
    // Convert date strings back to Date objects if any
    await prisma.category.create({
      data: {
        ...cat,
        createdAt: new Date(cat.createdAt)
      }
    });
  }

  console.log(`Importing ${dump.products.length} products...`);
  for (const prod of dump.products) {
    await prisma.product.create({
      data: {
        ...prod,
        createdAt: new Date(prod.createdAt)
      }
    });
  }

  console.log(`Importing ${dump.settings.length} settings...`);
  for (const set of dump.settings) {
    await prisma.setting.create({
      data: set
    });
  }

  console.log(`Importing ${dump.testimonials.length} testimonials...`);
  for (const test of dump.testimonials) {
    await prisma.testimonial.create({
      data: {
        ...test,
        createdAt: new Date(test.createdAt)
      }
    });
  }

  console.log('Database import completed successfully!');
}

main()
  .catch(e => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

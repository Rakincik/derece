const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      lmsCourseId: true
    }
  });

  console.log('Products and their LMS Course IDs:');
  products.forEach(p => {
    console.log(`- Title: "${p.title}" | LMS Course ID: ${p.lmsCourseId} | ID: ${p.id}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

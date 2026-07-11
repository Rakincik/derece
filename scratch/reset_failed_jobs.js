const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lmsQueue.updateMany({
    where: {
      status: 'FAILED'
    },
    data: {
      status: 'PENDING',
      attempts: 0,
      error: null
    }
  });

  console.log(`Successfully reset ${result.count} failed jobs back to PENDING status.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

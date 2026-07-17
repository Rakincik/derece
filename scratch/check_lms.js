const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const jobs = await prisma.lmsQueue.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { order: true }
  });
  console.log(JSON.stringify(jobs, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

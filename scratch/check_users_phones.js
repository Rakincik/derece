const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      tcNo: true
    }
  });

  console.log(`Total users in DB: ${allUsers.length}`);
  allUsers.forEach(u => {
    console.log(`- ${u.name} | Email: ${u.email} | Phone: ${u.phone} | TC: ${u.tcNo}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

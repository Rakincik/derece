const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = process.argv[2];

if (!email) {
  console.error("Lütfen bir e-posta adresi belirtin. Örn: node promote.js rustem@example.com");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: email.trim() }
  });

  if (!user) {
    console.error(`Hata: '${email}' e-postasına sahip bir kullanıcı bulunamadı.`);
    console.log("Önce tarayıcıda /hesabim sayfasına gidip kayıt olun, ardından bu scripti tekrar çalıştırın.");
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' }
  });

  console.log(`Başarılı! ${updated.name || updated.email} kullanıcısı artık YÖNETİCİ (ADMIN) rolünde.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

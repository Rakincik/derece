const { hashPassword } = require('./src/lib/auth.js');
const { default: prisma } = require('./src/lib/db.js');

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] || 'Yeni Admin';

if (!email || !password) {
  console.error("Hata: Lütfen e-posta ve şifre belirtin.");
  console.log("Kullanım: node scripts/create_admin.js <e-posta> <şifre> [isim]");
  process.exit(1);
}

async function main() {
  const cleanEmail = email.trim().toLowerCase();
  
  // Kullanıcı zaten var mı kontrol edelim
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (existing) {
    console.error(`Hata: '${cleanEmail}' e-postasına sahip bir kullanıcı zaten mevcut.`);
    process.exit(1);
  }

  // Şifreyi güvenli bir şekilde hashliyoruz
  const { salt, hash } = hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email: cleanEmail,
      password: hash,
      salt,
      name,
      role: 'ADMIN'
    }
  });

  console.log("\n-------------------------------------------");
  console.log("🎉 Yeni Admin Kullanıcısı Başarıyla Oluşturuldu!");
  console.log(`E-posta : ${admin.email}`);
  console.log(`İsim    : ${admin.name}`);
  console.log("-------------------------------------------\n");
}

main()
  .catch(e => {
    console.error("Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

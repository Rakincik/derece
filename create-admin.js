const { hashPassword } = require('./src/lib/auth.js');
const { default: prisma } = require('./src/lib/db.js');

async function createAdmin() {
  const email = 'dereceuzem@admin.com';
  const password = 'Derece.Admin';
  
  // check if user exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    // Update password if it already exists to match Derece.Admin
    const { salt, hash } = hashPassword(password);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hash,
        salt,
        role: 'ADMIN'
      }
    });
    console.log("Admin kullanıcısı güncellendi.");
    process.exit(0);
  }

  const { salt, hash } = hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hash,
      salt,
      name: 'Derece Admin',
      role: 'ADMIN'
    }
  });

  console.log("Admin kullanıcısı başarıyla oluşturuldu:", admin.email);
}

createAdmin()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    // 1. Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`❌ Kullanıcı bulunamadı: ${email}`);
      return;
    }

    // 2. Yeni şifre için auth.js içindeki standartlara göre salt ve hash oluştur
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(newPassword, salt, 10000, 64, 'sha512').toString('hex');

    // 3. Veritabanını güncelle
    await prisma.user.update({
      where: { email },
      data: {
        password: hash,
        salt: salt
      }
    });

    console.log(`✅ Şifre başarıyla güncellendi!\nKullanıcı: ${email}\nYeni Şifre: ${newPassword}`);
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ----------------------------------------------------
// BURADAKİ BİLGİLERİ DEĞİŞTİREREK ÇALIŞTIRABİLİRSİN
// ----------------------------------------------------
const targetEmail = 'nisa150780@gmail.com'; 
const newPassword = 'Nisa150780'; // <--- İstediğin şifreyi buraya yaz

resetPassword(targetEmail, newPassword);

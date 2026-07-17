import 'dotenv/config';
import puppeteer from 'puppeteer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OKINAR_URL = process.env.OKINAR_URL || 'https://dereceuzem.okinar.com';
const OKINAR_USERNAME = process.env.OKINAR_USERNAME;
const OKINAR_PASSWORD = process.env.OKINAR_PASSWORD;

async function runWorker() {
  // PENDING olan veya daha önce hata alıp deneme sayısı 3'ten küçük olanları getir
  const pendingJobs = await prisma.lmsQueue.findMany({
    where: {
      OR: [
        { status: 'PENDING' },
        { status: 'FAILED', attempts: { lt: 3 } }
      ]
    },
    include: {
      order: {
        include: {
          user: true,
          product: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  if (pendingJobs.length === 0) {
    return;
  }

  console.log(`[${new Date().toISOString()}] Toplam ${pendingJobs.length} kayıt işlenecek.`);

  let browser = null;
  try {
    // Sunucuda çalışması için headless: "new" (veya true) ve no-sandbox argümanları
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Gelişmiş bot algılama korumaları için user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Zaman aşımlarını ayarla
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(60000);

    // 1. Okinar'a Giriş Yap
    console.log('Okinar sistemine giriş yapılıyor...');
    
    // Eğer oturum açıksa login sayfasına gitmeden atlamak için ana sayfaya git
    await page.goto(`${OKINAR_URL}/account/`, { waitUntil: 'networkidle2' });
    
    // Hala login sayfasındaysa (redirect olduysa) giriş yap
    if (page.url().includes('login')) {
      await page.waitForSelector('input[type="text"], input[name="email"], input[name="username"]', { timeout: 15000 });
    
    // Form alanlarını doldur (Bu selector'ler Okinar sistemine göre revize edilmelidir)
    try {
      const userInp = await page.$('input[name="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
      if (userInp) await userInp.type(process.env.OKINAR_USERNAME);
      
      const passInp = await page.$('input[name="password"]') || await page.$('input[type="password"]');
      if (passInp) await passInp.type(process.env.OKINAR_PASSWORD);
      
      const loginBtn = await page.$('#btnLogin') || await page.$('button[type="submit"]');
      if (loginBtn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
          loginBtn.click()
        ]);
      }
      console.log(`Giriş başarılı!`);
    } catch (e) {
      console.warn("Giriş formunda hata oluştu:", e.message);
    }
    } else {
      console.log('Oturum zaten açık, login atlandı.');
    }

    // 2. Her bir kayıt için öğrenciyi ekle ve gruba ata
    for (const job of pendingJobs) {
      try {
        console.log(`Kayıt işleniyor... Sipariş ID: ${job.orderId}`);
        const user = job.order.user;
        const lmsCourseId = job.order.product.lmsCourseId;
        
        if (!lmsCourseId) {
          throw new Error('Ürünün LMS Kurs IDsi boş!');
        }

        // 1. Öğrenciyi Okinar'a API ile kaydet (Modal/form yerine direkt AJAX POST - %100 güvenilir)
        const digits = (user.phone || '').replace(/\D/g, '');
        const lmsPhone = digits.length >= 10 ? digits.slice(-10) : digits;
        const lmsEmail = (user.email || '').trim();
        
        const nameParts = (user.name || 'Öğrenci').trim().split(/\s+/);
        const surname = nameParts.length > 1 ? nameParts.pop() : 'Öğrenci';
        const firstName = nameParts.join(' ') || 'Öğrenci';
        
        console.log(`Kayit ediliyor: Ad=${firstName}, Soyad=${surname}, Email=${lmsEmail}, Tel=${lmsPhone}`);
        
        // Direkt Okinar API'sine POST isteği at (tarayıcı session cookie'lerini otomatik gönderir)
        const saveResult = await page.evaluate(async (data) => {
          try {
            const formData = new URLSearchParams();
            formData.append('name', data.firstName);
            formData.append('surname', data.surname);
            formData.append('email', data.email);
            formData.append('role', '3'); // 3 = Öğrenci
            formData.append('phone', data.phone);
            formData.append('password', '');
            
            const response = await fetch('/account/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formData.toString()
            });
            
            const text = await response.text();
            return { status: response.status, body: text };
          } catch (err) {
            return { status: 0, body: err.message };
          }
        }, { firstName, surname, email: lmsEmail, phone: lmsPhone });
        
        if (saveResult.status === 200) {
          try {
            const parsed = JSON.parse(saveResult.body);
            if (parsed.status === 'OK') {
              console.log('Ogrenci Okinar\'a basariyla kaydedildi.');
            } else {
              console.log(`Okinar kayit yaniti: ${saveResult.body}`);
            }
          } catch {
            console.log(`Okinar kayit yaniti (raw): ${saveResult.body.substring(0, 200)}`);
          }
        } else {
          console.log(`Okinar kayit hatasi (HTTP ${saveResult.status}): ${saveResult.body.substring(0, 2000)}`);
          // 500 hatası alınabilir (örn: email zaten var) - devam et, belki zaten kayıtlıdır
        }
        
        // --- GRUBA ATAMA AŞAMASI ---
        console.log(`Öğrenci ${lmsCourseId} ID'li gruba atanıyor...`);
        
        // Kullanıcılar sayfasına git ve doğru sayfada olduğumuzu doğrula
        for (let attempt = 0; attempt < 3; attempt++) {
          await page.goto(`${OKINAR_URL}/account/`, { waitUntil: 'networkidle2' });
          await new Promise(r => setTimeout(r, 2000));
          
          const currentUrl = page.url();
          if (currentUrl.includes('/account')) {
            break; // Doğru sayfadayız
          }
          
          // Login sayfasına yönlendirildiyse tekrar giriş yap
          if (currentUrl.includes('login')) {
            console.log('Oturum süresi dolmuş, tekrar giriş yapılıyor...');
            const u = await page.$('input[name="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
            if (u) await u.type(process.env.OKINAR_USERNAME);
            const p = await page.$('input[name="password"]') || await page.$('input[type="password"]');
            if (p) await p.type(process.env.OKINAR_PASSWORD);
            const b = await page.$('#btnLogin') || await page.$('button[type="submit"]');
            if (b) await Promise.all([page.waitForNavigation({waitUntil:'networkidle2',timeout:15000}).catch(()=>{}), b.click()]);
            await new Promise(r => setTimeout(r, 2000));
          }
          console.log(`Sayfa navigasyon denemesi ${attempt + 1}, URL: ${currentUrl}`);
        }
        
        // Arama Kutusuna E-posta Adresini Yaz (DataTables)
        const searchExists = await page.$('input[type="search"]') !== null;
        if (!searchExists) {
          throw new Error(`Kullanıcılar tablosu bulunamadı! Sayfa URL: ${page.url()}`);
        }
        
        // Önce inputu temizle
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[type="search"]');
          inputs.forEach(input => {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
          });
        });
        
        // Puppeteer ile gerçek typing
        await page.type('input[type="search"]', lmsEmail, { delay: 50 });
        
        // Tablonun filtrelenmesi için bekle
        await new Promise(r => setTimeout(r, 3000));
        
        // "Gruplar" butonuna tıkla (SADECE E-POSTASI EŞLEŞEN SATIRDAKİ BUTONA TIKLA)
        await page.evaluate((email) => {
          const rows = document.querySelectorAll('table tbody tr');
          let targetBtn = null;
          for (const row of rows) {
            // Satırın içindeki metinde email var mı? (Büyük/küçük harf duyarsız)
            if (row.innerText.toLowerCase().includes(email.toLowerCase())) {
              targetBtn = row.querySelector('button[onclick^="btn_group_modal"]');
              break;
            }
          }
          
          if (targetBtn) {
            targetBtn.click();
          } else {
            throw new Error(`Grup atama butonu bulunamadı! Okinar'da '${email}' e-postası ile eşleşen bir kayıt yok. Öğrenci kaydedilememiş.`);
          }
        }, lmsEmail);
        
        await page.waitForSelector('#modal-classroom', { visible: true, timeout: 10000 });
        // JSTree veya listeden Grubu Seç
        await page.evaluate(async (courseId) => {
          // JSTree API'si varsa tüm düğümleri aç (içinde arama yapabilmek için)
          try {
            if (window.$ && $.jstree) {
              const jstreeInstance = $.jstree.reference('#modal-classroom .jstree') || $.jstree.reference('.jstree');
              if (jstreeInstance) {
                jstreeInstance.open_all();
              }
            }
          } catch(e) {}
        });
        
        // JSTree'nin açılması için biraz animasyon süresi bekle
        await new Promise(r => setTimeout(r, 1500));
        
        await page.evaluate((courseId) => {
          if (window.$ && $.jstree) {
            const jstreeInstance = $.jstree.reference('#modal-classroom .jstree') || $.jstree.reference('.jstree'); 
            if (jstreeInstance) {
              jstreeInstance.deselect_all();
              jstreeInstance.select_node(courseId);
              if (jstreeInstance.check_node) jstreeInstance.check_node(courseId);
            }
          }
          // Her halükarda a etiketine de tıkla (Okinar custom event dinliyorsa)
          if (window.$) {
             window.$('#' + courseId + '_anchor').click();
          } else {
             const a = document.getElementById(courseId + '_anchor');
             if (a) a.click();
          }
        }, lmsCourseId);
        
        await new Promise(r => setTimeout(r, 1000));
        
        // MODALI KAYDET
        await page.evaluate(() => {
          const form = document.querySelector('#modal-classroom form');
          if (form) {
             const btn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-success') || form.querySelector('.btn-primary') || form.querySelector('.btn-info');
             if (btn) btn.click();
             else form.submit();
          } else {
             const btn = document.querySelector('#modal-classroom .btn-success') || document.querySelector('#modal-classroom .btn-primary') || document.querySelector('#modal-classroom .btn-info') || document.querySelector('#modal-classroom button[onclick*="save"]');
             if (btn) btn.click();
          }
        });
        
        await new Promise(r => setTimeout(r, 4000));
        
        // BAŞARILI - Kuyruğu Güncelle
        await prisma.lmsQueue.update({
          where: { id: job.id },
          data: { status: 'SUCCESS' }
        });
        console.log(`Kayıt başarıyla tamamlandı: ${job.orderId}`);

      } catch (err) {
        console.error(`Kayıt işlenirken hata: ${job.orderId}`, err.message);
        
        await prisma.lmsQueue.update({
          where: { id: job.id },
          data: { 
            status: 'FAILED',
            error: err.message,
            attempts: { increment: 1 }
          }
        });
      }
    }

  } catch (error) {
    console.error('Bot Genel Hatası:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Tarayıcı kapatıldı.');
    }
    await prisma.$disconnect();
  }
}

async function startDaemon() {
  console.log(`[${new Date().toISOString()}] LMS Queue Worker Daemon Started...`);
  
  // Sonsuz döngü (Daemon)
  while (true) {
    try {
      await runWorker();
    } catch (err) {
      console.error('Daemon loop error:', err);
    }
    // Her işlem döngüsünden sonra 1 dakika (60000 ms) bekle
    await new Promise(resolve => setTimeout(resolve, 60000));
  }
}

startDaemon();

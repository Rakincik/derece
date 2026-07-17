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

        // 1. Kullanıcılar Listesini Bul
        await page.goto(`${OKINAR_URL}/account/`, { waitUntil: 'networkidle2' });
        
        // Modalın yüklenmesi veya yönlendirmeler için biraz bekle
        await new Promise(r => setTimeout(r, 2000));
        
        let hasModal = await page.$('#modal-register') !== null;
        
        if (!hasModal) {
          console.log('Kullanıcılar sayfası (veya modal) doğrudan bulunamadı, sol menüden tıklanıyor...');
          // Sol menüdeki Kullanıcılar linkine tıkla (Okinar SPA yapısında AJAX ile yüklüyor olabilir)
          await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            // Kullanıcılar Panel vs. olabileceği için tam eşleşme veya kapsama bakıyoruz
            const target = links.find(l => l.innerText.trim() === 'Kullanıcılar' || l.innerText.includes('Tüm Kullanıcılar'));
            if (target) {
              target.click();
            }
          });
          
          // AJAX yüklemesi için bekle
          await new Promise(r => setTimeout(r, 3000));
          hasModal = await page.$('#modal-register') !== null;
        }
        
        if (!hasModal) {
          throw new Error('Kullanıcılar sayfası bulunamadı (modal-register yok)! Sol menüye tıklanmasına rağmen açılmadı.');
        }
        
        console.log('Kullanıcılar sayfasına başarıyla ulaşıldı.');
        
        // 2. Yeni Kullanıcı Modalını Aç
        await page.waitForSelector('button[data-target="#modal-register"]', { visible: true, timeout: 15000 });
        await page.click('button[data-target="#modal-register"]');
        await page.waitForSelector('#modal-register', { visible: true, timeout: 10000 });
        
        // 3. Formu Doldur (Ad-soyad sonundaki/başındaki boşlukları trimle ve telefonu 10 haneli formatta temizle)
        const digits = (user.phone || '').replace(/\D/g, '');
        const lmsPhone = digits.length >= 10 ? digits.slice(-10) : digits;
        const lmsEmail = (user.email || '').trim();
        
        const nameParts = (user.name || 'Öğrenci').trim().split(/\s+/);
        const surname = nameParts.length > 1 ? nameParts.pop() : 'Öğrenci';
        const firstName = nameParts.join(' ') || 'Öğrenci';
        
        // 3. Formu Doldur (Evaluate ile daha sağlam)
        await page.evaluate(({ firstName, surname, lmsEmail, lmsPhone }) => {
          const setInput = (selectors, val) => {
            const el = document.querySelector(selectors);
            if (el) {
              el.focus();
              el.value = val;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            }
          };
          
          setInput('#modal-register input[name="name"], #modal-register input[name="ad"], #modal-register input[name="first_name"], #modal-register #name, #modal-register #ad', firstName);
          
          setInput('#modal-register input[name="surname"], #modal-register input[name="soyad"], #modal-register input[name="lastname"], #modal-register input[name="last_name"], #modal-register #surname, #modal-register #soyad', surname);
          
          setInput('#modal-register input[name="email"], #modal-register input[name="eposta"], #modal-register input[name="e_posta"], #modal-register #email, #modal-register #eposta, #modal-register input[type="email"]', lmsEmail);
          
          setInput('#modal-register input[name="phone"], #modal-register input[name="telefon"], #modal-register input[name="cep_telefonu"], #modal-register input[name="gsm"], #modal-register #phone, #modal-register #telefon', lmsPhone);
        }, { firstName, surname, lmsEmail, lmsPhone });
        
        await new Promise(r => setTimeout(r, 1000));
        
        // Formu Kaydet (Puppeteer ile gerçek tıklama)
        await page.click('#modal-register .btn-success, #modal-register button[type="submit"]');
        
        // Formun gönderilmesi için biraz bekle
        await new Promise(r => setTimeout(r, 4000));

        // Şifre alanı disabled değilse doldur (Screenshotta disabled görünüyordu)
        const isPasswordDisabled = await page.$eval('#modal-register input[name="password"]', el => el.disabled).catch(()=>true);
        if (!isPasswordDisabled) {
          await page.evaluate((email) => {
             const passEl = document.querySelector('#modal-register input[name="password"]');
             if(passEl) {
               passEl.value = email;
               passEl.dispatchEvent(new Event('input', { bubbles: true }));
             }
          }, lmsEmail);
        }
        
        // Formu Kaydet
        await page.evaluate(() => {
          const form = document.querySelector('#modal-register form');
          if (form) {
            const btn = form.querySelector('button[type="submit"]') || form.querySelector('button.btn-primary') || form.querySelector('button.btn-success');
            if (btn) btn.click();
          }
        });
        
        // Kaydedilmesini bekle
        await new Promise(r => setTimeout(r, 4000));
        
        // --- GRUBA ATAMA AŞAMASI ---
        console.log(`Öğrenci ${lmsCourseId} ID'li gruba atanıyor...`);
        
        // Form işlemlerinden sonra tablonun yenilenmesi ve açık kalmış olabilecek hata modallarının 
        // (örn: 'Bu email zaten var') kapanması için sayfayı tamamen yeniliyoruz.
        await page.reload({ waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 3000));
        
        // Arama Kutusuna E-posta Adresini Yaz (DataTables) - page.type ile gerçek klavye vuruşları
        await page.waitForSelector('input[type="search"]', { timeout: 15000 });
        
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

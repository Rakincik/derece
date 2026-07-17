const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const url = process.env.OKINAR_URL || 'https://dereceuzem.okinar.com';
  
  console.log('Okinar login...');
  await page.goto(url + '/account/', { waitUntil: 'networkidle2' });
  if (page.url().includes('login')) {
    const u = await page.$('input[name="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
    if (u) await u.type(process.env.OKINAR_USERNAME);
    const p = await page.$('input[name="password"]') || await page.$('input[type="password"]');
    if (p) await p.type(process.env.OKINAR_PASSWORD);
    const b = await page.$('#btnLogin') || await page.$('button[type="submit"]');
    if (b) await Promise.all([page.waitForNavigation({waitUntil:'networkidle2',timeout:15000}).catch(()=>{}), b.click()]);
  }
  
  await page.goto(url + '/account/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Search page loaded. Current URL:', page.url());
  
  const testEmail = 'onurbostan5068@gmail.com';
  const testPhone = '5368303250';
  const testName = 'Onur';
  
  const testSearch = async (term, name) => {
    console.log(`\nTesting search by ${name}: "${term}"`);
    await page.evaluate(() => {
      const input = document.querySelector('input[type="search"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    if (await page.$('input[type="search"]')) {
      await page.type('input[type="search"]', term, { delay: 30 });
      await new Promise(r => setTimeout(r, 3000));
      
      const results = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map(r => r.innerText.trim().replace(/\s+/g, ' '));
      });
      console.log(`Results found:`, results.slice(0, 5));
    } else {
      console.log('Search input not found!');
    }
  };
  
  await testSearch(testEmail, 'Email');
  await testSearch(testPhone, 'Phone');
  await testSearch(testName, 'Name');
  
  await browser.close();
})();

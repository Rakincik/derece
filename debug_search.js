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
  await new Promise(r => setTimeout(r, 4000));
  
  console.log('Page loaded. Analyzing all tables on the page...');
  
  const tablesInfo = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    return tables.map((t, idx) => {
      const headers = Array.from(t.querySelectorAll('thead th')).map(th => th.innerText.trim());
      const firstRows = Array.from(t.querySelectorAll('tbody tr')).slice(0, 3).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim())
      );
      return {
        index: idx,
        id: t.id,
        className: t.className,
        headers,
        firstRows
      };
    });
  });
  
  console.log('TABLES FOUND:', JSON.stringify(tablesInfo, null, 2));
  
  await browser.close();
})();

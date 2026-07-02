const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://dereceuzem.okinar.com/account/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="email"]', 'volkancetin06@hotmail.com');
  await page.type('input[name="password"]', '5536445851');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(()=>console.log('nav timeout')),
    page.click('button[type="submit"]')
  ]);
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => a.innerText.trim() + ' : ' + a.href).filter(l => l.toLowerCase().includes('kullanıcı') || l.toLowerCase().includes('öğrenci') || l.toLowerCase().includes('grup'));
  });
  console.log(links.join('\n'));
  await browser.close();
})();

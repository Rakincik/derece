const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://dereceuzem.okinar.com/account/login', { waitUntil: 'networkidle2' });
  
  // Try login
  const userInp = await page.$('input[name="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
  if(userInp) await userInp.type('volkancetin06@hotmail.com');
  
  const passInp = await page.$('input[name="password"]') || await page.$('input[type="password"]');
  if(passInp) await passInp.type('5536445851');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
    page.evaluate(() => document.querySelector('form').submit())
  ]);
  
  await page.waitForTimeout(3000); // Wait for potential login_control redirects
  
  await page.goto('https://dereceuzem.okinar.com/account/', { waitUntil: 'networkidle2' });
  
  console.log('Current URL:', page.url());
  
  const hasModal = await page.$('#modal-register') !== null;
  console.log('Has #modal-register:', hasModal);
  
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href }));
  });
  
  const usersLink = links.find(l => l.text.toLowerCase().includes('kullanıcılar'));
  if (usersLink) console.log('Kullanıcılar Link:', usersLink.href);
  
  await browser.close();
})();

const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://dereceuzem.okinar.com/login_control', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  await page.type('input[type="text"]', 'admin@dereceuzem.com');
  await page.type('input[type="password"]', 'B1a2t3u4*');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  await page.goto('https://dereceuzem.okinar.com/account/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('button[data-target="#modal-register"]', { visible: true, timeout: 15000 });
  await page.click('button[data-target="#modal-register"]');
  await page.waitForSelector('#modal-register', { visible: true, timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  
  const modalHtml = await page.evaluate(() => {
    return document.querySelector('#modal-register').innerHTML;
  });
  
  fs.writeFileSync('debug_modal_register.html', modalHtml);
  console.log('Saved modal HTML!');
  await browser.close();
})();

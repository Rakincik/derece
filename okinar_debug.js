import 'dotenv/config';
import puppeteer from 'puppeteer';
import fs from 'fs';

async function debug() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Logging in...');
  await page.goto('https://dereceuzem.okinar.com/account/login', { waitUntil: 'networkidle2' });
  
  // Try username forms
  const userInp = await page.$('input[name="email"]') || await page.$('input[name="username"]') || await page.$('input[type="text"]');
  if(userInp) await userInp.type(process.env.OKINAR_USERNAME);
  
  const passInp = await page.$('input[name="password"]') || await page.$('input[type="password"]');
  if(passInp) await passInp.type(process.env.OKINAR_PASSWORD);
  
  const loginBtn = await page.$('button[type="submit"]') || await page.$('input[type="submit"]');
  if(loginBtn) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {}),
      loginBtn.click()
    ]);
  }
  
  console.log('Logged in. Taking screenshot of dashboard...');
  await page.screenshot({ path: 'C:\\Users\\Rüstem\\.gemini\\antigravity-ide\\brain\\4c8460a8-ce21-4699-82cd-88af3b030de4\\okinar_dashboard.png' });
  
  console.log('Going to group 419...');
  await page.goto('https://dereceuzem.okinar.com/group/detail/419', { waitUntil: 'networkidle2' }).catch(() => {});
  await page.screenshot({ path: 'C:\\Users\\Rüstem\\.gemini\\antigravity-ide\\brain\\4c8460a8-ce21-4699-82cd-88af3b030de4\\okinar_group419.png' });
  
  const html = await page.content();
  fs.writeFileSync('C:\\Users\\Rüstem\\.gemini\\antigravity-ide\\brain\\4c8460a8-ce21-4699-82cd-88af3b030de4\\group419.html', html);

  console.log('Done.');
  await browser.close();
}

debug();

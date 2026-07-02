const fs = require('fs');
const html = fs.readFileSync('C:\\\\Users\\\\Rüstem\\\\.gemini\\\\antigravity-ide\\\\brain\\\\4c8460a8-ce21-4699-82cd-88af3b030de4\\\\group419.html', 'utf8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
console.log('Links on page:');
$('a').each((i, el) => {
  if ($(el).text().trim().toLowerCase().includes('kullanıcı') || $(el).text().trim().toLowerCase().includes('öğrenci')) {
    console.log($(el).text().trim(), '=>', $(el).attr('href'), 'class:', $(el).attr('class'));
  }
});
console.log('Buttons on page:');
$('button').each((i, el) => {
  if ($(el).text().trim().toLowerCase().includes('kullanıcı') || $(el).text().trim().toLowerCase().includes('öğrenci')) {
    console.log($(el).text().trim(), '=> class:', $(el).attr('class'), 'id:', $(el).attr('id'));
  }
});

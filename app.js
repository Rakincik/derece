const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Next.js'i production modunda başlatıyoruz
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

// Plesk/Passenger tarafından dinamik atanan portu dinliyoruz
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${port}`);
  });
});

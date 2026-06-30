const https = require('https');

const options = {
  hostname: 'dereceuzem.com',
  port: 444, // We will also try 443
  path: '/',
  method: 'GET',
  rejectUnauthorized: false // Don't fail the request immediately so we can inspect the certificate
};

function checkSSL(port) {
  return new Promise((resolve) => {
    const req = https.request({ ...options, port }, (res) => {
      const cert = res.socket.getPeerCertificate();
      console.log(`=== Port ${port} ===`);
      if (cert && Object.keys(cert).length > 0) {
        console.log('Subject:', cert.subject);
        console.log('Issuer:', cert.issuer);
        console.log('Valid From:', cert.valid_from);
        console.log('Valid To:', cert.valid_to);
        const daysRemaining = (new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24);
        console.log('Days remaining:', Math.round(daysRemaining));
        console.log('Serial Number:', cert.serialNumber);
      } else {
        console.log('No peer certificate returned.');
      }
      resolve();
    });

    req.on('error', (err) => {
      console.log(`=== Port ${port} Error ===`);
      console.error(err.message);
      resolve();
    });

    req.end();
  });
}

async function run() {
  await checkSSL(443);
  // Also check if they are using a custom port or if www sub-domain has certificate issues
  options.hostname = 'www.dereceuzem.com';
  await checkSSL(443);
}

run();

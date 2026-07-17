require('dotenv').config();
const { ShopierApiClient } = require('@nopeion/shopier');

async function main() {
  const pat = process.env.SHOPIER_PAT;
  if (!pat) {
    console.error('HATA: .env dosyasında SHOPIER_PAT bulunamadı!');
    process.exit(1);
  }

  const client = new ShopierApiClient({ pat });

  try {
    console.log('Shopier REST Webhook aboneliği oluşturuluyor...');
    const webhook = await client.webhooks.create({
      url: 'https://dereceuzem.com/api/webhooks/shopier',
      events: ['order.created']
    });

    console.log('====================================');
    console.log('WEBHOOK BAŞARIYLA OLUŞTURULDU!');
    console.log('WEBHOOK TOKEN:');
    console.log(webhook.token);
    console.log('====================================');
    console.log('Lütfen bu tokenı kopyalayıp .env dosyanıza ekleyin:');
    console.log(`SHOPIER_WEBHOOK_TOKEN=${webhook.token}`);
    console.log('====================================');
  } catch (error) {
    console.error('Webhook oluşturulurken hata oluştu:', error);
  }
}

main();

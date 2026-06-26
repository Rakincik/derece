const PROD_URL = 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

const clientCode = "142915";
const username = "TP10168267";
const password = "CDC0BD910AC9B10E";
const guid = "F2D68A9B-EDD5-449F-9229-E23EB37666D0";

async function queryBIN(bin) {
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <BIN_SanalPos xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>${clientCode}</CLIENT_CODE>
        <CLIENT_USERNAME>${username}</CLIENT_USERNAME>
        <CLIENT_PASSWORD>${password}</CLIENT_PASSWORD>
      </G>
      <BIN>${bin}</BIN>
    </BIN_SanalPos>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(PROD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'https://turkpos.com.tr/BIN_SanalPos'
    },
    body: xmlPayload
  });
  const text = await response.text();
  
  const brandMatch = text.match(/<Kart_Marka>([^<]*)<\/Kart_Marka>/);
  const brand = brandMatch ? brandMatch[1] : null;
  const isCreditMatch = text.match(/<Kart_Tip>([^<]*)<\/Kart_Tip>/);
  const isCredit = isCreditMatch ? isCreditMatch[1] === 'Kredi Kartı' : false;
  
  return { brand, isCredit };
}

async function queryRates() {
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Ozel_Oran_SK_Liste xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>${clientCode}</CLIENT_CODE>
        <CLIENT_USERNAME>${username}</CLIENT_USERNAME>
        <CLIENT_PASSWORD>${password}</CLIENT_PASSWORD>
      </G>
      <GUID>${guid}</GUID>
    </TP_Ozel_Oran_SK_Liste>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(PROD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'https://turkpos.com.tr/TP_Ozel_Oran_SK_Liste'
    },
    body: xmlPayload
  });
  const text = await response.text();
  
  const rowRegex = /<DT_Ozel_Oranlar_SK[^>]*>([\s\S]*?)<\/DT_Ozel_Oranlar_SK>/g;
  let match;
  const rates = [];
  
  while ((match = rowRegex.exec(text)) !== null) {
    const rowContent = match[1];
    const bankName = (rowContent.match(/<Kredi_Karti_Banka>([^<]*)<\/Kredi_Karti_Banka>/) || [])[1] || '';
    
    const installments = {};
    for (let i = 1; i <= 12; i++) {
      const key = `MO_${String(i).padStart(2, '0')}`;
      const valMatch = rowContent.match(new RegExp(`<${key}>([^<]*)<\/${key}>`));
      if (valMatch) {
        installments[i] = parseFloat(valMatch[1].replace(',', '.'));
      }
    }
    rates.push({ bankName, installments });
  }
  return rates;
}

// Map Card brand to the exact bank list rate name
function getNormalizedBrandName(brand) {
  if (!brand) return 'Diğer Banka Kartları';
  const b = brand.toLowerCase().trim();
  if (b.includes('bonus')) return 'Bonus';
  if (b.includes('axess') || b.includes('wings')) return 'Axess';
  if (b.includes('maximum')) return 'Maximum';
  if (b.includes('world')) return 'World';
  if (b.includes('cardfinans') || b.includes('finans')) return 'CardFinans';
  if (b.includes('paraf')) return 'Paraf';
  if (b.includes('advantage')) return 'Advantage';
  if (b.includes('combo') || b.includes('ziraat')) return 'Combo';
  return 'Diğer Banka Kartları';
}

async function testMatch(bin) {
  console.log(`\nMatching for BIN: ${bin}`);
  const { brand, isCredit } = await queryBIN(bin);
  console.log(`Detected Card Brand: "${brand}", Is Credit Card: ${isCredit}`);
  
  const rates = await queryRates();
  
  // Find matching rate
  const mappedBrand = getNormalizedBrandName(brand);
  console.log(`Normalized Mapped Brand Name: "${mappedBrand}"`);
  
  let targetRate = rates.find(r => r.bankName.toLowerCase().trim() === mappedBrand.toLowerCase().trim());
  if (!targetRate) {
    targetRate = rates.find(r => r.bankName.includes('Diğer Banka Kartları'));
  }
  
  console.log(`Found installment rates for "${targetRate ? targetRate.bankName : 'None'}":`);
  if (targetRate) {
    console.log(targetRate.installments);
  }
}

async function main() {
  await testMatch("454360"); // Maximum (İş Bankası)
  await testMatch("543771"); // Bonus (Garanti)
}

main();

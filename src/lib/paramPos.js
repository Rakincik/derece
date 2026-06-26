import crypto from 'crypto';

const TEST_URL = 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx';
const PROD_URL = 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

const getEndpoint = () => process.env.PARAM_MODE === 'PRODUCTION' ? PROD_URL : TEST_URL;

/**
 * Format total decimal amount to Turkish Kurus format with comma
 * Example: 1500.5 -> "1500,50"
 */
export function formatParamAmount(amount) {
  return parseFloat(amount).toFixed(2).replace('.', ',');
}

/**
 * Generate SHA2B64 signature (SHA-1 binary hashed and base64 encoded)
 * Formül: CLIENT_CODE + GUID + Taksit + Islem_Tutar + Toplam_Tutar + Siparis_ID
 */
export function generateSHA2B64(stringToHash) {
  const hash = crypto.createHash('sha1').update(Buffer.from(stringToHash, 'utf-8')).digest();
  return hash.toString('base64');
}

/**
 * Generate SHA-1 base64 encoded signature for callback verification
 * Formül: islemGUID + md + mdStatus + orderId + Lowercase(GUID)
 */
export function generateCallbackHash(stringToHash) {
  return crypto.createHash('sha1').update(stringToHash).digest('base64');
}

/**
 * Step 1: Initialize 3D Secure Verification via TP_WMD_UCD
 * Returns the HTML form (UCD_HTML) to be executed on the client-side
 */
export async function init3DPayment({
  orderId,
  amount,
  cardHolderName,
  cardNumber,
  expireMonth,
  expireYear,
  cvv,
  successUrl,
  failUrl,
  clientIp,
  installmentCount = 1,
  data1 = '',
  data2 = '',
  data3 = '',
  data4 = '',
  data5 = ''
}) {
  const clientCode = process.env.PARAM_CLIENT_CODE || '';
  const username = process.env.PARAM_USERNAME || '';
  const password = process.env.PARAM_PASSWORD || '';
  const guid = process.env.PARAM_GUID || '';

  const formattedAmount = formatParamAmount(amount);

  // Sign hash generation string
  const hashString = `${clientCode}${guid}${installmentCount}${formattedAmount}${formattedAmount}${orderId}`;
  const sha2b64 = generateSHA2B64(hashString);

  // SOAP Envelope XML Payload
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_WMD_UCD xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>${clientCode}</CLIENT_CODE>
        <CLIENT_USERNAME>${username}</CLIENT_USERNAME>
        <CLIENT_PASSWORD>${password}</CLIENT_PASSWORD>
      </G>
      <GUID>${guid}</GUID>
      <KK_Sahibi>${cardHolderName}</KK_Sahibi>
      <KK_No>${cardNumber}</KK_No>
      <KK_SK_Ay>${expireMonth}</KK_SK_Ay>
      <KK_SK_Yil>${expireYear}</KK_SK_Yil>
      <KK_CVC>${cvv}</KK_CVC>
      <KK_Sahibi_GSM></KK_Sahibi_GSM>
      <Hata_URL>${failUrl}</Hata_URL>
      <Basarili_URL>${successUrl}</Basarili_URL>
      <Siparis_ID>${orderId}</Siparis_ID>
      <Siparis_Aciklama>DereceUzem Egitim Paketi Alimi</Siparis_Aciklama>
      <Taksit>${installmentCount}</Taksit>
      <Islem_Tutar>${formattedAmount}</Islem_Tutar>
      <Toplam_Tutar>${formattedAmount}</Toplam_Tutar>
      <Islem_Hash>${sha2b64}</Islem_Hash>
      <Islem_Guvenlik_Tip>3D</Islem_Guvenlik_Tip>
      <IPAdr>${clientIp}</IPAdr>
      <Ref_URL>${successUrl}</Ref_URL>
      <Data1>${data1}</Data1>
      <Data2>${data2}</Data2>
      <Data3>${data3}</Data3>
      <Data4>${data4}</Data4>
      <Data5>${data5}</Data5>
    </TP_WMD_UCD>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'https://turkpos.com.tr/TP_WMD_UCD'
    },
    body: xmlPayload
  });

  const responseText = await response.text();
  
  // Extract UCD_HTML value from SOAP Response
  const match = responseText.match(/<UCD_HTML>([\s\S]*?)<\/UCD_HTML>/);
  if (!match || !match[1]) {
    // Try to extract Sonuc_Str for detailed error info
    const errorMatch = responseText.match(/<Sonuc_Str>([\s\S]*?)<\/Sonuc_Str>/);
    const reason = errorMatch && errorMatch[1] ? errorMatch[1] : 'Bilinmeyen hata';
    throw new Error(`Param POS Hatası: ${reason}`);
  }

  // XML tag decoding
  return match[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

/**
 * Step 2: Complete Payment / Capture Funds via TP_WMD_Pay
 * Invoked on the callback handler once 3D authentication completes successfully
 */
export async function completePayment({
  orderId,
  islemGuid,
  ucdMd
}) {
  const clientCode = process.env.PARAM_CLIENT_CODE || '';
  const username = process.env.PARAM_USERNAME || '';
  const password = process.env.PARAM_PASSWORD || '';
  const guid = process.env.PARAM_GUID || '';

  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_WMD_Pay xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>${clientCode}</CLIENT_CODE>
        <CLIENT_USERNAME>${username}</CLIENT_USERNAME>
        <CLIENT_PASSWORD>${password}</CLIENT_PASSWORD>
      </G>
      <GUID>${guid}</GUID>
      <UCD_MD>${ucdMd}</UCD_MD>
      <Islem_GUID>${islemGuid}</Islem_GUID>
      <Siparis_ID>${orderId}</Siparis_ID>
    </TP_WMD_Pay>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(getEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'https://turkpos.com.tr/TP_WMD_Pay'
    },
    body: xmlPayload
  });

  const responseText = await response.text();

  // Extract result codes
  const sonucMatch = responseText.match(/<Sonuc>([\s\S]*?)<\/Sonuc>/);
  const sonucStrMatch = responseText.match(/<Sonuc_Ack>([\s\S]*?)<\/Sonuc_Ack>/);

  const sonuc = sonucMatch ? parseInt(sonucMatch[1]) : -1;
  const aciklama = sonucStrMatch ? sonucStrMatch[1] : 'Bilinmeyen hata';

  return {
    success: sonuc > 0,
    sonuc,
    aciklama
  };
}

/**
 * Step 3: Query BIN information from Param POS using BIN_SanalPos
 */
export async function queryBIN(bin) {
  const clientCode = process.env.PARAM_CLIENT_CODE || '';
  const username = process.env.PARAM_USERNAME || '';
  const password = process.env.PARAM_PASSWORD || '';

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

  const response = await fetch(getEndpoint(), {
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

  const bankNameMatch = text.match(/<Kart_Banka>([^<]*)<\/Kart_Banka>/);
  const bankName = bankNameMatch ? bankNameMatch[1] : '';

  return { brand, isCredit, bankName };
}

let cachedRates = null;
let cachedRatesTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Step 4: Fetch all merchant installment rates with in-memory caching
 */
export async function queryInstallmentRates() {
  const now = Date.now();
  if (cachedRates && (now - cachedRatesTime < CACHE_TTL)) {
    return cachedRates;
  }

  const clientCode = process.env.PARAM_CLIENT_CODE || '';
  const username = process.env.PARAM_USERNAME || '';
  const password = process.env.PARAM_PASSWORD || '';
  const guid = process.env.PARAM_GUID || '';

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

  const response = await fetch(getEndpoint(), {
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

  cachedRates = rates;
  cachedRatesTime = now;
  return rates;
}

/**
 * Normalizes card brand name to match the merchant rate list entries
 */
export function getNormalizedBrandName(brand) {
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

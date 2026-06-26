const crypto = require('crypto');

const PROD_URL = 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

const clientCode = "142915";
const username = "TP10168267";
const password = "CDC0BD910AC9B10E";
const guid = "F2D68A9B-EDD5-449F-9229-E23EB37666D0";

function formatParamAmount(amount) {
  return parseFloat(amount).toFixed(2).replace('.', ',');
}

function generateSHA2B64(stringToHash) {
  const hash = crypto.createHash('sha1').update(Buffer.from(stringToHash, 'utf-8')).digest();
  return hash.toString('base64');
}

async function test(clientIp) {
  console.log(`Testing with clientIp: "${clientIp}"`);
  const orderId = "test_" + Date.now();
  const formattedAmount = formatParamAmount(10);
  const hashString = `${clientCode}${guid}1${formattedAmount}${formattedAmount}${orderId}`;
  const sha2b64 = generateSHA2B64(hashString);

  const successUrl = "https://dereceuzem.com/api/checkout/callback";
  const failUrl = "https://dereceuzem.com/api/checkout/callback";

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
      <KK_Sahibi>RUSTEM AKINCIK</KK_Sahibi>
      <KK_No>4543607068964103</KK_No>
      <KK_SK_Ay>10</KK_SK_Ay>
      <KK_SK_Yil>2028</KK_SK_Yil>
      <KK_CVC>123</KK_CVC>
      <KK_Sahibi_GSM></KK_Sahibi_GSM>
      <Hata_URL>${failUrl}</Hata_URL>
      <Basarili_URL>${successUrl}</Basarili_URL>
      <Siparis_ID>${orderId}</Siparis_ID>
      <Siparis_Aciklama>Test</Siparis_Aciklama>
      <Taksit>1</Taksit>
      <Islem_Tutar>${formattedAmount}</Islem_Tutar>
      <Toplam_Tutar>${formattedAmount}</Toplam_Tutar>
      <Islem_Hash>${sha2b64}</Islem_Hash>
      <Islem_Guvenlik_Tip>3D</Islem_Guvenlik_Tip>
      <IPAdr>${clientIp}</IPAdr>
      <Ref_URL>${successUrl}</Ref_URL>
      <Data1></Data1>
      <Data2></Data2>
      <Data3></Data3>
      <Data4></Data4>
      <Data5></Data5>
    </TP_WMD_UCD>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch(PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'https://turkpos.com.tr/TP_WMD_UCD'
      },
      body: xmlPayload
    });
    const text = await response.text();
    const resultMatch = text.match(/<Sonuc_Str>([\s\S]*?)<\/Sonuc_Str>/);
    const resultStr = resultMatch ? resultMatch[1] : "No Sonuc_Str found";
    console.log(`Result for ${clientIp}: ${resultStr}`);
  } catch (err) {
    console.error(`Error for ${clientIp}:`, err.message);
  }
}

async function main() {
  await test("::1");
  await test("::ffff:127.0.0.1");
}

main();

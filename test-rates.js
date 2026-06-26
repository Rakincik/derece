const PROD_URL = 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

const clientCode = "142915";
const username = "TP10168267";
const password = "CDC0BD910AC9B10E";
const guid = "F2D68A9B-EDD5-449F-9229-E23EB37666D0";

async function testRates() {
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

  try {
    const response = await fetch(PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'https://turkpos.com.tr/TP_Ozel_Oran_SK_Liste'
      },
      body: xmlPayload
    });
    const text = await response.text();
    
    const startIdx = text.indexOf('<diffgr:diffgram');
    if (startIdx !== -1) {
      console.log("Found diffgram content:");
      console.log(text.substring(startIdx, startIdx + 3000));
    } else {
      console.log("No diffgram found. Response sample:");
      console.log(text.substring(0, 3000));
    }
    
  } catch (err) {
    console.error("Error fetching rates:", err.message);
  }
}

testRates();

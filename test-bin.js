const PROD_URL = 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx';

const clientCode = "142915";
const username = "TP10168267";
const password = "CDC0BD910AC9B10E";

async function testBin() {
  const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <BIN_SanalPos xmlns="https://turkpos.com.tr/">
      <G>
        <CLIENT_CODE>${clientCode}</CLIENT_CODE>
        <CLIENT_USERNAME>${username}</CLIENT_USERNAME>
        <CLIENT_PASSWORD>${password}</CLIENT_PASSWORD>
      </G>
      <BIN>454360</BIN>
    </BIN_SanalPos>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch(PROD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'https://turkpos.com.tr/BIN_SanalPos'
      },
      body: xmlPayload
    });
    const text = await response.text();
    console.log("Raw SOAP Response Length:", text.length);
    console.log("Response XML:");
    console.log(text);
  } catch (err) {
    console.error("Error fetching BIN:", err.message);
  }
}

testBin();

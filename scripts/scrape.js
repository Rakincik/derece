const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

// Configuration
const BASE_URL = 'https://dereceuzem.com/';
const OUTPUT_DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'scraped-data.json');
const IMAGE_DIR = path.join(__dirname, '..', 'public', 'images', 'scraped');

// Ensure image directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Queue and Visited trackers
const visitedUrls = new Set();
const urlsToVisit = [BASE_URL];
const scrapedData = {
  menus: [],
  contact: {
    phone: '',
    email: '',
    address: '',
    socials: {}
  },
  products: []
};

// Helper: Decode Cloudflare Protected Email
function decodeCloudflareEmail(encodedString) {
  try {
    let email = "";
    const key = parseInt(encodedString.substr(0, 2), 16);
    for (let n = 2; n < encodedString.length; n += 2) {
      const charCode = parseInt(encodedString.substr(n, 2), 16) ^ key;
      email += String.fromCharCode(charCode);
    }
    return email;
  } catch (err) {
    console.error('Error decoding Cloudflare email:', err);
    return '';
  }
}

// Helper: Decode HTML Entities
function decodeHtmlEntities(str) {
  if (!str) return '';
  
  // Replace decimal entities (e.g. &#39;)
  str = str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  
  // Replace hex entities (e.g. &#x27;)
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  const entities = {
    'nbsp': ' ', 'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', 'apos': "'",
    'uuml': 'ü', 'Uuml': 'Ü', 'ouml': 'ö', 'Ouml': 'Ö', 'ccedil': 'ç', 'Ccedil': 'Ç',
    'scedil': 'ş', 'Scedil': 'Ş', 'gbreve': 'ğ', 'Gbreve': 'Ğ', 'Iuml': 'İ', 'iuml': 'i',
    'rsquo': "'", 'lsquo': "'", 'ldquo': '"', 'rdquo': '"', 'ndash': '–', 'mdash': '—',
    'bull': '•', 'deg': '°'
  };
  
  return str.replace(/&([a-zA-Z]+);/g, (match, entity) => {
    return entities[entity] || match;
  });
}

// Helper: Strip HTML tags
function stripHtmlTags(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper: Download Image
async function downloadImage(url, filename) {
  try {
    const absoluteUrl = url.startsWith('http') ? url : new URL(url, BASE_URL).href;
    console.log(`  Downloading image: ${absoluteUrl}...`);
    
    const response = await fetch(absoluteUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const destPath = path.join(IMAGE_DIR, filename);
    const fileStream = fs.createWriteStream(destPath);
    
    await pipeline(response.body, fileStream);
    console.log(`  Saved image: ${filename}`);
    return `/images/scraped/${filename}`;
  } catch (err) {
    console.error(`  Failed to download image ${url}:`, err.message);
    return null;
  }
}

// Extract information from HTML pages
async function crawlPage(url) {
  if (visitedUrls.has(url)) return;
  visitedUrls.add(url);
  
  console.log(`\nFetching: ${url}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`Failed to fetch ${url} (status: ${response.status})`);
      return;
    }
    
    const html = await response.text();
    
    // Check if 404 page
    if (html.includes('<title>404') || html.includes('Sayfa Bulunamadı')) {
      console.log(`Skipping 404 page: ${url}`);
      return;
    }
    
    // Parse contact details if they exist in footer and aren't populated yet
    if (!scrapedData.contact.phone) {
      const phoneMatch = html.match(/href="tel:([^"]+)"|las la-phone mr-1"><\/i>\s*([\d\s]+)/i);
      if (phoneMatch) {
        scrapedData.contact.phone = (phoneMatch[1] || phoneMatch[2]).trim();
        console.log(`Found Phone: ${scrapedData.contact.phone}`);
      }
    }
    
    if (!scrapedData.contact.email) {
      const cfEmailMatch = html.match(/data-cfemail="([0-9a-fA-F]+)"/i);
      if (cfEmailMatch) {
        scrapedData.contact.email = decodeCloudflareEmail(cfEmailMatch[1]);
        console.log(`Decoded Email: ${scrapedData.contact.email}`);
      }
    }
    
    // Check for social media links
    const instagramMatch = html.match(/href="(https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.-]+\/?)"/i);
    if (instagramMatch && !scrapedData.contact.socials.instagram) {
      scrapedData.contact.socials.instagram = instagramMatch[1];
      console.log(`Found Instagram: ${scrapedData.contact.socials.instagram}`);
    }
    
    const youtubeMatch = html.match(/href="(https:\/\/(www\.)?youtube\.com\/[a-zA-Z0-9_.-]+\/?)"/i);
    if (youtubeMatch && !scrapedData.contact.socials.youtube) {
      scrapedData.contact.socials.youtube = youtubeMatch[1];
      console.log(`Found YouTube: ${scrapedData.contact.socials.youtube}`);
    }

    // Parse main menus if not populated yet (from index)
    if (url === BASE_URL && scrapedData.menus.length === 0) {
      const menuRegex = /<span style="position:\s*relative"\s*>([^<]+)/g;
      let match;
      const parsedMenus = new Set();
      while ((match = menuRegex.exec(html)) !== null) {
        const menuName = decodeHtmlEntities(match[1].trim());
        if (menuName && !menuName.includes('2026') && !menuName.includes('2027')) {
          // Add clean names
          parsedMenus.add(menuName);
        } else if (menuName) {
          parsedMenus.add(menuName);
        }
      }
      scrapedData.menus = Array.from(parsedMenus);
      console.log('Found menus:', scrapedData.menus);
    }
    
    // Parse links to crawl next (products or category pages)
    const linkRegex = /href="([^"]+)"/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1];
      
      // Skip absolute URLs pointing elsewhere
      if (href.startsWith('http') && !href.startsWith(BASE_URL)) continue;
      // Skip system pages
      if (href.includes('uye-girisi') || href.includes('uyelik') || href.includes('sepet') || href.includes('hesabim') || href.includes('newsletter') || href.includes('addtocart') || href.includes('javascript')) continue;
      
      // Normalize URL
      const absoluteUrl = href.startsWith('http') ? href : new URL(href, BASE_URL).href;
      
      // We only crawl product pages and category pages to find all products
      const isProduct = href.includes('-P');
      const isCategory = href.includes('turk-dili-ve-edebiyati') || href.includes('okul-oncesi') || href.includes('meb-ags') || href.includes('kpss') || href.includes('dgs') || href.includes('yks');
      
      if ((isProduct || isCategory) && !visitedUrls.has(absoluteUrl)) {
        if (!urlsToVisit.includes(absoluteUrl)) {
          urlsToVisit.push(absoluteUrl);
        }
      }
    }
    
    // If it's a product page, parse product data!
    if (url.includes('-P')) {
      console.log(`Parsing product page: ${url}`);
      
      // Extract Product ID
      const idMatch = url.match(/-P(\d+)/);
      const productId = idMatch ? parseInt(idMatch[1]) : null;
      
      // Extract Name
      const nameMatch = html.match(/<div class="urun-detay-sag-alan-baslik">\s*([^<]+)/);
      const name = nameMatch ? decodeHtmlEntities(nameMatch[1].trim()) : '';
      
      // Extract Stock Code
      const codeMatch = html.match(/Stok Kodu[\s\S]*?:&nbsp;&nbsp;(\d+)/i);
      const stockCode = codeMatch ? codeMatch[1].trim() : '';
      
      // Extract Price
      const priceMatch = html.match(/item-price">\s*([\d,.]+)/);
      const priceVal = priceMatch ? priceMatch[1].replace(/,/g, '').trim() : '';
      const price = priceVal ? parseFloat(priceVal) : null;
      
      // Extract Image Name & URL
      const imgMatch = html.match(/id="glasscase"[\s\S]*?src="([^"]+)"/i) || html.match(/cat-detail-products-box-img-big[\s\S]*?src="([^"]+)"/i) || html.match(/images\/product\/[^"]+/);
      const origImageUrl = imgMatch ? imgMatch[1] || imgMatch[0] : null;
      
      // Extract Description
      const descMatch = html.match(/descAcordion[\s\S]*?new-tab-content">([\s\S]*?)<\/div>/i);
      const descriptionHtml = descMatch ? descMatch[1].trim() : '';
      const descriptionText = decodeHtmlEntities(stripHtmlTags(descriptionHtml));
      
      if (name) {
        // Download image if we found one
        let localImagePath = null;
        if (origImageUrl) {
          const fileExtension = path.extname(origImageUrl.split('?')[0]) || '.jpg';
          const cleanImageName = `product_${productId}${fileExtension}`;
          localImagePath = await downloadImage(origImageUrl, cleanImageName);
        }
        
        const slug = url.split('/').pop().replace(/-P\d+/, '');
        
        const product = {
          id: productId,
          slug: slug,
          name: name,
          stockCode: stockCode,
          price: price,
          cover: localImagePath || origImageUrl,
          originalImage: origImageUrl ? new URL(origImageUrl, BASE_URL).href : null,
          descriptionHtml: descriptionHtml,
          description: descriptionText,
          url: url
        };
        
        // Avoid duplicate products
        const index = scrapedData.products.findIndex(p => p.id === productId);
        if (index > -1) {
          scrapedData.products[index] = product;
        } else {
          scrapedData.products.push(product);
        }
        
        console.log(`Parsed Product successfully: [ID: ${productId}] ${name} - Price: ${price} TL`);
      }
    }
    
  } catch (err) {
    console.error(`Error crawling page ${url}:`, err.message);
  }
}

// Main execution flow
async function main() {
  console.log('--- Dereceuzem Old Website Scraper Started ---');
  
  while (urlsToVisit.length > 0) {
    const nextUrl = urlsToVisit.shift();
    await crawlPage(nextUrl);
    
    // Add brief delay to be polite to the server
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n--- Scraping Finished ---');
  console.log(`Total Products Extracted: ${scrapedData.products.length}`);
  
  // Write scraped data to JSON file
  fs.writeFileSync(OUTPUT_DATA_FILE, JSON.stringify(scrapedData, null, 2), 'utf8');
  console.log(`Data saved to: ${OUTPUT_DATA_FILE}`);
}

main().catch(err => {
  console.error('Fatal error in scraper:', err);
});

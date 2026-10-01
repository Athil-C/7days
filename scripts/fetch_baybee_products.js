import https from 'https';

function fetchPage(page = 1) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'baybee.co.in',
      path: `/products.json?limit=250&page=${page}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.products || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const allProducts = [];
  let page = 1;
  while (page <= 5) {
    console.log(`Fetching page ${page}...`);
    const prods = await fetchPage(page);
    if (!prods || prods.length === 0) break;
    allProducts.push(...prods);
    console.log(`Page ${page} fetched ${prods.length} products. Total so far: ${allProducts.length}`);
    if (prods.length < 250) break;
    page++;
  }

  console.log(`Done! Total fetched: ${allProducts.length}`);
  
  // Group by product_type
  const types = {};
  allProducts.forEach(p => {
    const t = p.product_type || 'Uncategorized';
    types[t] = (types[t] || 0) + 1;
  });

  console.log('Product Types:', types);
}

run().catch(console.error);

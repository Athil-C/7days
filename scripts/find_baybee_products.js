import https from 'https';
import fs from 'fs';
import path from 'path';

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

async function findCandidates() {
  const all = [];
  for (let p = 1; p <= 5; p++) {
    const list = await fetchPage(p);
    all.push(...list);
  }

  // Filter for clean studio products across our key categories
  const targetCategories = {
    'battery_jeep': p => (p.product_type === 'Battery Operated' || p.title.toLowerCase().includes('jeep') || p.title.toLowerCase().includes('car')) && p.title.toLowerCase().includes('jeep'),
    'battery_bike': p => (p.product_type === 'Battery Operated' || p.title.toLowerCase().includes('bike') || p.title.toLowerCase().includes('motorcycle')) && (p.title.toLowerCase().includes('bike') || p.title.toLowerCase().includes('motorcycle') || p.title.toLowerCase().includes('vespa')),
    'study_table': p => p.product_type === 'Study Table' || p.title.toLowerCase().includes('study table'),
    'high_chair': p => p.product_type === 'High Chair' || p.title.toLowerCase().includes('high chair'),
    'tricycle': p => p.product_type === 'Tricycle' || p.product_type === 'Trikes' || p.title.toLowerCase().includes('tricycle') || p.title.toLowerCase().includes('trike'),
    'ride_on': p => (p.product_type === 'Push Ride On' || p.product_type === 'Push Ride-Ons' || p.product_type === 'Swing Cars') || p.title.toLowerCase().includes('swing car') || p.title.toLowerCase().includes('twister'),
    'walker': p => p.product_type === 'Walkers' || p.title.toLowerCase().includes('walker'),
    'stroller': p => p.product_type === 'Strollers and Prams' || p.title.toLowerCase().includes('stroller') || p.title.toLowerCase().includes('pram'),
    'scooter': p => p.product_type === 'Skate Scooters' || p.product_type === 'Kick Scooter' || p.title.toLowerCase().includes('scooter'),
    'rocking_horse': p => p.product_type === 'Rocking Horses & Animals' || p.title.toLowerCase().includes('rocking horse') || p.title.toLowerCase().includes('rocker'),
    'pretend_play': p => p.product_type === 'Pretend Play' || p.product_type === 'Pretend Play Toys' || p.title.toLowerCase().includes('kitchen') || p.title.toLowerCase().includes('doctor'),
    'educational': p => p.product_type === 'Educational Toys' || p.product_type === 'Wooden Toys' || p.product_type === 'Wooden Puzzles',
    'teether_rattle': p => p.product_type === 'Teethers' || p.product_type === 'Rattle Toys' || p.title.toLowerCase().includes('rattle') || p.title.toLowerCase().includes('teether'),
    'soft_toys': p => p.product_type === 'Soft Toys' || p.title.toLowerCase().includes('plush') || p.title.toLowerCase().includes('teddy')
  };

  const results = {};
  for (const [key, filterFn] of Object.entries(targetCategories)) {
    const matched = all.filter(filterFn);
    results[key] = matched.slice(0, 5).map(m => ({
      id: m.id,
      title: m.title,
      type: m.product_type,
      image: m.images[0] ? m.images[0].src : null,
      handle: m.handle
    }));
    console.log(`Category: ${key} found ${matched.length} items. Sample: ${results[key][0]?.title}`);
  }

  fs.writeFileSync('scripts/baybee_selected.json', JSON.stringify(results, null, 2));
}

findCandidates().catch(console.error);

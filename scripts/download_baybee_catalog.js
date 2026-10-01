import https from 'https';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const targetDir = 'public/products/baybee';
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

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

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching Baybee catalog...');
  const all = [];
  for (let p = 1; p <= 5; p++) {
    const list = await fetchPage(p);
    all.push(...list);
  }
  console.log(`Fetched ${all.length} products total.`);

  // Curated list of high quality items across departments
  const selectors = [
    // 1. Battery Jeeps
    { slug: 'baybee-copster-electric-jeep', q: p => p.title.toLowerCase().includes('copster'), cat: 'Toys', badge: 'Electric Jeep', desc: 'Battery-operated off-road electric jeep with working headlights, suspension, and parent remote control.' },
    { slug: 'baybee-chase-electric-jeep', q: p => p.title.toLowerCase().includes('chase electric jeep'), cat: 'Toys', badge: 'Electric Jeep', desc: 'Powerful rechargeable kids electric jeep with wide terrain wheels, safety belt, and dashboard music.' },
    { slug: 'baybee-supercop-police-jeep', q: p => p.title.toLowerCase().includes('supercop police'), cat: 'Toys', badge: 'Police Jeep', desc: 'Special police edition electric ride-on with flashing siren lights, megaphone sound, and sturdy bumpers.' },
    { slug: 'baybee-speedrover-jeep', q: p => p.title.toLowerCase().includes('speedrover'), cat: 'Toys', badge: 'Ride-On Jeep', desc: 'Heavy-duty dual motor electric ride-on jeep with realistic engine sounds and smooth pedal accelerator.' },

    // 2. Battery Bikes & Scooters
    { slug: 'baybee-velzo-battery-bike', q: p => p.title.toLowerCase().includes('velzo'), cat: 'Outdoors', badge: 'Electric Bike', desc: 'Sleek rechargeable kids motorcycle with training balance wheels, illuminated headlamp, and easy throttle.' },
    { slug: 'baybee-rover-battery-bike', q: p => p.title.toLowerCase().includes('rover kids battery operated bike'), cat: 'Outdoors', badge: 'Electric Bike', desc: 'Dynamic sports electric motorcycle with rugged styling, rear stabilizer wheels, and safety footrests.' },
    { slug: 'baybee-adreno-electric-bike', q: p => p.title.toLowerCase().includes('adreno baby electric'), cat: 'Outdoors', badge: 'Kids Bike', desc: 'Sporty battery-operated kids bike with hand accelerator, built-in melodies, and balanced ride design.' },

    // 3. Study Tables & Desks
    { slug: 'baybee-convertible-study-table', q: p => p.title.toLowerCase().includes('drawing & writing table'), cat: 'Education', badge: 'Study Desk', desc: '2-in-1 convertible kids drawing and writing study table with matching ergonomic chair and storage groove.' },
    { slug: 'baybee-5in1-study-table-chair', q: p => p.title.toLowerCase().includes('5-in-1 study table'), cat: 'Education', badge: 'Study Set', desc: 'Multi-activity children study table set with adjustable tilt desktop, cup holder, and posture-friendly seat.' },
    { slug: 'baybee-kids-table-chair-set', q: p => p.title.toLowerCase().includes('convertible study desk for kids') || p.title.toLowerCase().includes('2-in-1 kids table and chair'), cat: 'Education', badge: 'Activity Table', desc: 'Compact durable activity study desk with easy-clean surface and pencil organizer for preschoolers.' },

    // 4. High Chairs & Dining
    { slug: 'baybee-2in1-high-chair', q: p => p.title.toLowerCase().includes('2 in 1 high chair for baby'), cat: 'Baby', badge: 'High Chair', desc: 'Convertible baby dining high chair featuring 5-point safety harness, removable food tray, and non-slip legs.' },
    { slug: 'baybee-booster-dining-chair', q: p => p.product_type === 'High Chair' && p.title.toLowerCase().includes('booster'), cat: 'Baby', badge: 'Booster Chair', desc: 'Portable feeding booster seat with washable tray, safety straps, and adjustable height settings.' },

    // 5. Tricycles & Trikes
    { slug: 'baybee-nova-baby-tricycle', q: p => p.title.toLowerCase().includes('nova baby tricycle'), cat: 'Baby', badge: 'Baby Trike', desc: 'Steerable parent-push baby tricycle with protective sun canopy, footrests, and rear storage basket.' },
    { slug: 'baybee-canopy-push-trike', q: p => (p.product_type === 'Tricycle' || p.product_type === 'Trikes') && p.title.toLowerCase().includes('canopy'), cat: 'Baby', badge: 'Canopy Trike', desc: 'Multi-stage adjustable canopy trike with 3-point harness, parent control handle, and anti-slip pedals.' },
    { slug: 'baybee-classic-toddler-trike', q: p => (p.product_type === 'Tricycle' || p.product_type === 'Trikes') && !p.title.toLowerCase().includes('canopy'), cat: 'Baby', badge: 'Tricycle', desc: 'Sturdy beginner tricycle with ergonomic contoured seat, bell, and shock-absorbing EVA rubber tires.' },

    // 6. Ride-ons & Swing Cars
    { slug: 'baybee-nitro-pro-ride-on', q: p => p.title.toLowerCase().includes('nitro pro'), cat: 'Baby', badge: 'Ride-On Car', desc: 'Comfortable manual foot-to-floor ride-on push car with backrest support, steering horn, and underseat trunk.' },
    { slug: 'baybee-magic-twister-swing-car', q: p => p.title.toLowerCase().includes('swing') && (p.title.toLowerCase().includes('car') || p.title.toLowerCase().includes('twister')), cat: 'Baby', badge: 'Swing Car', desc: 'Original self-powered twist swing car with smooth 360-degree PU flashing wheels and wide grip steering.' },
    { slug: 'baybee-push-car-with-handle', q: p => p.product_type === 'Push Ride-Ons' && p.title.toLowerCase().includes('handle'), cat: 'Baby', badge: 'Push Car', desc: 'Parent-assist push ride-on car with removable side safety guardrails, footrest extensions, and canopy.' },

    // 7. Baby Walkers
    { slug: 'baybee-musical-baby-walker', q: p => p.product_type === 'Walkers' && p.title.toLowerCase().includes('musical'), cat: 'Baby', badge: 'Baby Walker', desc: 'Interactive musical activity walker with detachable rattle toys, height adjustments, and multi-directional wheels.' },
    { slug: 'baybee-foldable-step-walker', q: p => p.product_type === 'Walkers' && p.title.toLowerCase().includes('foldable'), cat: 'Baby', badge: 'Step Walker', desc: 'Compact fold-flat baby walker with high-back padded seat, wide anti-tip base, and sensory toy dashboard.' },

    // 8. Strollers & Prams
    { slug: 'baybee-twin-foldable-stroller', q: p => p.title.toLowerCase().includes('stroller') && p.title.toLowerCase().includes('foldable'), cat: 'Baby', badge: 'Baby Stroller', desc: 'Ultra-lightweight one-hand folding baby stroller with multi-position reclining seat and UV sun canopy.' },
    { slug: 'baybee-compact-travel-pram', q: p => p.product_type === 'Strollers and Prams' && !p.title.toLowerCase().includes('twin'), cat: 'Baby', badge: 'Baby Pram', desc: 'Smooth suspension all-terrain baby pram stroller with swivel lock wheels, shopping basket, and bumper bar.' },

    // 9. Kick Scooters
    { slug: 'baybee-twirlo-kick-scooter', q: p => p.title.toLowerCase().includes('twirlo'), cat: 'Outdoors', badge: 'Kick Scooter', desc: '3-wheel lean-to-steer kids kick scooter with bright LED light-up wheels, rear brake, and foldable handlebar.' },
    { slug: 'baybee-adjustable-skate-scooter', q: p => (p.product_type === 'Skate Scooters' || p.product_type === 'Kick Scooter') && p.title.toLowerCase().includes('adjustable'), cat: 'Outdoors', badge: 'Skate Scooter', desc: 'Adjustable height kids scooter with extra-wide anti-slip deck, ABEC-7 bearings, and safety grips.' },

    // 10. Rockers & Bouncers
    { slug: 'baybee-2in1-rocker-bouncer', q: p => p.title.toLowerCase().includes('rocker & bouncer') || p.title.toLowerCase().includes('rocker'), cat: 'Baby', badge: 'Baby Rocker', desc: 'Gentle soothing baby rocker and stationary bouncer seat with hanging toy bar and vibration calming feature.' },
    { slug: 'baybee-plush-rocking-horse', q: p => p.product_type === 'Rocking Horses & Animals', cat: 'Baby', badge: 'Rocking Toy', desc: 'Classic wooden base rocking companion with soft plush fabric, solid wood handles, and foot support.' },

    // 11. Pretend Play & Kitchen
    { slug: 'baybee-bowling-sports-set', q: p => p.title.toLowerCase().includes('bowling set'), cat: 'Toys', badge: 'Sports Game', desc: 'Colorful lightweight indoor and outdoor kids bowling pin playset with easy-grip rolling balls.' },
    { slug: 'baybee-chef-kitchen-set', q: p => (p.product_type === 'Pretend Play' || p.product_type === 'Pretend Play Toys') && (p.title.toLowerCase().includes('kitchen') || p.title.toLowerCase().includes('cook')), cat: 'Toys', badge: 'Kitchen Set', desc: 'Interactive pretend cooking kitchen playset with realistic pots, pans, utensils, and food accessories.' },

    // 12. Educational & Puzzles
    { slug: 'baybee-wooden-math-learning-set', q: p => p.title.toLowerCase().includes('counting sticks') || p.title.toLowerCase().includes('math'), cat: 'Education', badge: 'Math Set', desc: 'Montessori wooden math learning box with counting sticks, number blocks, and write-and-wipe problem cards.' },
    { slug: 'baybee-wooden-alphabet-puzzle', q: p => (p.product_type === 'Wooden Puzzles' || p.product_type === 'Educational Toys') && (p.title.toLowerCase().includes('puzzle') || p.title.toLowerCase().includes('board')), cat: 'Education', badge: 'Wooden Puzzle', desc: 'Non-toxic wooden alphabet and animal puzzle board with chunky lift-out pieces for fine motor skill development.' },

    // 13. Teethers & Rattles
    { slug: 'baybee-silicone-fruit-teether', q: p => p.title.toLowerCase().includes('silicone') && p.title.toLowerCase().includes('teether'), cat: 'Baby', badge: 'Baby Teether', desc: 'BPA-free food grade silicone fruit nibbler and soothing sensory teether pacifier with safety hygiene cap.' },
    { slug: 'baybee-sensory-rattle-set', q: p => p.product_type === 'Rattle Toys' || p.title.toLowerCase().includes('rattle'), cat: 'Baby', badge: 'Rattle Set', desc: 'Multi-texture newborn sensory rattle set designed for grasping, shaking auditory discovery, and soothing gums.' },

    // 14. Soft Toys & Stackers
    { slug: 'baybee-teddy-stacking-rings', q: p => p.title.toLowerCase().includes('stacking') || p.title.toLowerCase().includes('rings'), cat: 'Baby', badge: 'Stacking Toy', desc: 'Vibrant rainbow color nesting stacking rings topped with a friendly smiling teddy bear topper.' },
    { slug: 'baybee-cuddle-plush-companion', q: p => p.product_type === 'Soft Toys' || p.title.toLowerCase().includes('soft toy'), cat: 'Baby', badge: 'Plush Toy', desc: 'Hypoallergenic ultra-soft stuffed companion made from skin-friendly fabrics for cozy bedtime cuddles.' }
  ];

  const processedCatalog = [];
  let idCounter = 1;

  for (const sel of selectors) {
    const matched = all.find(sel.q);
    if (!matched) {
      console.log(`Warning: no match for ${sel.slug}`);
      continue;
    }

    const imgUrl = matched.images[0] ? matched.images[0].src : null;
    if (!imgUrl) {
      console.log(`Warning: no image for ${matched.title}`);
      continue;
    }

    const filename = `${sel.slug}.jpg`;
    const destPath = path.join(targetDir, filename);

    try {
      console.log(`Downloading [${idCounter}]: ${matched.title.slice(0, 45)}...`);
      const rawBuf = await downloadImage(imgUrl);

      // Process image to standardized clean studio 800x800 web format with clean border
      await sharp(rawBuf)
        .resize({
          width: 800,
          height: 800,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(destPath);

      processedCatalog.push({
        id: idCounter++,
        name: matched.title,
        category: sel.cat,
        description: sel.desc,
        price: null, // Strictly preserve 7Days policy: no hallucinated pricing
        image: `/products/baybee/${filename}`,
        isFeatured: idCounter <= 10,
        badge: sel.badge,
        baybeeHandle: matched.handle
      });
      console.log(`✓ Saved ${filename}`);
    } catch (err) {
      console.error(`Failed to process ${sel.slug}:`, err.message);
    }
  }

  console.log(`Successfully processed ${processedCatalog.length} Baybee catalog products!`);
  fs.writeFileSync('scripts/baybee_final_catalog.json', JSON.stringify(processedCatalog, null, 2));
}

run().catch(console.error);

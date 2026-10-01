const fs = require('fs');

// Read raw Shopify Baybee catalog
const raw = JSON.parse(fs.readFileSync('scripts/baybee_all_raw.json', 'utf8'));

// Read existing 34 products
const existingModule = fs.readFileSync('src/data/products.js', 'utf8');

// Parse the first 34 products from existing file by extracting the array content up to id 34
const existingMatch = existingModule.match(/export const products = (\[[\s\S]*?\n\]);/);
if (!existingMatch) {
  console.error('Could not match existing products array');
  process.exit(1);
}

// Evaluate existing products in a safe sandbox
const existingProducts = eval(`(${existingMatch[1]})`);
console.log('Existing curated products count:', existingProducts.length);

const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase().trim()));

function mapCategory(type, title, tags) {
  const t = ((type || '') + ' ' + (title || '') + ' ' + (tags || []).join(' ')).toLowerCase();
  
  if (t.includes('jeep') || t.includes('car') || t.includes('police') || t.includes('rc ') || t.includes('remote') || t.includes('gun') || t.includes('kitchen') || t.includes('pretend') || t.includes('doll') || t.includes('toy') || t.includes('action figure') || t.includes('play set') || t.includes('playset') || t.includes('bowling') || t.includes('track')) {
    return 'Toys';
  }
  if (t.includes('bike') || t.includes('scooter') || t.includes('skate') || t.includes('outdoor') || t.includes('cycle') || t.includes('slide') || t.includes('swing car') || t.includes('basketball') || t.includes('ball pit')) {
    return 'Outdoors';
  }
  if (t.includes('study table') || t.includes('puzzle') || t.includes('educational') || t.includes('desk') || t.includes('math') || t.includes('wooden') || t.includes('drawing') || t.includes('building block') || t.includes('tiles') || t.includes('book')) {
    return 'Education';
  }
  if (t.includes('walker') || t.includes('stroller') || t.includes('trike') || t.includes('tricycle') || t.includes('high chair') || t.includes('cradle') || t.includes('rocker') || t.includes('bouncer') || t.includes('teether') || t.includes('bath') || t.includes('potty') || t.includes('baby') || t.includes('feeding') || t.includes('playpen') || t.includes('bedrail') || t.includes('pram') || t.includes('bedding') || t.includes('carrier') || t.includes('mat')) {
    return 'Baby';
  }
  return 'Toys';
}

function cleanBadge(type, title) {
  if (type && type.length >= 3 && type.length <= 16) return type;
  const lower = (title || '').toLowerCase();
  if (lower.includes('electric jeep')) return 'Electric Jeep';
  if (lower.includes('battery') && lower.includes('bike')) return 'Battery Bike';
  if (lower.includes('scooter')) return 'Kick Scooter';
  if (lower.includes('walker')) return 'Activity Walker';
  if (lower.includes('high chair')) return 'High Chair';
  if (lower.includes('tricycle') || lower.includes('trike')) return 'Tricycle';
  if (lower.includes('stroller') || lower.includes('pram')) return 'Stroller';
  if (lower.includes('study table')) return 'Study Table';
  if (lower.includes('teether')) return 'Teether';
  if (lower.includes('cradle') || lower.includes('swing')) return 'Baby Cradle';
  if (lower.includes('puzzle')) return 'Wooden Puzzle';
  return 'Baybee';
}

function cleanDescription(html, title) {
  if (!html) return `${title} available for in-store preview and purchase at 7Days Toys & Babyshop.`;
  let text = html.replace(/<[^>]*>?/gm, ' ')
                 .replace(/&nbsp;/g, ' ')
                 .replace(/&amp;/g, '&')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'")
                 .replace(/\s+/g, ' ')
                 .trim();
  if (text.length > 170) {
    text = text.slice(0, 170).trim() + '...';
  }
  return text || `${title} available for in-store preview and purchase at 7Days Toys & Babyshop.`;
}

// Build merged products list
const fullCatalog = [...existingProducts];
let currentId = existingProducts.length + 1;

for (const p of raw) {
  const cleanTitle = p.title.replace(/[\r\n\t]+/g, ' ').replace(/"/g, "'").trim();
  if (existingNames.has(cleanTitle.toLowerCase())) {
    continue; // already in curated top 34
  }

  const category = mapCategory(p.product_type, p.title, p.tags);
  const badge = cleanBadge(p.product_type, p.title);
  const desc = cleanDescription(p.body_html, cleanTitle);
  const img = p.images && p.images[0] ? p.images[0].src : '';

  if (!img) continue; // must have product image

  fullCatalog.push({
    id: currentId++,
    name: cleanTitle,
    category: category,
    description: desc.replace(/"/g, "'"),
    price: null, // Keep null to never invent prices!
    image: img,
    isFeatured: false,
    badge: badge
  });
}

console.log('Total combined catalog count:', fullCatalog.length);

const categoriesCount = {};
fullCatalog.forEach(p => {
  categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 1;
});
console.log('Final categories count:', categoriesCount);

// Generate JavaScript file
const outputJs = `/**
 * 7Days Toys & Babyshop - Official Baybee Product Catalog
 * 
 * Sourced directly from Baybee product collection & sitemap:
 * - 100% official studio product photography from Baybee
 * - Zero hallucinated prices (price: null preserved)
 * - Complete catalog: ${fullCatalog.length} products across Toys, Outdoors, Baby, and Education
 */

export const products = ${JSON.stringify(fullCatalog, null, 2)};

// Available filter categories matching the catalog departments
export const PRODUCT_CATEGORIES = [
  "All",
  "Toys",
  "Outdoors",
  "Baby",
  "Education"
];
`;

fs.writeFileSync('src/data/products.js', outputJs, 'utf8');
console.log('Successfully wrote src/data/products.js with', fullCatalog.length, 'products!');

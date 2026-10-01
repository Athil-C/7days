const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/baybee_all_raw.json', 'utf8'));

function mapCategory(type, title, tags) {
  const t = ((type || '') + ' ' + (title || '') + ' ' + (tags || []).join(' ')).toLowerCase();
  
  if (t.includes('jeep') || t.includes('car') || t.includes('police') || t.includes('rc ') || t.includes('remote') || t.includes('gun') || t.includes('kitchen') || t.includes('pretend') || t.includes('doll') || t.includes('toy') || t.includes('action figure') || t.includes('play set') || t.includes('playset') || t.includes('bowling')) {
    return 'Toys';
  }
  if (t.includes('bike') || t.includes('scooter') || t.includes('skate') || t.includes('outdoor') || t.includes('cycle') || t.includes('slide') || t.includes('swing car') || t.includes('basketball')) {
    return 'Outdoors';
  }
  if (t.includes('study table') || t.includes('puzzle') || t.includes('educational') || t.includes('desk') || t.includes('math') || t.includes('wooden') || t.includes('drawing') || t.includes('building block') || t.includes('tiles')) {
    return 'Education';
  }
  if (t.includes('walker') || t.includes('stroller') || t.includes('trike') || t.includes('tricycle') || t.includes('high chair') || t.includes('cradle') || t.includes('rocker') || t.includes('bouncer') || t.includes('teether') || t.includes('bath') || t.includes('potty') || t.includes('baby') || t.includes('feeding') || t.includes('playpen') || t.includes('bedrail') || t.includes('pram')) {
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
  if (text.length > 175) {
    text = text.slice(0, 175).trim() + '...';
  }
  return text || `${title} available for in-store preview and purchase at 7Days Toys & Babyshop.`;
}

const catalog = raw.map((p, idx) => {
  const category = mapCategory(p.product_type, p.title, p.tags);
  const badge = cleanBadge(p.product_type, p.title);
  const desc = cleanDescription(p.body_html, p.title);
  const img = p.images && p.images[0] ? p.images[0].src : '';
  return {
    id: idx + 1,
    name: p.title.replace(/[\r\n\t]+/g, ' ').replace(/"/g, "'").trim(),
    category: category,
    description: desc.replace(/"/g, "'"),
    price: null,
    image: img,
    isFeatured: idx < 16,
    badge: badge
  };
});

console.log('Total catalog entries:', catalog.length);
const catCounts = {};
catalog.forEach(c => catCounts[c.category] = (catCounts[c.category] || 0) + 1);
console.log('Category Counts:', catCounts);

fs.writeFileSync('scripts/baybee_full_catalog.json', JSON.stringify(catalog, null, 2));
console.log('File size KB:', Math.round(fs.statSync('scripts/baybee_full_catalog.json').size / 1024));

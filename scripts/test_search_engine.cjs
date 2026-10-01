const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/baybee_all_raw.json', 'utf8'));

// We can read products from src/data/products.js
import('../src/data/products.js').then(({ products }) => {
  function matchWord(text, word) {
    if (!word || word.length < 2) return false;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(\\b|\\s|^)' + escaped + '(\\b|\\s|$)', 'i');
    return regex.test(text);
  }

  function smartSearch(list, rawQuery) {
    if (!rawQuery || !rawQuery.trim()) return list;
    const query = rawQuery.toLowerCase().trim();
    const tokens = query.split(/\s+/).filter(t => t.length > 1);

    // Negative filters for cars: exclude bath, sipper, etc.
    const isCarSearch = query.includes('car') || query.includes('jeep') || query.includes('vehicle');

    const scored = [];
    for (const p of list) {
      const name = p.name.toLowerCase();
      const badge = (p.badge || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const combined = name + ' ' + badge;

      if (isCarSearch && (name.includes('sipper') || name.includes('bath') || name.includes('shopping cart') || name.includes('cradle') || name.includes('high chair'))) {
        continue;
      }

      let score = 0;

      // Exact full query match
      if (combined.includes(query)) score += 60;
      else if (desc.includes(query)) score += 25;

      let matchedTokens = 0;
      tokens.forEach(tok => {
        if (matchWord(combined, tok)) {
          matchedTokens++;
          score += 20;
        } else if (matchWord(desc, tok)) {
          matchedTokens++;
          score += 5;
        }
      });

      // Special semantic booster for charge / battery + remote + car / jeep
      if ((query.includes('charge') || query.includes('battery') || query.includes('remote')) && isCarSearch) {
        const isTrueVehicle = matchWord(combined, 'jeep') || matchWord(combined, 'car') || matchWord(combined, 'suv');
        const hasPower = combined.includes('battery') || combined.includes('electric') || combined.includes('remote') || desc.includes('remote') || desc.includes('rechargeable');
        if (isTrueVehicle && hasPower) score += 35;
      }

      if (tokens.length > 1) {
        if (matchedTokens >= Math.ceil(tokens.length * 0.5) && score >= 20) {
          scored.push({ p, score });
        }
      } else {
        if (score > 0) scored.push({ p, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.p);
  }

  const res = smartSearch(products, 'charge remote car');
  console.log('Smart search "charge remote car" count:', res.length);
  console.log('Top 10:');
  res.slice(0, 10).forEach(r => console.log(' -> ' + r.name + ' [' + r.badge + ']'));

  const bad = res.filter(r => r.name.toLowerCase().includes('sipper') || r.name.toLowerCase().includes('cradle') || r.name.toLowerCase().includes('bath'));
  console.log('Bad items in smart search:', bad.length);
});

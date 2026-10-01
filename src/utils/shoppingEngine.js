/**
 * 7Days Toys & Babyshop - Reusable Shopping & Recommendation Engine
 * 
 * Reuses the existing product dataset from src/data/products.js.
 * Powers:
 * - Smart Search with synonym interpretation
 * - Gift Finder
 * - Birthday Gift Finder
 * - Shop by Age
 * - Shop by Budget
 */

import { products } from '../data/products.js';
import { 
  AGE_GROUPS, 
  BUDGET_TIERS, 
  OCCASION_PRODUCT_MAPPING, 
  INTEREST_OPTIONS, 
  SEARCH_SYNONYMS,
  VIDEO_ELIGIBLE_PRODUCT_IDS
} from '../data/shoppingConfig.js';
import { SHOP_FULL_NAME, createWhatsAppUrl } from '../data/config.js';


/**
 * Filter products by Age Group ID (e.g. "0-1", "1-3", "3-5", "5-8", "8-12", "12+")
 */
export function filterProductsByAge(productsList, ageGroupId) {
  if (!ageGroupId || ageGroupId === 'all') return productsList;
  const group = AGE_GROUPS.find(g => g.id === ageGroupId);
  if (!group) return productsList;
  const allowedSet = new Set(group.productIds);
  return productsList.filter(p => allowedSet.has(p.id));
}

/**
 * Filter products by Budget Tier ID (e.g. "under-500", "500-1000", "1000-2500", "2500-plus")
 * If numeric price exists, uses price >= min && price <= max.
 * If price is null, uses catalog budget tier mappings.
 */
export function filterProductsByBudget(productsList, budgetTierId) {
  if (!budgetTierId || budgetTierId === 'all') return productsList;
  const tier = BUDGET_TIERS.find(t => t.id === budgetTierId);
  if (!tier) return productsList;

  return productsList.filter(p => {
    // Strictly do NOT include products with null, undefined, or unverified prices
    if (typeof p.price === 'number' && p.price !== null && !Number.isNaN(p.price)) {
      return p.price >= tier.min && p.price <= tier.max;
    }
    return false;
  });
}

/**
 * Filter products by category
 */
export function filterProductsByCategory(productsList, category) {
  if (!category || category === 'All') return productsList;
  return productsList.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * Check if a product is eligible for video request CTA
 */
export function isProductVideoEligible(productId) {
  return VIDEO_ELIGIBLE_PRODUCT_IDS.has(productId);
}

/**
 * Client-side Smart Search Interpretation
 * Analyzes natural queries (e.g., "birthday gift under 1000 for a 5 year old", "remote car", "cycle")
 */
export function parseSearchIntent(rawQuery) {
  if (!rawQuery) return { cleanTerms: [], age: null, budget: null, occasion: null };

  const query = rawQuery.toLowerCase().trim();
  let extractedAge = null;
  let extractedBudget = null;
  let extractedOccasion = null;

  // 1. Age extraction
  if (query.includes('5 year') || query.includes('6 year') || query.includes('7 year') || query.includes('8 year') || query.includes('5-8') || query.includes('5 to 8')) {
    extractedAge = '5-8';
  } else if (query.includes('1 year') || query.includes('2 year') || query.includes('3 year') || query.includes('toddler') || query.includes('1-3')) {
    extractedAge = '1-3';
  } else if (query.includes('0-1') || query.includes('infant') || query.includes('newborn') || query.includes('baby')) {
    extractedAge = '0-1';
  } else if (query.includes('3-5') || query.includes('3 to 5') || query.includes('preschool') || query.includes('4 year')) {
    extractedAge = '3-5';
  } else if (query.includes('8-12') || query.includes('9 year') || query.includes('10 year') || query.includes('11 year') || query.includes('12 year')) {
    extractedAge = '8-12';
  } else if (query.includes('12+') || query.includes('teen') || query.includes('13 year')) {
    extractedAge = '12+';
  }

  // 2. Budget extraction
  if (query.includes('under 500') || query.includes('below 500') || query.includes('<500')) {
    extractedBudget = 'under-500';
  } else if (query.includes('under 1000') || query.includes('below 1000') || query.includes('500-1000') || query.includes('1000')) {
    extractedBudget = '500-1000';
  } else if (query.includes('under 2500') || query.includes('1000-2500')) {
    extractedBudget = '1000-2500';
  } else if (query.includes('2500+') || query.includes('above 2500')) {
    extractedBudget = '2500-plus';
  }

  // 3. Occasion extraction
  if (query.includes('birthday') || query.includes('bday')) {
    extractedOccasion = 'birthday';
  } else if (query.includes('school') || query.includes('class')) {
    extractedOccasion = 'school';
  } else if (query.includes('new baby') || query.includes('shower')) {
    extractedOccasion = 'new-baby';
  }

  // 4. Tokenize and normalize search terms with synonyms
  const tokens = query.split(/\s+/).filter(Boolean);
  const expandedTerms = new Set();

  tokens.forEach(tok => {
    expandedTerms.add(tok);
    if (SEARCH_SYNONYMS[tok]) {
      SEARCH_SYNONYMS[tok].forEach(s => expandedTerms.add(s));
    }
  });

  return {
    rawQuery,
    tokens,
    expandedTerms: Array.from(expandedTerms),
    age: extractedAge,
    budget: extractedBudget,
    occasion: extractedOccasion
  };
}

/**
 * Smart Search Products
 * Combines full text matching with semantic synonym expansion and intent extraction.
 * Uses whole-word boundary matching to eliminate false positives (e.g. "car" matching "care", "carpet", "shopping cart").
 */
export function searchProducts(productsList, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return productsList;

  const cleanQuery = rawQuery.toLowerCase().trim();
  const intent = parseSearchIntent(rawQuery);
  const terms = intent.expandedTerms;
  const isVehicleQuery = cleanQuery.includes('car') || cleanQuery.includes('jeep') || cleanQuery.includes('rc') || cleanQuery.includes('remote');

  function matchWordOrBoundary(text, term) {
    if (!text || !term) return false;
    if (term.length <= 4) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
      return rx.test(text);
    }
    return text.includes(term);
  }

  const scored = [];

  for (const item of productsList) {
    const name = item.name.toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const badge = (item.badge || '').toLowerCase();
    const combined = `${name} ${badge}`;

    // Negative filtering: if searching for cars/jeeps/RC, exclude bath stands, sippers, shopping carts, etc.
    if (isVehicleQuery && (name.includes('bath') || name.includes('sipper') || name.includes('shopping cart') || name.includes('teether') || name.includes('playpen'))) {
      continue;
    }

    let score = 0;

    // Exact direct query match
    if (combined.includes(cleanQuery)) {
      score += 100;
    } else if (desc.includes(cleanQuery)) {
      score += 40;
    }

    // Token & synonym matching with word boundaries
    terms.forEach(term => {
      if (term.length < 2) return;
      if (matchWordOrBoundary(combined, term)) {
        score += 25;
      } else if (matchWordOrBoundary(desc, term)) {
        score += 8;
      }
    });

    // Special booster for remote car / charge car
    if (isVehicleQuery) {
      const isCar = matchWordOrBoundary(combined, 'car') || matchWordOrBoundary(combined, 'jeep') || matchWordOrBoundary(combined, 'suv');
      const isElectric = combined.includes('battery') || combined.includes('electric') || combined.includes('rechargeable') || combined.includes('remote') || desc.includes('remote') || desc.includes('rechargeable');
      if (isCar && isElectric) {
        score += 35;
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}

/**
 * Universal Multi-Factor Recommendation Engine
 * Used for Gift Finder, Birthday Gift Finder, and Smart Shopping Assistants.
 * 
 * Supports:
 * - age: "0-1" | "1-3" | "3-5" | "5-8" | "8-12" | "12+"
 * - budget: "under-500" | "500-1000" | "1000-2500" | "2500-plus"
 * - interest: "cars-rc" | "outdoor" | "dolls" | "educational" | etc.
 * - occasion: "birthday" | "new-baby" | "school" | "festival" | "just-for-fun" | "gift"
 */
export function getRecommendedProducts({ age, budget, interest, occasion } = {}) {
  let scored = products.map(product => ({
    product,
    score: 0
  }));

  // 1. Filter / score by Age
  if (age) {
    const ageGroup = AGE_GROUPS.find(g => g.id === age);
    if (ageGroup) {
      const ageSet = new Set(ageGroup.productIds);
      scored = scored.map(item => ({
        ...item,
        score: item.score + (ageSet.has(item.product.id) ? 30 : 0)
      }));
    }
  }

  // 2. Filter / score by Budget (only applies if product has a verified numeric price)
  if (budget) {
    const budgetTier = BUDGET_TIERS.find(b => b.id === budget);
    if (budgetTier) {
      scored = scored.map(item => {
        const hasValidPrice = typeof item.product.price === 'number' && item.product.price !== null && !Number.isNaN(item.product.price);
        const match = hasValidPrice && item.product.price >= budgetTier.min && item.product.price <= budgetTier.max;
        return {
          ...item,
          score: item.score + (match ? 25 : 0)
        };
      });
    }
  }

  // 3. Filter / score by Interest
  if (interest) {
    const interestObj = INTEREST_OPTIONS.find(i => i.id === interest);
    if (interestObj) {
      const interestSet = new Set(interestObj.productIds);
      scored = scored.map(item => {
        const directIdMatch = interestSet.has(item.product.id);
        const catMatch = item.product.category.toLowerCase() === interestObj.category.toLowerCase();
        return {
          ...item,
          score: item.score + (directIdMatch ? 40 : (catMatch ? 15 : 0))
        };
      });
    }
  }

  // 4. Filter / score by Occasion
  if (occasion) {
    const occasionProductIds = OCCASION_PRODUCT_MAPPING[occasion] || [];
    const occasionSet = new Set(occasionProductIds);
    scored = scored.map(item => ({
      ...item,
      score: item.score + (occasionSet.has(item.product.id) ? 20 : 0)
    }));
  }

  // Boost featured products slightly for tie-breaking
  scored = scored.map(item => ({
    ...item,
    score: item.score + (item.product.isFeatured ? 5 : 0)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return items that have a positive recommendation score, or fallback to featured products if nothing matched
  const positive = scored.filter(s => s.score > 0).map(s => s.product);

  if (positive.length > 0) {
    return positive;
  }

  // Fallback to top featured products if too restrictive
  return products.filter(p => p.isFeatured).slice(0, 8);
}

/**
 * Standardized WhatsApp Link Generator
 * Complies with strict rules:
 * - NO price hallucination (if price is null, omit the price line completely).
 * - "Check availability" phrasing.
 * - Standardized format for store inquiries.
 */
export function generateWhatsAppProductInquiry({ product, inquiryType = 'general', giftContext = null }) {
  let message = '';

  if (inquiryType === 'video') {
    message = `Hi ${SHOP_FULL_NAME},\n\nCould you please send me a short video of this product?\n\nProduct:\n*${product.name}*\n\nThank you.`;
  } else if (inquiryType === 'gift' && giftContext) {
    const ageLabel = giftContext.ageLabel || 'child';
    const occasionLabel = giftContext.occasionLabel || 'gift';
    const budgetLabel = giftContext.budgetLabel ? ` with a budget of ${giftContext.budgetLabel}` : '';

    message = `Hi ${SHOP_FULL_NAME},\n\nI'm looking for a ${occasionLabel.toLowerCase()} gift for a ${ageLabel}${budgetLabel}.\n\nProduct:\n*${product.name}*\n\nCould you please confirm availability and share more details?\n\nThank you.`;
  } else {
    // Standard product inquiry
    const hasPrice = product.price !== null && product.price !== undefined && !Number.isNaN(product.price);
    const priceLine = hasPrice ? `Price: ₹${product.price}\n` : '';

    message = `Hi ${SHOP_FULL_NAME},\n\nI'm interested in:\n\nProduct: *${product.name}*\nCategory: ${product.category}\n${priceLine}\nCould you please confirm in-store availability and share details?\n\nThank you.`;
  }

  return createWhatsAppUrl(message);
}

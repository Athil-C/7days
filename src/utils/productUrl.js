/**
 * Helper utilities for SEO-friendly product URLs and slugs.
 */

/**
 * Converts a string into a clean, URL-safe slug.
 * Example: "Baby" -> "baby"
 * Example: "Baybee Feeding Booster Seat with Washable Food Tray" -> "baybee-feeding-booster-seat-with-washable-food-tray"
 */
export function slugify(text) {
  if (!text) return '';
  let str = String(text);
  try {
    str = decodeURIComponent(str);
  } catch (_) {}
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates the canonical SEO-friendly URL for a product.
 * Format: /product/:categorySlug/:productSlug
 * Example: /product/baby/baybee-feeding-booster-seat-with-washable-food-tray
 */
export function getProductUrl(product) {
  if (!product) return '/products';

  const category = product.category || 'all';
  const name = product.name || `item-${product.id}`;

  const categorySlug = slugify(category) || 'all';
  const productSlug = slugify(name) || `item-${product.id}`;

  return `/product/${categorySlug}/${productSlug}`;
}

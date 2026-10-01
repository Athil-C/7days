/**
 * 7Days Toys & Babyshop - Store Configuration
 * 
 * IMPORTANT FOR STORE OWNER / DEVELOPER:
 * Please update the WhatsApp number and Phone number below when the final
 * SIM card / official business number is activated.
 * Format: Country code without '+' or special characters for WhatsApp URL (e.g., '919876543210' for India).
 */

// ==========================================
// STORE CONTACT CONFIGURATION
// ==========================================
// REPLACE WITH OFFICIAL PHONE / WHATSAPP NUMBER
export const SHOP_WHATSAPP_NUMBER = "+919526122471";
export const SHOP_PHONE_DISPLAY = "+91 95261 22471";
export const SHOP_PHONE_CALL = "+919526122471";

// Secondary phone number
export const SHOP_PHONE_SECONDARY = "+91 99617 36375";
export const SHOP_PHONE_SECONDARY_CALL = "+919961736375";

// SOCIAL & STORE LINKS
export const SHOP_INSTAGRAM_URL = "https://www.instagram.com/7days_toys/";
export const SHOP_NAME = "7Days";
export const SHOP_SUBTITLE = "Toys & Babyshop";
export const SHOP_FULL_NAME = "7Days Toys & Babyshop";
export const SHOP_TAGLINE = "Little Things. Big Smiles.";

// ADDRESS & LOCATION
export const SHOP_ADDRESS = {
  line1: "Payod",
  town: "Mananthavady",
  district: "Wayanad",
  state: "Kerala",
  country: "India",
  formatted: "Payod, Mananthavady, Wayanad, Kerala, India",
  short: "Payod, Mananthavady, Wayanad",
  // Google Maps Search query for Payod, Mananthavady
  mapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=Payod+Mananthavady+Wayanad+Kerala",
  mapsDirectionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Payod+Mananthavady+Wayanad+Kerala"
};

/**
 * Generates an encoded WhatsApp direct chat link with pre-filled message
 * @param {string} message - Custom greeting or inquiry message
 * @returns {string} WhatsApp URL
 */
export function createWhatsAppUrl(message = "") {
  const cleanNumber = SHOP_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message || `Hi ${SHOP_FULL_NAME}, I'd like to inquire about your store products!`);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

/**
 * Generates dynamic WhatsApp message for a specific product inquiry
 * Strictly omits price if null/undefined.
 * @param {string|object} product - Product name or Product object
 * @returns {string} WhatsApp URL
 */
export function getProductInquiryUrl(product) {
  if (typeof product === 'string') {
    const message = `Hi ${SHOP_FULL_NAME},\n\nI'm interested in:\n\nProduct: ${product}\n\nCould you please confirm availability and share more details?\n\nThank you.`;
    return createWhatsAppUrl(message);
  }

  const name = product?.name || 'this item';
  const category = product?.category ? `Category: ${product.category}\n` : '';
  const hasPrice = product?.price !== null && product?.price !== undefined && !Number.isNaN(product.price);
  const priceLine = hasPrice ? `Price: ₹${product.price}\n` : '';

  const message = `Hi ${SHOP_FULL_NAME},\n\nI'm interested in this product:\n\n*${name}*\n${category}${priceLine}\nCould you please confirm in-store availability and share details?\n\nThank you.`;
  return createWhatsAppUrl(message);
}


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
  const encoded = encodeURIComponent(message || `Hi ${SHOP_FULL_NAME}, I'd like to inquire about your store products!`);
  return `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encoded}`;
}

/**
 * Generates dynamic WhatsApp message for a specific product inquiry
 * @param {string} productName - Name of the product
 * @returns {string} WhatsApp URL
 */
export function getProductInquiryUrl(productName) {
  const message = `Hi ${SHOP_FULL_NAME}, I'm interested in ${productName}. Is it available?`;
  return createWhatsAppUrl(message);
}

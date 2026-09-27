/**
 * 7Days Toys & Babyshop - Store Announcements & Updates
 * 
 * HOW TO ADD A NEW UPDATE:
 * Simply add a new object to the `storeUpdates` array below with:
 * - id: unique number or string
 * - title: English title
 * - titleMalayalam: (Optional) Malayalam title
 * - category: e.g. "Services", "New Arrivals", "Offers", "Notices"
 * - date: e.g. "September 2026" or "Active Now"
 * - bannerImage: path to the image saved in public/updates/ (e.g. "/updates/my-banner.png")
 * - description: Brief description of the update
 * - highlights: Array of 3-4 bullet point highlights
 * - whatsappMessage: Pre-filled message sent when a customer taps WhatsApp
 * - isFeatured: true/false
 */

export const storeUpdates = [
  {
    id: 1,
    title: "Electric Car, Bike & Gear Cycle Spare Parts & Service Available",
    titleMalayalam: "ഇലക്ട്രിക് കാർ, ബൈക്ക്, ഗിയർ സൈക്കിൾ സ്പെയർ പാർട്സ് & സർവീസ് ലഭ്യമാണ്",
    category: "New Service",
    badge: "Specialized Service",
    badgeColor: "bg-red-600",
    date: "Available Now",
    bannerImage: "/updates/service-spareparts-banner.png",
    description: "Complete repair, spare parts replacement, and professional maintenance service for all children's electric ride-on cars, bikes, and multi-speed gear cycles at our Payod showroom.",
    highlights: [
      "Electric Ride-on Cars & Bikes Servicing",
      "All Kinds of Gear Cycle Service & Tuning",
      "Authentic Spare Parts & Battery Replacements",
      "Expert In-Store Diagnostic & Quick Repair"
    ],
    whatsappMessage: "Hi 7Days Toys, I would like to inquire about Electric Car/Bike/Gear Cycle Service and Spare Parts.",
    isFeatured: true
  }
];

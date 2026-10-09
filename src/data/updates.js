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
  },
  {
    id: 2,
    title: "New Arrivals: Premium Battery Ride-on Jeeps, Bikes & Magic Cars",
    category: "New Arrivals",
    badge: "Fresh Stock",
    badgeColor: "bg-emerald-600",
    date: "In Showroom Now",
    bannerImage: "/store/store-magic-swing-cars.png",
    description: "Huge arrival of rechargeable 4x4 electric jeeps with parental remote, battery motorcycles, and smooth magic swing cars ready for in-store test drive and direct pickup.",
    highlights: [
      "Parental 2.4G Remote Control Jeeps",
      "Safe Soft-Start & Dual Battery Power",
      "Smooth PU Bearing Magic Swing Cars",
      "Live In-Store Demo at Payod Showroom"
    ],
    whatsappMessage: "Hi 7Days Toys, I would like to inquire about the newly arrived battery ride-on jeeps and bikes.",
    isFeatured: true
  },
  {
    id: 3,
    title: "Kids & Youth Bicycles: Hero, Gang & Multi-Speed Cycles In Stock",
    category: "Showroom Collection",
    badge: "Bicycle Hub",
    badgeColor: "bg-blue-600",
    date: "Available Now",
    bannerImage: "/store/store-front-cycles.png",
    description: "Wide selection of children's trainer cycles, balance bikes, and gear cycles from top brands with free professional assembly and after-sales maintenance support.",
    highlights: [
      "All Age Groups (2 to 14+ Years)",
      "Free In-Store Fitting & Safety Tuning",
      "Heavy-Duty Training Wheels & Accessories",
      "Best Direct Pricing & Warranty Support"
    ],
    whatsappMessage: "Hi 7Days Toys, I would like to inquire about kids bicycles and gear cycles available in your showroom.",
    isFeatured: true
  }
];

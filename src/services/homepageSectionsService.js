/**
 * 7Days Toys & Babyshop - Homepage Sections Configuration Service
 * Provides live synchronization between Admin "Homepage Sections & Showcase"
 * and the customer-facing Homepage.
 */

const STORAGE_KEYS = {
  AGE_BRACKETS: '7days_custom_age_brackets_v1',
  CARE_SERVICES: '7days_custom_care_services_v1',
  INSTAGRAM_FEED: '7days_custom_instagram_v1',
  STORE_LOCATION: '7days_custom_store_location_v1'
};

export const DEFAULT_AGE_BRACKETS = [
  {
    id: "0-1",
    label: "0–12 Months",
    tagline: "Infant & Sensory",
    description: "BPA-free silicone teethers, soothing bouncers, and kick piano sensory gyms.",
    icon: "🍼",
    category: "Baby",
    tag: "Infants"
  },
  {
    id: "1-3",
    label: "1–3 Years",
    tagline: "First Steps & Discovery",
    description: "Musical walkers, canopy tricycles, magic twister cars & high chairs.",
    icon: "🧸",
    category: "Toys",
    tag: "Toddlers"
  },
  {
    id: "3-5",
    label: "3–6 Years",
    tagline: "Curious Preschoolers",
    description: "Rechargeable electric jeeps, sports bikes, study desks & activity sets.",
    icon: "🎨",
    category: "Toys",
    tag: "Preschool"
  },
  {
    id: "5-8",
    label: "6–12 Years",
    tagline: "Active Exploration & Cycles",
    description: "Police electric jeeps, adventure bicycles, sports bikes & skates.",
    icon: "🚲",
    category: "Outdoors",
    tag: "Big Kids"
  }
];

export const DEFAULT_CARE_SERVICES = [
  {
    id: 1,
    title: 'Kids EV & Ride-on Servicing',
    tag: 'Electric Vehicles',
    description: "Complete maintenance, diagnostics, and repairs for children's electric cars and rechargeable bikes.",
    iconKey: 'Cpu',
    accent: 'text-[#FB8500]',
    bg: 'bg-[#FB8500]/15'
  },
  {
    id: 2,
    title: 'Gear Cycle Service & Tuning',
    tag: 'Bicycles',
    description: 'Professional brake tuning, chain adjustment, gear alignment, and safety inspections for all kids bikes.',
    iconKey: 'Bike',
    accent: 'text-[#219EBC]',
    bg: 'bg-[#219EBC]/15'
  },
  {
    id: 3,
    title: 'Spare Parts & Battery Replacement',
    tag: 'Spare Parts',
    description: 'Authentic 6V/12V ride-on batteries, remote controllers, chargers, pedal switches, and replacement wheels.',
    iconKey: 'BatteryCharging',
    accent: 'text-[#6A994E]',
    bg: 'bg-[#6A994E]/15'
  },
  {
    id: 4,
    title: 'In-Store Quick Diagnostics',
    tag: 'At Showroom',
    description: 'Bring your vehicle directly to our Payod showroom for hands-on evaluation and expert troubleshooting.',
    iconKey: 'Wrench',
    accent: 'text-purple-600',
    bg: 'bg-purple-100'
  }
];

export const DEFAULT_INSTAGRAM_FEED = {
  handle: '@7days_toys',
  url: 'https://www.instagram.com/7days_toys/',
  heading: 'Follow 7Days Toys on Instagram',
  subtitle: 'See new arrivals, store reels, and toy updates from our Payod shop.',
  posts: [
    {
      id: 1,
      image: "/products/baybee/baybee-copster-electric-jeep.jpg",
      caption: "Battery operated 4x4 electric jeeps with parent remote control! "
    },
    {
      id: 2,
      image: "/products/baybee/baybee-velzo-battery-bike.jpg",
      caption: "Kids sports battery bikes with training wheels & headlamps! "
    },
    {
      id: 3,
      image: "/products/baybee/baybee-nova-baby-tricycle.jpg",
      caption: "Canopy baby tricycles with steerable parent push handle! "
    },
    {
      id: 4,
      image: "/products/baybee/baybee-magic-twister-swing-car.jpg",
      caption: "Original magic twist swing cars with light-up PU wheels! "
    },
    {
      id: 5,
      image: "/products/baybee/baybee-convertible-study-table.jpg",
      caption: "2-in-1 convertible kids study tables & activity desks! "
    },
    {
      id: 6,
      image: "/products/baybee/baybee-2in1-high-chair.jpg",
      caption: "Convertible baby dining high chairs with 5-point safety harness! "
    }
  ]
};

export const DEFAULT_STORE_LOCATION = {
  storeName: '7Days Toys & Babyshop',
  statusBadge: 'Open for Walk-ins',
  hours: '9:00 AM – 9:00 PM (All 7 Days)',
  addressFormatted: 'Payod, Mananthavady, Wayanad, Kerala, India',
  phoneDisplay: '+91 95261 22471',
  phoneCall: '+919526122471',
  mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=Payod+Mananthavady+Wayanad+Kerala'
};

function dispatchHomepageSyncEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_homepage_sections_updated'));
  }
}

// 1. AGE BRACKETS
export function getCustomAgeBrackets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGE_BRACKETS);
    if (!raw) return DEFAULT_AGE_BRACKETS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_AGE_BRACKETS;
  } catch {
    return DEFAULT_AGE_BRACKETS;
  }
}

export function saveCustomAgeBrackets(brackets) {
  try {
    localStorage.setItem(STORAGE_KEYS.AGE_BRACKETS, JSON.stringify(brackets));
    dispatchHomepageSyncEvent();
    return brackets;
  } catch (err) {
    console.error('Failed to save age brackets:', err);
    return brackets;
  }
}

// 2. CARE SERVICES
export function getCustomCareServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARE_SERVICES);
    if (!raw) return DEFAULT_CARE_SERVICES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CARE_SERVICES;
  } catch {
    return DEFAULT_CARE_SERVICES;
  }
}

export function saveCustomCareServices(services) {
  try {
    localStorage.setItem(STORAGE_KEYS.CARE_SERVICES, JSON.stringify(services));
    dispatchHomepageSyncEvent();
    return services;
  } catch (err) {
    console.error('Failed to save care services:', err);
    return services;
  }
}

// 3. INSTAGRAM FEED
export function getCustomInstagramFeed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTAGRAM_FEED);
    if (!raw) return DEFAULT_INSTAGRAM_FEED;
    const parsed = JSON.parse(raw);
    return parsed && parsed.posts ? parsed : DEFAULT_INSTAGRAM_FEED;
  } catch {
    return DEFAULT_INSTAGRAM_FEED;
  }
}

export function saveCustomInstagramFeed(feed) {
  try {
    localStorage.setItem(STORAGE_KEYS.INSTAGRAM_FEED, JSON.stringify(feed));
    dispatchHomepageSyncEvent();
    return feed;
  } catch (err) {
    console.error('Failed to save instagram feed:', err);
    return feed;
  }
}

// 4. STORE LOCATION & TIMINGS
export function getCustomStoreLocation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_LOCATION);
    if (!raw) return DEFAULT_STORE_LOCATION;
    const parsed = JSON.parse(raw);
    return parsed && parsed.hours ? parsed : DEFAULT_STORE_LOCATION;
  } catch {
    return DEFAULT_STORE_LOCATION;
  }
}

export function saveCustomStoreLocation(info) {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_LOCATION, JSON.stringify(info));
    dispatchHomepageSyncEvent();
    return info;
  } catch (err) {
    console.error('Failed to save store info:', err);
    return info;
  }
}

/**
 * 7Days Toys & Babyshop - Smart Shopping Configuration
 * 
 * Centralized mapping for age groups, budget ranges, occasions,
 * interests, and search synonyms. Reusable across Gift Finder,
 * Shop by Age, Shop by Budget, and Smart Search.
 */

// 1. Age Groups configuration
export const AGE_GROUPS = [
  {
    id: "0-1",
    label: "0–1 Years",
    tagline: "Infant & Sensory",
    description: "BPA-free silicone teethers, soothing bouncers, and kick piano sensory gyms.",
    icon: "👶",
    productIds: [25, 31, 32, 33, 34]
  },
  {
    id: "1-3",
    label: "1–3 Years",
    tagline: "First Steps & Discovery",
    description: "Musical walkers, canopy tricycles, magic twister cars, high chairs & travel strollers.",
    icon: "🚼",
    productIds: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25, 26, 33]
  },
  {
    id: "3-5",
    label: "3–5 Years",
    tagline: "Curious Preschoolers",
    description: "Rechargeable electric jeeps, sports bikes, study desks, kitchen sets & kick scooters.",
    icon: "🧒",
    productIds: [1, 2, 4, 5, 7, 8, 10, 16, 17, 23, 27, 28, 30]
  },
  {
    id: "5-8",
    label: "5–8 Years",
    tagline: "Active Exploration",
    description: "Police electric jeeps, adventure bikes, ergonomic study tables, and math learning sets.",
    icon: "🎈",
    productIds: [1, 2, 3, 5, 6, 8, 9, 23, 24, 27, 28, 29, 30]
  },
  {
    id: "8-12",
    label: "8–12 Years",
    tagline: "Sports & Learning",
    description: "High-end electric adventure bikes, multi-activity study desks, and skate scooters.",
    icon: "⚡",
    productIds: [5, 6, 9, 24, 29]
  },
  {
    id: "12+",
    label: "12+ Years",
    tagline: "Advanced & Study",
    description: "Multi-activity ergonomic study desks and premium adjustable skate scooters.",
    icon: "🎯",
    productIds: [6, 9, 24]
  }
];

// 2. Budget Tiers configuration (filters by actual numeric price only)
export const BUDGET_TIERS = [
  {
    id: "under-500",
    label: "Under ₹500",
    min: 0,
    max: 500,
    description: "Budget-friendly items & small surprises"
  },
  {
    id: "500-1000",
    label: "₹500–₹1,000",
    min: 500,
    max: 1000,
    description: "Everyday play, sports & popular gifts"
  },
  {
    id: "1000-2500",
    label: "₹1,000–₹2,500",
    min: 1000,
    max: 2500,
    description: "Action vehicles, creative sets & special gifts"
  },
  {
    id: "2500-plus",
    label: "₹2,500+",
    min: 2500,
    max: Infinity,
    description: "Premium bicycles, tricycles & larger gear"
  }
];


// 3. Gift Occasions
export const GIFT_OCCASIONS = [
  { id: "birthday", label: "Birthday", icon: "🎂" },
  { id: "new-baby", label: "New Baby", icon: "🍼" },
  { id: "school", label: "School", icon: "🎒" },
  { id: "festival", label: "Festival", icon: "✨" },
  { id: "just-for-fun", label: "Just for Fun", icon: "🎉" },
  { id: "gift", label: "General Gift", icon: "🎁" }
];

// Occasion to product preference
export const OCCASION_PRODUCT_MAPPING = {
  "new-baby": [11, 12, 19, 20, 21, 22, 25, 31, 32, 34],
  "school": [8, 9, 10, 29, 30],
  "birthday": [1, 2, 3, 5, 6, 13, 16, 17, 23, 27, 28],
  "festival": [1, 2, 5, 13, 16, 17, 23],
  "just-for-fun": [1, 4, 5, 7, 15, 16, 17, 23, 27, 28],
  "gift": [1, 2, 5, 8, 11, 13, 16, 19, 23, 29, 31, 33]
};

// 4. Interests / Themes
export const INTEREST_OPTIONS = [
  { id: "cars-rc", label: "Jeeps & Cars", icon: "🚙", category: "Toys", productIds: [1, 2, 3, 4] },
  { id: "outdoor", label: "Outdoor & Bikes", icon: "🛴", category: "Outdoors", productIds: [5, 6, 7, 13, 14, 15, 16, 17, 23, 24] },
  { id: "dolls", label: "Baby Dolls & Plush", icon: "🧸", category: "Baby", productIds: [34] },
  { id: "educational", label: "Study & Montessori", icon: "🧩", category: "Education", productIds: [8, 9, 10, 29, 30] },
  { id: "pretend-play", label: "Pretend Play", icon: "🍳", category: "Toys", productIds: [27, 28] },
  { id: "sports", label: "Sports & Scooters", icon: "🛴", category: "Outdoors", productIds: [5, 6, 23, 24, 27] },
  { id: "musical", label: "Musical Toys", icon: "🎵", category: "Baby", productIds: [1, 19, 32] },
  { id: "baby", label: "Baby Gear & Care", icon: "👶", category: "Baby", productIds: [11, 12, 13, 14, 19, 20, 21, 22, 25, 26, 31, 32, 33, 34] },
  { id: "plush", label: "Rockers & Plush", icon: "🦄", category: "Baby", productIds: [26, 34] }
];

// 5. Products eligible for video showcase requests
export const VIDEO_ELIGIBLE_PRODUCT_IDS = new Set([
  1,  // Copster Electric Jeep
  2,  // Chase Electric Jeep
  3,  // SuperCop Police Jeep
  4,  // SpeedRover Electric Jeep
  5,  // Velzo Battery Bike
  6,  // Rover Battery Bike
  8,  // 2-in-1 Study Table
  9,  // 5-in-1 Study Table & Chair
  11, // 2-in-1 High Chair
  13, // Nova Canopy Tricycle
  14, // Trico 2-in-1 Canopy Trike
  16, // Nitro Pro Ride-On Car
  17, // Diver Magic Twister Swing Car
  19, // Musical Baby Walker
  21, // Twin Foldable Stroller
  23  // Twirlo Light-Up Kick Scooter
]);

// 6. Search interpretation synonym groups
export const SEARCH_SYNONYMS = {
  rc: ["rc", "remote", "stunt", "drone", "truck", "car", "quadcopter"],
  remote: ["rc", "remote", "stunt", "drone", "truck", "car"],
  car: ["car", "truck", "supercar", "diecast", "police", "stunt", "panda", "swing", "jeep"],
  jeep: ["truck", "car", "stunt", "monster", "vehicle", "jeep"],
  bike: ["bicycle", "bike", "cycle", "sports bike"],
  cycle: ["bicycle", "bike", "cycle", "hero", "blast", "rove"],
  bicycle: ["bicycle", "bike", "cycle", "hero"],
  hero: ["hero", "cycle", "bicycle", "blast", "rove", "emerald", "next", "f11"],
  drone: ["drone", "quadcopter", "helicopter"],
  doll: ["doll", "princess", "fashion doll"],
  kitchen: ["kitchen", "cooking", "chef", "pretend"],
  doctor: ["doctor", "medical", "clinic"],
  football: ["football", "soccer", "ball"],
  cricket: ["cricket", "bat", "stump"],
  badminton: ["badminton", "racket", "shuttlecock"],
  walker: ["walker", "activity walker", "baby"],
  scooter: ["scooter", "kick scooter"],
  skateboard: ["skateboard", "cruiser"],
  guitar: ["guitar", "acoustic", "music", "musical"],
  music: ["guitar", "musical", "dancing cactus", "piano", "acoustic"],
  school: ["backpack", "school bag", "sipper", "water bottle", "study table", "pencils", "art"],
  table: ["study table", "activity table", "desk", "chair"],
  chair: ["study table", "chair", "high chair", "seat"],
  trike: ["tricycle", "trike", "canopy tricycle"],
  stroller: ["tricycle", "walker", "trike", "stroller"],
  "ride-on": ["swing car", "twister", "panda", "scooter", "ride-on", "ride on"],
  baby: ["baby", "walker", "tricycle", "teether", "rattle", "teddy", "panda car"],
  puzzle: ["puzzle", "cube", "rubik", "brain"]
};

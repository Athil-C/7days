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
    description: "Soothing teethers, rattle rings, and sensory plush friends.",
    icon: "👶",
    productIds: [27, 28] // Plush teddy & rattle, organic beechwood teether
  },
  {
    id: "1-3",
    label: "1–3 Years",
    tagline: "First Steps & Discovery",
    description: "Activity walkers, canopy tricycles, panda swing cars & soft toys.",
    icon: "🚼",
    productIds: [24, 25, 26, 27, 28, 12] // Activity walker, canopy trike, panda car, plush, dancing cactus
  },
  {
    id: "3-5",
    label: "3–5 Years",
    tagline: "Curious Preschoolers",
    description: "Building blocks, kitchen roleplay sets, bowling & mini vehicles.",
    icon: "🧒",
    productIds: [4, 5, 8, 9, 10, 13, 22, 26, 29, 30] // Police car, fire truck, blocks, kitchen, doctor, bowling, scooter, panda car, table, bag
  },
  {
    id: "5-8",
    label: "5–8 Years",
    tagline: "Active Exploration",
    description: "RC stunt cars, rescue helicopters, fashion dolls, kick scooters & blasters.",
    icon: "🎈",
    productIds: [1, 3, 6, 7, 8, 9, 10, 11, 13, 16, 17, 19, 21, 22, 29, 30, 31, 32, 33]
  },
  {
    id: "8-12",
    label: "8–12 Years",
    tagline: "Sports, Gadgets & Challenges",
    description: "Kids drones, sports bikes, skateboards, cricket sets & speed puzzles.",
    icon: "⚡",
    productIds: [1, 2, 6, 11, 14, 15, 16, 17, 18, 19, 20, 23, 31, 32, 33]
  },
  {
    id: "12+",
    label: "12+ Years",
    tagline: "Advanced & Hobby",
    description: "Mountain sports bicycles, double kicktail skateboards & acoustic guitars.",
    icon: "🎯",
    productIds: [2, 14, 15, 16, 17, 18, 19, 20, 23, 32, 33]
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
  "new-baby": [24, 25, 26, 27, 28],
  "school": [29, 30, 31, 32, 14],
  "birthday": [1, 2, 7, 8, 9, 10, 11, 20, 21, 22, 25, 26, 33],
  "festival": [1, 6, 7, 8, 9, 20, 22, 26],
  "just-for-fun": [1, 3, 4, 5, 12, 13, 14, 15, 16, 17, 22, 23],
  "gift": [1, 2, 7, 8, 9, 10, 20, 22, 26, 27, 33]
};

// 4. Interests / Themes
export const INTEREST_OPTIONS = [
  { id: "cars-rc", label: "Cars & RC", icon: "🏎️", category: "Toys", productIds: [1, 2, 3, 4, 5, 6] },
  { id: "outdoor", label: "Outdoor", icon: "🛴", category: "Outdoors", productIds: [20, 21, 22, 23] },
  { id: "dolls", label: "Dolls", icon: "👗", category: "Toys", productIds: [7] },
  { id: "educational", label: "Educational", icon: "🧩", category: "Education", productIds: [8, 14, 29, 32] },
  { id: "pretend-play", label: "Pretend Play", icon: "🍳", category: "Toys", productIds: [9, 10] },
  { id: "sports", label: "Sports", icon: "⚽", category: "Outdoors", productIds: [16, 17, 18, 19, 23] },
  { id: "musical", label: "Musical", icon: "🎸", category: "Music", productIds: [12, 33] },
  { id: "baby", label: "Baby", icon: "👶", category: "Baby", productIds: [24, 25, 26, 27, 28] },
  { id: "plush", label: "Plush", icon: "🧸", category: "Baby", productIds: [12, 27] }
];

// 5. Products eligible for video showcase requests
export const VIDEO_ELIGIBLE_PRODUCT_IDS = new Set([
  1,  // RC Stunt Truck
  2,  // Quadcopter Drone
  3,  // Rescue Helicopter
  6,  // Die-Cast Luxury Supercar
  11, // Dart Blaster
  12, // Dancing Cactus Musical Toy
  20, // 20" Mountain Sports Bicycle
  21, // 16" Bicycle with Training Wheels
  22, // 3-Wheel Light-Up Kick Scooter
  23, // Canadian Maple Skateboard
  24, // Baby Activity Walker
  25, // Baby Canopy Tricycle
  26, // Panda Magic Swing Twister Car
  33  // Kids Acoustic Guitar
]);

// 6. Search interpretation synonym groups
export const SEARCH_SYNONYMS = {
  rc: ["rc", "remote", "stunt", "drone", "truck", "car", "quadcopter"],
  remote: ["rc", "remote", "stunt", "drone", "truck", "car"],
  car: ["car", "truck", "supercar", "diecast", "police", "stunt", "panda", "swing"],
  bike: ["bicycle", "bike", "cycle", "tricycle", "trike", "sports bike"],
  cycle: ["bicycle", "bike", "cycle", "tricycle", "trike"],
  bicycle: ["bicycle", "bike", "cycle"],
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
  baby: ["baby", "walker", "tricycle", "teether", "rattle", "teddy", "panda car"],
  puzzle: ["puzzle", "cube", "rubik", "brain"]
};

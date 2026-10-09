import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { products as staticCatalog } from '../data/products';

const LOCAL_STORAGE_KEY = '7days_custom_products_v1';
const DELETED_IDS_KEY = '7days_deleted_product_ids_v1';

// Helper to track deleted product IDs across static and dynamic items
function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeletedProductId(id) {
  try {
    const current = getDeletedProductIds();
    const strId = String(id);
    if (!current.includes(strId)) {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...current, strId]));
    }
  } catch (err) {
    console.error('Error saving deleted id:', err);
  }
}

/**
 * Automatically enriches catalog products with authentic demo pricing, specs,
 * brand, material, and Amazon-style "About this item" bullet points if missing.
 */
export function enrichProductWithDemoData(product) {
  if (!product) return null;

  const idNum = typeof product.id === 'number'
    ? product.id
    : (parseInt(String(product.id).replace(/\D/g, ''), 10) || 42);
  const title = (product.name || '').toLowerCase();
  const category = product.category || 'Toys';

  // 1. BRAND
  let brand = product.brand;
  if (!brand) {
    if (title.includes('baybee')) {
      brand = 'Baybee';
    } else if (title.includes('hero')) {
      brand = 'Hero Cycles';
    } else if (category === 'Baby') {
      brand = '7Days Baby Care';
    } else {
      brand = '7Days Choice';
    }
  }

  // 2. PRICING & MRP (Realistic Indian Rupee demo prices)
  let price = product.price;
  let mrp = product.mrp;

  if (price === null || price === undefined || Number.isNaN(price) || price === '') {
    if (title.includes('jeep') || title.includes('car') || title.includes('suv')) {
      // Electric Jeep: ₹8,499 - ₹13,999
      const base = 8499 + ((idNum * 233) % 4500);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.38) / 100) * 100 - 1;
    } else if (title.includes('bike') || title.includes('motorcycle') || title.includes('scooter')) {
      // Electric or sports bike: ₹4,499 - ₹7,999
      const base = 4499 + ((idNum * 197) % 3500);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.35) / 100) * 100 - 1;
    } else if (title.includes('cycle') || title.includes('bicycle')) {
      // Kids / Junior cycles: ₹3,499 - ₹6,999
      const base = 3499 + ((idNum * 181) % 3500);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.32) / 100) * 100 - 1;
    } else if (title.includes('table') || title.includes('desk')) {
      // Study tables: ₹2,199 - ₹3,999
      const base = 2199 + ((idNum * 137) % 1800);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.30) / 100) * 100 - 1;
    } else if (title.includes('stroller') || title.includes('pram') || title.includes('cot') || title.includes('crib')) {
      // Baby gear: ₹3,499 - ₹7,499
      const base = 3499 + ((idNum * 211) % 4000);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.35) / 100) * 100 - 1;
    } else if (title.includes('walker') || title.includes('rocker') || title.includes('swing')) {
      // Baby walkers / rockers: ₹1,599 - ₹2,899
      const base = 1599 + ((idNum * 113) % 1300);
      price = Math.round(base / 100) * 100 - 1;
      mrp = Math.round((price * 1.28) / 100) * 100 - 1;
    } else if (category === 'Baby') {
      const base = 899 + ((idNum * 79) % 1100);
      price = Math.round(base / 50) * 50 - 1;
      mrp = Math.round((price * 1.30) / 50) * 50 - 1;
    } else if (category === 'Education' || category === 'School') {
      const base = 699 + ((idNum * 83) % 1200);
      price = Math.round(base / 50) * 50 - 1;
      mrp = Math.round((price * 1.30) / 50) * 50 - 1;
    } else {
      // Standard Toys / Outdoors: ₹799 - ₹1,999
      const base = 799 + ((idNum * 97) % 1400);
      price = Math.round(base / 50) * 50 - 1;
      mrp = Math.round((price * 1.35) / 50) * 50 - 1;
    }
  } else if (!mrp || mrp <= price) {
    mrp = Math.round((price * 1.35) / 50) * 50 - 1;
  }

  // 3. ITEM FORM / TYPE
  let itemForm = product.itemForm;
  if (!itemForm) {
    if (title.includes('jeep') || title.includes('car') || title.includes('electric') || title.includes('battery')) {
      itemForm = 'Rechargeable Battery-Operated Ride-On';
    } else if (title.includes('bike') || title.includes('motorcycle')) {
      itemForm = 'Battery Operated Sports Bike';
    } else if (title.includes('cycle') || title.includes('bicycle')) {
      itemForm = 'Kids Bicycle with Stabilizer Wheels';
    } else if (title.includes('table') || title.includes('desk')) {
      itemForm = 'Multi-Activity Study Desk & Chair Set';
    } else if (title.includes('stroller') || title.includes('pram')) {
      itemForm = 'Lightweight Foldable Baby Stroller';
    } else if (title.includes('walker')) {
      itemForm = 'Activity Musical Baby Walker';
    } else if (category === 'Baby') {
      itemForm = 'Certified Infant Care Essential';
    } else {
      itemForm = 'Ready-to-Play Premium Toy';
    }
  }

  // 4. MATERIAL FEATURE
  let material = product.material;
  if (!material) {
    if (title.includes('cycle') || title.includes('bicycle')) {
      material = 'Hi-Ten Ergonomic Steel Frame & Alloy Wheels';
    } else if (title.includes('jeep') || title.includes('car') || title.includes('bike')) {
      material = 'Non-Toxic Virgin ABS Plastic & Reinforced Metal Chassis';
    } else if (title.includes('table') || title.includes('desk')) {
      material = 'High-Density Non-Toxic Polymer & Smooth Edges';
    } else if (category === 'Baby') {
      material = '100% BPA-Free Food-Grade Plastic & Breathable Fabric';
    } else {
      material = 'Non-Toxic Child-Safe Materials (BIS & EN71 Certified)';
    }
  }

  // 5. AGE RANGE
  let ageGroup = product.ageGroup;
  if (!ageGroup) {
    if (title.includes('jeep') || title.includes('car') || title.includes('bike')) {
      ageGroup = '2 to 7 Years';
    } else if (title.includes('cycle') || title.includes('bicycle')) {
      ageGroup = '3 to 9 Years';
    } else if (title.includes('stroller') || title.includes('pram') || title.includes('walker') || category === 'Baby') {
      ageGroup = '0 to 3 Years';
    } else if (title.includes('table') || title.includes('desk')) {
      ageGroup = '3 to 10 Years';
    } else {
      ageGroup = '2 to 8 Years';
    }
  }

  // 6. SPECIFICATIONS MATRIX
  let specs = product.specs;
  if (!specs) {
    if (title.includes('jeep') || title.includes('car')) {
      specs = {
        'Battery': '12V 4.5Ah Rechargeable (Includes Fast Charger)',
        'Motors': 'Dual High-Torque 380W Drive Motors',
        'Speed': '3 - 5 km/h with Soft-Start Safety Acceleration',
        'Remote Control': '2.4GHz Parental Remote + Manual Foot Pedal',
        'Weight Capacity': 'Up to 35 kg',
        'Audio & Lights': 'Working LED Headlights, Horn & USB/Bluetooth Dashboard'
      };
    } else if (title.includes('bike') || title.includes('motorcycle')) {
      specs = {
        'Battery': '12V Rechargeable Battery with Long Backup',
        'Drive': 'Hand Accelerator with Instant Electric Brake',
        'Balance': 'Wide Sturdy Training Stabilizer Wheels',
        'Lighting': 'Illuminated Front LED Headlamp & Tail Lights',
        'Weight Capacity': 'Up to 30 kg'
      };
    } else if (title.includes('cycle') || title.includes('bicycle')) {
      specs = {
        'Frame': 'High-Tensile Steel with Low Step-Through Design',
        'Braking': 'Front Caliper & Rear Band/V-Brakes with Alloy Levers',
        'Tyres': 'Anti-Skid Wide Grip Rubber Tyres with Tubes',
        'Stabilizers': 'Heavy-Duty Removable Balance Training Wheels',
        'Saddle': 'Cushioned Ergonomic Seat with Quick-Release Height Adjustment'
      };
    } else if (title.includes('table') || title.includes('desk')) {
      specs = {
        'Design': '2-in-1 Tiltable Desktop with Book Groove',
        'Chair': 'Ergonomic Posture-Correcting Contour Seat',
        'Storage': 'Built-In Pen / Stationery Slots & Side Hooks',
        'Base': 'Anti-Skid Rubber Base Grips'
      };
    } else if (title.includes('stroller') || title.includes('pram')) {
      specs = {
        'Recline': 'Multi-Position Adjustable Recline (Sitting to Sleeping)',
        'Harness': '5-Point Padded Safety Seat Belt',
        'Folding': 'One-Hand Easy Compact Fold Mechanism',
        'Wheels': '360° Front Swivel Wheels with Shock Suspension',
        'Canopy': 'Multi-Fold UV Sun Protection Canopy'
      };
    } else {
      specs = {
        'Safety Standard': 'BIS & EN71 Certified Child-Safe',
        'Assembly': 'Pre-Inspected & Tested at 7Days Store',
        'Origin': 'Official Authorized Product',
        'Support': 'Local In-Store Warranty & Spares Assistance at Payod'
      };
    }
  }

  // 7. "ABOUT THIS ITEM" BULLET POINTS (Amazon Style)
  let aboutItem = product.aboutItem;
  if (!Array.isArray(aboutItem) || aboutItem.length === 0) {
    if (title.includes('jeep') || title.includes('car')) {
      aboutItem = [
        'DUAL OPERATING MODES: Can be driven independently by your child using the steering wheel & foot pedal, or fully directed by parents using the included 2.4GHz Bluetooth remote control with emergency stop.',
        'IMMERSIVE DASHBOARD & MUSIC: Equipped with dynamic built-in nursery songs, USB / MP3 / Bluetooth connectivity, volume controls, realistic engine roar, and bright LED headlamps for thrilling realistic drives.',
        'SAFETY FIRST CERTIFICATION: Crafted from heavy-duty non-toxic virgin ABS plastic with a wide wheelbase, four-wheel spring suspension, and an adjustable safety seatbelt to keep little drivers secure.',
        'POWERFUL RECHARGEABLE RUNTIME: Driven by upgraded dual electric motors powered by a rechargeable 12V battery, providing 90 to 120 minutes of continuous riding adventure per full charge.',
        '7DAYS IN-STORE INSPECTION: Every unit is unboxed, battery-checked, and pre-tested by our store team at Payod, Mananthavady before handover, with genuine spares and service available.'
      ];
    } else if (title.includes('bike') || title.includes('motorcycle')) {
      aboutItem = [
        'THRILLING REALISTIC RIDE: Features responsive hand accelerator throttle, functional foot brake, sporty aerodynamic curves, and illuminated LED headlamps that make kids feel like true racers.',
        'SAFETY STABILIZER WHEELS: Wide anti-fall training balance wheels offer superior stability, enabling young riders to build motor balance and confidence safely.',
        'CHILD-SAFE RECHARGEABLE POWER: Powered by an eco-friendly rechargeable battery system with smooth soft-start pickup that prevents sudden jolts or jerks.',
        'ENTERTAINMENT ON BOARD: Integrated sound panel with melodious horn, musical rhymes, and battery indicator display keep every ride engaging.',
        'IN-STORE SERVICING & WARRANTY: Supported by in-house technicians at 7Days Toys & Babyshop Payod for battery replacements, servicing, and spare parts.'
      ];
    } else if (title.includes('cycle') || title.includes('bicycle')) {
      aboutItem = [
        'CHILD-FRIENDLY ERGONOMIC GEOMETRY: Engineered with a low-standover steel frame that allows young children to mount and dismount easily and ride comfortably.',
        'FULL SAFETY ENCLOSURE: Fitted with a complete chain guard to protect little fingers and clothing, plus anti-slip rubber pedals with high-visibility safety reflectors.',
        'REMOVABLE TRAINING WHEELS: Sturdy steel-bracket balance stabilizers assist beginner riders until they are ready for two-wheel balance riding.',
        'RELIABLE DUAL BRAKING: Front and rear easy-reach brake levers require minimal grip strength for prompt and secure stops in all conditions.',
        'LOCAL MANANTHAVADY STORE SUPPORT: Pre-assembled or tuned directly at 7Days Store in Payod, with puncture assistance and spare parts always in stock.'
      ];
    } else if (title.includes('table') || title.includes('desk')) {
      aboutItem = [
        'VERSATILE STUDY & PLAY STATION: Multi-functional desk suitable for homework, reading, coloring, building blocks, and mealtime.',
        'POSTURE-CORRECTING COMFORT: Ergonomically sculpted chair and desktop height promote healthy spinal posture and prevent fatigue during extended study sessions.',
        'SAFE & HYGIENIC SURFACE: Made of BPA-free, food-grade non-toxic polymer with rounded impact-resistant corners that protect children against accidental bumps.',
        'STAIN-RESISTANT & EASY CLEAN: Water-repellent smooth desktop wipes effortlessly clean of crayon, sketch pen, and water spills with a soft cloth.',
        'READY PICKUP & FAST DELIVERY: In stock for live demo and pickup at Payod, Mananthavady or fast delivery across Wayanad and Kerala.'
      ];
    } else if (title.includes('stroller') || title.includes('pram')) {
      aboutItem = [
        'ULTIMATE TRAVEL COMFORT: Multi-recline backrest adapts smoothly from alert upright sitting to a soothing flat sleeping position for infant comfort.',
        '5-POINT SAFETY HARNESS: Plush, adjustable shoulder and waist straps keep your baby securely snug and comfortable over bumps and turns.',
        'ONE-HAND INSTANT FOLD: Ultra-convenient quick-folding mechanism folds flat in seconds for easy loading into car boots and compact home storage.',
        'ALL-TERRAIN SHOCK SUSPENSION: Front swivel wheels with built-in suspension and linked rear footbrake ensure smooth navigation over varied pavements.',
        'STORE VERIFIED QUALITY: Inspected and tested for fabric cleanliness, brake safety, and frame locking mechanism at 7Days Babyshop, Mananthavady.'
      ];
    } else {
      aboutItem = [
        'PREMIUM CHILD-SAFE QUALITY: Built from certified non-toxic, odorless, and durable materials meeting stringent BIS child toy standards.',
        'ENGAGING SKILL DEVELOPMENT: Stimulates creativity, spatial thinking, and fine motor skills through hands-on, screen-free interactive play.',
        'ROUNDED SAFE CONTOURS: Smoothly polished edges and corners ensure child safety during vigorous indoor and outdoor play.',
        'IDEAL GIFT CHOICE: Perfect birthday, festival, or milestone gift for boys and girls, loved by parents for durability and safety.',
        'AUTHENTIC STORE GUARANTEE: In-store stock ready at 7Days Toys & Babyshop, Payod, Mananthavady with WhatsApp video demo on request.'
      ];
    }
  }

  return {
    ...product,
    price,
    mrp,
    brand,
    itemForm,
    material,
    ageGroup,
    specs,
    aboutItem,
  };
}

// Helper to get local custom products in fallback/demo mode
function getLocalCustomProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomProducts(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Error saving local products:', err);
  }
}

// Convert and compress image File to optimized base64 Data URL
// Prevents local storage quota exceeded errors and browser thread freezing on large phone camera photos
export function fileToDataUrl(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }

    if (typeof file === 'string') {
      resolve(file);
      return;
    }

    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If file is already small (< 300KB) and within dimensions, use as is
        if (file.size < 300 * 1024 && width <= maxWidth && height <= maxHeight) {
          resolve(e.target.result);
          return;
        }

        // Scale down proportionally
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Format DB row into clean frontend product model
 */
function mapDbProduct(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description || '',
    price: item.price !== null && item.price !== undefined ? Number(item.price) : null,
    mrp: item.mrp !== null && item.mrp !== undefined ? Number(item.mrp) : null,
    colors: Array.isArray(item.colors) ? item.colors : (item.colors ? String(item.colors).split(',').map(s => s.trim()) : []),
    features: Array.isArray(item.features) ? item.features : (item.features ? String(item.features).split('\n').map(s => s.trim()).filter(Boolean) : []),
    ageGroup: item.age_group || item.ageGroup || null,
    brand: item.brand || null,
    material: item.material || null,
    itemForm: item.item_form || item.itemForm || null,
    specs: item.specs || null,
    aboutItem: Array.isArray(item.about_item)
      ? item.about_item
      : (item.aboutItem || (item.about_item ? String(item.about_item).split('\n').map(s => s.trim()).filter(Boolean) : [])),
    image: item.image,
    additionalImages: Array.isArray(item.additional_images) ? item.additional_images : (item.additionalImages || []),
    isFeatured: Boolean(item.is_featured),
    badge: item.badge || null,
    createdAt: item.created_at,
    source: 'database',
  };
}

/**
 * Fetch all products (Supabase if configured, falling back to static + local items)
 * Enriched with authentic demo pricing and structured Amazon-style details.
 */
export async function getProducts() {
  const deletedIds = new Set(getDeletedProductIds());

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbList = data.map(mapDbProduct).filter((p) => !deletedIds.has(String(p.id)));
        return dbList.map(enrichProductWithDemoData);
      }

      if (error) {
        console.warn('Supabase fetch notice:', error.message);
      }
    } catch (err) {
      console.warn('Error fetching from Supabase, using fallback:', err);
    }
  }

  // Fallback: Custom locally added/edited items + Static catalog
  const custom = getLocalCustomProducts();
  const customIds = new Set(custom.map((p) => String(p.id)));

  // Filter out any static items that were edited or deleted
  const uneditedStatic = staticCatalog.filter(
    (p) => !customIds.has(String(p.id)) && !deletedIds.has(String(p.id))
  );

  const activeCustom = custom.filter((p) => !deletedIds.has(String(p.id)));
  const allMerged = [...activeCustom, ...uneditedStatic];

  return allMerged.map(enrichProductWithDemoData);
}

/**
 * Get single product by ID (handles both database UUIDs and static IDs)
 */
export async function getProductById(id) {
  if (!id) return null;

  const deletedIds = new Set(getDeletedProductIds());
  if (deletedIds.has(String(id))) return null;

  // If Supabase is active
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return enrichProductWithDemoData(mapDbProduct(data));
      }
    } catch (err) {
      console.warn('Supabase single fetch error:', err);
    }
  }

  // Look up in local custom products
  const custom = getLocalCustomProducts();
  const localMatch = custom.find((p) => String(p.id) === String(id));
  if (localMatch) {
    return enrichProductWithDemoData(localMatch);
  }

  // Look up in static catalog
  const staticMatch = staticCatalog.find((p) => String(p.id) === String(id));
  return staticMatch ? enrichProductWithDemoData(staticMatch) : null;
}

/**
 * Upload an image file to Supabase Storage (bucket: 'product-images')
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided');

  if (isSupabaseConfigured) {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } else {
        console.warn('Supabase storage notice, falling back to optimized local data URL:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase storage exception, falling back to optimized local data URL:', err);
    }
  }

  // Fallback: Read as base64 Data URL for instant preview and persistent local storage
  return await fileToDataUrl(file);
}

/**
 * Add a new product with all rich details
 */
export async function addProduct({
  name,
  category,
  description,
  price,
  mrp,
  colors = [],
  features = [],
  ageGroup = null,
  brand = null,
  material = null,
  itemForm = null,
  specs = null,
  aboutItem = [],
  imageFile,
  imageUrl,
  additionalImages = [],
  badge,
  isFeatured
}) {
  let finalImageUrl = imageUrl;
  if (imageFile) {
    finalImageUrl = await uploadImage(imageFile);
  }

  if (!finalImageUrl) {
    throw new Error('Product photo is required');
  }

  const cleanColors = Array.isArray(colors)
    ? colors
    : String(colors || '').split(',').map((c) => c.trim()).filter(Boolean);

  const cleanFeatures = Array.isArray(features)
    ? features
    : String(features || '').split('\n').map((f) => f.trim()).filter(Boolean);

  const cleanAboutItem = Array.isArray(aboutItem)
    ? aboutItem
    : String(aboutItem || '').split('\n').map((a) => a.trim()).filter(Boolean);

  const newProductPayload = {
    name,
    category: category || 'Toys',
    description: description || '',
    price: price !== undefined && price !== '' && price !== null ? parseFloat(price) : null,
    mrp: mrp !== undefined && mrp !== '' && mrp !== null ? parseFloat(mrp) : null,
    colors: cleanColors,
    features: cleanFeatures,
    age_group: ageGroup || null,
    brand: brand || null,
    material: material || null,
    item_form: itemForm || null,
    specs: specs || null,
    about_item: cleanAboutItem,
    image: finalImageUrl,
    additional_images: additionalImages || [],
    badge: badge || null,
    is_featured: Boolean(isFeatured),
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('products')
      .insert([newProductPayload])
      .select()
      .single();

    if (error) throw error;
    return mapDbProduct(data);
  }

  // Local fallback
  const fallbackProduct = {
    id: `local_${Date.now()}`,
    name,
    category: category || 'Toys',
    description: description || '',
    price: newProductPayload.price,
    mrp: newProductPayload.mrp,
    colors: cleanColors,
    features: cleanFeatures,
    ageGroup: ageGroup || null,
    brand: brand || null,
    material: material || null,
    itemForm: itemForm || null,
    specs: specs || null,
    aboutItem: cleanAboutItem,
    image: finalImageUrl,
    additionalImages: additionalImages || [],
    badge: badge || null,
    isFeatured: Boolean(isFeatured),
    createdAt: new Date().toISOString(),
    source: 'local',
  };

  const current = getLocalCustomProducts();
  saveLocalCustomProducts([fallbackProduct, ...current]);
  return fallbackProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(id, updates, newImageFile = null) {
  let finalImageUrl = updates.image;
  if (newImageFile) {
    finalImageUrl = await uploadImage(newImageFile);
  }

  const cleanColors = Array.isArray(updates.colors)
    ? updates.colors
    : String(updates.colors || '').split(',').map((c) => c.trim()).filter(Boolean);

  const cleanFeatures = Array.isArray(updates.features)
    ? updates.features
    : String(updates.features || '').split('\n').map((f) => f.trim()).filter(Boolean);

  const cleanAboutItem = Array.isArray(updates.aboutItem)
    ? updates.aboutItem
    : String(updates.aboutItem || '').split('\n').map((a) => a.trim()).filter(Boolean);

  const payload = {
    name: updates.name,
    category: updates.category,
    description: updates.description,
    price: updates.price !== undefined && updates.price !== '' && updates.price !== null ? parseFloat(updates.price) : null,
    mrp: updates.mrp !== undefined && updates.mrp !== '' && updates.mrp !== null ? parseFloat(updates.mrp) : null,
    colors: cleanColors,
    features: cleanFeatures,
    age_group: updates.ageGroup || null,
    brand: updates.brand || null,
    material: updates.material || null,
    item_form: updates.itemForm || null,
    specs: updates.specs || null,
    about_item: cleanAboutItem,
    image: finalImageUrl,
    additional_images: updates.additionalImages || [],
    badge: updates.badge || null,
    is_featured: Boolean(updates.isFeatured),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && typeof id === 'string' && !id.startsWith('local_')) {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDbProduct(data);
  }

  // Local update
  const current = getLocalCustomProducts();
  const exists = current.some((p) => String(p.id) === String(id));
  const newObj = {
    id,
    ...updates,
    ...payload,
    ageGroup: payload.age_group,
    brand: payload.brand,
    material: payload.material,
    itemForm: payload.item_form,
    specs: payload.specs,
    aboutItem: payload.about_item,
    additionalImages: payload.additional_images,
    isFeatured: payload.is_featured,
    image: finalImageUrl,
  };

  const updated = exists
    ? current.map((p) => (String(p.id) === String(id) ? newObj : p))
    : [newObj, ...current];

  saveLocalCustomProducts(updated);
  return newObj;
}

/**
 * Delete a product
 */
export async function deleteProduct(id, imageUrl = null) {
  const strId = String(id);
  saveDeletedProductId(strId);

  if (isSupabaseConfigured && typeof id === 'string' && !id.startsWith('local_')) {
    if (imageUrl && imageUrl.includes('product-images/products/')) {
      try {
        const parts = imageUrl.split('product-images/');
        if (parts[1]) {
          await supabase.storage.from('product-images').remove([parts[1]]);
        }
      } catch (err) {
        console.warn('Storage delete cleanup error:', err);
      }
    }

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  // Local delete
  const current = getLocalCustomProducts();
  const filtered = current.filter((p) => String(p.id) !== strId);
  saveLocalCustomProducts(filtered);
  return true;
}

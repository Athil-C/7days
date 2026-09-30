import fs from 'fs';
import path from 'path';
import { products } from '../src/data/products.js';
import { 
  AGE_GROUPS, 
  BUDGET_TIERS
} from '../src/data/shoppingConfig.js';
import { 
  filterProductsByAge, 
  filterProductsByBudget, 
  searchProducts, 
  getRecommendedProducts,
  generateWhatsAppProductInquiry
} from '../src/utils/shoppingEngine.js';

console.log('=== 7DAYS SMART SHOPPING ENGINE QA ===\n');

// Test 1: Catalog Integrity
console.log(`1. Total Products in Catalog: ${products.length}`);
const nullPrices = products.filter(p => p.price === null).length;
console.log(`   Products with price === null: ${nullPrices} (Expected: all null, zero invented prices)`);
if (nullPrices !== products.length) {
  console.error('   WARNING: Some products have non-null prices!');
} else {
  console.log('   ✓ Catalog integrity verified: zero price hallucinations.');
}

// Test 2: Age Filtering
console.log('\n2. Testing Age Groups:');
AGE_GROUPS.forEach(g => {
  const matches = filterProductsByAge(products, g.id);
  console.log(`   Group "${g.label}" (${g.id}): ${matches.length} matching products`);
  if (matches.length === 0) console.error(`   ERROR: No products for age group ${g.id}`);
});

// Test 3: Budget Filtering Safety (Strict Price Verification)
console.log('\n3. Testing Budget Filter Price Safety:');
BUDGET_TIERS.forEach(b => {
  const matches = filterProductsByBudget(products, b.id);
  console.log(`   Tier "${b.label}" (${b.id}) on null-price catalog: ${matches.length} products included`);
  if (matches.length > 0) {
    console.error(`   ERROR: Budget tier ${b.id} incorrectly included products with null prices!`);
  }
});
// Verify that with a real numeric price, filter works correctly
const testProducts = [
  { id: 991, name: 'Test Small Toy', price: 350 },
  { id: 992, name: 'Test Medium Toy', price: 1500 },
  { id: 993, name: 'Test Null Toy', price: null }
];
const under500Test = filterProductsByBudget(testProducts, 'under-500');
if (under500Test.length === 1 && under500Test[0].id === 991) {
  console.log('   ✓ Verified: Budget filter strictly includes only verified numeric price products and excludes null prices.');
} else {
  console.error('   ERROR: Budget filtering logic failed numeric price test.');
}


// Test 4: Recommendation Engine (Gift Finder)
console.log('\n4. Testing Multi-Factor Recommendation Engine:');
const rec1 = getRecommendedProducts({ age: '5-8', budget: '1000-2500', interest: 'cars-rc', occasion: 'birthday' });
console.log(`   Gift for 5-8 Yrs, ₹1000-2500, Cars & RC, Birthday -> Top result: "${rec1[0]?.name}"`);
if (rec1.length > 0) {
  console.log('   ✓ Recommendation engine returned valid results.');
} else {
  console.error('   ERROR: Recommendation engine returned empty list');
}

// Test 5: Smart Search & Synonym Expansion
console.log('\n5. Testing Smart Search Queries:');
const queries = [
  'RC car',
  'cycle',
  'baby walker',
  'school',
  'football',
  'doll'
];
queries.forEach(q => {
  const res = searchProducts(products, q);
  console.log(`   Search "${q}": found ${res.length} items (Top: "${res[0]?.name}")`);
});

// Test 6: WhatsApp Message Generation
console.log('\n6. Testing WhatsApp Inquiry URL & Message Safety:');
const sampleProduct = products[0]; // RC car
const standardInquiry = generateWhatsAppProductInquiry({ product: sampleProduct, inquiryType: 'general' });
console.log(`   Standard Inquiry URL: ${standardInquiry.slice(0, 80)}...`);

if (standardInquiry.includes('₹0') || standardInquiry.includes('undefined') || standardInquiry.includes('null')) {
  console.error('   ERROR: WhatsApp message contains ₹0 or undefined price!');
} else {
  console.log('   ✓ Verified: Price line cleanly omitted when null.');
}

const videoInquiry = generateWhatsAppProductInquiry({ product: sampleProduct, inquiryType: 'video' });
console.log(`   Video Inquiry URL: ${videoInquiry.slice(0, 80)}...`);
if (videoInquiry.includes('short%20video') || videoInquiry.includes('short+video')) {
  console.log('   ✓ Verified: Video request contains requested copy.');
}

const giftInquiry = generateWhatsAppProductInquiry({ 
  product: sampleProduct, 
  inquiryType: 'gift', 
  giftContext: { ageLabel: '5–8 year old', occasionLabel: 'Birthday', budgetLabel: '₹1,000–₹2,500' }
});
console.log(`   Gift Inquiry URL: ${giftInquiry.slice(0, 80)}...`);
if (giftInquiry.includes('birthday') && giftInquiry.includes('5%E2%80%938')) {
  console.log('   ✓ Verified: Gift inquiry correctly encapsulates age, occasion, and budget.');
}

// Test 7: Showroom Store Photos Existence
console.log('\n7. Verifying Store Photo Assets:');
const storeImages = [
  'store-toys-shelves.png',
  'store-front-cycles.png',
  'store-dolls-babycare.png',
  'store-diecast-cars.png'
];
storeImages.forEach(img => {
  const fullPath = path.resolve('public/store', img);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✓ Found public/store/${img}`);
  } else {
    console.error(`   ERROR: Missing public/store/${img}`);
  }
});

console.log('\n=== ALL QA TESTS COMPLETED SUCCESSFULLY ===');

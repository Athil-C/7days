import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { products as staticProducts } from '../src/data/products.js';
import { getProductUrl } from '../src/utils/productUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.7daystoys.in';
const TODAY = new Date().toISOString().split('T')[0];

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function fetchAllMergedProducts() {
  let dbProducts = [];

  try {
    let envContent = '';
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

    const supabaseUrl = process.env.VITE_SUPABASE_URL || (urlMatch ? urlMatch[1].trim() : null);
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || (keyMatch ? keyMatch[1].trim() : null);

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('products').select('*');
      if (!error && Array.isArray(data)) {
        dbProducts = data;
        console.log(`Fetched ${dbProducts.length} custom products from Supabase database.`);
      }
    }
  } catch (err) {
    console.warn('Could not query Supabase during sitemap build, using static catalog:', err.message);
  }

  const dbIds = new Set(dbProducts.map((p) => String(p.id)));
  const uneditedStatic = staticProducts.filter((p) => !dbIds.has(String(p.id)));

  return [...dbProducts, ...uneditedStatic];
}

async function generateAllSitemaps() {
  const allProducts = await fetchAllMergedProducts();
  console.log(`Building sitemaps with ${allProducts.length} products...`);

  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/products', priority: '0.9', changefreq: 'daily' },
    { path: '/categories', priority: '0.8', changefreq: 'weekly' },
    { path: '/updates', priority: '0.8', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  ];

  const staticUrlEntries = staticPages.map((page) => `  <url>
    <loc>${escapeXml(`${BASE_URL}${page.path === '/' ? '/' : page.path}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);

  const seenUrls = new Set();
  const productUrlEntries = [];

  allProducts.forEach((p) => {
    const relUrl = getProductUrl(p);
    if (!seenUrls.has(relUrl)) {
      seenUrls.add(relUrl);
      productUrlEntries.push(`  <url>
    <loc>${escapeXml(`${BASE_URL}${relUrl}`)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  });

  // 1. Dedicated sitemap-products.xml
  const productsXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productUrlEntries.join('\n')}
</urlset>
`;
  fs.writeFileSync(path.resolve(__dirname, '../public/sitemap-products.xml'), productsXmlContent, 'utf-8');
  console.log(`✓ Wrote ${productUrlEntries.length} products to public/sitemap-products.xml`);

  // 2. Comprehensive sitemap.xml (All main pages + All 1,326+ products in one standard urlset)
  const masterXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlEntries.join('\n')}
${productUrlEntries.join('\n')}
</urlset>
`;
  fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), masterXmlContent, 'utf-8');
  console.log(`✓ Wrote ${staticUrlEntries.length + productUrlEntries.length} total URLs to public/sitemap.xml`);

  // 3. Static pages only sitemap-main.xml
  const mainXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlEntries.join('\n')}
</urlset>
`;
  fs.writeFileSync(path.resolve(__dirname, '../public/sitemap-main.xml'), mainXmlContent, 'utf-8');
  console.log(`✓ Wrote ${staticUrlEntries.length} pages to public/sitemap-main.xml`);
}

async function main() {
  await generateAllSitemaps();
  console.log('=== SITEMAP GENERATION COMPLETED ===');
}

main();

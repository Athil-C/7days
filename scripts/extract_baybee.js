import fs from 'fs';

const content = fs.readFileSync('C:/Users/athil/.gemini/antigravity-ide/brain/a7c134c5-e31d-47b7-a042-90f51bc659ed/.system_generated/steps/845/content.md', 'utf8');

const regex = /href="(\/products\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
let match;
const products = [];
while ((match = regex.exec(content)) !== null) {
  const url = match[1];
  const title = match[2].replace(/<[^>]+>/g, '').trim();
  if (title) {
    products.push({ url, title });
  }
}

console.log('Total products listed in sitemap:', products.length);
console.log('Sample 30 products:');
products.slice(0, 30).forEach((p, i) => console.log(`${i+1}. ${p.title} -> ${p.url}`));

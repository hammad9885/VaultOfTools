// scripts/generate-sitemap.js
// Simple sitemap generator for Next.js app router
// Usage: node scripts/generate-sitemap.js > public/sitemap.xml
// Adjust BASE_URL as needed.
const fs = require('fs');
const path = require('path');

const APP_DIR = path.resolve(__dirname, '..', 'app');
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const BASE_URL = process.env.BASE_URL || 'https://vaultoftools.com'; // Change to your domain

function isPageFile(file) {
  return file === 'page.tsx' || file === 'page.jsx' || file === 'page.js';
}

function walk(dir, routeParts = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const urls = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue; // skip private dirs
      const subDir = path.join(dir, entry.name);
      const newParts = [...routeParts, entry.name];
      urls.push(...walk(subDir, newParts));
    } else if (entry.isFile() && isPageFile(entry.name)) {
      let route = '/' + routeParts.join('/');
      // root index page becomes '/'
      if (route === '/app') route = '/';
      if (route.endsWith('/app')) route = route.replace('/app', '');
      if (!route.startsWith('/')) route = '/' + route;
      if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1);
      urls.push(route);
    }
  }
  return urls;
}

function dedupe(arr) { return Array.from(new Set(arr)); }

const routes = dedupe(walk(APP_DIR));

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const route of routes) {
  const loc = `${BASE_URL}${route}`;
  xml += `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
}
xml += `</urlset>`;

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap generated at public/sitemap.xml');

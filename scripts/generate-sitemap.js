#!/usr/bin/env node
/**
 * sitemap.xml を products/*.html とルートの公開ページから再生成する。
 * Usage: node scripts/generate-sitemap.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "sitemap.xml");
const BASE = "https://nattoku-labo.com";

const EXCLUDE_PRODUCTS = new Set([
  "template-unified.html",
  "template-unified-old.html",
  "test-js.html",
]);

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastmodFile(absPath) {
  try {
    const st = fs.statSync(absPath);
    return formatDate(st.mtime);
  } catch {
    return formatDate(new Date());
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const urlEntries = [];

// トップ
urlEntries.push({
  loc: `${BASE}/`,
  lastmod: lastmodFile(path.join(ROOT, "index.html")),
  changefreq: "daily",
  priority: "1.0",
});

// ルートの公開HTML（存在するものだけ）
const rootPages = [
  { file: "about.html", changefreq: "monthly", priority: "0.8" },
  { file: "privacy.html", changefreq: "monthly", priority: "0.5" },
  { file: "contact-simple.html", changefreq: "monthly", priority: "0.6" },
];
for (const p of rootPages) {
  const ab = path.join(ROOT, p.file);
  if (fs.existsSync(ab)) {
    urlEntries.push({
      loc: `${BASE}/${p.file}`,
      lastmod: lastmodFile(ab),
      changefreq: p.changefreq,
      priority: p.priority,
    });
  }
}

// 製品ページ
const productsDir = path.join(ROOT, "products");
const productFiles = fs
  .readdirSync(productsDir)
  .filter((f) => f.endsWith(".html") && !EXCLUDE_PRODUCTS.has(f) && !f.startsWith("moshimo-embed"))
  .sort((a, b) => a.localeCompare(b, "en"));

for (const f of productFiles) {
  const ab = path.join(productsDir, f);
  urlEntries.push({
    loc: `${BASE}/products/${f}`,
    lastmod: lastmodFile(ab),
    changefreq: "weekly",
    priority: "0.9",
  });
}

const body = urlEntries
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${esc(u.lastmod)}</lastmod>
    <changefreq>${esc(u.changefreq)}</changefreq>
    <priority>${esc(u.priority)}</priority>
  </url>`
  )
  .join("\n\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;

fs.writeFileSync(OUT, xml, "utf8");
console.log(`✅ Wrote ${OUT} (${urlEntries.length} URLs, ${productFiles.length} product pages).`);

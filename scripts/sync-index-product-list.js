#!/usr/bin/env node
"use strict";

/**
 * Rebuild the SEO product link grid on index.html from products-index.json.
 * Also clear misleading static search-result count / empty-state text.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");
const INDEX_JSON = path.join(ROOT, "products", "data", "products-index.json");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadAllProducts() {
  const byId = new Map();
  if (fs.existsSync(INDEX_JSON)) {
    for (const p of JSON.parse(fs.readFileSync(INDEX_JSON, "utf8"))) {
      if (p?.id) byId.set(p.id, p);
    }
  }
  // Fill gaps from product HTML + JSON so every /products/* page is linked
  const productsDir = path.join(ROOT, "products");
  const dataDir = path.join(productsDir, "data");
  for (const file of fs.readdirSync(productsDir)) {
    if (!file.endsWith(".html") || /template|test/i.test(file)) continue;
    const id = file.replace(/\.html$/, "");
    if (byId.has(id)) continue;
    const jsonPath = path.join(dataDir, `${id}.json`);
    if (!fs.existsSync(jsonPath)) continue;
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    byId.set(id, {
      id,
      name: data.productName || id,
      manufacturer: data.manufacturer || "",
    });
  }
  return [...byId.values()];
}

function main() {
  const products = loadAllProducts();
  if (!products.length) {
    throw new Error("No products found for index list");
  }

  const sorted = [...products].sort((a, b) => {
    const m = String(a.manufacturer || "").localeCompare(String(b.manufacturer || ""), "ja");
    if (m) return m;
    return String(a.name || "").localeCompare(String(b.name || ""), "ja");
  });

  const linkStyle =
    "padding: 0.75rem 1rem; background: var(--gray-50); border-radius: 8px; text-decoration: none; color: var(--dark); transition: all 0.3s ease; border: 1px solid var(--gray-200);";
  const links = sorted
    .map((p) => {
      const label = [p.manufacturer, p.name].filter(Boolean).join(" ");
      return `                <a href="/products/${escapeHtml(p.id)}" style="${linkStyle}">
                    <i class="fas fa-robot" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                    ${escapeHtml(label)}
                </a>`;
    })
    .join("\n");

  let html = fs.readFileSync(INDEX, "utf8");

  const listRe =
    /(<!-- 製品リンク一覧（SEO用） -->[\s\S]*?<div style="display: grid; grid-template-columns: repeat\(auto-fill, minmax\(280px, 1fr\)\); gap: 1rem;">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<!-- Footer -->)/;
  if (!listRe.test(html)) {
    throw new Error("Could not find SEO product list block in index.html");
  }
  html = html.replace(
    listRe,
    `$1\n                <!-- ALL_PRODUCTS_START: auto-generated from products-index.json -->\n${links}\n                <!-- ALL_PRODUCTS_END -->\n            $2`,
  );

  // Avoid contradictory static messages before JS runs
  html = html.replace(
    /(<strong id="resultCount">)[^<]*(<\/strong>)/,
    "$1—$2",
  );
  html = html.replace(
    /(<div id="noResults" class="no-results")([^>]*)>/,
    (full, open, attrs) => {
      let next = attrs;
      if (!/style=/i.test(next)) {
        next += ' style="display: none;"';
      } else if (!/display:\s*none/i.test(next)) {
        next = next.replace(/style="([^"]*)"/i, 'style="$1; display: none;"');
      }
      return `${open}${next}>`;
    },
  );

  fs.writeFileSync(INDEX, html, "utf8");
  console.log(`✅ Synced ${sorted.length} product links into index.html`);
}

main();

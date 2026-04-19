#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "products");
const DATA_DIR = path.join(PRODUCTS_DIR, "data");
const TEMPLATE_PATH = path.join(PRODUCTS_DIR, "template-unified.html");
const PRODUCTS_DATA_PATH = path.join(ROOT, "products-data.js");

function readJson(inputPath) {
  const resolved = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`JSON file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, "utf8");
  return { data: JSON.parse(raw), resolvedPath: resolved };
}

function validateProductJson(data) {
  const required = [
    "productId",
    "productName",
    "manufacturer",
    "overallRating",
    "totalReviews",
    "price",
    "reliabilityScore",
  ];
  const missing = required.filter((key) => data[key] === undefined || data[key] === null || data[key] === "");
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
  const numericFields = ["overallRating", "totalReviews", "price", "reliabilityScore"];
  const invalidNumbers = numericFields.filter((key) => Number.isNaN(Number(data[key])));
  if (invalidNumbers.length > 0) {
    throw new Error(`Numeric fields must be valid numbers: ${invalidNumbers.join(", ")}`);
  }
}

function ensureNotExists(filePath, label) {
  if (fs.existsSync(filePath)) {
    throw new Error(`${label} already exists: ${filePath}`);
  }
}

function writeProductJson(productId, data) {
  const outputPath = path.join(DATA_DIR, `${productId}.json`);
  ensureNotExists(outputPath, "Product JSON");
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return outputPath;
}

function createProductHtml(productId) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found: ${TEMPLATE_PATH}`);
  }
  const htmlPath = path.join(PRODUCTS_DIR, `${productId}.html`);
  ensureNotExists(htmlPath, "Product HTML");
  fs.copyFileSync(TEMPLATE_PATH, htmlPath);
  return htmlPath;
}

function buildProductEntry(data) {
  const toScore = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 0;
  };
  const getPerformanceScore = (key, fallback = 0) => {
    return toScore(data.performanceAnalysis?.[key]?.score ?? fallback);
  };
  const badges = Array.isArray(data.badges) && data.badges.length > 0
    ? data.badges.slice(0, 3)
    : ["新規追加", "詳細分析対応", "JSON自動追加"];

  const amazonUrl = pickUrl(
    data.cta?.amazon,
    data.cta?.amazonUrl,
    data.amazonUrl,
  );
  const rakutenUrl = pickUrl(
    data.cta?.rakuten,
    data.cta?.rakutenUrl,
    data.rakutenUrl,
  );
  const listFallback = `https://nattoku-labo.com/products/${data.productId}.html`;
  const finalAmazon = amazonUrl || (hasMoshimoAffiliate(data) ? listFallback : "");
  const finalRakuten = rakutenUrl || (hasMoshimoAffiliate(data) ? listFallback : "");
  if (!finalAmazon || !finalRakuten) {
    throw new Error(
      "products-data 用のリンクが必要です: cta.amazon と cta.rakuten（URL）、またはもしも moshimoAffiliateHtmlFile / moshimoAffiliateEasyLinkHtml / moshimoAffiliateEasyLinkHtmlFile / moshimoAffiliateEasyLink / moshimoAffiliateHtml",
    );
  }

  return [
    "    {",
    `        id: '${escapeSingle(data.productId)}',`,
    `        name: '${escapeSingle(data.productName)}',`,
    `        manufacturer: '${escapeSingle(data.manufacturer)}',`,
    `        price: ${Number(data.price)},`,
    `        rating: ${Number(data.overallRating)},`,
    `        reviewCount: ${Number(data.totalReviews)},`,
    `        totalReviewCount: ${Number(data.totalReviews)},`,
    `        image: '${escapeSingle(data.imageUrl != null ? String(data.imageUrl).trim() : "")}',`,
    `        badges: [${badges.map((badge) => `'${escapeSingle(String(badge))}'`).join(", ")}],`,
    "        specs: {",
    `            suction: ${getPerformanceScore("floorCleaning", 80)},`,
    `            mopping: ${getPerformanceScore("carpetCleaning", 75)},`,
    `            noise: ${toScore(data.performanceAnalysis?.quietness?.score ?? data.performanceAnalysis?.nightQuietness?.score ?? 75)},`,
    `            obstacle: ${getPerformanceScore("stepClimbing", 70)},`,
    `            app: ${getPerformanceScore("appStability", 80)},`,
    `            maintenance: ${getPerformanceScore("maintenance", 80)}`,
    "        },",
    `        amazonUrl: '${escapeSingle(finalAmazon)}',`,
    `        rakutenUrl: '${escapeSingle(finalRakuten)}'`,
    "    }",
  ].join("\n");
}

function escapeSingle(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function pickUrl(...candidates) {
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string" && /^https?:\/\//.test(c)) return c;
    if (typeof c === "object" && typeof c.url === "string" && /^https?:\/\//.test(c.url)) {
      return c.url;
    }
  }
  return "";
}

function hasMoshimoAffiliate(data) {
  if (!data) return false;
  if (typeof data.moshimoAffiliateEasyLinkHtml === "string" && data.moshimoAffiliateEasyLinkHtml.trim()) return true;
  if (typeof data.moshimoAffiliateEasyLinkHtmlFile === "string" && data.moshimoAffiliateEasyLinkHtmlFile.trim()) return true;
  if (data.moshimoAffiliateEasyLink && typeof data.moshimoAffiliateEasyLink === "object") return true;
  if (typeof data.moshimoAffiliateHtml === "string" && data.moshimoAffiliateHtml.trim()) return true;
  if (typeof data.moshimoAffiliateHtmlFile === "string" && data.moshimoAffiliateHtmlFile.trim()) return true;
  return false;
}

function updateProductsDataJs(data) {
  const content = fs.readFileSync(PRODUCTS_DATA_PATH, "utf8");
  const idNeedle = `id: '${data.productId}'`;
  if (content.includes(idNeedle)) {
    throw new Error(`products-data.js already has productId: ${data.productId}`);
  }

  const endIndex = content.indexOf("];");
  if (endIndex === -1) {
    throw new Error("Could not find productsData array end in products-data.js");
  }

  const before = content.slice(0, endIndex).trimEnd();
  const after = content.slice(endIndex);
  const entry = buildProductEntry(data);
  const updated = `${before},\n${entry}\n\n${after}`;
  fs.writeFileSync(PRODUCTS_DATA_PATH, updated, "utf8");
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node scripts/add-product-from-json.js <path-to-json>");
    process.exit(1);
  }

  try {
    const { data, resolvedPath } = readJson(inputPath);
    validateProductJson(data);

    const productId = String(data.productId).trim();
    if (!/^[a-z0-9-]+$/.test(productId)) {
      throw new Error("productId must match ^[a-z0-9-]+$");
    }

    const jsonPath = writeProductJson(productId, data);
    const htmlPath = createProductHtml(productId);
    updateProductsDataJs(data);

    const syncScript = path.join(__dirname, "sync-products-data-from-json.js");
    execFileSync(process.execPath, [syncScript], { cwd: ROOT, stdio: "inherit" });

    console.log("✅ Product added successfully");
    console.log(`- Source JSON: ${resolvedPath}`);
    console.log(`- Data file: ${jsonPath}`);
    console.log(`- HTML file: ${htmlPath}`);
    console.log(`- Updated: ${PRODUCTS_DATA_PATH}`);
    console.log(`- Preview URL: products/${productId}.html`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

main();

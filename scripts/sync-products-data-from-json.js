#!/usr/bin/env node
/**
 * products/data/*.json に存在するが products-data.js に無い製品だけを追記する。
 * 既存の詳細フィールド（dataSources 等）はそのまま保持する。
 *
 * トップページ index.html は products-data.js を読み込む前提（単一ソース）。
 * あわせて products/js/navigation.js の ALL_PRODUCTS / MANUFACTURERS を
 * data ディレクトリの JSON から再生成する（ナビ・関連製品の一覧と一致させる）。
 *
 * Usage: node scripts/sync-products-data-from-json.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "products", "data");
const PRODUCTS_DATA_PATH = path.join(ROOT, "products-data.js");
const NAVIGATION_JS_PATH = path.join(ROOT, "products", "js", "navigation.js");

function escapeSingle(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

/** cta.amazon / cta.amazonUrl / { url: "..." } などを吸収 */
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

function normalizeManufacturer(name) {
  const s = String(name || "").trim();
  if (/アイロボット|iRobot/i.test(s)) return "iRobot";
  if (/ECOVACS|エコバックス/i.test(s)) return "ECOVACS";
  if (/Roborock/i.test(s)) return "Roborock";
  if (/SwitchBot/i.test(s)) return "SwitchBot";
  if (/Anker|Eufy/i.test(s)) return "Anker";
  if (/Dreame/i.test(s)) return "Dreame";
  return s || "その他";
}

function toScore(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, Math.round(parsed))) : 0;
}

function getNoiseScore(data) {
  const pa = data.performanceAnalysis || {};
  return toScore(pa.nightQuietness?.score ?? pa.quietness?.score ?? 75);
}

function buildProductEntryLines(data) {
  const required = ["productId", "productName", "manufacturer", "overallRating", "totalReviews", "price"];
  const missing = required.filter((k) => data[k] === undefined || data[k] === null || data[k] === "");
  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
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
      "CTA URLs or もしも (moshimoAffiliateHtmlFile / moshimoAffiliateEasyLinkHtml / moshimoAffiliateEasyLinkHtmlFile / moshimoAffiliateEasyLink / moshimoAffiliateHtml) が必要です",
    );
  }

  const getPerformanceScore = (key, fallback = 0) =>
    toScore(data.performanceAnalysis?.[key]?.score ?? fallback);

  const badges =
    Array.isArray(data.badges) && data.badges.length > 0
      ? data.badges.slice(0, 3)
      : ["詳細分析", "口コミ統計", "データ駆動"];

  const manufacturer = normalizeManufacturer(data.manufacturer);
  const catalogImage =
    data.imageUrl != null && String(data.imageUrl).trim() !== "" ? String(data.imageUrl).trim() : "";

  return [
    "    {",
    `        id: '${escapeSingle(data.productId)}',`,
    `        name: '${escapeSingle(data.productName)}',`,
    `        manufacturer: '${escapeSingle(manufacturer)}',`,
    `        price: ${Number(data.price)},`,
    `        rating: ${Number(data.overallRating)},`,
    `        reviewCount: ${Number(data.totalReviews)},`,
    `        totalReviewCount: ${Number(data.totalReviews)},`,
    `        image: '${escapeSingle(catalogImage)}',`,
    `        badges: [${badges.map((b) => `'${escapeSingle(String(b))}'`).join(", ")}],`,
    "        specs: {",
    `            suction: ${getPerformanceScore("floorCleaning", 80)},`,
    `            mopping: ${getPerformanceScore("carpetCleaning", 75)},`,
    `            noise: ${getNoiseScore(data)},`,
    `            obstacle: ${getPerformanceScore("stepClimbing", 70)},`,
    `            app: ${getPerformanceScore("appStability", 80)},`,
    `            maintenance: ${getPerformanceScore("maintenance", 80)}`,
    "        },",
    `        amazonUrl: '${escapeSingle(finalAmazon)}',`,
    `        rakutenUrl: '${escapeSingle(finalRakuten)}'`,
    "    }",
  ].join("\n");
}

function patchManufacturers(content) {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const manufacturersSet = new Set();
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
      manufacturersSet.add(normalizeManufacturer(data.manufacturer));
    } catch {
      /* skip */
    }
  }
  const list = Array.from(manufacturersSet).sort();
  const manufacturersJs = `const manufacturers = ['すべて', ${list.map((m) => `'${escapeSingle(m)}'`).join(", ")}];`;
  const manufacturersRe = /const manufacturers = \[[\s\S]*?\];\s*const priceRanges/;
  if (!manufacturersRe.test(content)) {
    throw new Error("Could not patch manufacturers array (pattern not found)");
  }
  return content.replace(manufacturersRe, `${manufacturersJs}\nconst priceRanges`);
}

/**
 * 固定ナビ・関連製品用の軽量リストを JSON から再書き込みする。
 */
function rebuildNavigationFromDataDir() {
  let nav = fs.readFileSync(NAVIGATION_JS_PATH, "utf8");

  const manufacturersSet = new Set();
  const items = [];
  const navErrors = [];

  const jsonFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
  for (const file of jsonFiles) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    } catch (e) {
      navErrors.push(`${file}: parse error: ${e.message}`);
      continue;
    }
    const id = data.productId;
    const name = data.productName;
    const price = Number(data.price);
    const rating = Number(data.overallRating);
    if (!id || name === undefined || name === null || String(name).trim() === "") {
      navErrors.push(`${file}: missing productId or productName`);
      continue;
    }
    if (!Number.isFinite(price) || !Number.isFinite(rating)) {
      navErrors.push(`${file}: missing or invalid price / overallRating`);
      continue;
    }
    const manufacturer = normalizeManufacturer(data.manufacturer);
    manufacturersSet.add(manufacturer);
    items.push({
      id: String(id),
      name: String(name),
      manufacturer,
      price,
      rating,
    });
  }

  items.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const productLines = items.map(
    (p) =>
      `    { id: '${escapeSingle(p.id)}', name: '${escapeSingle(p.name)}', manufacturer: '${escapeSingle(p.manufacturer)}', price: ${p.price}, rating: ${p.rating} }`,
  );

  const manList = Array.from(manufacturersSet).sort();
  const manufacturersJs = `const MANUFACTURERS = ['すべて', ${manList.map((m) => `'${escapeSingle(m)}'`).join(", ")}];`;

  const newBlock = `const ALL_PRODUCTS = [\n${productLines.join(",\n")}\n];\n\n// メーカー一覧\n${manufacturersJs}`;

  const navProductsRe =
    /const ALL_PRODUCTS = \[[\s\S]*?\];\s*\r?\n\r?\n\/\/ メーカー一覧\s*\r?\nconst MANUFACTURERS = \[[\s\S]*?\];/;
  if (!navProductsRe.test(nav)) {
    throw new Error("Could not patch products/js/navigation.js (ALL_PRODUCTS / MANUFACTURERS pattern not found)");
  }
  const replaced = nav.replace(navProductsRe, newBlock);
  fs.writeFileSync(NAVIGATION_JS_PATH, replaced, "utf8");
  if (replaced !== nav) {
    console.log(`✅ Updated products/js/navigation.js (${items.length} products).`);
  } else {
    console.log(`✅ products/js/navigation.js already up to date (${items.length} products).`);
  }
  if (navErrors.length) {
    console.warn("⚠️ navigation.js sync skipped some JSON rows:");
    navErrors.forEach((e) => console.warn(`  - ${e}`));
  }
}

function main() {
  let content = fs.readFileSync(PRODUCTS_DATA_PATH, "utf8");
  const existingIds = new Set(
    [...content.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]),
  );

  const filterMarker = "// フィルター用のマスターデータ";
  const idxFilter = content.indexOf(filterMarker);
  if (idxFilter === -1) {
    throw new Error(`products-data.js: marker not found: ${filterMarker}`);
  }

  const head = content.slice(0, idxFilter);
  const tail = content.slice(idxFilter);
  const closeIdx = head.lastIndexOf("\n];");
  if (closeIdx === -1) {
    throw new Error("products-data.js: could not find productsData array closing");
  }

  const jsonFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json")).sort();
  const newBlocks = [];
  const errors = [];

  for (const file of jsonFiles) {
    const full = path.join(DATA_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, "utf8"));
    } catch (e) {
      errors.push(`${file}: parse error: ${e.message}`);
      continue;
    }
    if (!data.productId || existingIds.has(data.productId)) {
      continue;
    }
    try {
      newBlocks.push(buildProductEntryLines(data));
      existingIds.add(data.productId);
    } catch (e) {
      errors.push(`${file}: ${e.message}`);
    }
  }

  if (newBlocks.length === 0) {
    console.log("✅ No missing products (products-data.js already matches JSON set).");
  } else {
    const beforeClose = head.slice(0, closeIdx);
    const afterClose = head.slice(closeIdx);
    content = beforeClose + ",\n" + newBlocks.join(",\n") + afterClose + tail;
    console.log(`✅ Appended ${newBlocks.length} product(s) from JSON.`);
  }

  content = patchManufacturers(content);
  fs.writeFileSync(PRODUCTS_DATA_PATH, content, "utf8");

  rebuildNavigationFromDataDir();

  if (errors.length) {
    console.warn("⚠️ Skipped:");
    errors.forEach((e) => console.warn(`  - ${e}`));
  }
}

main();

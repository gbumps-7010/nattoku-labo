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
const PRODUCTS_INDEX_PATH = path.join(DATA_DIR, "products-index.json");
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
  if (typeof data.affiliate?.moshimo === "string" && data.affiliate.moshimo.trim()) return true;
  if (typeof data.moshimoAffiliateEasyLinkHtml === "string" && data.moshimoAffiliateEasyLinkHtml.trim()) return true;
  if (typeof data.moshimoAffiliateEasyLinkHtmlFile === "string" && data.moshimoAffiliateEasyLinkHtmlFile.trim()) return true;
  if (data.moshimoAffiliateEasyLink && typeof data.moshimoAffiliateEasyLink === "object") return true;
  if (typeof data.moshimoAffiliateHtml === "string" && data.moshimoAffiliateHtml.trim()) return true;
  if (typeof data.moshimoAffiliateHtmlFile === "string" && data.moshimoAffiliateHtmlFile.trim()) return true;
  return false;
}

function hasAffiliate(data) {
  return hasMoshimoAffiliate(data) ||
    (typeof data?.affiliate?.direct === "string" && data.affiliate.direct.trim() !== "");
}

function isPublishReady(data) {
  return data?.affiliate?.hpPublish === true &&
    String(data?.imageUrl || "").trim() !== "" &&
    hasAffiliate(data);
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
  const required = ["productId", "productName", "manufacturer", "totalReviews", "price"];
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
  const listFallback = `https://nattoku-labo.com/products/${data.productId}`;
  const finalAmazon = amazonUrl || (hasAffiliate(data) ? listFallback : "");
  const finalRakuten = rakutenUrl || (hasAffiliate(data) ? listFallback : "");
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
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && f !== "products-index.json");
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

  const jsonFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && f !== "products-index.json")
    .sort();
  for (const file of jsonFiles) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    } catch (e) {
      navErrors.push(`${file}: parse error: ${e.message}`);
      continue;
    }
    if (!isPublishReady(data)) continue;
    const id = data.productId;
    const name = data.productName;
    const price = Number(data.price);
    if (!id || name === undefined || name === null || String(name).trim() === "") {
      navErrors.push(`${file}: missing productId or productName`);
      continue;
    }
    if (!Number.isFinite(price)) {
      navErrors.push(`${file}: missing or invalid price`);
      continue;
    }
    const manufacturer = normalizeManufacturer(data.manufacturer);
    manufacturersSet.add(manufacturer);
    items.push({
      id: String(id),
      name: String(name),
      manufacturer,
      price,
    });
  }

  items.sort((a, b) => a.id.localeCompare(b.id, "en"));

  const productLines = items.map(
    (p) =>
      `    { id: '${escapeSingle(p.id)}', name: '${escapeSingle(p.name)}', manufacturer: '${escapeSingle(p.manufacturer)}', price: ${p.price} }`,
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

/**
 * トップページ用の商品一覧を、公開中の製品HTMLとJSONから全件再生成する。
 */
function rebuildProductsIndexFromDataDir() {
  const entries = [];
  const jsonFiles = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && f !== "products-index.json")
    .sort();

  for (const file of jsonFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    const productId = String(data.productId || "").trim();
    if (!productId) continue;
    if (!isPublishReady(data)) continue;
    if (!fs.existsSync(path.join(ROOT, "products", `${productId}.html`))) continue;

    const positiveKeywords = (data.reviewKeywords?.positive || [])
      .map((item) => item?.keyword)
      .filter(Boolean)
      .slice(0, 2);
    const badges = Array.isArray(data.badges) && data.badges.length
      ? data.badges.slice(0, 3)
      : [normalizeManufacturer(data.manufacturer), ...positiveKeywords].filter(Boolean);
    const getPerformanceScore = (key, fallback = 0) =>
      toScore(data.performanceAnalysis?.[key]?.score ?? fallback);

    entries.push({
      id: productId,
      name: String(data.productName || productId),
      manufacturer: normalizeManufacturer(data.manufacturer),
      price: Number(data.price || 0),
      reviewCount: Number(data.totalReviews || 0),
      totalReviewCount: Number(data.totalReviews || 0),
      image: String(data.imageUrl || "").trim(),
      badges,
      overallTrustScore: Number(data.reliabilityScore || data.reliability?.score || 0),
      specs: {
        suction: getPerformanceScore("floorCleaning", 0),
        mopping: getPerformanceScore("carpetCleaning", 0),
        noise: getNoiseScore(data),
        obstacle: getPerformanceScore("stepClimbing", 0),
        app: getPerformanceScore("appStability", 0),
        maintenance: getPerformanceScore("maintenance", 0),
      },
    });
  }

  fs.writeFileSync(PRODUCTS_INDEX_PATH, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
  console.log(`✅ Updated products/data/products-index.json (${entries.length} products).`);
}

function main() {
  // 公開一覧は products-index.json と navigation.js を正とする。
  // 旧 products-data.js へ追記すると旧IDとの重複が発生するため更新しない。
  rebuildNavigationFromDataDir();
  rebuildProductsIndexFromDataDir();
}

main();

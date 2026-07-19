#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "products");
const DATA_DIR = path.join(PRODUCTS_DIR, "data");
const EXCLUDED = new Set(["template-unified.html", "template-unified-old.html", "test-js.html"]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getNestedValue(object, dottedPath) {
  return dottedPath.split(".").reduce((value, key) => value?.[key], object);
}

function displayName(data) {
  const manufacturer = String(data.manufacturer || "").trim();
  const name = String(data.productName || data.productId).trim();
  return manufacturer && !name.toLowerCase().includes(manufacturer.toLowerCase())
    ? `${manufacturer} ${name}`
    : name;
}

function buildMetadata(data) {
  const name = displayName(data);
  const title = String(
    data.metaTitle || `${data.productName} 詳細分析 | もう失敗しない。ナットクLabo`,
  );
  const description = String(
    data.metaDescription || `${name}の口コミ統計分析。詳細データを公開。`,
  );

  return { name, title, description };
}

function buildStructuredData(data, metadata) {
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://nattoku-labo.com/products/${data.productId}#product`,
    url: `https://nattoku-labo.com/products/${data.productId}`,
    name: metadata.name,
    description: metadata.description,
    brand: {
      "@type": "Brand",
      name: String(data.manufacturer || ""),
    },
    offers: {
      "@type": "Offer",
      url: `https://nattoku-labo.com/products/${data.productId}`,
      price: Number(data.price),
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
    },
  };

  if (data.imageUrl) product.image = String(data.imageUrl);
  if (data.modelNumber) product.model = String(data.modelNumber);
  if (data.asin) product.sku = String(data.asin);

  return JSON.stringify(product, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function replaceSimpleDynamic(html, dottedPath, value) {
  if (value === undefined || value === null || typeof value === "object") return html;
  const escapedPath = escapeRegExp(dottedPath);
  const pattern = new RegExp(
    `(<(?:span|p|h1)(?=[^>]*data-dynamic="${escapedPath}")[^>]*>)[\\s\\S]*?(<\\/(?:span|p|h1)>)`,
    "g",
  );
  return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function formatValue(dottedPath, value) {
  if (value === undefined || value === null) return value;
  const reliabilityWeights = {
    "reliability.dataAdequacy.score": 60,
    "reliability.consistency.percentage": 30,
    "reliability.freshness.score": 10,
  };
  if (reliabilityWeights[dottedPath]) {
    const number = Number(value);
    if (!Number.isFinite(number)) return value;
    const weighted = Math.round(number * reliabilityWeights[dottedPath] / 100 * 10) / 10;
    return Number.isInteger(weighted) ? String(weighted) : weighted.toFixed(1);
  }
  if (dottedPath === "price") {
    const number = Number(value);
    return Number.isFinite(number) ? `約¥${number.toLocaleString("ja-JP")}` : value;
  }
  if (dottedPath.startsWith("operationalCost.")) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("ja-JP") : value;
  }
  return value;
}

const mobileOverrides = `        /* MOBILE_LAYOUT_FIX_START */
        html,
        body {
            max-width: 100%;
            overflow-x: clip;
        }

        img,
        iframe {
            max-width: 100%;
        }

        @media (max-width: 480px) {
            .header-content,
            .container {
                padding-left: 1rem;
                padding-right: 1rem;
            }

            .product-header,
            .product-info {
                min-width: 0;
                width: 100%;
            }

            .product-header {
                gap: 1rem;
            }

            .product-image-header {
                width: min(200px, 100%);
                height: auto;
                aspect-ratio: 1;
            }

            .performance-scores {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.5rem;
                width: 100%;
            }

            .score-item {
                min-width: 0;
                justify-content: center;
                gap: 0.35rem;
                padding: 0.5rem 0.6rem;
            }

            .score-label,
            .score-value,
            .product-meta > * {
                min-width: 0;
                overflow-wrap: anywhere;
            }

            .score-label {
                font-size: 0.75rem;
            }

            .score-value {
                font-size: 1rem;
            }

            .product-meta {
                display: grid;
                grid-template-columns: 1fr;
                gap: 0.65rem;
                width: 100%;
            }

            .product-meta > * {
                padding: 0.55rem 0.75rem !important;
            }

            .affiliate-cta-section {
                max-width: 100% !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                overflow: hidden;
            }

            .affiliate-cta-section iframe,
            .affiliate-cta-section img,
            .affiliate-cta-section table {
                max-width: 100% !important;
            }

            .card {
                min-width: 0;
                padding: 1rem;
            }

            .data-quality-summary,
            [style*="minmax(280px"] {
                grid-template-columns: 1fr !important;
            }
        }
        /* MOBILE_LAYOUT_FIX_END */`;

function ensureMobileOverrides(html) {
  const existing =
    /[ \t]*\/\* MOBILE_LAYOUT_FIX_START \*\/[\s\S]*?\/\* MOBILE_LAYOUT_FIX_END \*\//;
  if (existing.test(html)) return html.replace(existing, mobileOverrides);

  const headEnd = html.indexOf("</head>");
  const styleEnd = html.lastIndexOf("</style>", headEnd);
  if (styleEnd === -1) throw new Error("Could not find a head style block");
  return `${html.slice(0, styleEnd)}${mobileOverrides}\n${html.slice(styleEnd)}`;
}

function prerenderHtml(html, data) {
  const metadata = buildMetadata(data);
  const structuredData = buildStructuredData(data, metadata);

  html = ensureMobileOverrides(html);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="https://nattoku-labo.com/products/${escapeHtml(data.productId)}">`,
  );
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${structuredData}\n    </script>`,
  );
  html = html.replace(
    /(<p class="reliability-intro-text"[^>]*>)[\s\S]*?(<\/p>)/i,
    '$1\n                    このスコアは、口コミデータの<strong>量が妥当か</strong>、<strong>使った人の意見がおおむね一致しているか</strong>、<strong>最新の状況を反映しているか</strong>を総合的に評価したものです。85点以上は「購入判断の参考として、信頼できる水準」と考えられます。\n                $2',
  );

  html = html.replace(
    /<span class="product-title">[\s\S]*?<\/span>/,
    `<span class="product-title">${escapeHtml(metadata.name)}</span>`,
  );
  html = html.replace(
    /<img(?=[^>]*data-dynamic="imageUrl")[^>]*>/,
    `<img src="${escapeHtml(data.imageUrl || "")}" alt="${escapeHtml(metadata.name)}" class="product-image-header" data-dynamic="imageUrl">`,
  );

  const directPaths = [
    "manufacturer",
    "productName",
    "price",
    "totalReviews",
    "reliabilityScore",
    "dataQuality.totalReviews",
    "dataQuality.adoptedReviews",
    "dataQuality.excludedReviews",
    "reliability.score",
    "reliability.dataAdequacy.score",
    "reliability.dataAdequacy.description",
    "reliability.consistency.percentage",
    "reliability.consistency.description",
    "reliability.freshness.score",
    "reliability.freshness.description",
    "updateInfo.lastUpdated",
    "updateInfo.note",
    "timeSaving.annualHours",
    "timeSaving.workDaysEquivalent",
    "timeSaving.dailyMinutes",
    "timeSaving.vacuumMinutes",
    "timeSaving.mopMinutes",
    "timeSaving.monthlyHours",
    "operationalCost.daily",
    "operationalCost.dailyNote",
    "operationalCost.monthly",
    "operationalCost.annual",
  ];

  for (const dottedPath of directPaths) {
    let value = getNestedValue(data, dottedPath);
    if (value === undefined && dottedPath === "reliability.score") value = data.reliabilityScore;
    if (value === undefined && dottedPath === "dataQuality.totalReviews") value = data.totalReviews;
    if (value === undefined && dottedPath === "reliability.dataAdequacy.score") {
      value = data.reliability?.dataAdequacy?.percentage;
    }
    if (value === undefined && dottedPath === "reliability.consistency.percentage") {
      value = data.reliability?.consistency?.score;
    }
    if (value === undefined && dottedPath === "reliability.freshness.score") {
      value = data.reliability?.freshness?.percentage;
    }
    html = replaceSimpleDynamic(html, dottedPath, formatValue(dottedPath, value));
  }

  const existingSummary = /[ \t]*<!-- SEO_PRERENDER_START -->[\s\S]*?<!-- SEO_PRERENDER_END -->/;
  html = html.replace(existingSummary, "");

  return html;
}

function validatePrerenderedHtml(html, data) {
  const weightedExpectations = [
    [
      "reliability.dataAdequacy.score",
      data.reliability?.dataAdequacy?.score ?? data.reliability?.dataAdequacy?.percentage,
      60,
    ],
    [
      "reliability.consistency.percentage",
      data.reliability?.consistency?.percentage ?? data.reliability?.consistency?.score,
      30,
    ],
    [
      "reliability.freshness.score",
      data.reliability?.freshness?.score ?? data.reliability?.freshness?.percentage,
      10,
    ],
  ];
  const required = [
    `<link rel="canonical" href="https://nattoku-labo.com/products/${data.productId}">`,
    `data-dynamic="productName">${escapeHtml(data.productName)}</h1>`,
    "/* MOBILE_LAYOUT_FIX_START */",
  ];
  for (const expected of required) {
    if (!html.includes(expected)) {
      throw new Error(`${data.productId}: prerender validation failed (${expected})`);
    }
  }
  for (const [dottedPath, rawValue, weight] of weightedExpectations) {
    if (rawValue === undefined || rawValue === null) continue;
    const weighted = Math.round(Number(rawValue) * weight / 100 * 10) / 10;
    const display = Number.isInteger(weighted) ? String(weighted) : weighted.toFixed(1);
    const expected = `data-dynamic="${dottedPath}">${display}</span>`;
    if (!html.includes(expected)) {
      throw new Error(`${data.productId}: weighted reliability value is incorrect (${dottedPath})`);
    }
  }

  const jsonLdMatch = html.match(
    /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  );
  if (!jsonLdMatch) throw new Error(`${data.productId}: Product JSON-LD not found`);
  const jsonLd = JSON.parse(jsonLdMatch[1]);
  if (
    jsonLd["@type"] !== "Product" ||
    jsonLd.url !== `https://nattoku-labo.com/products/${data.productId}` ||
    jsonLd.aggregateRating !== undefined
  ) {
    throw new Error(`${data.productId}: Product JSON-LD values do not match source JSON`);
  }
}

function productIdsFromArgs() {
  const args = process.argv.slice(2);
  if (args.length && !args.includes("--all")) return args;
  return fs
    .readdirSync(PRODUCTS_DIR)
    .filter((file) => file.endsWith(".html") && !EXCLUDED.has(file))
    .map((file) => path.basename(file, ".html"))
    .sort();
}

function main() {
  const ids = productIdsFromArgs();
  let updated = 0;

  const templatePath = path.join(PRODUCTS_DIR, "template-unified.html");
  if (fs.existsSync(templatePath)) {
    const currentTemplate = fs.readFileSync(templatePath, "utf8");
    const nextTemplate = ensureMobileOverrides(currentTemplate);
    if (nextTemplate !== currentTemplate) {
      fs.writeFileSync(templatePath, nextTemplate, "utf8");
    }
  }

  for (const productId of ids) {
    if (!/^[a-z0-9-]+$/.test(productId)) {
      throw new Error(`Invalid productId: ${productId}`);
    }
    const htmlPath = path.join(PRODUCTS_DIR, `${productId}.html`);
    const dataPath = path.join(DATA_DIR, `${productId}.json`);
    if (!fs.existsSync(htmlPath)) throw new Error(`HTML not found: ${htmlPath}`);
    if (!fs.existsSync(dataPath)) throw new Error(`JSON not found: ${dataPath}`);

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    if (String(data.productId || "") !== productId) {
      throw new Error(`productId mismatch: ${dataPath}`);
    }

    const current = fs.readFileSync(htmlPath, "utf8");
    const next = prerenderHtml(current, data);
    validatePrerenderedHtml(next, data);
    if (next !== current) {
      fs.writeFileSync(htmlPath, next, "utf8");
      updated += 1;
    }
  }

  console.log(`✅ Prerendered ${ids.length} product pages (${updated} updated).`);
}

main();

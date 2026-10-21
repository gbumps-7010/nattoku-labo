#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { computeOverallScores, formatScore } = require("./lib/overall-score");
const { loadVerified, summarize } = require("./lib/consumables");
const {
  buildPerformanceDetailsHtml,
  buildKeywordListHtml,
  buildComplaintsHtml,
  buildAttributeDetailsHtml,
  buildStaticAffiliateHtml,
  buildTimeSavingLinkSection,
  updateBadgeHtml,
  buildEditorialReview,
  overallColor,
  buildPurchaseCtaHtml,
  buildCompareCandidatesHtml,
} = require("./lib/prerender-sections");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "products");
const DATA_DIR = path.join(PRODUCTS_DIR, "data");
const EXCLUDED = new Set(["template-unified.html", "template-unified-old.html", "test-js.html"]);
const LOADER_V = "20261021c";
const CHARTS_V = "20261021c"; // products/js/product-charts.js を変えたら上げる
const VERIFIED_CONSUMABLES = loadVerified(path.join(ROOT, "scripts", "data", "consumables"));
// 製品ごとの title / description の上書き（scripts/data/seo-overrides.json）
const SEO_OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "data", "seo-overrides.json"), "utf8"),
);
// 不満点直後の購入ブロック・比較候補（scripts/data/purchase-flow.json）
const PURCHASE_FLOW = JSON.parse(
  fs.readFileSync(path.join(ROOT, "scripts", "data", "purchase-flow.json"), "utf8"),
);
const BAND_MANIFEST = JSON.parse(
  fs.readFileSync(path.join(ROOT, "compare", "_bands-manifest.json"), "utf8"),
);

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

function manufacturerKatakana(manufacturer) {
  const m = String(manufacturer || "").trim();
  const map = {
    iRobot: "アイロボット",
    Roborock: "ロボロック",
    ECOVACS: "エコバックス",
    Dreame: "ドリーミー",
    Anker: "アンカー",
    eufy: "アンカー",
    Eufy: "アンカー",
    SwitchBot: "スイッチボット",
  };
  return map[m] || m;
}

function manufacturerEnglish(manufacturer) {
  const m = String(manufacturer || "").trim();
  const map = {
    iRobot: "iRobot",
    Roborock: "Roborock",
    ECOVACS: "ECOVACS",
    Dreame: "Dreame",
    Anker: "Anker",
    eufy: "Anker",
    Eufy: "Anker",
    SwitchBot: "SwitchBot",
  };
  return map[m] || m;
}

function seoProductLabel(data) {
  let name = String(data.productName || data.productId || "").trim();
  name = name
    .replace(/^ロボット掃除機\s*/u, "")
    .replace(/^お掃除ロボット\s*/u, "")
    .replace(/^Eufy\s+(Clean\s+)?/i, "")
    .replace(/^Robot Vacuum\s+/i, "")
    .replace(/^RoboVac\s+/i, "")
    .replace(/^iRobot\s+/i, "")
    .replace(/^Roborock\s+/i, "")
    .replace(/^ECOVACS\s+/i, "")
    .replace(/^Dreame\s+/i, "")
    .replace(/^SwitchBot\s+/i, "")
    .replace(/^Anker\s+/i, "")
    .trim();
  return name || String(data.productId || "").trim();
}

function displayName(data) {
  const manufacturer = String(data.manufacturer || "").trim();
  const name = String(data.productName || data.productId).trim();
  return manufacturer && !name.toLowerCase().includes(manufacturer.toLowerCase())
    ? `${manufacturer} ${name}`
    : name;
}

function buildMetadata(data) {
  // SEO枠（title・meta・JSON-LD・パンくず・H1）の正はここ。product-loader.js はプリレンダ済みページでは上書きしない。
  // H1 の組み立ては products/js/product-loader.js buildSeoMetadata() と揃えておく（未プリレンダ時の表示用）
  const name = displayName(data);
  const kana = manufacturerKatakana(data.manufacturer);
  const eng = manufacturerEnglish(data.manufacturer);
  const override = SEO_OVERRIDES[data.productId] || {};
  // label は検索される表記（ルンバ ○○ / Eufy ○○ など）。英字ブランドが既に入っていれば後ろはカナだけにする
  const label = override.label || seoProductLabel(data);
  const brandPart =
    eng && !label.toLowerCase().includes(eng.toLowerCase()) ? `${kana}（${eng}）` : kana;
  const comparePart = "口コミ・評判";
  const title = override.title || `${label}の口コミ・評判｜${brandPart}｜ナットクLabo`;
  const reviews = Number(data.totalReviews || data.reviewCount || 0);
  const reviewBit = reviews > 0 ? `${reviews}件の口コミを分析。` : "口コミを分析。";
  const fallbackDesc =
    `${label}（${brandPart}）の${reviewBit}` +
    "メリット・よくある不満・向いている人を公開します。";
  const description = override.description
    ? override.description.replace(/\{totalReviews\}/g, String(reviews))
    : String(data.metaDescription || fallbackDesc);

  return { name, title, brandPart, comparePart, labelPart: label, description };
}

function buildProductTitleHtml(metadata) {
  // SERPと同じ順: 機種名 → 口コミ・評判 → メーカー
  const parts = [metadata.labelPart, metadata.comparePart, metadata.brandPart].filter(
    Boolean,
  );
  return parts
    .map((part, idx) => {
      const sep =
        idx > 0
          ? '<span class="product-title-sep" aria-hidden="true">｜</span>'
          : "";
      return `<span class="product-title-unit">${sep}<span class="product-title-part">${escapeHtml(part)}</span></span>`;
    })
    .join("");
}

function pageUrl(productId) {
  return `https://nattoku-labo.com/products/${productId}`;
}

function buildStructuredData(data, metadata) {
  const url = pageUrl(data.productId);
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: metadata.name,
    description: metadata.description,
    brand: {
      "@type": "Brand",
      name: String(data.manufacturer || ""),
    },
    offers: {
      "@type": "Offer",
      url,
      price: Number(data.price),
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
    },
  };

  if (data.imageUrl) product.image = String(data.imageUrl);
  if (data.modelNumber) product.model = String(data.modelNumber);
  if (data.asin) product.sku = String(data.asin);

  // Editorial Review only — do NOT add aggregateRating (third-party review aggregate risk)
  const review = buildEditorialReview(data, metadata);
  if (review) product.review = review;

  const crumbName = metadata.labelPart || metadata.name;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://nattoku-labo.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "製品一覧",
        item: "https://nattoku-labo.com/#productsContainer",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: crumbName,
        item: url,
      },
    ],
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: metadata.title,
    description: metadata.description,
    isPartOf: {
      "@type": "WebSite",
      name: "ナットクLabo",
      url: "https://nattoku-labo.com/",
    },
    primaryEntity: { "@id": `${url}#product` },
  };

  return [product, breadcrumb, webpage]
    .map((obj) =>
      JSON.stringify(obj, null, 2)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026"),
    )
    .map((json) => `<script type="application/ld+json">\n${json}\n    </script>`)
    .join("\n    ");
}

function removeSeoSummaryBlock(html) {
  return html.replace(
    /[ \t]*<!-- SEO_PRERENDER_START -->[\s\S]*?<!-- SEO_PRERENDER_END -->\s*/g,
    "",
  );
}

function upsertOpenGraphTags(html, data, metadata) {
  const url = pageUrl(data.productId);
  const tags = [
    `<meta property="og:type" content="product">`,
    `<meta property="og:site_name" content="ナットクLabo">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}">`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}">`,
  ];
  if (data.imageUrl) {
    tags.push(`<meta property="og:image" content="${escapeHtml(data.imageUrl)}">`);
  }
  tags.push(`<meta name="twitter:card" content="summary_large_image">`);
  tags.push(`<meta name="twitter:title" content="${escapeHtml(metadata.title)}">`);
  tags.push(`<meta name="twitter:description" content="${escapeHtml(metadata.description)}">`);

  html = html.replace(
    /\s*<meta\s+(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>\s*/gi,
    "\n    ",
  );

  const canonicalRe = /(<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>)/i;
  if (!canonicalRe.test(html)) {
    throw new Error(`${data.productId}: canonical tag missing for Open Graph insertion`);
  }
  return html.replace(canonicalRe, `$1\n    ${tags.join("\n    ")}`);
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
  if (dottedPath === "overallScore" || dottedPath === "featureAverageScore" || dottedPath === "reliabilityScore") {
    const number = Number(value);
    return Number.isFinite(number) ? formatScore(number) : value;
  }
  return value;
}

function yenRange(lo, hi, step) {
  const a = Math.floor(lo / step + 0.5) * step;
  const b = Math.floor(hi / step + 0.5) * step;
  const f = (n) => n.toLocaleString("ja-JP");
  return a === b ? `約¥${f(a)}` : `約¥${f(a)}〜${f(b)}`;
}

function monthsText([a, b]) {
  const one = (m) => (Number.isInteger(m) ? `${m}カ月` : `${Math.round(m * 30.4)}日`);
  if (a === b) return `${one(a)}ごと`;
  if (Number.isInteger(a) && Number.isInteger(b)) return `${a}〜${b}カ月ごと`;
  return `${one(a)}〜${one(b)}ごと`;
}

function buildConsumablesSection(data, entry) {
  const head = `<!-- CONSUMABLES_START -->
        <section id="consumables-cost">
            <h2 class="section-title">
                <i class="fas fa-piggy-bank"></i>
                消耗品代（維持費）の目安
            </h2>
            <div class="card">`;
  const tail = `
            </div>
        </section>
        <!-- CONSUMABLES_END -->`;
  if (!entry) {
    return `${head}
                <p style="font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;">消耗品データ確認中</p>
                <p style="color: #334155; font-size: 0.95rem; line-height: 1.75; margin: 0;">消耗品の価格と交換目安を、メーカーの公式情報で確認しています。確認が終わるまで、金額の表示を止めています。</p>${tail}`;
  }

  const c = summarize(entry, Number(data.price));
  const cell = "padding: 0.6rem 0.5rem; border-bottom: 1px solid #e5e7eb; vertical-align: top;";
  const rows = c.parts
    .map((p) => {
      const qty = p.packQty > 1 ? `${p.packQty}個入り` : "1個";
      const per = (p.perSwap || 1) > 1 ? `・1回${p.perSwap}個` : "";
      const links = [
        `<a href="${escapeHtml(p.priceUrl)}" target="_blank" rel="noopener">${p.intervalUrl ? "価格" : "価格・交換目安"}</a>`,
      ];
      if (p.intervalUrl) {
        links.push(`<a href="${escapeHtml(p.intervalUrl)}" target="_blank" rel="noopener">交換目安</a>`);
      }
      return `
                            <tr>
                                <td style="${cell}">${escapeHtml(p.item)}</td>
                                <td style="${cell}">¥${p.packPrice.toLocaleString("ja-JP")}（${qty}${per}）</td>
                                <td style="${cell}">${monthsText(p.intervalMonths)}<br><small style="color: #475569;">${escapeHtml(p.intervalBasis)}</small></td>
                                <td style="${cell} white-space: nowrap;">${yenRange(p.annualLo, p.annualHi, 10)}</td>
                                <td style="${cell} white-space: nowrap;">${links.join("・")}</td>
                            </tr>`;
    })
    .join("");
  const notes = [];
  if (c.excluded.length) notes.push(`計算に含めていないもの：${c.excluded.join("、")}`);
  if (c.note) notes.push(c.note);
  notes.push(`確認日：${c.checkedAt}`);
  const box = (label, value, accent) => `
                    <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 2px solid ${accent}; text-align: center;">
                        <p style="font-size: 0.9rem; color: #0f172a; margin-bottom: 0.4rem; font-weight: 600;">${label}</p>
                        <p style="font-size: 1.6rem; font-weight: 900; color: #059669; margin: 0;">${value}</p>
                    </div>`;
  const th = "text-align: left; padding: 0.6rem 0.5rem; border-bottom: 2px solid #cbd5e1; white-space: nowrap;";
  return `${head}
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">${box(
                  "年間",
                  yenRange(c.annualLo, c.annualHi, 100),
                  "#10b981",
                )}${box("1カ月あたり", yenRange(c.annualLo / 12, c.annualHi / 12, 100), "#e5e7eb")}
                </div>
                <p style="color: #334155; font-size: 0.95rem; line-height: 1.75; margin-bottom: 1rem;">メーカー公式の純正品価格と交換目安から計算した金額です。交換目安に幅があるため、金額も幅で示しています（長い方の周期で交換した場合〜短い方の周期で交換した場合）。洗剤・電気代は含みません。</p>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; min-width: 560px; border-collapse: collapse; font-size: 0.88rem; color: #0f172a;">
                        <thead>
                            <tr><th scope="col" style="${th}">部品</th><th scope="col" style="${th}">純正品価格</th><th scope="col" style="${th}">交換目安</th><th scope="col" style="${th}">年間</th><th scope="col" style="${th}">出典</th></tr>
                        </thead>
                        <tbody>${rows}
                        </tbody>
                    </table>
                </div>
                <p style="font-size: 0.82rem; color: #475569; line-height: 1.7; margin: 0.85rem 0 0;">${escapeHtml(notes.join(" "))}</p>${tail}`;
}

const CONSUMABLES_MARKED = /<!-- CONSUMABLES_START -->[\s\S]*?<!-- CONSUMABLES_END -->/;
const CONSUMABLES_LEGACY =
  /(?:<!-- Daily Maintenance Cost -->\s*)?<section>\s*<h2 class="section-title">\s*<i class="fas fa-piggy-bank"><\/i>[\s\S]*?<\/section>/;

function replaceConsumablesSection(html, sectionHtml, label) {
  if (CONSUMABLES_MARKED.test(html)) return html.replace(CONSUMABLES_MARKED, () => sectionHtml);
  if (CONSUMABLES_LEGACY.test(html)) return html.replace(CONSUMABLES_LEGACY, () => sectionHtml);
  throw new Error(`${label}: consumables section not found`);
}

function bumpLoaderVersion(html) {
  return html
    .replace(/js\/product-loader\.js\?v=[0-9a-z]+/, `js/product-loader.js?v=${LOADER_V}`)
    .replace(/js\/product-charts\.js\?v=[0-9a-z]+/, `js/product-charts.js?v=${CHARTS_V}`);
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

            .score-hero {
                width: 100%;
            }

            .product-meta > * {
                min-width: 0;
                overflow-wrap: anywhere;
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
  const computed = computeOverallScores(data);
  if (computed) {
    if (computed.overallScore != null) data.overallScore = computed.overallScore;
    if (computed.featureAverageScore != null) {
      data.featureAverageScore = computed.featureAverageScore;
    }
  }

  const metadata = buildMetadata(data);
  const structuredDataScripts = buildStructuredData(data, metadata);

  html = ensureMobileOverrides(html);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}">`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${pageUrl(escapeHtml(data.productId))}">`,
  );
  html = upsertOpenGraphTags(html, data, metadata);

  // Replace the first Product JSON-LD block, then drop any leftover JSON-LD in <head>
  // so Breadcrumb/WebPage scripts stay singular and in sync.
  let replacedJsonLd = false;
  html = html.replace(/(\s*)<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, (match, ws) => {
    if (!replacedJsonLd) {
      replacedJsonLd = true;
      return `${ws}${structuredDataScripts}`;
    }
    return "";
  });
  if (!replacedJsonLd) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/i,
      (m) => `${m}\n    ${structuredDataScripts}`,
    );
  }

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
    "overallScore",
    "featureAverageScore",
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

  // H1はSEOタイトルを表示（｜単位で改行できる構造）
  html = html.replace(
    /(<h1 class="product-title"[^>]*data-dynamic="productName"[^>]*>)[\s\S]*?(<\/h1>)/i,
    `$1${buildProductTitleHtml(metadata)}$2`,
  );

  // 消耗品代は公式情報で確認できた製品だけ金額を出す（それ以外は「確認中」）
  html = replaceConsumablesSection(
    html,
    buildConsumablesSection(data, VERIFIED_CONSUMABLES[data.productId]),
    data.productId,
  );

  // P0-1: bake analysis sections into static HTML for crawlers
  html = injectPerformanceDetails(html, data);
  html = injectKeywordFallbacks(html, data);
  html = injectComplaints(html, data);
  html = injectPurchaseFlow(html, data);
  html = injectAttributeScores(html, data);
  html = injectAffiliateStatic(html, data);
  html = injectTimeSavingLink(html);
  html = injectUpdateBadge(html, data);
  html = injectBreadcrumbCurrent(html, metadata);

  html = bumpLoaderVersion(html);

  // 口コミ分析サマリー（seo-unique-summary）は表示しない
  html = removeSeoSummaryBlock(html);

  // セクション見出しは製品名なしの共通文言に統一する
  html = stripProductNameFromSectionHeadings(html, metadata.name, data.productName);

  return html;
}

function injectPerformanceDetails(html, data) {
  const inner = buildPerformanceDetailsHtml(data.performanceAnalysis);
  if (!inner) return html;
  const marked =
    /(<div class="performance-details-grid"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/i;
  if (marked.test(html)) {
    return html.replace(marked, `$1${inner}\n                $2`);
  }
  return html;
}

function injectKeywordFallbacks(html, data) {
  const posList = buildKeywordListHtml(data.reviewKeywords?.positive || [], "positive");
  const negList = buildKeywordListHtml(data.reviewKeywords?.negative || [], "negative");

  // Drop prior fallbacks so re-runs stay idempotent
  html = html.replace(/\s*<noscript>\s*<ul class="keyword-fallback"[\s\S]*?<\/ul>\s*<\/noscript>/gi, "");
  html = html.replace(/\s*<noscript>\s*<p class="keyword-fallback-empty"[\s\S]*?<\/p>\s*<\/noscript>/gi, "");
  html = html.replace(/\s*<div class="keyword-fallback-wrap"[\s\S]*?<\/div>/gi, "");

  const afterPos = `$1\n                        <div class="keyword-fallback-wrap">${posList}</div>`;
  const afterNeg = `$1\n                        <div class="keyword-fallback-wrap">${negList}</div>`;
  html = html.replace(/(<canvas id="positiveKeywordsChart"><\/canvas>\s*<\/div>)/i, afterPos);
  html = html.replace(/(<canvas id="negativeKeywordsChart"><\/canvas>\s*<\/div>)/i, afterNeg);
  return html;
}

function injectComplaints(html, data) {
  const inner = buildComplaintsHtml(data);
  if (!inner) return html;
  const re =
    /(<div class="problems-grid complaints-list">)[\s\S]*?(<\/div>\s*<\/section>)/i;
  if (re.test(html)) {
    return html.replace(re, `$1${inner}\n            $2`);
  }
  return html;
}

// --- 不満点直後の購入ブロックと比較候補（新しい点数は作らず、製品ページと同じ計算の既存値だけを使う） ---
const FLOW_AXES = [
  { keys: ["floorCleaning"], label: "フローリング清掃" },
  { keys: ["carpetCleaning"], label: "カーペット清掃" },
  { keys: ["petHair", "petHairRemoval"], label: "ペット毛対応" },
  { keys: ["nightQuietness", "quietness"], label: "静音性（夜間）" },
  { keys: ["stepClimbing"], label: "段差乗り越え" },
  { keys: ["maintenance"], label: "メンテナンス性" },
  { keys: ["appStability"], label: "アプリ安定性" },
  { keys: ["batteryLife"], label: "バッテリー持続" },
];
const FAILURE_RE = /故障|初期不良|不具合|壊れ/;
const FLOW_START = "<!-- PURCHASE_FLOW_START -->";
const FLOW_END = "<!-- PURCHASE_FLOW_END -->";
let flowProducts = null;

function axisScores(data) {
  const perf = data.performanceAnalysis || {};
  const out = {};
  for (const axis of FLOW_AXES) {
    const node = axis.keys.map((k) => perf[k]).find(Boolean);
    const n = Number(node?.score);
    if (Number.isFinite(n)) out[axis.label] = n;
  }
  return out;
}

function loadFlowProducts() {
  if (flowProducts) return flowProducts;
  const bandOf = {};
  for (const band of BAND_MANIFEST) for (const slug of band.slugs) bandOf[slug] = band.label;
  flowProducts = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json") && !["ad-links.json", "products-index.json"].includes(f))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf8")))
    .filter((d) => d.productId && d.affiliate?.hpPublish === true)
    .map((d) => ({
      id: d.productId,
      name: buildMetadata(d).labelPart,
      price: Number(d.price),
      overall: computeOverallScores(d)?.overallScore,
      rel: Number(d.reliabilityScore || d.reliability?.score || 0),
      reviews: Number(d.totalReviews || 0),
      band: bandOf[d.productId] || null,
      axes: axisScores(d),
    }));
  return flowProducts;
}

function selectCandidates(data) {
  const all = loadFlowProducts();
  const self = all.find((p) => p.id === data.productId);
  if (!self) return [];
  const minReviews = Number(PURCHASE_FLOW.minReviewsForCandidate || 0);
  const chosen = new Set([self.id]);
  const out = [];
  const priceText = (p) => `価格目安 約¥${p.price.toLocaleString("ja-JP")}`;
  const overallText = (p) => `総合点 ${formatScore(p.overall)}`;
  const href = (p) => `/products/${p.id}`;

  // ① 姉妹機
  const pair = (PURCHASE_FLOW.siblings || []).find((s) => s.includes(self.id));
  const sibling = pair && all.find((p) => p.id !== self.id && pair.includes(p.id));
  if (sibling) {
    chosen.add(sibling.id);
    out.push({ href: href(sibling), role: "同じシリーズの姉妹機", name: sibling.name, priceText: priceText(sibling), overallText: overallText(sibling) });
  }

  // ② 同じ価格帯で総合点がより高い機種
  if (self.band && self.overall != null) {
    const better = all
      .filter((p) => !chosen.has(p.id) && p.band === self.band && p.reviews >= minReviews && p.overall > self.overall)
      .sort((a, b) => b.overall - a.overall || b.rel - a.rel || b.reviews - a.reviews)[0];
    if (better) {
      chosen.add(better.id);
      out.push({ href: href(better), role: `同じ予算（${self.band}）で総合点が上`, name: better.name, priceText: priceText(better), overallText: overallText(better) });
    }
  }

  // ③ この機種でいちばん点数が低い項目が得意な、価格が近い機種
  const weakest = Object.entries(self.axes).sort((a, b) => a[1] - b[1])[0];
  if (weakest && Number.isFinite(self.price)) {
    const [label, score] = weakest;
    const win = Number(PURCHASE_FLOW.priceWindow || 0.3);
    const strong = all
      .filter(
        (p) =>
          !chosen.has(p.id) &&
          p.reviews >= minReviews &&
          Math.abs(p.price - self.price) <= self.price * win &&
          (p.axes[label] ?? -1) > score,
      )
      .sort((a, b) => b.axes[label] - a.axes[label] || b.overall - a.overall)[0];
    if (strong) {
      chosen.add(strong.id);
      out.push({
        href: href(strong),
        role: `${label}を重視するなら`,
        name: strong.name,
        priceText: priceText(strong),
        overallText: overallText(strong),
        axisText: `${label} ${strong.axes[label]}点（この機種は${score}点）`,
      });
    }
  }
  return out;
}

function purchaseCtaCopy(data) {
  const failure = (data.topComplaints || []).some((c) => FAILURE_RE.test(String(c.title || "")));
  const hasDirect = !!String(data.affiliate?.direct || "").trim();
  const notOfficial = (PURCHASE_FLOW.ecNotOfficial || []).includes(data.productId);
  const price = Number(data.price);
  const priceText = Number.isFinite(price) ? `価格目安：約¥${price.toLocaleString("ja-JP")}` : "";
  if (failure && hasDirect) {
    return { heading: "故障が心配なら、保証が手厚い公式ストアで", sub: "公式ストアの保証・特典を確認してから選べます。ほかのショップの価格も比べられます。", priceText };
  }
  if (failure && !notOfficial) {
    return { heading: "故障が心配なら、メーカー正規販売店で", sub: "正規販売店の価格を確認できます。購入前に保証の条件も確かめておくと安心です。", priceText };
  }
  return { heading: "気になる点が許容範囲なら、今の価格をチェック", sub: "ショップごとの最新価格を確認できます。", priceText };
}

function injectPurchaseFlow(html, data) {
  // 挿入した分（"\n        START … END\n"）だけを取り除き、周りの改行は元のまま残す
  const existing = new RegExp(`\\n[ \\t]*${FLOW_START}[\\s\\S]*?${FLOW_END}\\n`);
  html = html.replace(existing, "");
  if (!(PURCHASE_FLOW.pilot || []).includes(data.productId)) return html;
  const block =
    `\n        ${FLOW_START}` +
    buildPurchaseCtaHtml(purchaseCtaCopy(data)) +
    buildCompareCandidatesHtml(selectCandidates(data)) +
    `\n        ${FLOW_END}\n`;
  const anchor = "\n        <!-- Attribute Scores -->";
  if (!html.includes(anchor)) throw new Error(`${data.productId}: Attribute Scores anchor missing for purchase flow`);
  return html.replace(anchor, `${block}${anchor}`);
}

function injectAttributeScores(html, data) {
  const scores = data.attributeScores;
  if (!scores) return html;
  for (const key of Object.keys(scores)) {
    const attr = scores[key];
    if (!attr) continue;
    const cardRe = new RegExp(
      `(<div class="attribute-card"[^>]*data-attribute="${escapeRegExp(key)}"[^>]*>)([\\s\\S]*?)(</div>\\s*)(?=<div class="attribute-card"|</div>\\s*</div>\\s*</section>)`,
      "i",
    );
    html = html.replace(cardRe, (full, open, body, close) => {
      let next = body;
      if (attr.overall != null) {
        const color = overallColor(attr.overall);
        next = next.replace(
          /<span([^>]*class="attribute-overall-score"[^>]*)>[\s\S]*?<\/span>/i,
          `<span style="font-size: 1.5rem; font-weight: 700; color: ${color};" class="attribute-overall-score">${escapeHtml(attr.overall)}</span>`,
        );
      }
      const details = buildAttributeDetailsHtml(attr, key);
      if (details) {
        // details は入れ子の div を含むので、カード内の最後の </div> までを置き換える（再実行しても重複しない）
        next = next.replace(
          /(<div class="attribute-details">)[\s\S]*(<\/div>)(\s*)$/i,
          `$1${details}\n                        $2$3`,
        );
      }
      return open + next + close;
    });
  }
  return html;
}

function injectAffiliateStatic(html, data) {
  const block = buildStaticAffiliateHtml(data);
  // Strip previous static blocks
  html = html.replace(
    /\s*<!-- AFFILIATE_STATIC_START -->[\s\S]*?<!-- AFFILIATE_STATIC_END -->\s*/g,
    "\n",
  );
  // Insert into first empty #affiliate-moshimo and #affiliate-moshimo-2
  let n = 0;
  html = html.replace(
    /(<div id="affiliate-moshimo(?:-2)?"[^>]*>)([\s\S]*?)(<\/div>)/gi,
    (full, open, _inner, close) => {
      n += 1;
      if (n > 2) return full;
      return `${open}\n${block}\n            ${close}`;
    },
  );
  return html;
}

function injectTimeSavingLink(html) {
  const section = buildTimeSavingLinkSection();
  const marked = /<!-- TIME_SAVING_START -->[\s\S]*?<!-- TIME_SAVING_END -->/;
  if (marked.test(html)) return html.replace(marked, () => section);
  const legacy =
    /(?:<!-- Time Saving \/ Quality of Life -->\s*)?<section>\s*<h2 class="section-title">\s*<i class="fas fa-clock"><\/i>[\s\S]*?自由な時間が増えます[\s\S]*?<\/section>/;
  if (legacy.test(html)) return html.replace(legacy, () => section);
  // Already replaced heading variant
  const legacy2 =
    /<section>\s*<h2 class="section-title">\s*<i class="fas fa-clock"><\/i>[\s\S]*?掃除の手間を減らすという視点[\s\S]*?<\/section>/;
  if (legacy2.test(html)) return html.replace(legacy2, () => section);
  return html;
}

function injectUpdateBadge(html, data) {
  const badge = updateBadgeHtml(data.updateInfo?.lastUpdated);
  const re =
    /<div class="update-status-badge"[^>]*data-dynamic="updateInfo\.badge"[^>]*>[\s\S]*?<\/div>/i;
  if (re.test(html)) return html.replace(re, () => badge);
  return html;
}

function injectBreadcrumbCurrent(html, metadata) {
  const name = metadata.labelPart || metadata.name;
  return html.replace(
    /(<span class="breadcrumb-current">)[\s\S]*?(<\/span>)/i,
    `$1${escapeHtml(name)}$2`,
  );
}

function stripProductNameFromSectionHeadings(html, displayName, productName) {
  const generics = [
    ["の口コミの信頼度", "口コミの信頼度"],
    ["の総合性能分析", "総合性能分析"],
    ["の口コミキーワード", "口コミキーワード"],
    ["の主な不満点と対策", "主な不満点と対策"],
    ["のライフスタイル別の相性診断", "ライフスタイル別の相性診断"],
    ["で毎日の掃除から解放されて、自由な時間が増えます", "毎日の掃除から解放されて、自由な時間が増えます"],
    ["を毎日使い続けるためのコスト（維持費）", "毎日使い続けるためのコスト（維持費）"],
  ];
  const names = [...new Set([displayName, productName].filter(Boolean).map(String))];
  for (const name of names) {
    for (const [suffix, generic] of generics) {
      const specific = `${name}${suffix}`;
      if (html.includes(specific)) {
        html = html.split(specific).join(generic);
      }
    }
  }
  return html;
}

function validatePrerenderedHtml(html, data) {
  const metadata = buildMetadata(data);
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
  const url = pageUrl(data.productId);
  const required = [
    `<link rel="canonical" href="${url}">`,
    `property="og:url" content="${url}"`,
    `data-dynamic="productName">${buildProductTitleHtml(metadata)}</h1>`,
    "/* MOBILE_LAYOUT_FIX_START */",
  ];
  for (const expected of required) {
    if (!html.includes(expected)) {
      throw new Error(`${data.productId}: prerender validation failed (${expected})`);
    }
  }
  if (
    html.includes("<!-- SEO_PRERENDER_START -->") ||
    html.includes("seo-unique-summary") ||
    html.includes("口コミ分析サマリー")
  ) {
    throw new Error(`${data.productId}: SEO analysis summary block must be removed`);
  }
  if (!html.includes("<!-- CONSUMABLES_START -->") || html.includes('data-dynamic="operationalCost.')) {
    throw new Error(`${data.productId}: consumables section must come from verified data only`);
  }
  for (const [dottedPath, rawValue, weight] of weightedExpectations) {
    if (rawValue === undefined || rawValue === null) continue;
    // 内訳は JS が #reliability-factors に注入するページがあるため、静的spanがある場合のみ検証
    if (!html.includes(`data-dynamic="${dottedPath}"`)) continue;
    const weighted = Math.round(Number(rawValue) * weight / 100 * 10) / 10;
    const display = Number.isInteger(weighted) ? String(weighted) : weighted.toFixed(1);
    const expected = `data-dynamic="${dottedPath}">${display}</span>`;
    if (!html.includes(expected)) {
      throw new Error(`${data.productId}: weighted reliability value is incorrect (${dottedPath})`);
    }
  }

  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (!jsonLdBlocks.length) throw new Error(`${data.productId}: Product JSON-LD not found`);
  const jsonLd = JSON.parse(jsonLdBlocks[0][1]);
  if (
    jsonLd["@type"] !== "Product" ||
    jsonLd.url !== url ||
    jsonLd.aggregateRating !== undefined
  ) {
    throw new Error(`${data.productId}: Product JSON-LD values do not match source JSON`);
  }
  const types = jsonLdBlocks.map((m) => JSON.parse(m[1])["@type"]);
  if (!types.includes("BreadcrumbList") || !types.includes("WebPage")) {
    throw new Error(`${data.productId}: BreadcrumbList/WebPage JSON-LD missing`);
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
    const nextTemplate = bumpLoaderVersion(
      replaceConsumablesSection(
        ensureMobileOverrides(currentTemplate),
        buildConsumablesSection({}, null),
        "template-unified",
      ),
    );
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

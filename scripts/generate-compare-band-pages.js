/**
 * Generate ALL price-band comparison pages with every product in each band.
 * Mobile: narrow sticky columns + horizontal swipe.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "products/data");

const affiliateScript = (() => {
  const template = fs.readFileSync(
    path.join(root, "compare/robot-vacuum-10-15man.html"),
    "utf8",
  );
  return template.match(
    /<script>\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*<\/script>/,
  )[0];
})();

const STYLE = `<style>
    :root {
      --primary: #1e40af;
      --secondary: #0f172a;
      --accent: #0ea5e9;
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #1e293b;
      --muted: #64748b;
      --line: #e2e8f0;
      --good: #059669;
      --warn: #b45309;
      --bad: #dc2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      padding-top: 72px;
      font-family: "Noto Sans JP", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.75;
    }
    header.hero {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      padding: 1.35rem 1rem 1.6rem;
    }
    @media (min-width: 720px) {
      header.hero { padding: 1.75rem 1.25rem 2rem; }
    }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 0.85rem; }
    @media (min-width: 720px) {
      .wrap { padding: 0 1rem; }
    }
    .eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      opacity: 0.85;
      margin-bottom: 0.45rem;
    }
    h1 {
      font-size: clamp(1.15rem, 4.6vw, 1.85rem);
      font-weight: 900;
      line-height: 1.35;
      margin-bottom: 0.65rem;
    }
    .lede { font-size: 0.9rem; opacity: 0.95; max-width: 46rem; }
    .source-banner {
      margin-top: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.55rem;
      flex-wrap: wrap;
      background: #fef08a;
      color: #0f172a;
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      font-weight: 800;
      font-size: 0.88rem;
      line-height: 1.45;
      max-width: 40rem;
    }
    .source-banner .source-kicker {
      display: inline-block;
      background: #0f172a;
      color: #fef08a;
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      flex-shrink: 0;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.85rem;
    }
    .chip {
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 999px;
      padding: 0.22rem 0.65rem;
      font-size: 0.72rem;
      font-weight: 600;
    }
    article { padding: 1.25rem 0 3.5rem; }
    h2 {
      font-size: 1.2rem;
      font-weight: 900;
      margin: 2rem 0 0.85rem;
      padding-bottom: 0.4rem;
      border-bottom: 3px solid var(--primary);
    }
    h3 {
      font-size: 1.02rem;
      font-weight: 800;
      margin: 1.4rem 0 0.55rem;
    }
    p { margin-bottom: 0.85rem; }
    .note {
      background: #eff6ff;
      border-left: 4px solid var(--accent);
      padding: 0.75rem 0.95rem;
      border-radius: 0 10px 10px 0;
      color: #1e3a8a;
      font-size: 0.88rem;
      margin: 1rem 0 1.25rem;
    }
    .table-source {
      margin: 0 0 0.55rem;
      padding: 0.6rem 0.75rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      font-size: 0.84rem;
      font-weight: 700;
      color: #78350f;
      line-height: 1.5;
    }
    .swipe-hint {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin: 0 0 0.55rem;
      padding: 0.55rem 0.7rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      color: #1e40af;
      font-size: 0.8rem;
      font-weight: 800;
    }
    .swipe-hint .count {
      flex-shrink: 0;
      background: #1e40af;
      color: #fff;
      border-radius: 999px;
      padding: 0.15rem 0.55rem;
      font-size: 0.72rem;
    }
    /* ===== MAIN COMPARISON TABLE ===== */
    .table-stage {
      background: #fff;
      border: 2px solid #cbd5e1;
      border-radius: 16px;
      padding: 0.65rem;
      margin: 0.5rem 0 1.5rem;
      box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
    }
    .table-stage-label {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.65rem;
      padding: 0 0.15rem;
    }
    .table-stage-label strong {
      font-size: 1.02rem;
      font-weight: 900;
      color: var(--secondary);
    }
    .compare-scroll-wrap {
      position: relative;
    }
    .compare-scroll-wrap::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 8px;
      width: 28px;
      z-index: 3;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s ease;
      background: linear-gradient(to left, rgba(255,255,255,.95), transparent);
    }
    .compare-scroll-wrap.can-scroll-right::after {
      opacity: 1;
    }
    .compare-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      padding-bottom: 0.35rem;
      scrollbar-width: thin;
      /* Keep first product clear of sticky label column when snapping/resting */
      scroll-padding-left: 5.5rem;
    }
    @media (min-width: 720px) {
      .compare-scroll { scroll-padding-left: 7.2rem; }
    }
    .compare-scroll::-webkit-scrollbar { height: 7px; }
    .compare-scroll::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 999px;
    }
    table.compare {
      width: max-content;
      min-width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 0.76rem;
    }
    table.compare th,
    table.compare td {
      padding: 0.55rem 0.4rem;
      border-bottom: 1px solid var(--line);
      text-align: center;
      vertical-align: middle;
    }
    table.compare th:first-child,
    table.compare td:first-child {
      text-align: left;
      font-weight: 700;
      color: #334155;
      white-space: normal;
      line-height: 1.3;
      background: #f8fafc;
      position: sticky;
      left: 0;
      z-index: 4;
      min-width: 4.8rem;
      max-width: 5.4rem;
      padding-left: 0.45rem;
      padding-right: 0.4rem;
      box-shadow: 6px 0 10px -8px rgba(15, 23, 42, 0.35);
      font-size: 0.7rem;
    }
    table.compare thead th {
      background: #f1f5f9;
      vertical-align: bottom;
      border-bottom: 2px solid #cbd5e1;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    table.compare thead th:first-child {
      z-index: 5;
      vertical-align: middle;
      font-size: 0.72rem;
    }
    table.compare thead th.product-col {
      background: #f1f5f9;
    }
    .product-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      width: 7.1rem;
      padding: 0.15rem 0.1rem;
    }
    .product-photo {
      width: 68px;
      height: 68px;
      object-fit: contain;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 4px;
    }
    .product-name {
      font-size: 0.7rem;
      font-weight: 900;
      line-height: 1.25;
      color: var(--secondary);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      word-break: break-word;
    }
    .product-mfr {
      font-size: 0.62rem;
      font-weight: 700;
      color: var(--muted);
      margin-top: -0.15rem;
    }
    .product-head a {
      color: inherit;
      text-decoration: none;
      width: 100%;
    }
    .product-head a:hover .product-name { color: var(--primary); }
    @media (min-width: 720px) {
      table.compare { font-size: 0.84rem; }
      table.compare th,
      table.compare td { padding: 0.65rem 0.55rem; }
      table.compare th:first-child,
      table.compare td:first-child {
        min-width: 6.5rem;
        max-width: 7.2rem;
        font-size: 0.8rem;
      }
      .product-head { width: 9.5rem; gap: 0.45rem; }
      .product-photo { width: 96px; height: 96px; }
      .product-name { font-size: 0.8rem; }
      .product-mfr { font-size: 0.72rem; }
    }
    @media (min-width: 1100px) {
      .product-head { width: 11rem; }
      .product-photo { width: 112px; height: 112px; }
      .product-name { font-size: 0.84rem; }
    }
    table.compare tbody tr:nth-child(even) td { background: #fcfdff; }
    table.compare tbody tr:nth-child(even) td:first-child { background: #f1f5f9; }
    table.compare tbody tr:hover td { background: #f0f9ff; }
    table.compare tbody tr:hover td:first-child { background: #e0f2fe; }
    .score { font-weight: 900; color: var(--primary); font-size: 0.92rem; }
    .price { font-weight: 800; font-size: 0.78rem; white-space: nowrap; }
    .kw {
      font-size: 0.68rem;
      line-height: 1.4;
      text-align: left;
      max-width: 7.1rem;
      word-break: break-word;
    }
    @media (min-width: 720px) {
      .score { font-size: 1rem; }
      .price { font-size: 0.86rem; }
      .kw { font-size: 0.78rem; max-width: 9.5rem; }
    }
    .warn { color: var(--warn); font-weight: 700; }
    .bad { color: var(--bad); font-weight: 700; }
    .thin-data { opacity: 0.85; }
    .section-sub {
      color: var(--muted);
      font-size: 0.88rem;
      margin-top: -0.4rem;
      margin-bottom: 0.85rem;
    }
    .matrix {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.7rem;
    }
    @media (min-width: 760px) {
      .matrix { grid-template-columns: 1fr 1fr; }
    }
    .card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 1rem;
    }
    .card h3 { margin-top: 0; }
    .pick {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      font-weight: 800;
      font-size: 0.72rem;
      padding: 0.12rem 0.5rem;
      border-radius: 6px;
      margin-bottom: 0.35rem;
    }
    .product-links {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    @media (min-width: 640px) {
      .product-links { grid-template-columns: 1fr 1fr; }
    }
    .product-links a {
      display: block;
      text-decoration: none;
      color: var(--primary);
      font-weight: 700;
      font-size: 0.88rem;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.7rem 0.85rem;
    }
    .affiliate-section { margin: 1.75rem 0 1rem; }
    .affiliate-section > h2 { margin-top: 0; }
    .affiliate-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.85rem;
    }
    @media (min-width: 640px) {
      .affiliate-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (min-width: 980px) {
      .affiliate-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    .aff-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 0.9rem 0.8rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      min-width: 0;
    }
    .aff-card-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .aff-card-head img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #fff;
      flex-shrink: 0;
    }
    .aff-card-head .name {
      font-weight: 900;
      font-size: 0.86rem;
      line-height: 1.3;
      color: var(--secondary);
    }
    .aff-card-head .mfr {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--muted);
    }
    .aff-official {
      display: block;
      text-align: center;
      text-decoration: none;
      color: #fff;
      font-weight: 800;
      font-size: 0.88rem;
      line-height: 1.4;
      padding: 0.7rem 0.8rem;
      border-radius: 10px;
      background: linear-gradient(145deg, #0e7490 0%, #0d9488 42%, #059669 100%);
    }
    .aff-moshimo { min-width: 0; width: 100%; }
    .aff-moshimo iframe {
      width: 100%;
      max-width: 100%;
      border: 0;
      display: block;
    }
    .aff-status {
      font-size: 0.78rem;
      color: var(--muted);
      font-weight: 600;
    }
    .aff-status.error { color: var(--bad); }
    footer {
      border-top: 1px solid var(--line);
      padding: 1.5rem 1rem;
      color: var(--muted);
      font-size: 0.82rem;
      text-align: center;
    }
    .row-group td {
      border-top: 2px solid #cbd5e1;
    }
  </style>`;

function load(slug) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, `${slug}.json`), "utf8"));
}

function yen(n) {
  return "¥" + Number(n).toLocaleString("ja-JP");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortKw(keyword) {
  const map = [
    [/満足|買ってよかった/, "満足"],
    [/水拭き|拭き掃除/, "水拭き"],
    [/マッピング|ルート/, "マッピング"],
    [/静か|静音/, "静か"],
    [/綺麗|きれい/, "綺麗"],
    [/使いやすい|便利/, "便利"],
    [/吸引/, "吸引"],
    [/サラサラ|ピカピカ|床が/, "床きれい"],
    [/家事/, "家事が楽"],
    [/故障|不具合/, "故障"],
    [/段差|引っかかる|スタック/, "段差"],
    [/止ま/, "停止"],
    [/コード|巻き込/, "コード"],
    [/動作音|騒音/, "動作音"],
    [/アプリ|Wi-?Fi/, "アプリ"],
    [/コンパクト|小型/, "小型"],
    [/ゴミ収集|自動収集/, "自動収集"],
    [/ペット/, "ペット毛"],
  ];
  for (const [re, label] of map) {
    if (re.test(keyword)) return label;
  }
  return String(keyword).split(/[・／/]/)[0].slice(0, 6);
}

function topKws(list, n = 3) {
  return (list || [])
    .slice(0, n)
    .map((x) => shortKw(x.keyword || x))
    .filter(Boolean)
    .join(" / ");
}

function scoreTone(pct) {
  if (pct == null) return "";
  if (pct >= 7) return " bad";
  if (pct >= 4) return " warn";
  return "";
}

function complaintCell(c) {
  if (!c) return '<td class="kw">—</td>';
  const title = (c.title || "").replace(/（.*?）/g, "").trim();
  const short = title.length > 18 ? title.slice(0, 18) + "…" : title;
  const pct = c.percentage != null ? `（${c.percentage}%）` : "";
  const tone = scoreTone(c.percentage);
  return `<td class="kw${tone}">${escapeHtml(short)}${pct}</td>`;
}

function complaintShort(c) {
  if (!c) return '<td class="kw">—</td>';
  const t = (c.title || "").replace(/（.*?）/g, "").trim();
  const short = t.length > 18 ? t.slice(0, 18) + "…" : t;
  return `<td class="kw">${escapeHtml(short)}</td>`;
}

function brandOf(p) {
  const m = (p.manufacturer || "").trim();
  if (/ecovacs/i.test(m)) return "ECOVACS";
  if (/roborock/i.test(m)) return "Roborock";
  if (/anker|eufy/i.test(m)) return "Anker";
  if (/irobot/i.test(m)) return "iRobot";
  if (/switchbot/i.test(m)) return "SwitchBot";
  if (/dreame/i.test(m)) return "Dreame";
  return m || "—";
}

function perf(p, key) {
  const v = p.performanceAnalysis?.[key]?.score;
  return v != null ? Math.round(v) : "—";
}

function autoOneLiner(p) {
  const reviews = p.totalReviews || 0;
  if (reviews < 30) return "口コミ少なめ。参考程度に";
  if (reviews < 80) return "データは中位。注意点を要確認";
  const scores = [
    ["床", perf(p, "floorCleaning")],
    ["静音", perf(p, "quietness")],
    ["メンテ", perf(p, "maintenance")],
    ["ペット毛", perf(p, "petHairRemoval")],
    ["アプリ", perf(p, "appStability")],
  ].filter(([, s]) => typeof s === "number");
  scores.sort((a, b) => b[1] - a[1]);
  if (reviews >= 300 && scores[0]) return `口コミ厚みあり。${scores[0][0]}が強い`;
  if (scores[0]) return `${scores[0][0]}評価が相対的に高い`;
  return "表の数値と注意点で判断";
}

function productMeta(slug) {
  const p = load(slug);
  const comps = (p.topComplaints || []).slice(0, 3);
  const reviews = p.totalReviews || 0;
  return {
    slug,
    name: p.productName,
    brand: brandOf(p),
    price: p.price,
    priceLabel: yen(p.price),
    reviews,
    trust: p.reliabilityScore,
    imageUrl: p.imageUrl,
    pos: topKws(p.reviewKeywords?.positive, 3) || "—",
    neg: topKws(p.reviewKeywords?.negative, 3) || "—",
    floor: perf(p, "floorCleaning"),
    quiet: perf(p, "quietness"),
    maint: perf(p, "maintenance"),
    step: perf(p, "stepClimbing"),
    pet: perf(p, "petHairRemoval"),
    app: perf(p, "appStability"),
    c1: comps[0] || null,
    c2: comps[1] || null,
    c3: comps[2] || null,
    oneLiner: autoOneLiner(p),
    thin: reviews < 50,
  };
}

function listAllSlugs() {
  return fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function productsInRange(min, max) {
  return listAllSlugs()
    .map((slug) => {
      const p = load(slug);
      return { slug, price: p.price, reviews: p.totalReviews || 0 };
    })
    .filter((x) => x.price >= min && x.price < max)
    .sort((a, b) => a.price - b.price || b.reviews - a.reviews)
    .map((x) => productMeta(x.slug));
}

function buildPoints(products) {
  const ranked = [...products].sort((a, b) => b.reviews - a.reviews);
  const top = ranked.slice(0, Math.min(3, ranked.length));
  const thin = products.filter((p) => p.thin);
  const points = top.map((p, i) => ({
    pick: i === 0 ? "口コミ厚み" : i === 1 ? "対抗候補" : "第三候補",
    h: p.name,
    p: `${p.reviews}件・信頼度${p.trust}。${p.oneLiner}`,
  }));
  points.push({
    pick: "見方",
    h: `帯内 ${products.length} 製品をすべて掲載`,
    p:
      thin.length > 0
        ? `口コミ50件未満が${thin.length}台あります。件数の薄い列は参考値として扱い、詳細ページも確認してください。`
        : "左右スワイプで全製品を横断比較できます。件数と信頼度を先に見ると判断しやすいです。",
  });
  return points;
}

function buildWho(products) {
  const ranked = [...products].sort((a, b) => b.reviews - a.reviews);
  const byFloor = [...products]
    .filter((p) => typeof p.floor === "number")
    .sort((a, b) => b.floor - a.floor)[0];
  const byQuiet = [...products]
    .filter((p) => typeof p.quiet === "number")
    .sort((a, b) => b.quiet - a.quiet)[0];
  const byMaint = [...products]
    .filter((p) => typeof p.maint === "number")
    .sort((a, b) => b.maint - a.maint)[0];
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
  return [
    {
      h: "失敗したくない",
      p: `<strong>${escapeHtml(ranked[0].name)}</strong> — 帯内で口コミが最も厚い（${ranked[0].reviews}件）。`,
    },
    {
      h: "床をきれいに",
      p: byFloor
        ? `<strong>${escapeHtml(byFloor.name)}</strong> — 床掃除スコア ${byFloor.floor}。`
        : "表の床掃除スコアを優先して比較。",
    },
    {
      h: "音が気になる",
      p: byQuiet
        ? `<strong>${escapeHtml(byQuiet.name)}</strong> — 静音スコア ${byQuiet.quiet}。`
        : "表の静音スコアを優先して比較。",
    },
    {
      h: "手間を減らしたい / 予算",
      p: `<strong>${escapeHtml(byMaint ? byMaint.name : cheapest.name)}</strong>${
        byMaint ? ` — メンテ ${byMaint.maint}。` : "。"
      }予算優先なら <strong>${escapeHtml(cheapest.name)}</strong>（${cheapest.priceLabel}）。`,
    },
  ];
}

const BAND_DEFS = [
  {
    label: "〜5万円",
    urlPath: "/compare/robot-vacuum-under-5man",
    filename: "compare/robot-vacuum-under-5man.html",
    min: 0,
    max: 50000,
  },
  {
    label: "5〜7万円",
    urlPath: "/compare/robot-vacuum-5-7man",
    filename: "compare/robot-vacuum-5-7man.html",
    min: 50000,
    max: 70000,
  },
  {
    label: "7〜10万円",
    urlPath: "/compare/robot-vacuum-7-10man",
    filename: "compare/robot-vacuum-7-10man.html",
    min: 70000,
    max: 100000,
  },
  {
    label: "10〜15万円",
    urlPath: "/compare/robot-vacuum-10-15man",
    filename: "compare/robot-vacuum-10-15man.html",
    min: 100000,
    max: 150000,
  },
  {
    label: "15〜20万円",
    urlPath: "/compare/robot-vacuum-15-20man",
    filename: "compare/robot-vacuum-15-20man.html",
    min: 150000,
    max: 200000,
  },
  {
    label: "20万円〜",
    urlPath: "/compare/robot-vacuum-20man-plus",
    filename: "compare/robot-vacuum-20man-plus.html",
    min: 200000,
    max: Number.POSITIVE_INFINITY,
  },
];

function productHead(prod) {
  const thinClass = prod.thin ? " thin-data" : "";
  return `<th scope="col" class="product-col${thinClass}">
                  <div class="product-head">
                    <a href="https://nattoku-labo.com/products/${prod.slug}" target="_blank" rel="noopener">
                      <img
                        class="product-photo"
                        src="${escapeHtml(prod.imageUrl)}"
                        alt="${escapeHtml(prod.brand + " " + prod.name)}"
                        width="112"
                        height="112"
                        loading="lazy"
                      >
                      <div class="product-name">${escapeHtml(prod.name)}</div>
                      <div class="product-mfr">${escapeHtml(prod.brand)}</div>
                    </a>
                  </div>
                </th>`;
}

function cells(prods, fn) {
  return prods.map(fn).join("\n                ");
}

function buildTable(prods) {
  return `<table class="compare">
            <thead>
              <tr>
                <th scope="col">比較項目</th>
                ${prods.map(productHead).join("\n                ")}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>参考価格</td>
                ${cells(prods, (p) => `<td class="price">${p.priceLabel}</td>`)}
              </tr>
              <tr>
                <td>口コミ件数</td>
                ${cells(
                  prods,
                  (p) =>
                    `<td class="score${p.thin ? " thin-data" : ""}">${p.reviews}件</td>`,
                )}
              </tr>
              <tr>
                <td>口コミ信頼度</td>
                ${cells(prods, (p) => `<td class="score">${p.trust}</td>`)}
              </tr>
              <tr class="row-group">
                <td>高評価で多い声</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.pos)}</td>`)}
              </tr>
              <tr>
                <td>低評価で多い声</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.neg)}</td>`)}
              </tr>
              <tr class="row-group">
                <td>床掃除</td>
                ${cells(prods, (p) => `<td class="score">${p.floor}</td>`)}
              </tr>
              <tr>
                <td>静音</td>
                ${cells(prods, (p) => `<td class="score">${p.quiet}</td>`)}
              </tr>
              <tr>
                <td>メンテ</td>
                ${cells(prods, (p) => `<td class="score">${p.maint}</td>`)}
              </tr>
              <tr>
                <td>段差</td>
                ${cells(prods, (p) => `<td class="score">${p.step}</td>`)}
              </tr>
              <tr>
                <td>ペット毛</td>
                ${cells(prods, (p) => `<td class="score">${p.pet}</td>`)}
              </tr>
              <tr>
                <td>アプリ安定</td>
                ${cells(prods, (p) => `<td class="score">${p.app}</td>`)}
              </tr>
              <tr class="row-group">
                <td>注意点1</td>
                ${cells(prods, (p) => complaintCell(p.c1))}
              </tr>
              <tr>
                <td>注意点2</td>
                ${cells(prods, (p) => complaintShort(p.c2))}
              </tr>
              <tr>
                <td>注意点3</td>
                ${cells(prods, (p) => complaintShort(p.c3))}
              </tr>
              <tr class="row-group">
                <td>ひとこと</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.oneLiner)}</td>`)}
              </tr>
            </tbody>
          </table>`;
}

function affCards(prods) {
  return prods
    .map(
      (p) => `          <article class="aff-card" data-slug="${p.slug}">
            <div class="aff-card-head">
              <img src="${escapeHtml(p.imageUrl)}" alt="" loading="lazy">
              <div>
                <div class="name">${escapeHtml(p.name)}</div>
                <div class="mfr">${escapeHtml(p.brand)}</div>
              </div>
            </div>
            <div class="aff-official-slot"></div>
            <div class="aff-moshimo" id="aff-moshimo-${p.slug}"></div>
            <p class="aff-status">読み込み中…</p>
          </article>`,
    )
    .join("\n");
}

function matrixPoints(points) {
  return `<div class="matrix">
        ${points
          .map(
            (c) => `<div class="card">
          <span class="pick">${escapeHtml(c.pick)}</span>
          <h3>${escapeHtml(c.h)}</h3>
          <p>${escapeHtml(c.p)}</p>
        </div>`,
          )
          .join("\n        ")}
      </div>`;
}

function matrixWho(who) {
  return `<div class="matrix">
        ${who
          .map(
            (c) => `<div class="card">
          <h3>${escapeHtml(c.h)}</h3>
          <p>${c.p}</p>
        </div>`,
          )
          .join("\n        ")}
      </div>`;
}

function itemListJson(band) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析`,
    description: `2大ECサイトの口コミを分析した${band.label}帯のロボット掃除機おすすめ比較（全${band.products.length}製品）`,
    url: `https://nattoku-labo.com${band.urlPath}`,
    numberOfItems: band.products.length,
    itemListElement: band.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://nattoku-labo.com/products/${p.slug}`,
      name: p.name,
    })),
  };
}

const scrollHelperScript = `
  <script>
    (function () {
      const wrap = document.querySelector(".compare-scroll-wrap");
      const scroller = document.querySelector(".compare-scroll");
      if (!wrap || !scroller) return;
      const update = () => {
        const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
        wrap.classList.toggle("can-scroll-right", scroller.scrollLeft < max - 4);
      };
      // Ensure the leftmost product starts fully visible beside the sticky label.
      const resetLeft = () => {
        scroller.scrollLeft = 0;
        update();
      };
      scroller.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      if (document.readyState === "complete") resetLeft();
      else window.addEventListener("load", resetLeft);
      requestAnimationFrame(resetLeft);
    })();
  </script>`;

function buildPage(band) {
  const totalReviews = band.products.reduce((s, p) => s + (p.reviews || 0), 0);
  const title = `ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析 | ナットクLabo`;
  const desc = `${band.label}帯のロボット掃除機全${band.products.length}製品をおすすめ比較。2大ECサイトの口コミを分析し、価格・信頼度・注意点を横並びで確認できます。`;
  const h1 = `ロボット掃除機のおすすめ比較【${band.label}】｜2大ECサイトの口コミ分析`;
  const productLinks = band.products
    .map(
      (p) =>
        `<a href="https://nattoku-labo.com/products/${p.slug}" target="_blank" rel="noopener">${escapeHtml(p.name)} の詳細分析 →</a>`,
    )
    .join("\n        ");
  const points = buildPoints(band.products);
  const who = buildWho(band.products);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://nattoku-labo.com${band.urlPath}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="https://nattoku-labo.com${band.urlPath}">
  <meta property="og:title" content="ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  ${STYLE}

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v=20260809b">
  <script type="application/ld+json">
  ${JSON.stringify(itemListJson(band), null, 2)}
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://nattoku-labo.com/"},
      {"@type": "ListItem", "position": 2, "name": "おすすめ比較", "item": "https://nattoku-labo.com/compare/"},
      {"@type": "ListItem", "position": 3, "name": "${band.label}", "item": "https://nattoku-labo.com${band.urlPath}"}
    ]
  }
  </script>

</head>
<body>
  <header class="hero">
    <div class="wrap">
      <p class="eyebrow">ロボット掃除機 おすすめ比較 · 口コミ分析 · ${band.label}帯 · 全${band.products.length}製品</p>
      <h1>${h1}</h1>
      <p class="lede">
        「ロボット掃除機 おすすめ 比較」で迷う人向けに、同じ予算帯の候補を2大ECサイトの口コミ分析で横比較します。この価格帯の掲載製品はすべて表に入れています。
      </p>
      <div class="source-banner" role="note">
        <span class="source-kicker">データ根拠</span>
        <span>2大ECサイトの口コミを分析した結果です（合計 ${totalReviews.toLocaleString("ja-JP")}件 / ${band.products.length}製品）</span>
      </div>
      <div class="meta-row">
        <span class="chip">2大ECサイトの口コミ分析</span>
        <span class="chip">おすすめ比較</span>
        <span class="chip">${band.label}</span>
        <span class="chip">全${band.products.length}製品</span>
      </div>
    </div>
  </header>

  <article>
    <div class="wrap">
      <div class="note">
        表示価格はメーカー希望小売価格（参考）です。本ページの比較は、2大ECサイトに寄せられた口コミを集計・分析した参考情報です。口コミが少ない製品は数値が揺れやすいので、件数・信頼度とあわせて読んでください。
      </div>

      <section class="table-stage" aria-label="ロボット掃除機おすすめ比較表">
        <div class="table-stage-label">
          <strong>ロボット掃除機 おすすめ比較表（${band.label}・全${band.products.length}製品）</strong>
        </div>
        <p class="table-source">比較表の数値・キーワード・注意点は、すべて2大ECサイトの口コミ分析に基づきます。</p>
        <p class="swipe-hint">
          <span>表を左右にスワイプして全製品を比較</span>
          <span class="count">${band.products.length}製品</span>
        </p>
        <div class="compare-scroll-wrap can-scroll-right">
          <div class="compare-scroll">
            ${buildTable(band.products)}
          </div>
        </div>
      </section>

      <section class="affiliate-section" id="price-check" aria-label="最新価格をチェック">
        <h2>最新価格をチェック</h2>
        <p class="section-sub">各製品の最新価格は、以下から確認できます（${band.products.length}製品）。</p>
        <div class="affiliate-grid" id="affiliate-grid">
${affCards(band.products)}
        </div>
      </section>

      <h2>このおすすめ比較で見るべきポイント</h2>
      <p class="section-sub">表の差だけ短く補足します。詳細は各製品ページへ。</p>
      ${matrixPoints(points)}

      <h2>どんな人におすすめか</h2>
      ${matrixWho(who)}

      <h2>比較したロボット掃除機の詳細へ</h2>
      <div class="product-links">
        ${productLinks}
      </div>

      <p class="section-sub" style="margin-top:1.5rem"><a href="/compare/">ほかの価格帯のおすすめ比較一覧 →</a></p>
    </div>
  </article>

  <footer>
    ナットクLabo ·
  </footer>
  ${affiliateScript}
  ${scrollHelperScript}
  <script src="/products/js/navigation.js?v=20260809b"></script>
</body>
</html>
`;
}

const manifest = [];
for (const def of BAND_DEFS) {
  const products = productsInRange(def.min, def.max);
  if (!products.length) {
    console.warn("empty band", def.label);
    continue;
  }
  const band = { ...def, products };
  const html = buildPage(band);
  fs.writeFileSync(path.join(root, def.filename), html, "utf8");
  console.log(
    "wrote",
    def.filename,
    products.length,
    "products:",
    products.map((p) => p.slug).join(","),
  );
  manifest.push({
    label: def.label,
    urlPath: def.urlPath,
    slugs: products.map((p) => p.slug),
    count: products.length,
  });
}

fs.writeFileSync(
  path.join(root, "compare/_bands-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("done", manifest.length, "bands");

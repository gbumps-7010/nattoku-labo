/**
 * 1) ヒーロー meta の class 名衝突を解消（nav の .product-meta と分離）
 * 2) パンくずを ホーム / 製品一覧 / 製品名 に修正
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "products");

const NEW_BREADCRUMB = `            <div class="breadcrumb" aria-label="パンくずリスト">
                <a href="/"><i class="fas fa-home"></i> ホーム</a>
                <span aria-hidden="true">/</span>
                <a href="/#productsContainer">製品一覧</a>
                <span aria-hidden="true">/</span>
                <span class="breadcrumb-current">製品名</span>
            </div>`;

const BREADCRUMB_RE =
  /<div class="breadcrumb"[^>]*>[\s\S]*?<\/div>\s*(?=\s*<div class="product-header">)/;

let ok = 0;
let fail = [];

for (const fn of fs.readdirSync(DIR).sort()) {
  if (!fn.endsWith(".html") || fn.startsWith("test")) continue;
  const fp = path.join(DIR, fn);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes('class="breadcrumb"') && !html.includes("product-meta")) continue;

  // Rename hero meta classes (avoid clashing with navigation dropdown .product-meta)
  html = html.replace(/class="product-meta"/g, 'class="product-header-stats"');
  html = html.replace(/class="product-meta-pill"/g, 'class="product-header-stat"');
  html = html.replace(/\.product-meta-pill/g, ".product-header-stat");
  html = html.replace(/\.product-meta\b/g, ".product-header-stats");

  // Fix accidental renames inside comments? unlikely.
  // Restore if we broke something in unrelated CSS - product-header-stats is correct for hero.

  if (!BREADCRUMB_RE.test(html)) {
    fail.push(fn + ":breadcrumb");
  } else {
    html = html.replace(BREADCRUMB_RE, NEW_BREADCRUMB + "\n            \n");
  }

  // Bump navigation.css cache so clients pick up companion CSS fix
  html = html.replace(/navigation\.css\?v=[^"']+/g, "navigation.css?v=20260814a");
  html = html.replace(/navigation\.js\?v=[^"']+/g, "navigation.js?v=20260814a");

  fs.writeFileSync(fp, html, "utf8");
  ok++;
  console.log("patched", fn);
}

console.log(`\ndone: ${ok}`);
if (fail.length) {
  console.log("FAILED:", fail.join(", "));
  process.exitCode = 1;
}

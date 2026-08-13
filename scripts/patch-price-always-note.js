/**
 * 価格 info ツールチップを廃止し、ヘッダーに常時注意書きを表示
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "products");

const NEW_PRICE_CSS = `
        /* 価格注意書き（常時表示） */
        .product-price-block {
            margin: 1rem 0 1.15rem;
        }

        .product-price-value {
            font-size: 2rem;
            font-weight: 900;
            color: white;
            line-height: 1.2;
        }

        .price-note {
            display: block;
            margin-top: 0.55rem;
            max-width: 36rem;
            font-size: 0.82rem;
            line-height: 1.55;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.95);
        }

        .price-note strong {
            color: #fde68a;
            font-weight: 800;
        }
`;

const NEW_PRICE_HTML = `
                    <div class="product-price-block">
                        <div class="product-price-value">
                            <span data-dynamic="price">00,000</span>
                        </div>
                        <p class="price-note">
                            表示価格はメーカー公式ホームページの参考価格です。<br>
                            各ECサイトではセールが頻繁に入るため、<strong>購入前に現在の販売価格の確認を強く推奨</strong>します。
                        </p>
                    </div>
`;

const PRICE_HTML_RE =
  /<div style="font-size: 2rem; font-weight: 900; color: white; margin: 1rem 0;">[\s\S]*?<\/div>\s*(?=\s*<div class="product-meta">)/;

// From tooltip comment (or .price-info-tooltip) through end of tooltip hover rule, keep going until before breadcrumb or next major section
const PRICE_CSS_RE =
  /(?:\/\*\s*価格情報ツールチップ\s*\*\/\s*)?\.price-info-tooltip\s*\{[\s\S]*?\.price-info-tooltip:hover\s*\.tooltip-text\s*\{[\s\S]*?\}\s*/;

const PRICE_NOTE_ONLY_CSS_RE =
  /\.price-note\s*\{[\s\S]*?\}\s*(?=\.price-info-tooltip|\.breadcrumb|\/\*|@media)/;

let ok = 0;
let fail = [];

for (const fn of fs.readdirSync(DIR).sort()) {
  if (!fn.endsWith(".html") || fn.startsWith("test")) continue;
  const fp = path.join(DIR, fn);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes('data-dynamic="price"')) continue;

  let changed = false;

  if (PRICE_HTML_RE.test(html)) {
    html = html.replace(PRICE_HTML_RE, NEW_PRICE_HTML.trimEnd() + "\n                    \n                    ");
    changed = true;
  } else if (html.includes("product-price-block")) {
    // already converted html
  } else {
    fail.push(fn + ":html");
    continue;
  }

  if (PRICE_CSS_RE.test(html)) {
    html = html.replace(PRICE_CSS_RE, NEW_PRICE_CSS.trimStart());
    changed = true;
  } else if (!html.includes("product-price-block") || !html.includes(".product-price-block")) {
    // Try insert CSS before .breadcrumb or after performance-scores styles
    if (html.includes(".price-note {") && !html.includes(".product-price-block")) {
      // remove leftover .price-note and tooltip if any
      html = html.replace(
        /\/\*\s*価格情報ツールチップ\s*\*\/[\s\S]*?\.price-info-tooltip:hover\s*\.tooltip-text\s*\{[\s\S]*?\}\s*/,
        NEW_PRICE_CSS.trimStart()
      );
      changed = true;
    } else if (!html.includes(".product-price-block")) {
      // insert before breadcrumb styles if present
      if (html.includes(".breadcrumb")) {
        html = html.replace(".breadcrumb", NEW_PRICE_CSS.trimStart() + "\n        .breadcrumb");
        changed = true;
      } else {
        fail.push(fn + ":css");
        continue;
      }
    }
  }

  // Clean any leftover tooltip CSS fragments
  if (html.includes("price-info-tooltip")) {
    html = html.replace(
      /\/\*\s*価格情報ツールチップ\s*\*\/[\s\S]*?\.price-info-tooltip:hover\s*\.tooltip-text\s*\{[\s\S]*?\}\s*/g,
      ""
    );
    html = html.replace(/\.price-info-tooltip[\s\S]*?\.price-info-tooltip:hover\s*\.tooltip-text\s*\{[\s\S]*?\}\s*/g, "");
    changed = true;
  }

  if (!changed && html.includes("product-price-block") && html.includes(".product-price-block")) {
    console.log("already", fn);
    continue;
  }

  fs.writeFileSync(fp, html, "utf8");
  ok++;
  console.log("patched", fn);
}

console.log(`\ndone: ${ok}`);
if (fail.length) {
  console.log("FAILED:", fail.join(", "));
  process.exitCode = 1;
}

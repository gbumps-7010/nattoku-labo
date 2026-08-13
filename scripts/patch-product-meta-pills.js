/**
 * 全製品ページのヒーロー meta ピルを高コントラスト化し、データ更新日を追加する。
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "products");

const META_CSS = `
        .product-meta {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
        }

        .product-meta-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.55rem 1.05rem;
            border-radius: 999px;
            font-weight: 700;
            font-size: 0.92rem;
            line-height: 1.3;
            color: #0f172a;
            background: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
        }

        .product-meta-pill [data-dynamic] {
            color: #0369a1;
            font-weight: 900;
        }
`.trimEnd();

const META_HTML = `
                    <div class="product-meta">
                        <div class="product-meta-pill">
                            総口コミ: <span data-dynamic="totalReviews">0</span>件
                        </div>
                        <div class="product-meta-pill">
                            口コミ信頼度: <span data-dynamic="reliabilityScore">0</span>点
                        </div>
                        <div class="product-meta-pill">
                            データ更新: <span data-dynamic="updateInfo.lastUpdated">—</span>
                        </div>
                    </div>
`.trimEnd();

// product-meta wrapper + one or more child divs (pills)
const META_HTML_RE =
  /<div class="product-meta">\s*(?:<div[\s\S]*?<\/div>\s*)+<\/div>/;

function patchCss(html) {
  // Replace existing product-meta (+ optional pill) block before /* Container */ or .container
  const cssRe =
    /\n\s*\.product-meta\s*\{[\s\S]*?\}\s*(?:\.product-meta-pill\s*\{[\s\S]*?\}\s*(?:\.product-meta-pill\s*\[data-dynamic\]\s*\{[\s\S]*?\}\s*)?)?(?=\/\*\s*Container|\.container\s*\{)/;

  if (cssRe.test(html)) {
    return html.replace(cssRe, `\n${META_CSS}\n`);
  }
  return html;
}

function patchMobileCss(html) {
  const mobilePill =
    /\.product-meta-pill\s*\{[^}]*justify-content:\s*flex-start;[^}]*\}/;
  if (mobilePill.test(html)) {
    return html.replace(
      mobilePill,
      `.product-meta-pill {
                padding: 0.6rem 0.85rem;
                font-size: 0.88rem;
                justify-content: flex-start;
                width: 100%;
                box-sizing: border-box;
            }`
    );
  }
  return html;
}

function patchHtmlBlock(html) {
  if (!META_HTML_RE.test(html)) return null;
  return html.replace(META_HTML_RE, META_HTML);
}

function patchReliabilityLabel(html) {
  return html.replace(/>記事最終更新日</g, ">データ更新日<");
}

let ok = 0;
let fail = [];

for (const fn of fs.readdirSync(DIR).sort()) {
  if (!fn.endsWith(".html")) continue;
  if (fn.startsWith("test")) continue;
  // include template-unified.html
  const fp = path.join(DIR, fn);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes('class="product-meta"')) continue;

  html = patchCss(html);
  html = patchMobileCss(html);
  const next = patchHtmlBlock(html);
  if (!next) {
    fail.push(fn);
    continue;
  }
  html = next;
  html = patchReliabilityLabel(html);
  fs.writeFileSync(fp, html, "utf8");
  ok++;
  console.log("patched", fn);
}

console.log(`\ndone: ${ok} files`);
if (fail.length) {
  console.log("FAILED html block:", fail.join(", "));
  process.exitCode = 1;
}

/**
 * 価格ツールチップ本文＋表示ラベルを更新
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "products");

const TOOLTIP_RE =
  /(価格について<\/strong>)([\s\S]*?)(<\/span>\s*<\/span>\s*<span class="price-note">)/;

const NEW_BODY = `
                                表示価格は<strong style="color:#e2e8f0;">メーカー公式ホームページ</strong>の参考価格です。<br><br>
                                Amazon・楽天などの各ECサイトでは<strong style="color:#fde68a;">セールが頻繁に入る</strong>ため、表示価格と大きく異なることがあります。<br><br>
                                <strong style="color:#fca5a5;">購入前に、必ず各ECサイトで現在の販売価格をご確認ください。</strong>
                            `;

const NOTE_RE =
  /(<span class="price-note">)([\s\S]*?)(<\/span>\s*<\/div>\s*(?:\s*<div class="product-meta">))/;

const NEW_NOTE =
  '参考価格（メーカー公式HP） · <strong style="color:#fde68a;">ECは現価の確認を強く推奨</strong> <i class="fas fa-info-circle" style="font-size: 0.7rem; color: #60a5fa;"></i>';

let ok = 0;
let fail = [];

for (const fn of fs.readdirSync(DIR).sort()) {
  if (!fn.endsWith(".html") || fn.startsWith("test")) continue;
  const fp = path.join(DIR, fn);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes("価格について")) continue;

  if (!TOOLTIP_RE.test(html)) {
    fail.push(fn + ":tooltip");
    continue;
  }
  html = html.replace(TOOLTIP_RE, `$1${NEW_BODY}$3`);

  if (!NOTE_RE.test(html)) {
    // note may already be updated; ensure content
    if (!html.includes("ECは現価の確認を強く推奨")) {
      fail.push(fn + ":note");
      continue;
    }
  } else {
    html = html.replace(NOTE_RE, `$1${NEW_NOTE}$3`);
  }

  // Normalize newlines in inserted body to file style
  if (html.includes("\r\n")) {
    html = html.replace(/\n(?!\r)/g, "\n"); // leave as written; write with \n is ok for git
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

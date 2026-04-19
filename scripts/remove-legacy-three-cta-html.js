#!/usr/bin/env node
/**
 * 旧3ボタン（Amazon/楽天/Yahoo）CTA HTML を削除し、もしも用 purchase-compare-cta ブロックに置換する。
 * 対象: products 配下および deploy-files/products 配下の .html
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIRS = [
  path.join(ROOT, "products"),
  path.join(ROOT, "deploy-files", "products"),
];

const MOSHI_SECTION = `        <!-- 購入案内: JSON の moshimoAffiliate* があるときだけ表示（もしもアフィリエイト） -->
        <section id="purchase-compare-cta" hidden>
            <h2 class="section-title">
                <i class="fas fa-shopping-cart"></i>
                購入・価格のご案内
            </h2>
            <div class="nattoku-moshimo-slot" aria-live="polite"></div>
            <p style="text-align: center; color: #64748b; font-size: 0.85rem; margin: 1.25rem 0 0 0; line-height: 1.6;">
                💡 以下のカードから各ショップの<strong>価格・在庫・送料</strong>をご確認いただけます（もしもアフィリエイト）
            </p>
        </section>
`;

function walkHtml(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "data") continue;
      walkHtml(p, out);
    } else if (name.endsWith(".html")) out.push(p);
  }
}

function stripLegacy(html) {
  let s = html;
  let changed = false;
  const hadPurchaseCompare = html.includes('id="purchase-compare-cta"');

  // 上部「メインCTA」（総合性能分析の直後）＋直後の <section> 1つ
  const reMain =
    /<!-- メインCTA: 総合性能分析の直後 -->\s*<section[\s\S]*?<\/section>\s*\r?\n/g;
  if (s.search(reMain) !== -1) {
    s = s.replace(reMain, "");
    changed = true;
  }

  // 下部「購入先を比較」3カード
  const reBottom =
    /<!-- CTA Buttons -->\s*<section>[\s\S]*?<\/section>\s*\r?\n/g;
  if (s.search(reBottom) !== -1) {
    s = s.replace(
      reBottom,
      hadPurchaseCompare ? "\n" : MOSHI_SECTION + "\n",
    );
    changed = true;
  }

  // メインCTAコメントのみ残っている場合（次のブロックが <!-- ... --> のとき）
  const reOrphanMain =
    /<!-- メインCTA: 総合性能分析の直後 -->(?:\s*\r?\n)+(?=\s*<!--)/g;
  if (s.search(reOrphanMain) !== -1) {
    s = s.replace(reOrphanMain, "");
    changed = true;
  }

  // すでに purchase-compare-cta があり、古い CTA Buttons が無い場合は何もしない
  // 重複 id 防止: 置換後に id="purchase-compare-cta" が2つあれば2つ目を削除（念のため）
  const idCount = (s.match(/id="purchase-compare-cta"/g) || []).length;
  if (idCount > 1) {
    let first = true;
    s = s.replace(
      /<!-- 購入案内: JSON の moshimoAffiliate\* があるときだけ表示（もしもアフィリエイト） -->\s*<section id="purchase-compare-cta" hidden>[\s\S]*?<\/section>\s*\r?\n/g,
      (block) => {
        if (first) {
          first = false;
          return block;
        }
        changed = true;
        return "";
      },
    );
  }

  return { s, changed };
}

/** product-loader があるのに #purchase-compare-cta が無い HTML にスロットを挿入する */
function ensurePurchaseCompareCta(html) {
  if (html.includes('id="purchase-compare-cta"')) return { s: html, changed: false };
  if (!html.includes("product-loader.js")) return { s: html, changed: false };

  const re =
    /(\s*<\/section>\s*\r?\n(?:\s*\r?\n)*)((?:\s*<\/div>\s*\r?\n)+)([\s\r\n]*<!-- Product Loader Script -->)/g;
  let last = null;
  let m;
  while ((m = re.exec(html)) !== null) {
    last = m;
  }
  if (!last) return { s: html, changed: false };

  const full = last[0];
  const head = html.slice(0, last.index);
  const tail = html.slice(last.index + full.length);
  const inserted =
    last[1] + MOSHI_SECTION + "\n" + last[2] + last[3];
  return { s: head + inserted + tail, changed: true };
}

function main() {
  const files = [];
  for (const d of DIRS) walkHtml(d, files);

  let total = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const needsWork =
      raw.includes('data-dynamic="cta.amazon"') ||
      raw.includes('id="purchase-compare-cta"') ||
      raw.includes("<!-- メインCTA: 総合性能分析の直後 -->");
    if (!needsWork) continue;

    const { s, changed } = stripLegacy(raw);
    if (!changed) {
      if (raw.includes('data-dynamic="cta.amazon"')) {
        console.warn("skip (pattern not matched):", path.relative(ROOT, file));
      }
      continue;
    }
    fs.writeFileSync(file, s, "utf8");
    total++;
    console.log("updated:", path.relative(ROOT, file));
  }
  console.log("strip pass done,", total, "files");

  let ensured = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { s, changed } = ensurePurchaseCompareCta(raw);
    if (!changed) continue;
    fs.writeFileSync(file, s, "utf8");
    ensured++;
    console.log("ensure purchase-compare-cta:", path.relative(ROOT, file));
  }
  console.log("ensure pass done,", ensured, "files");
}

main();

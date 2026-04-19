#!/usr/bin/env node
/**
 * データ品質保証セクション直後に「今の価格を確認する」＋もしもリピート用スロットを挿入する。
 * CRLF / インデント差に対応（購入案内コメントの直前に挿入）。
 */
"use strict";

const fs = require("fs");
const path = require("path");

const DIRS = [
  path.resolve(__dirname, "..", "products"),
  path.resolve(__dirname, "..", "deploy-files", "products"),
];

const COMMENT =
  "<!-- 購入案内: JSON の moshimoAffiliate* があるときだけ表示（もしもアフィリエイト） -->";

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

function insertBlock(lineEnd) {
  return (
    `        <!-- 今の価格: かんたんリンク（product-loader で表示制御） -->${lineEnd}` +
    `        <section id="nattoku-moshimo-after-quality" hidden>${lineEnd}` +
    `            <h2 class="section-title">${lineEnd}` +
    `                <i class="fas fa-yen-sign"></i>${lineEnd}` +
    `                今の価格を確認する${lineEnd}` +
    `            </h2>${lineEnd}` +
    `            <div class="card" style="padding: 1rem;">${lineEnd}` +
    `                <div class="nattoku-moshimo-repeat-slot" aria-live="polite"></div>${lineEnd}` +
    `            </div>${lineEnd}` +
    `        </section>${lineEnd}${lineEnd}`
  );
}

function patchContent(s) {
  if (s.includes("nattoku-moshimo-after-quality")) return null;
  const i = s.indexOf(COMMENT);
  if (i < 0) return null;

  const lineEnd = s.includes("\r\n") ? "\r\n" : "\n";
  const re = new RegExp(
    "(<\\/section>)(\\r?\\n(?:[ \\t]*\\r?\\n)*)([\\t ]*)(" +
      COMMENT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      ")",
  );
  const m = s.match(re);
  if (!m) return null;
  const block = insertBlock(lineEnd);
  return s.replace(re, `$1$2${block}$3$4`);
}

function main() {
  const files = [];
  for (const d of DIRS) walkHtml(d, files);
  let n = 0;
  for (const file of files) {
    const s0 = fs.readFileSync(file, "utf8");
    const s1 = patchContent(s0);
    if (s1 == null) continue;
    fs.writeFileSync(file, s1, "utf8");
    console.log(path.relative(path.resolve(__dirname, ".."), file));
    n++;
  }
  console.log("done,", n, "files");
}

main();

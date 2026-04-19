#!/usr/bin/env node
/**
 * ヘッダー内の <img class="product-image-header" data-dynamic="imageUrl"> と
 * 対応する .product-image-header / 2カラム .product-header のスタイルを削除・簡略化する。
 */
"use strict";

const fs = require("fs");
const path = require("path");

const DIRS = [
  path.resolve(__dirname, "..", "products"),
  path.resolve(__dirname, "..", "deploy-files", "products"),
];

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

function transform(html) {
  if (!html.includes("product-image-header")) return html;
  let s = html;

  s = s.replace(/<img[^>]*class="product-image-header"[^>]*>\s*\r?\n?/g, "");

  s = s.replace(
    /\.product-header\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*auto\s+1fr;\s*gap:\s*2rem;\s*align-items:\s*start;\s*\}/g,
    `.product-header {
            display: block;
        }`,
  );

  s = s.replace(
    /\.product-image-header\s*\{[^}]*width:\s*220px;[^}]*height:\s*220px;[^}]*background:\s*var\(--white\);[^}]*border-radius:\s*12px;[^}]*padding:\s*1rem;[^}]*object-fit:\s*contain;\s*\}/g,
    "",
  );

  s = s.replace(
    /@media\s*\(max-width:\s*768px\)\s*\{([^]*?)\.product-header\s*\{\s*grid-template-columns:\s*1fr;\s*text-align:\s*center;\s*\}\s*\.product-image-header\s*\{\s*margin:\s*0\s+auto;\s*\}/g,
    (m, before) => {
      return `@media (max-width: 768px) {${before}.product-header {
                text-align: center;
            }`;
    },
  );

  s = s.replace(/\n{3,}/g, "\n\n");
  return s;
}

function main() {
  const files = [];
  for (const dir of DIRS) {
    if (fs.existsSync(dir)) walkHtml(dir, files);
  }
  let n = 0;
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const next = transform(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next, "utf8");
      console.log(path.relative(path.resolve(__dirname, ".."), file));
      n++;
    }
  }
  console.log("done,", n, "files");
}

main();

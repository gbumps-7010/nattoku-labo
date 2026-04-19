#!/usr/bin/env node
/**
 * 信頼度サブカード: 「重要度」を削除し、スコア表示を「◯％」1行に統一。
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOTS = [
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

function patch(s) {
  let t = s;
  t = t.split("重要度 60%").join("60%");
  t = t.split("重要度 30%").join("30%");
  t = t.split("重要度 10%").join("10%");

  t = t.replace(
    /(<span style="font-size: 2\.5rem; font-weight: 900; color: #0284c7;" data-dynamic="reliability\.dataAdequacy\.score">)(\d+)(<\/span>)\s*\r?\n\s*<span style="font-size: 1rem; color: #64748b; font-weight: 600;">\/ 100<\/span>/g,
    "$1$2%$3",
  );
  t = t.replace(
    /(<span style="font-size: 2\.5rem; font-weight: 900; color: #7c3aed;" data-dynamic="reliability\.consistency\.percentage">)(\d+)(<\/span>)\s*\r?\n\s*<span style="font-size: 1\.5rem; color: #7c3aed; font-weight: 700;">%<\/span>/g,
    "$1$2%$3",
  );
  t = t.replace(
    /(<span style="font-size: 2\.5rem; font-weight: 900; color: #10b981;" data-dynamic="reliability\.freshness\.score">)(\d+)(<\/span>)\s*\r?\n\s*<span style="font-size: 1rem; color: #64748b; font-weight: 600;">\/ 100<\/span>/g,
    "$1$2%$3",
  );
  return t;
}

function main() {
  const files = [];
  for (const r of ROOTS) walkHtml(r, files);
  let n = 0;
  for (const f of files) {
    const s = fs.readFileSync(f, "utf8");
    const t = patch(s);
    if (t !== s) {
      fs.writeFileSync(f, t, "utf8");
      console.log(path.relative(path.resolve(__dirname, ".."), f));
      n++;
    }
  }
  console.log("done,", n, "files");
}

main();

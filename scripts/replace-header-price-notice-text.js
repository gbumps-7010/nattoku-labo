#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOTS = [
  path.resolve(__dirname, "..", "products"),
  path.resolve(__dirname, "..", "deploy-files", "products"),
];

const PAIRS = [
  ["参考価格（メーカー希望小売価格）", "参考価格（メーカー公式HP参考）"],
  ["表示価格はメーカー希望小売価格です。", "表示価格はメーカー公式HPを参考にした価格です。"],
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

function main() {
  const files = [];
  for (const r of ROOTS) walkHtml(r, files);
  let n = 0;
  for (const f of files) {
    let s = fs.readFileSync(f, "utf8");
    let t = s;
    for (const [from, to] of PAIRS) {
      if (t.includes(from)) t = t.split(from).join(to);
    }
    if (t !== s) {
      fs.writeFileSync(f, t, "utf8");
      console.log(path.relative(path.resolve(__dirname, ".."), f));
      n++;
    }
  }
  console.log("done,", n, "files");
}

main();

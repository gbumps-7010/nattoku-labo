#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "products", "data");

const files = fs.readdirSync(DATA).filter((f) => f.endsWith(".json"));
const byJson = new Map();
const duplicateIds = [];

for (const f of files) {
  const full = path.join(DATA, f);
  let j;
  try {
    j = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    console.error("PARSE_FAIL", f, e.message);
    process.exit(1);
  }
  const id = j.productId;
  if (!id) {
    console.error("NO_PRODUCTID", f);
    process.exit(1);
  }
  if (byJson.has(id)) {
    duplicateIds.push({ id, a: byJson.get(id), b: f });
  } else {
    byJson.set(id, f);
  }
}

const pjs = fs.readFileSync(path.join(ROOT, "products-data.js"), "utf8");
const mark = "// フィルター用のマスターデータ";
const idxF = pjs.indexOf(mark);
if (idxF === -1) {
  console.error("products-data.js: marker not found");
  process.exit(1);
}
const head = pjs.slice(0, idxF);
const arrIds = [...head.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]);
const arrSet = new Set(arrIds);

const nav = fs.readFileSync(path.join(ROOT, "products", "js", "navigation.js"), "utf8");
const navM = nav.match(/const ALL_PRODUCTS = \[([\s\S]*?)\];\s*\/\/ メーカー一覧/);
if (!navM) {
  const navM2 = nav.match(/const ALL_PRODUCTS = \[([\s\S]*?)\n\];/);
  if (!navM2) {
    console.error("navigation.js: ALL_PRODUCTS block not found");
    process.exit(1);
  }
}
const navBlock = navM || nav.match(/const ALL_PRODUCTS = \[([\s\S]*?)\n\];/);
const navIds = [...navBlock[1].matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
const navSet = new Set(navIds);

const jsonIds = [...byJson.keys()];
const ph = path.join(ROOT, "products");
const htmls = fs.readdirSync(ph).filter(
  (f) =>
    f.endsWith(".html") &&
    !f.startsWith("template") &&
    f !== "test-js.html" &&
    !f.startsWith("moshimo-embed")
);
const pageNames = new Set(htmls.map((f) => f.replace(/\.html$/, "")));

const missingInData = arrIds.filter((id) => !byJson.has(id));
const missingInJs = jsonIds.filter((id) => !arrSet.has(id));
const navMissing = jsonIds.filter((id) => !navSet.has(id));
const extraNav = navIds.filter((id) => !byJson.has(id));
const noHtml = jsonIds.filter((id) => !pageNames.has(id));
const extraHtml = [...pageNames].filter((n) => !byJson.has(n) && n !== "data" && !n.includes("moshimo"));

console.log("JSON ユニーク productId 数:", jsonIds.length);
console.log("products-data.js 先頭配列内の id 数:", arrIds.length);
console.log("navigation.js ALL_PRODUCTS 件数:", navIds.length);
console.log("products/*.html 商品ページ数（テンプレ・test除く）:", htmls.length);

if (duplicateIds.length) {
  console.log("\n⚠️ 同一 productId が複数JSONにある可能性:");
  duplicateIds.forEach((d) => console.log("  ", d.id, d.a, d.b));
}
if (missingInData.length) {
  console.log("\n❌ products-data.js にあって products/data に productId が無い:");
  missingInData.forEach((x) => console.log("  ", x));
}
if (missingInJs.length) {
  console.log("\n❌ JSON があるが products-data 先頭配列に無い:");
  missingInJs.forEach((x) => console.log("  ", x, "→", byJson.get(x)));
}
if (navMissing.length) {
  console.log("\n❌ JSON があるが ALL_PRODUCTS に無い:");
  navMissing.forEach((x) => console.log("  ", x));
}
if (extraNav.length) {
  console.log("\n❌ ALL_PRODUCTS に余分な id（JSONに無い）:");
  extraNav.forEach((x) => console.log("  ", x));
}
if (noHtml.length) {
  console.log("\n❌ products/<id>.html が無い（JSON productId）:");
  noHtml.forEach((x) => console.log("  ", x));
}
if (extraHtml.length) {
  console.log("\n⚠️ HTML はあるが JSON が無い（要確認）:");
  extraHtml.forEach((x) => console.log("  ", x + ".html"));
}

const hasErr =
  missingInData.length +
    missingInJs.length +
    navMissing.length +
    extraNav.length +
    noHtml.length +
    duplicateIds.length >
  0;

if (!hasErr) {
  console.log("\n✅ 構造上一致: JSON / products-data / navigation / 商品HTML の対応に欠けはありません。");
} else {
  console.log("\n⛔ 上記の差分を解消してください。");
  process.exit(1);
}

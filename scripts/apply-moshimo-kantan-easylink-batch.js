#!/usr/bin/env node
/**
 * もしも「かんたんリンク」配布HTMLを一括で製品JSONへ差し込む。
 *
 * 前提:
 * モードA（既定）: --from 内の各 .html ファイル名が製品IDと一致（例: anker-eufy-c10.html）
 * モードB（--map）: もしも側の好きなファイル名のまま置き、マップで製品IDに対応
 * 共通: 対応する `products/data/{productId}.json` が存在すること
 *
 * 実行後:
 * - HTML を `products/data/moshimo-embed-{productId}.html` にコピー（既定）
 * - JSON に `"moshimoAffiliateEasyLinkHtmlFile": "moshimo-embed-{productId}.html"` を設定
 *
 * 使い方:
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --map path/to/map.tsv
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --map path/to/map.json
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --dry-run
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --move   # コピー後に元ファイルを削除
 *
 * マップ形式:
 *   - .json: { "roborock-q10v": "ダウンロード/q10v.htm" }  （パスは --from からの相対）
 *   - .tsv / .txt: 1行1件、製品ID<TAB>相対パス 。先頭#はコメント
 */
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const DATA_DIR = path.join(REPO, "products", "data");

function parseArgs() {
  const argv = process.argv.slice(2);
  let from = "";
  let mapPath = "";
  let dryRun = false;
  let move = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from" && argv[i + 1]) {
      from = path.resolve(argv[++i]);
    } else if (argv[i] === "--map" && argv[i + 1]) {
      mapPath = path.resolve(argv[++i]);
    } else if (argv[i] === "--dry-run") {
      dryRun = true;
    } else if (argv[i] === "--move") {
      move = true;
    }
  }
  return { from, dryRun, move, mapPath };
}

/**
 * @returns { { productId: string, rel: string }[] }
 */
function loadMapEntries(mapPath) {
  const ext = path.extname(mapPath).toLowerCase();
  const raw = fs.readFileSync(mapPath, "utf8");
  if (ext === ".json") {
    const o = JSON.parse(raw);
    if (o == null || typeof o !== "object" || Array.isArray(o)) {
      throw new Error("マップ .json はオブジェクト形式にしてください: { \"製品ID\": \"相対パス.html\", ... }");
    }
    return Object.entries(o)
      .map(([k, v]) => ({ productId: String(k).trim(), rel: String(v).trim() }))
      .filter((e) => e.productId && e.rel);
  }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    let productId;
    let rel;
    if (line.includes("\t")) {
      const p = line.split("\t", 2).map((s) => s.trim());
      productId = p[0];
      rel = p[1] || "";
    } else {
      const m = line.match(/^(\S+)\s+(.+)$/);
      if (m) {
        productId = m[1].trim();
        rel = m[2].trim();
      }
    }
    if (productId && rel) {
      out.push({ productId, rel });
    }
  }
  return out;
}

function main() {
  const { from, dryRun, move, mapPath } = parseArgs();
  if (!from || !fs.existsSync(from)) {
    console.error("使い方: node scripts/apply-moshimo-kantan-easylink-batch.js --from <HTMLが入ったフォルダ>");
    process.exit(1);
  }

  let jobs = [];
  if (mapPath) {
    if (!fs.existsSync(mapPath)) {
      console.error("マップが見つかりません:", mapPath);
      process.exit(1);
    }
    let entries;
    try {
      entries = loadMapEntries(mapPath);
    } catch (e) {
      console.error("マップ読み込み失敗:", e.message);
      process.exit(1);
    }
    for (const { productId, rel } of entries) {
      const src = path.join(from, rel);
      jobs.push({ productId, src, rel });
    }
  } else {
    const names = fs.readdirSync(from).filter((n) => n.toLowerCase().endsWith(".html"));
    if (names.length === 0) {
      console.warn("フォルダ内に .html がありません（配置後に再実行）:", from);
      process.exit(0);
    }
    for (const name of names) {
      const productId = path.basename(name, path.extname(name));
      jobs.push({ productId, src: path.join(from, name), rel: name });
    }
  }

  let ok = 0;
  let skip = 0;

  for (const { productId, src, rel } of jobs) {
    const jsonPath = path.join(DATA_DIR, `${productId}.json`);
    const destName = `moshimo-embed-${productId}.html`;
    const dest = path.join(DATA_DIR, destName);

    if (!fs.existsSync(src)) {
      console.warn("スキップ（元ファイルなし）:", productId, "←", rel);
      skip++;
      continue;
    }

    if (!fs.existsSync(jsonPath)) {
      console.warn("スキップ（JSONなし）:", productId, "→", jsonPath);
      skip++;
      continue;
    }

    if (dryRun) {
      console.log("[dry-run]", productId, "←", rel, "→", destName);
      ok++;
      continue;
    }

    fs.copyFileSync(src, dest);
    if (move) {
      try {
        fs.unlinkSync(src);
      } catch (e) {
        console.error("元ファイル削除に失敗（取り込みは済んでいます）:", src, e.message);
      }
    }

    const raw = fs.readFileSync(jsonPath, "utf8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("JSON parse 失敗:", jsonPath, e.message);
      skip++;
      continue;
    }

    data.moshimoAffiliateEasyLinkHtmlFile = destName;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");

    console.log("OK:", productId, "→", destName);
    ok++;
  }

  console.log("完了:", ok, "件 / スキップ:", skip, dryRun ? "(dry-run)" : "");
}

main();

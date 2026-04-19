#!/usr/bin/env node
/**
 * もしも「かんたんリンク」配布HTMLを一括で製品JSONへ差し込む。
 *
 * 前提:
 * - 各ファイル名が製品IDと一致: `{productId}.html`（例: anker-eufy-c10.html）
 * - 対応する `products/data/{productId}.json` が存在すること
 *
 * 実行後:
 * - HTML を `products/data/moshimo-embed-{productId}.html` にコピー（既定）
 * - JSON に `"moshimoAffiliateEasyLinkHtmlFile": "moshimo-embed-{productId}.html"` を設定
 *
 * 使い方:
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --dry-run
 *   node scripts/apply-moshimo-kantan-easylink-batch.js --from path/to/folder --move   # コピー後に元ファイルを削除
 */
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const DATA_DIR = path.join(REPO, "products", "data");

function parseArgs() {
  const argv = process.argv.slice(2);
  let from = "";
  let dryRun = false;
  let move = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from" && argv[i + 1]) {
      from = path.resolve(argv[++i]);
    } else if (argv[i] === "--dry-run") {
      dryRun = true;
    } else if (argv[i] === "--move") {
      move = true;
    }
  }
  return { from, dryRun, move };
}

function main() {
  const { from, dryRun, move } = parseArgs();
  if (!from || !fs.existsSync(from)) {
    console.error("使い方: node scripts/apply-moshimo-kantan-easylink-batch.js --from <HTMLが入ったフォルダ>");
    process.exit(1);
  }

  const names = fs.readdirSync(from).filter((n) => n.toLowerCase().endsWith(".html"));
  if (names.length === 0) {
    console.warn("フォルダ内に .html がありません（配置後に再実行）:", from);
    process.exit(0);
  }

  let ok = 0;
  let skip = 0;

  for (const name of names) {
    const productId = path.basename(name, path.extname(name));
    const jsonPath = path.join(DATA_DIR, `${productId}.json`);
    const src = path.join(from, name);
    const destName = `moshimo-embed-${productId}.html`;
    const dest = path.join(DATA_DIR, destName);

    if (!fs.existsSync(jsonPath)) {
      console.warn("スキップ（JSONなし）:", productId, "→", jsonPath);
      skip++;
      continue;
    }

    if (dryRun) {
      console.log("[dry-run]", productId, "→", destName);
      ok++;
      continue;
    }

    fs.copyFileSync(src, dest);
    if (move) {
      fs.unlinkSync(src);
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

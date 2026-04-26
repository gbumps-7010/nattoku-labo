#!/usr/bin/env node
/**
 * Googleスプレッドシート「ファイル → ダウンロード → ウェブページ（.html）」
 * 形式の1ファイルに、ECOVACS 管理表風（製品名列 + かんたんリンク列）でまとまっている
 * 場合、行ごとに Moshimo かんたんリンクを抜き出し apply-moshimo-kantan-easylink-batch.js と
 * 同じ結果（moshimo-embed-*.html + JSON）にする。
 *
 * 使い方:
 *   node scripts/apply-moshimo-from-sheets-export.js --from path/to/ECOVACS.html
 *   node scripts/apply-moshimo-from-sheets-export.js --from path/to/ECOVACS.html --dry-run
 *
 * 別ブランド: --name-map path/to/override.json で { "DEEBOT X11 OmniCyclone": "deebot-x11-omnicyclone" } を上書き/追加
 */
"use strict";

const fs = require("fs");
const path = require("path");

const REPO = path.resolve(__dirname, "..");
const DATA_DIR = path.join(REPO, "products", "data");

/** スプレッドシートの「製品名」セル → products/data/{id}.json の productId */
const DEFAULT_SHEET_NAME_TO_PRODUCT_ID = {
  "DEEBOT X11 OmniCyclone": "deebot-x11-omnicyclone",
  "DEEBOT T90 OMNI": "ecovacs-deebot-t90-omni",
  "DEEBOT T80 OMNI": "deebot-t80-omni",
  "DEEBOT T50 OMNI": "deebot-t50-omni",
  "DEEBOT X8 PRO OMNI": "ecovacs-deebot-x8-pro-omni",
  "DEEBOT N30 PLUS": "deebot-n30-plus",
  "DEEBOT N30": "deebot-n30",
  "DEEBOT mini": "ecovacs-deebot-mini",
  "DEEBOT T50S OMNI": "deebot-t50s-omni",
  // Dreame（製品名はスプレッドシート B 列の表記に合わせる）
  "D20 Pro": "dreame-d20-pro",
  "D9 Max Gen 2": "dreame-d9-max-gen-2",
  "F10": "dreame-f10",
  "X50 Ultra": "dreame-x50-ultra",
  "L40s Pro Ultra": "dreame-l40s-pro-ultra",
  "X30 Ultra": "dreame-x30-ultra",
  "L10s Ultra Gen 3": "dreame-l10s-ultra-gen-3",
  "L40 Ultra AE": "dreame-l40-ultra-ae",
  "L20 Ultra Complete": "dreame-l20-ultra-complete",
  "L10s Ultra Gen 2": "dreame-l10s-ultra-gen2",
  "D10 Plus": "dreame-d10-plus",
  "D20 Pro Plus": "dreame-d20-pro-plus",
  // Roborock（スプレッドシート B 列表記に合わせる）
  "Saros 10R": "roborock-saros-10r",
  "Qrevo CurvC": "roborock-qrevo-curv-c",
  "Q10V+": "roborock-q10v-plus",
  "Q10V": "roborock-q10v",
  // Anker / Eufy（製品名は「製品名」列の <a> テキストに合わせる）
  "Eufy Robot Vacuum Omni E25": "eufy-robot-vacuum-omni-e25",
  "Eufy X10 Pro Omni": "eufy-x10-pro-omni",
  "Eufy Robot Vacuum Omni C28": "eufy-robot-vacuum-omni-c28",
  "Eufy Clean X8 Pro with Self-Empty Station": "eufy-clean-x8-pro-self-empty",
  "Eufy Robot Vacuum Omni S1 Pro": "eufy-robot-vacuum-omni-s1-pro",
  "Eufy Robot Vacuum Omni C20": "eufy-robot-vacuum-omni-c20",
  "Eufy Robot Vacuum Auto-Empty C10": "anker-eufy-c10",
  "Eufy RoboVac G30 Hybrid": "eufy-robovac-g30-hybrid",
  "Eufy RoboVac G30": "eufy-robovac-g30",
  "Eufy RoboVac X8 Hybrid": "eufy-robovac-x8-hybrid",
  "Eufy RoboVac G10 Hybrid": "eufy-robovac-g10-hybrid",
  // SwitchBot（スプレッドシート B 列の <a> 本文に合わせる）
  "お掃除ロボットS20": "switchbot-s20",
  "ロボット掃除機 K11+": "switchbot-k11-plus",
  "お掃除ロボットS10": "switchbot-s10",
  "ロボット掃除機 K10+ Pro": "switchbot-k10-plus-pro",
};

function decodeSheetsCellToHtml(escaped) {
  let s = String(escaped);
  s = s.replace(/<br\s*\/?>(\r\n|\n|\r)?/gi, "\n");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#39;/g, "'");
  s = s.replace(/&amp;/g, "&");
  return s.trim();
}

function parseArgs() {
  const argv = process.argv.slice(2);
  let from = "";
  let nameMapPath = "";
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--from" && argv[i + 1]) {
      from = path.resolve(argv[++i]);
    } else if (argv[i] === "--name-map" && argv[i + 1]) {
      nameMapPath = path.resolve(argv[++i]);
    } else if (argv[i] === "--dry-run") {
      dryRun = true;
    }
  }
  return { from, nameMapPath, dryRun };
}

/**
 * 製品名: B 列。メーカー＋製品（Dreame / ECOVACS 行）か、製品のみの行
 */
function productNameFromS0s(names) {
  if (names.length === 0) return null;
  if (names[0] === "メーカー名") return null;
  if (names[0] === "Dreame" || names[0] === "ECOVACS" || names[0] === "Roborock") {
    return names[1] && names[1].trim() ? names[1].trim() : null;
  }
  return names[names.length - 1] || null;
}

/** Anker 表など: 製品名は s2 内の <a> テキスト（B 列がハイパーリンク） */
function productNameFromS2WithLink(trInner) {
  const m = trInner.match(/<td class="s2"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
  if (!m) return null;
  return m[1].trim();
}

function productNamesFromRow(trInner) {
  const names = [];
  const re = /<td class="s0" dir="ltr">([^<]*)<\/td>/g;
  let m;
  while ((m = re.exec(trInner)) !== null) {
    names.push(m[1].trim());
  }
  if (names.length && names[0] === "メーカー名") return { header: true, product: null };
  const fromLink = productNameFromS2WithLink(trInner);
  if (fromLink) return { header: false, product: fromLink };
  const product = productNameFromS0s(names);
  if (!product) return { header: false, product: null };
  return { header: false, product };
}

function easyLinkFromRow(trInner) {
  const re = /&lt;!--\s*START MoshimoAffiliateEasyLink[\s\S]*?&lt;!--\s*MoshimoAffiliateEasyLink END\s*--&gt;/;
  const m = trInner.match(re);
  if (!m) return null;
  return decodeSheetsCellToHtml(m[0]);
}

function main() {
  const { from, nameMapPath, dryRun } = parseArgs();
  if (!from || !fs.existsSync(from)) {
    console.error("使い方: node scripts/apply-moshimo-from-sheets-export.js --from <スプレッドシートhtml>");
    process.exit(1);
  }

  const nameToId = { ...DEFAULT_SHEET_NAME_TO_PRODUCT_ID };
  if (nameMapPath) {
    const o = JSON.parse(fs.readFileSync(nameMapPath, "utf8"));
    Object.assign(nameToId, o);
  }

  const raw = fs.readFileSync(from, "utf8");
  const parts = raw.split(/<tr style="height: 20px">/i);
  let ok = 0;
  let skip = 0;

  for (const part of parts) {
    if (!/dir="ltr"/.test(part)) continue;
    const trInner = part;
    const { header, product } = productNamesFromRow(trInner);
    if (header) continue;
    if (!product) continue;

    const easyHtml = easyLinkFromRow(trInner);
    if (!easyHtml) {
      console.warn("行スキップ（かんたんリンクなし）:", product);
      skip++;
      continue;
    }

    const productId = nameToId[product];
    if (!productId) {
      console.warn("マップ未登録（--name-map で追加可）:", product);
      skip++;
      continue;
    }

    const jsonPath = path.join(DATA_DIR, `${productId}.json`);
    if (!fs.existsSync(jsonPath)) {
      console.warn("スキップ（JSONなし）:", product, "→", productId);
      skip++;
      continue;
    }

    const destName = `moshimo-embed-${productId}.html`;
    const dest = path.join(DATA_DIR, destName);

    if (dryRun) {
      console.log("[dry-run]", product, "→", productId, "→", destName, `(${easyHtml.length} 文字)`);
      ok++;
      continue;
    }

    fs.writeFileSync(dest, easyHtml, "utf8");
    const jraw = fs.readFileSync(jsonPath, "utf8");
    let data;
    try {
      data = JSON.parse(jraw);
    } catch (e) {
      console.error("JSON parse 失敗:", jsonPath, e.message);
      skip++;
      continue;
    }
    data.moshimoAffiliateEasyLinkHtmlFile = destName;
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log("OK:", product, "→", destName);
    ok++;
  }

  console.log("完了:", ok, "件 / スキップ:", skip, dryRun ? "(dry-run)" : "");
}

main();

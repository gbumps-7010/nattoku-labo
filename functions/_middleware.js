/**
 * Cloudflare Pages middleware
 *
 * 1) www → non-www / UTM 等クエリ除去（代替ページ化を防止）
 * 2) B: /products/products/... を何段でも /products/... へ畳む
 * 3) C: 拡張子付きを拡張子なしへ（正規URL方針）
 * 4) 旧スラッグ → 新スラッグ（_redirects の動的上限に依存しない）
 * 5) 公開終了URL → 410
 *
 * 注: Pages Functions 配下では _redirects が効かないことがあるため、
 * 正規化はここで1ホップ完結させる。
 */
const STRIP_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "twclid",
  "li_fat_id",
  "mc_cid",
  "mc_eid",
  "_ga",
  "_gl",
  "yclid",
  "igshid",
  "si",
]);

/** 旧スラッグ → 正規パス（拡張子なし） */
const SLUG_REDIRECTS = {
  "/products/anker-eufy-c10": "/products/eufy-robot-vacuum-auto-empty-c10",
  "/products/dreame-d10-plus": "/products/d10-plus",
  "/products/dreame-d9-max-gen-2": "/products/d9-max-gen-2",
  "/products/dreame-l10s-ultra-gen-3": "/products/l10s-ultra-gen-3",
  "/products/dreame-l10s-ultra-gen2": "/products/l10s-ultra-gen-2",
  "/products/dreame-l20-ultra-complete": "/products/l20-ultra-complete",
  "/products/dreame-l40-ultra-ae": "/products/l40-ultra-ae",
  "/products/dreame-l40s-pro-ultra": "/products/l40s-pro-ultra",
  "/products/dreame-x30-ultra": "/products/x30-ultra",
  "/products/dreame-x50-ultra": "/products/x50-ultra",
  "/products/ecovacs-deebot-mini": "/products/deebot-mini",
  "/products/ecovacs-deebot-t90-omni": "/products/deebot-t90-omni",
  "/products/ecovacs-deebot-x8-pro-omni": "/products/deebot-x8-pro-omni",
  "/products/eufy-clean-x8-pro-self-empty": "/products/eufy-clean-x8-pro-with-self-empty-station",
  "/products/roborock-q10v": "/products/q10v",
  "/products/roborock-q10v-plus": "/products/q10v-plus",
  "/products/roborock-qrevo-l": "/products/qrevo-l",
  "/products/roborock-saros-10r": "/products/saros-10r",
  "/products/roomba-105-combo": "/products/roomba-105-combo-autoempty",
  "/products/roomba-combo-10-max": "/products/roomba-plus-405-combo-autowash",
  "/products/irobot-roomba-combo-10-max": "/products/roomba-plus-405-combo-autowash",
  "/products/roomba-plus-405-combo": "/products/roomba-plus-405-combo-autowash",
  "/products/roomba-plus-505-combo": "/products/roomba-plus-505-combo-autowash",
  "/products/switchbot-k10-plus-pro": "/products/k10-pro",
  "/products/switchbot-k11-plus": "/products/k11",
  "/products/switchbot-s10": "/products/s10",
  "/products/switchbot-s20": "/products/s20",
  "/products/about": "/about",
  "/products/privacy": "/privacy",
  "/contact-simple": "/privacy",
};

/** 公開終了（410）— 拡張子なしキー */
const GONE_PATHS = new Set([
  "/products/template-unified",
  "/products/template-unified-old",
  "/products/test-js",
  "/products/dreame-d20-pro",
  "/products/dreame-d20-pro-plus",
  "/products/dreame-f10",
  "/products/f10-plus",
  "/products/eufy-robot-vacuum-omni-c20",
  "/products/qrevo-curvc",
  "/products/roborock-qrevo-curv-c",
  "/products/eufy-robovac-g30",
  "/products/eufy-robovac-x8-hybrid",
]);

const HTML_STRIP_PREFIXES = [
  "/products/",
  "/makers/",
  "/compare/",
  "/rankings/",
  "/guides/",
  "/drafts/",
];

function shouldStrip(name) {
  const key = String(name || "").toLowerCase();
  if (STRIP_PARAMS.has(key)) return true;
  if (key.startsWith("utm_")) return true;
  return false;
}

/** B: /products/products/... → /products/...（何段でも） */
function collapseNestedProducts(pathname) {
  let path = pathname;
  while (path.startsWith("/products/products/")) {
    path = "/products/" + path.slice("/products/products/".length);
  }
  if (path === "/products/products") path = "/products";
  return path;
}

/** C: 拡張子付き → なし（サイト正規URL） */
function stripHtmlExtension(pathname) {
  if (!pathname.toLowerCase().endsWith(".html")) return pathname;

  const bare = pathname.slice(0, -5);
  if (bare === "/index" || pathname === "/index.html") return "/";
  if (bare === "/about" || bare === "/privacy" || bare === "/contact-simple") {
    return bare;
  }
  if (HTML_STRIP_PREFIXES.some((p) => bare === p.slice(0, -1) || bare.startsWith(p))) {
    if (bare.endsWith("/index")) return bare.slice(0, -5) || "/";
    return bare;
  }
  return pathname;
}

function normalizePathname(pathname) {
  let path = collapseNestedProducts(pathname);
  path = stripHtmlExtension(path);

  if (path === "/products" || path === "/products/") return "/";
  if (path === "/products/index") return "/";

  // drafts 草案 → makers
  const draftMap = {
    "/drafts/manufacturer-compare-index": "/makers/",
    "/drafts/manufacturer-compare-preview": "/makers/ecovacs",
    "/drafts/manufacturer-compare-ecovacs": "/makers/ecovacs",
    "/drafts/manufacturer-compare-anker": "/makers/anker",
    "/drafts/manufacturer-compare-dreame": "/makers/dreame",
    "/drafts/manufacturer-compare-roborock": "/makers/roborock",
    "/drafts/manufacturer-compare-irobot": "/makers/irobot",
    "/drafts/manufacturer-compare-switchbot": "/makers/switchbot",
  };
  if (draftMap[path]) path = draftMap[path];

  if (SLUG_REDIRECTS[path]) path = SLUG_REDIRECTS[path];

  return path;
}

export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  let changed = false;

  if (incoming.hostname === "www.nattoku-labo.com") {
    incoming.hostname = "nattoku-labo.com";
    changed = true;
  }

  if ([...incoming.searchParams.keys()].some(shouldStrip)) {
    for (const key of [...incoming.searchParams.keys()]) {
      if (shouldStrip(key)) incoming.searchParams.delete(key);
    }
    changed = true;
  }

  const normalized = normalizePathname(incoming.pathname);
  if (normalized !== incoming.pathname) {
    incoming.pathname = normalized;
    changed = true;
  }

  const goneKey = stripHtmlExtension(collapseNestedProducts(incoming.pathname));
  if (GONE_PATHS.has(goneKey)) {
    return new Response("Gone", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }

  if (changed) {
    const dest = `${incoming.origin}${incoming.pathname}${incoming.search}${incoming.hash}`;
    return Response.redirect(dest, 301);
  }

  return context.next();
}

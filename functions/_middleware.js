/**
 * Cloudflare Pages middleware
 *
 * GSC「代替ページ（適切な canonical タグあり）」の主因の一つは、
 * UTM 等付きURLが 200 のまま返り、canonical だけ正規URLを指している状態。
 * トラッキング系クエリを剥がして 301 し、クロール対象を正規URLへ集約する。
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

function shouldStrip(name) {
  const key = String(name || "").toLowerCase();
  if (STRIP_PARAMS.has(key)) return true;
  if (key.startsWith("utm_")) return true;
  return false;
}

export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  let changed = false;

  // www → non-www（_redirects と併用。ここで1ホップに寄せる）
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

  // /index.html や末尾スラッシュの軽い正規化は _redirects / CF に任せ、
  // クエリ剥がし・www のみここで扱う（無限ループ防止）
  if (changed) {
    const dest = `${incoming.origin}${incoming.pathname}${incoming.search}${incoming.hash}`;
    return Response.redirect(dest, 301);
  }

  return context.next();
}

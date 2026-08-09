const fs = require("fs");

// --- sitemap ---
let sm = fs.readFileSync("sitemap.xml", "utf8");
const entries = [
  ["https://nattoku-labo.com/compare/", "0.96"],
  ["https://nattoku-labo.com/compare/robot-vacuum-under-5man", "0.95"],
  ["https://nattoku-labo.com/compare/robot-vacuum-5-7man", "0.95"],
  ["https://nattoku-labo.com/compare/robot-vacuum-7-10man", "0.95"],
  ["https://nattoku-labo.com/compare/robot-vacuum-10-15man", "0.95"],
  ["https://nattoku-labo.com/compare/robot-vacuum-15-20man", "0.95"],
  ["https://nattoku-labo.com/compare/robot-vacuum-20man-plus", "0.95"],
];
sm = sm.replace(
  /\n  <url>\n    <loc>https:\/\/nattoku-labo.com\/compare\/robot-vacuum-10-15man<\/loc>[\s\S]*?<\/url>\n/,
  "\n",
);
const block = entries
  .map(
    ([loc, pri]) => `  <url>
    <loc>${loc}</loc>
    <lastmod>2026-08-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pri}</priority>
  </url>`,
  )
  .join("\n\n");
sm = sm.replace(
  /(  <url>\n    <loc>https:\/\/nattoku-labo.com\/about<\/loc>[\s\S]*?<\/url>\n)/,
  `$1\n${block}\n`,
);
fs.writeFileSync("sitemap.xml", sm);
console.log("sitemap updated");

// --- nav ---
let nav = fs.readFileSync("products/js/navigation.js", "utf8");
nav = nav.replace(
  /<a href="\/compare\/robot-vacuum-10-15man" class="nav-link">\s*<i class="fas fa-table"><\/i> おすすめ比較\s*<\/a>/,
  `<a href="/compare/" class="nav-link">
                    <i class="fas fa-table"></i> おすすめ比較
                </a>`,
);
fs.writeFileSync("products/js/navigation.js", nav);
console.log("nav updated");

// --- index teaser ---
let idx = fs.readFileSync("index.html", "utf8");
const teaser = `    <!-- おすすめ比較（SEO用） -->
    <div style="max-width: 1200px; margin: 2rem auto 0; padding: 0 2rem;">
        <div style="display:grid;gap:0.75rem;">
            <a href="/compare/" style="display:block;text-decoration:none;background:#1e40af;border-radius:16px;padding:1.15rem 1.5rem;color:#fff;">
                <strong style="display:block;font-size:1.15rem;margin-bottom:0.3rem;">ロボット掃除機 おすすめ比較（価格帯別）｜口コミ分析</strong>
                <span style="font-size:0.95rem;font-weight:600;opacity:0.95;">〜5万 / 5〜7万 / 7〜10万 / 10〜15万 / 15〜20万 / 20万〜 の一覧 →</span>
            </a>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.65rem;">
                <a href="/compare/robot-vacuum-under-5man" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>〜5万円</strong></a>
                <a href="/compare/robot-vacuum-5-7man" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>5〜7万円</strong></a>
                <a href="/compare/robot-vacuum-7-10man" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>7〜10万円</strong></a>
                <a href="/compare/robot-vacuum-10-15man" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>10〜15万円</strong></a>
                <a href="/compare/robot-vacuum-15-20man" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>15〜20万円</strong></a>
                <a href="/compare/robot-vacuum-20man-plus" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:0.9rem 1rem;color:#1e3a8a;"><strong>20万円〜</strong></a>
            </div>
        </div>
    </div>`;
idx = idx.replace(
  /    <!-- おすすめ比較（SEO用） -->[\s\S]*?    <\/div>\n\n    <!-- 製品リンク一覧（SEO用） -->/,
  teaser + "\n\n    <!-- 製品リンク一覧（SEO用） -->",
);
fs.writeFileSync("index.html", idx);
console.log("index updated");

// --- product banners ---
const map = [
  ["eufy-robot-vacuum-auto-empty-c10", "〜5万円", "/compare/robot-vacuum-under-5man"],
  ["eufy-robovac-g30", "〜5万円", "/compare/robot-vacuum-under-5man"],
  ["roomba-mini-autoempty", "〜5万円", "/compare/robot-vacuum-under-5man"],
  ["deebot-t50-omni", "5〜7万円", "/compare/robot-vacuum-5-7man"],
  ["eufy-x10-pro-omni", "5〜7万円", "/compare/robot-vacuum-5-7man"],
  ["k11", "5〜7万円", "/compare/robot-vacuum-5-7man"],
  ["roomba-plus-405-combo-autowash", "7〜10万円", "/compare/robot-vacuum-7-10man"],
  ["q10p", "7〜10万円", "/compare/robot-vacuum-7-10man"],
  ["s20", "7〜10万円", "/compare/robot-vacuum-7-10man"],
  ["deebot-t80-omni", "10〜15万円", "/compare/robot-vacuum-10-15man"],
  ["qrevo-l", "10〜15万円", "/compare/robot-vacuum-10-15man"],
  ["eufy-robot-vacuum-omni-e25", "10〜15万円", "/compare/robot-vacuum-10-15man"],
  ["deebot-x8-pro-omni", "15〜20万円", "/compare/robot-vacuum-15-20man"],
  ["roomba-max-705-combo-autowash", "15〜20万円", "/compare/robot-vacuum-15-20man"],
  ["eufy-robot-vacuum-omni-s1-pro", "15〜20万円", "/compare/robot-vacuum-15-20man"],
  ["saros-10r", "20万円〜", "/compare/robot-vacuum-20man-plus"],
  ["deebot-x11-omnicyclone", "20万円〜", "/compare/robot-vacuum-20man-plus"],
];

function banner(label, href) {
  return `
        <section class="same-price-compare-banner" style="max-width:760px;margin:0 auto 2rem;padding:0 1.5rem;">
            <a href="${href}" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1rem 1.15rem;color:#1e3a8a;">
                <strong style="display:block;font-size:1rem;margin-bottom:0.25rem;">同価格帯の口コミ分析比較を見る</strong>
                <span style="font-size:0.9rem;font-weight:600;color:#1e40af;">${label}帯｜口コミ分析のおすすめ比較を見る →</span>
            </a>
        </section>
`;
}

for (const [slug, label, href] of map) {
  const fp = `products/${slug}.html`;
  if (!fs.existsSync(fp)) {
    console.warn("missing", fp);
    continue;
  }
  let html = fs.readFileSync(fp, "utf8");
  html = html.replace(
    /\n?\s*<section class="same-price-compare-banner"[\s\S]*?<\/section>\n?/,
    "\n",
  );
  const aff = /<section id="affiliate-cta"[\s\S]*?<\/section>/;
  if (!aff.test(html)) {
    console.warn("no aff", slug);
    continue;
  }
  html = html.replace(aff, (m) => m + "\n" + banner(label, href));
  fs.writeFileSync(fp, html);
  console.log("banner", slug);
}

// --- fix 10-15man leftover + hub link ---
let c15 = fs.readFileSync("compare/robot-vacuum-10-15man.html", "utf8");
c15 = c15.replace(/<div class="draft-path">[\s\S]*?<\/div>\s*<\/div>\s*\n\n/, "");
if (!c15.includes("ほかの価格帯のおすすめ比較一覧")) {
  c15 = c15.replace(
    /(<div class="product-links">[\s\S]*?<\/div>)/,
    `$1\n\n      <p class="section-sub" style="margin-top:1.5rem"><a href="/compare/">ほかの価格帯のおすすめ比較一覧 →</a></p>`,
  );
}
c15 = c15.replace(
  /"itemListElement": \[\s*\{"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https:\/\/nattoku-labo.com\/"\},\s*\{"@type": "ListItem", "position": 2, "name": "おすすめ比較", "item": "https:\/\/nattoku-labo.com\/compare\/robot-vacuum-10-15man"\}\s*\]/,
  `"itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://nattoku-labo.com/"},
      {"@type": "ListItem", "position": 2, "name": "おすすめ比較", "item": "https://nattoku-labo.com/compare/"},
      {"@type": "ListItem", "position": 3, "name": "10〜15万円", "item": "https://nattoku-labo.com/compare/robot-vacuum-10-15man"}
    ]`,
);
fs.writeFileSync("compare/robot-vacuum-10-15man.html", c15);
console.log("10-15man cleaned");

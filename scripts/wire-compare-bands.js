const fs = require("fs");

const manifest = JSON.parse(
  fs.readFileSync("compare/_bands-manifest.json", "utf8"),
);

function banner(label, href) {
  return `
        <section class="same-price-compare-banner">
            <a class="same-price-compare-link" href="${href}">
                <span class="same-price-compare-copy">
                    <strong>同価格帯の口コミ分析比較を見る</strong>
                    <span class="same-price-compare-meta">${label}｜全製品のおすすめ比較</span>
                </span>
                <span class="same-price-compare-action">比較を見る</span>
            </a>
        </section>
`;
}

let n = 0;
for (const band of manifest) {
  for (const slug of band.slugs) {
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
    html = html.replace(aff, (m) => m + "\n" + banner(band.label, band.urlPath));
    fs.writeFileSync(fp, html);
    n++;
    console.log("banner", slug, "->", band.label);
  }
}
console.log("banners", n);

// Update hub listing counts / copy
let hub = fs.readFileSync("compare/index.html", "utf8");
const metaByPath = Object.fromEntries(
  manifest.map((b) => [b.urlPath, b]),
);
hub = hub.replace(
  /<span class="meta">[\s\S]*?<\/span>/g,
  (m, offset) => m, // handled below via explicit replaces
);

const hubMetas = {
  "/compare/robot-vacuum-under-5man": "この価格帯の全13製品を比較",
  "/compare/robot-vacuum-5-7man": "この価格帯の全16製品を比較",
  "/compare/robot-vacuum-7-10man": "この価格帯の全11製品を比較",
  "/compare/robot-vacuum-10-15man": "この価格帯の全6製品を比較",
  "/compare/robot-vacuum-15-20man": "この価格帯の全7製品を比較",
  "/compare/robot-vacuum-20man-plus": "この価格帯の全2製品を比較",
};

for (const [urlPath, text] of Object.entries(hubMetas)) {
  const m = metaByPath[urlPath];
  const label = m ? `この価格帯の全${m.count}製品を比較` : text;
  const re = new RegExp(
    `(href="${urlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?<span class="meta">)[^<]*(</span>)`,
  );
  if (re.test(hub)) {
    hub = hub.replace(re, `$1${label}$2`);
  }
}
fs.writeFileSync("compare/index.html", hub);
console.log("hub updated");

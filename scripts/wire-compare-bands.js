const fs = require("fs");

const manifest = JSON.parse(
  fs.readFileSync("compare/_bands-manifest.json", "utf8"),
);

function banner(label, href) {
  return `
        <section class="same-price-compare-banner" style="max-width:760px;margin:0 auto 2rem;padding:0 1.5rem;">
            <a href="${href}" style="display:block;text-decoration:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:1rem 1.15rem;color:#1e3a8a;">
                <strong style="display:block;font-size:1rem;margin-bottom:0.25rem;">同価格帯の口コミ分析比較を見る</strong>
                <span style="font-size:0.9rem;font-weight:600;color:#1e40af;">${label}帯｜全製品のおすすめ比較を見る →</span>
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
  "/compare/robot-vacuum-under-5man": "帯内全11製品を横比較",
  "/compare/robot-vacuum-5-7man": "帯内全14製品を横比較",
  "/compare/robot-vacuum-7-10man": "帯内全9製品を横比較",
  "/compare/robot-vacuum-10-15man": "帯内全8製品を横比較",
  "/compare/robot-vacuum-15-20man": "帯内全4製品を横比較",
  "/compare/robot-vacuum-20man-plus": "帯内全2製品を横比較",
};

for (const [urlPath, text] of Object.entries(hubMetas)) {
  const m = metaByPath[urlPath];
  const label = m ? `帯内全${m.count}製品を横比較` : text;
  const re = new RegExp(
    `(href="${urlPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?<span class="meta">)[^<]*(</span>)`,
  );
  if (re.test(hub)) {
    hub = hub.replace(re, `$1${label}$2`);
  }
}
fs.writeFileSync("compare/index.html", hub);
console.log("hub updated");

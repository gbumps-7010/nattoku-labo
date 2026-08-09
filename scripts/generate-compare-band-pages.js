/**
 * Generate price-band comparison pages from product JSON + 10-15man template CSS/JS.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const templatePath = path.join(root, "compare/robot-vacuum-10-15man.html");
const template = fs.readFileSync(templatePath, "utf8");
const styleBlock = template.match(/<style>[\s\S]*?<\/style>/)[0];
const affiliateScript = template.match(
  /<script>\s*\(function \(\) \{[\s\S]*?\}\)\(\);\s*<\/script>/,
)[0];

function load(slug) {
  return JSON.parse(
    fs.readFileSync(path.join(root, `products/data/${slug}.json`), "utf8"),
  );
}

function yen(n) {
  return "¥" + Number(n).toLocaleString("ja-JP");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortKw(keyword) {
  const map = [
    [/満足|買ってよかった/, "満足"],
    [/水拭き|拭き掃除/, "水拭き"],
    [/マッピング|ルート/, "マッピング"],
    [/静か|静音/, "静か"],
    [/綺麗|きれい/, "綺麗"],
    [/使いやすい|便利/, "便利"],
    [/吸引/, "吸引"],
    [/サラサラ|ピカピカ|床が/, "床きれい"],
    [/家事/, "家事が楽"],
    [/故障|不具合/, "故障"],
    [/段差|引っかかる|スタック/, "段差"],
    [/止ま/, "停止"],
    [/コード|巻き込/, "コード"],
    [/動作音|騒音/, "動作音"],
    [/アプリ|Wi-?Fi/, "アプリ"],
    [/コンパクト|小型/, "小型"],
    [/ゴミ収集|自動収集/, "自動収集"],
    [/ペット/, "ペット毛"],
  ];
  for (const [re, label] of map) {
    if (re.test(keyword)) return label;
  }
  return String(keyword).split(/[・／/]/)[0].slice(0, 6);
}

function topKws(list, n = 3) {
  return (list || [])
    .slice(0, n)
    .map((x) => shortKw(x.keyword || x))
    .filter(Boolean)
    .join(" / ");
}

function scoreTone(pct) {
  if (pct == null) return "";
  if (pct >= 7) return " bad";
  if (pct >= 4) return " warn";
  return "";
}

function complaintCell(c) {
  if (!c) return '<td class="kw">—</td>';
  const title = (c.title || "").replace(/（.*?）/g, "").trim();
  const short = title.length > 22 ? title.slice(0, 22) + "…" : title;
  const pct = c.percentage != null ? `（${c.percentage}%）` : "";
  const tone = scoreTone(c.percentage);
  return `<td class="kw${tone}">${escapeHtml(short)}${pct}</td>`;
}

function brandOf(p) {
  const m = (p.manufacturer || "").trim();
  if (/ecovacs/i.test(m)) return "ECOVACS";
  if (/roborock/i.test(m)) return "Roborock";
  if (/anker|eufy/i.test(m)) return "Anker";
  if (/irobot/i.test(m)) return "iRobot";
  if (/switchbot/i.test(m)) return "SwitchBot";
  if (/dreame/i.test(m)) return "Dreame";
  return m || "—";
}

function perf(p, key) {
  const v = p.performanceAnalysis?.[key]?.score;
  return v != null ? Math.round(v) : "—";
}

function productMeta(slug, oneLiner) {
  const p = load(slug);
  const comps = (p.topComplaints || []).slice(0, 3);
  return {
    slug,
    name: p.productName,
    brand: brandOf(p),
    price: p.price,
    priceLabel: yen(p.price),
    reviews: p.totalReviews,
    trust: p.reliabilityScore,
    imageUrl: p.imageUrl,
    pos: topKws(p.reviewKeywords?.positive, 3),
    neg: topKws(p.reviewKeywords?.negative, 3),
    floor: perf(p, "floorCleaning"),
    quiet: perf(p, "quietness"),
    maint: perf(p, "maintenance"),
    step: perf(p, "stepClimbing"),
    pet: perf(p, "petHairRemoval"),
    app: perf(p, "appStability"),
    c1: comps[0] || null,
    c2: comps[1] || null,
    c3: comps[2] || null,
    oneLiner,
  };
}

const bands = [
  {
    label: "〜5万円",
    urlPath: "/compare/robot-vacuum-under-5man",
    filename: "compare/robot-vacuum-under-5man.html",
    products: [
      productMeta("eufy-robot-vacuum-auto-empty-c10", "自動収集つきのエントリー本命"),
      productMeta("eufy-robovac-g30", "口コミ最多。定番の吸引特化"),
      productMeta("roomba-mini-autoempty", "ブランド安心のコンパクト収集"),
    ],
    points: [
      {
        pick: "自動ゴミ収集",
        h: "Eufy Robot Vacuum Auto-Empty C10",
        p: "約3万円で自動収集。口コミ408件・信頼度88。音やカーペット評価のばらつきは先に確認。",
      },
      {
        pick: "口コミ厚み",
        h: "Eufy RoboVac G30",
        p: "帯内最多の472件。長く売れている定番だが、故障・Wi-Fi系の声も読む。",
      },
      {
        pick: "ブランド・サイズ",
        h: "Roomba® Mini + AutoEmpty™",
        p: "約5万円。コンパクトさ評価が高い。アプリ接続と段差は要対策。",
      },
      {
        pick: "共通注意",
        h: "機能の取捨選択",
        p: "この帯は全自動水拭きより「吸引＋収集の有無」で差が出やすい。",
      },
    ],
    who: [
      {
        h: "手間を減らしたい",
        p: "<strong>Eufy Robot Vacuum Auto-Empty C10</strong> — 自動収集で日常メンテが楽。",
      },
      {
        h: "まず安く始めたい",
        p: "<strong>Eufy RoboVac G30</strong> — 価格を抑えつつ口コミ判断材料が多い。",
      },
      {
        h: "小型・ブランド重視",
        p: "<strong>Roomba® Mini + AutoEmpty™</strong> — 置き場所を取りにくい。",
      },
      {
        h: "水拭き全自動が欲しい",
        p: "この帯は候補が薄い。一つ上の5〜7万円帯も併せて見る。",
      },
    ],
  },
  {
    label: "5〜7万円",
    urlPath: "/compare/robot-vacuum-5-7man",
    filename: "compare/robot-vacuum-5-7man.html",
    products: [
      productMeta("deebot-t50-omni", "口コミ最多のコスパ全自動"),
      productMeta("eufy-x10-pro-omni", "Omni系の対抗馬"),
      productMeta("k11", "小型・静音の第三候補"),
    ],
    points: [
      {
        pick: "口コミ厚み",
        h: "DEEBOT T50 OMNI",
        p: "1,287件・信頼度92.8。迷ったらまずここ。段差停止とセンサー系は進入禁止で抑える前提。",
      },
      {
        pick: "対抗フル自動",
        h: "Eufy X10 Pro Omni",
        p: "596件。水拭き・収集の満足度は高いが、故障・サポート系は要確認。",
      },
      {
        pick: "小型・静音",
        h: "ロボット掃除機 K11+",
        p: "503件・信頼度92.5。省スペース向き。吸引力・段差は評価が分かれる。",
      },
      {
        pick: "共通注意",
        h: "段差・スタック",
        p: "全自動でも段差スコアは伸びにくい。床の片付けは必須寄り。",
      },
    ],
    who: [
      {
        h: "床をきれいに / ペット",
        p: "<strong>DEEBOT T50 OMNI または Eufy X10 Pro Omni</strong> — 床・ペット毛の声が厚い。",
      },
      {
        h: "音が気になる / 狭い",
        p: "<strong>K11+</strong> — 小型・静音評価が目立つ。",
      },
      {
        h: "判断材料を最大化",
        p: "<strong>DEEBOT T50 OMNI</strong> — 帯内で圧倒的に口コミが多い。",
      },
      {
        h: "ブランドを変えたい",
        p: "<strong>Eufy X10 Pro Omni</strong> — Anker系のフル自動候補。",
      },
    ],
  },
  {
    label: "7〜10万円",
    urlPath: "/compare/robot-vacuum-7-10man",
    filename: "compare/robot-vacuum-7-10man.html",
    products: [
      productMeta(
        "roomba-plus-405-combo-autowash",
        "口コミ最多の水拭き全自動",
      ),
      productMeta("q10p", "Roborockの中位本命"),
      productMeta("s20", "SwitchBotの第三候補"),
    ],
    points: [
      {
        pick: "口コミ厚み",
        h: "Roomba® Plus 405 Combo + AutoWash™",
        p: "667件・信頼度91.6。初期不良・アプリ接続は先に確認。",
      },
      {
        pick: "マップ・吸引",
        h: "Q10P+",
        p: "184件。Roborockらしい運用感。口コミは中位なので個別注意点を読む。",
      },
      {
        pick: "別ブランド",
        h: "お掃除ロボットS20",
        p: "107件で閾値超え。データは薄めなので過度な期待は禁物。",
      },
      {
        pick: "共通注意",
        h: "口コミの厚み差",
        p: "405が突出。他2台は件数差を織り込んで比較する。",
      },
    ],
    who: [
      {
        h: "失敗したくない",
        p: "<strong>Roomba® Plus 405 Combo + AutoWash™</strong> — 判断材料が最も厚い。",
      },
      {
        h: "Roborock派",
        p: "<strong>Q10P+</strong> — 10万円手前のRoborock候補。",
      },
      {
        h: "SwitchBot連携",
        p: "<strong>S20</strong> — エコシステム優先なら。口コミは少なめ。",
      },
      {
        h: "コスパ全自動を再考",
        p: "一つ下の5〜7万円帯（T50 OMNI等）も併せて比較を。",
      },
    ],
  },
  {
    label: "15〜20万円",
    urlPath: "/compare/robot-vacuum-15-20man",
    filename: "compare/robot-vacuum-15-20man.html",
    products: [
      productMeta("deebot-x8-pro-omni", "帯内で最も口コミが厚い"),
      productMeta(
        "roomba-max-705-combo-autowash",
        "Combo全自動の別系統",
      ),
      productMeta(
        "eufy-robot-vacuum-omni-s1-pro",
        "Anker最上位。データは薄め",
      ),
    ],
    points: [
      {
        pick: "口コミ厚み",
        h: "DEEBOT X8 PRO OMNI",
        p: "257件。この帯では相対的に判断材料が多い本命。",
      },
      {
        pick: "ルンバ最上位寄り",
        h: "Roomba® Max 705 Combo + AutoWash™",
        p: "107件。掃除評価と不具合報告が混在しやすい帯。",
      },
      {
        pick: "要注記",
        h: "Eufy Robot Vacuum Omni S1 Pro",
        p: "85件・信頼度66.2。魅力はあるがデータ不足を前提に。",
      },
      {
        pick: "共通注意",
        h: "ハイエンドでも故障報告",
        p: "価格が高い＝無故障ではない。注意点行を優先して読む。",
      },
    ],
    who: [
      {
        h: "まず厚みで選ぶ",
        p: "<strong>DEEBOT X8 PRO OMNI</strong> — 帯内で口コミが最も厚い。",
      },
      {
        h: "iRobotエコシステム",
        p: "<strong>Roomba® Max 705 Combo + AutoWash™</strong> — Combo運用を重視。",
      },
      {
        h: "Anker最上位を試す",
        p: "<strong>Eufy Robot Vacuum Omni S1 Pro</strong> — 口コミ薄めなのでリスク許容が前提。",
      },
      {
        h: "予算を抑える",
        p: "一つ下の10〜15万円帯も性能差が小さい場合あり。",
      },
    ],
  },
  {
    label: "20万円〜",
    urlPath: "/compare/robot-vacuum-20man-plus",
    filename: "compare/robot-vacuum-20man-plus.html",
    products: [
      productMeta("saros-10r", "最高峰帯の口コミ本命"),
      productMeta("deebot-x11-omnicyclone", "ECOVACS旗艦。データは伸びしろ"),
    ],
    points: [
      {
        pick: "口コミ厚み",
        h: "Saros 10R",
        p: "317件・信頼度88.3。最高峰帯では判断材料が厚い側。",
      },
      {
        pick: "サイクロン旗艦",
        h: "DEEBOT X11 OmniCyclone",
        p: "93件・信頼度70.3。口コミ増加待ちの前提で比較。",
      },
      {
        pick: "共通注意",
        h: "段差・初期不良",
        p: "高価格帯でも段差・個体差の声は残る。進入禁止設定は前提。",
      },
      {
        pick: "予算再考",
        h: "15〜20万円帯",
        p: "用途次第では一段下でも十分なケースがある。",
      },
    ],
    who: [
      {
        h: "失敗確率を下げたい",
        p: "<strong>Saros 10R</strong> — 口コミ厚みで有利。",
      },
      {
        h: "ECOVACS最上位",
        p: "<strong>DEEBOT X11 OmniCyclone</strong> — 特徴重視。データは少なめ。",
      },
      {
        h: "コスパを見直す",
        p: "15〜20万円帯の X8 PRO なども併せて比較。",
      },
      {
        h: "ペット・床重視",
        p: "両機とも高性能寄り。個別のペット毛・床スコアを表で確認。",
      },
    ],
  },
];

function productHead(prod) {
  return `<th scope="col" class="product-col">
                  <div class="product-head">
                    <a href="https://nattoku-labo.com/products/${prod.slug}" target="_blank" rel="noopener">
                      <img
                        class="product-photo"
                        src="${escapeHtml(prod.imageUrl)}"
                        alt="${escapeHtml(prod.brand + " " + prod.name)}"
                        width="132"
                        height="132"
                        loading="eager"
                      >
                      <div class="product-name">${escapeHtml(prod.name)}</div>
                      <div class="product-mfr">${escapeHtml(prod.brand)}</div>
                    </a>
                  </div>
                </th>`;
}

function cells(prods, fn) {
  return prods.map(fn).join("\n                ");
}

function complaintShort(c) {
  if (!c) return '<td class="kw">—</td>';
  const t = (c.title || "").replace(/（.*?）/g, "").trim();
  const short = t.length > 22 ? t.slice(0, 22) + "…" : t;
  return `<td class="kw">${escapeHtml(short)}</td>`;
}

function buildTable(prods) {
  return `<table class="compare">
            <thead>
              <tr>
                <th scope="col">比較項目</th>
                ${prods.map(productHead).join("\n                ")}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>参考価格</td>
                ${cells(prods, (p) => `<td class="price">${p.priceLabel}</td>`)}
              </tr>
              <tr>
                <td>口コミ件数</td>
                ${cells(prods, (p) => `<td class="score">${p.reviews}件</td>`)}
              </tr>
              <tr>
                <td>口コミ信頼度</td>
                ${cells(prods, (p) => `<td class="score">${p.trust}</td>`)}
              </tr>
              <tr class="row-group">
                <td>高評価で多い声</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.pos)}</td>`)}
              </tr>
              <tr>
                <td>低評価で多い声</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.neg)}</td>`)}
              </tr>
              <tr class="row-group">
                <td>床掃除</td>
                ${cells(prods, (p) => `<td class="score">${p.floor}</td>`)}
              </tr>
              <tr>
                <td>静音</td>
                ${cells(prods, (p) => `<td class="score">${p.quiet}</td>`)}
              </tr>
              <tr>
                <td>メンテ</td>
                ${cells(prods, (p) => `<td class="score">${p.maint}</td>`)}
              </tr>
              <tr>
                <td>段差</td>
                ${cells(prods, (p) => `<td class="score">${p.step}</td>`)}
              </tr>
              <tr>
                <td>ペット毛</td>
                ${cells(prods, (p) => `<td class="score">${p.pet}</td>`)}
              </tr>
              <tr>
                <td>アプリ安定</td>
                ${cells(prods, (p) => `<td class="score">${p.app}</td>`)}
              </tr>
              <tr class="row-group">
                <td>注意点1</td>
                ${cells(prods, (p) => complaintCell(p.c1))}
              </tr>
              <tr>
                <td>注意点2</td>
                ${cells(prods, (p) => complaintShort(p.c2))}
              </tr>
              <tr>
                <td>注意点3</td>
                ${cells(prods, (p) => complaintShort(p.c3))}
              </tr>
              <tr class="row-group">
                <td>ひとこと</td>
                ${cells(prods, (p) => `<td class="kw">${escapeHtml(p.oneLiner)}</td>`)}
              </tr>
            </tbody>
          </table>`;
}

function affCards(prods) {
  return prods
    .map(
      (p) => `          <article class="aff-card" data-slug="${p.slug}">
            <div class="aff-card-head">
              <img src="${escapeHtml(p.imageUrl)}" alt="">
              <div>
                <div class="name">${escapeHtml(p.name)}</div>
                <div class="mfr">${escapeHtml(p.brand)}</div>
              </div>
            </div>
            <div class="aff-official-slot"></div>
            <div class="aff-moshimo" id="aff-moshimo-${p.slug}"></div>
            <p class="aff-status">読み込み中…</p>
          </article>`,
    )
    .join("\n");
}

function matrixPoints(points) {
  return `<div class="matrix">
        ${points
          .map(
            (c) => `<div class="card">
          <span class="pick">${escapeHtml(c.pick)}</span>
          <h3>${escapeHtml(c.h)}</h3>
          <p>${escapeHtml(c.p)}</p>
        </div>`,
          )
          .join("\n        ")}
      </div>`;
}

function matrixWho(who) {
  return `<div class="matrix">
        ${who
          .map(
            (c) => `<div class="card">
          <h3>${escapeHtml(c.h)}</h3>
          <p>${c.p}</p>
        </div>`,
          )
          .join("\n        ")}
      </div>`;
}

function itemListJson(band) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析`,
    description: `2大ECサイトの口コミを分析した${band.label}帯のロボット掃除機おすすめ比較`,
    url: `https://nattoku-labo.com${band.urlPath}`,
    numberOfItems: band.products.length,
    itemListElement: band.products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://nattoku-labo.com/products/${p.slug}`,
      name: p.name,
    })),
  };
}

function buildPage(band) {
  const totalReviews = band.products.reduce((s, p) => s + (p.reviews || 0), 0);
  const title = `ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析 | ナットクLabo`;
  const desc = `${band.label}帯のロボット掃除機をおすすめ比較。2大ECサイトの口コミを分析し、価格・信頼度・注意点を横並びで確認できます。`;
  const h1 = `ロボット掃除機のおすすめ比較【${band.label}】｜2大ECサイトの口コミ分析`;
  const productLinks = band.products
    .map(
      (p) =>
        `<a href="https://nattoku-labo.com/products/${p.slug}" target="_blank" rel="noopener">${escapeHtml(p.name)} の詳細分析 →</a>`,
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://nattoku-labo.com${band.urlPath}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="https://nattoku-labo.com${band.urlPath}">
  <meta property="og:title" content="ロボット掃除機 おすすめ比較【${band.label}】2大ECサイトの口コミ分析">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  ${styleBlock}

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v=20260809b">
  <script type="application/ld+json">
  ${JSON.stringify(itemListJson(band), null, 2)}
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://nattoku-labo.com/"},
      {"@type": "ListItem", "position": 2, "name": "おすすめ比較", "item": "https://nattoku-labo.com/compare/"},
      {"@type": "ListItem", "position": 3, "name": "${band.label}", "item": "https://nattoku-labo.com${band.urlPath}"}
    ]
  }
  </script>

</head>
<body>
  <header class="hero">
    <div class="wrap">
      <p class="eyebrow">ロボット掃除機 おすすめ比較 · 口コミ分析 · ${band.label}帯</p>
      <h1>${h1}</h1>
      <p class="lede">
        「ロボット掃除機 おすすめ 比較」で迷う人向けに、同じ予算帯の候補を2大ECサイトの口コミ分析で横比較します。
      </p>
      <div class="source-banner" role="note">
        <span class="source-kicker">データ根拠</span>
        <span>2大ECサイトの口コミを分析した結果です（合計 ${totalReviews.toLocaleString("ja-JP")}件）</span>
      </div>
      <div class="meta-row">
        <span class="chip">2大ECサイトの口コミ分析</span>
        <span class="chip">おすすめ比較</span>
        <span class="chip">${band.label}</span>
        <span class="chip">口コミ分析比較</span>
      </div>
    </div>
  </header>

  <article>
    <div class="wrap">
      <div class="note">
        表示価格はメーカー希望小売価格（参考）です。本ページの比較は、2大ECサイトに寄せられた口コミを集計・分析した参考情報です。すべての方に当てはまるわけではありません。
      </div>

      <section class="table-stage" aria-label="ロボット掃除機おすすめ比較表">
        <div class="table-stage-label">
          <strong>ロボット掃除機 おすすめ比較表（${band.label}）</strong>
        </div>
        <p class="table-source">比較表の数値・キーワード・注意点は、すべて2大ECサイトの口コミ分析に基づきます。</p>
        <p class="swipe-hint"><span>他の製品を見る</span><span>左右にスワイプ →</span></p>
        <div class="compare-scroll">
          ${buildTable(band.products)}
        </div>
      </section>

      <section class="affiliate-section" id="price-check" aria-label="最新価格をチェック">
        <h2>最新価格をチェック</h2>
        <p class="section-sub">各製品の最新価格は、以下から確認できます。</p>
        <div class="affiliate-grid" id="affiliate-grid">
${affCards(band.products)}
        </div>
      </section>

      <h2>このおすすめ比較で見るべきポイント</h2>
      <p class="section-sub">表の差だけ短く補足します。詳細は各製品ページへ。</p>
      ${matrixPoints(band.points)}

      <h2>どんな人におすすめか</h2>
      ${matrixWho(band.who)}

      <h2>比較したロボット掃除機の詳細へ</h2>
      <div class="product-links">
        ${productLinks}
      </div>

      <p class="section-sub" style="margin-top:1.5rem"><a href="/compare/">ほかの価格帯のおすすめ比較一覧 →</a></p>
    </div>
  </article>

  <footer>
    ナットクLabo ·
  </footer>
  ${affiliateScript}
  <script src="/products/js/navigation.js?v=20260809b"></script>
</body>
</html>
`;
}

const manifest = [];
for (const band of bands) {
  const html = buildPage(band);
  const out = path.join(root, band.filename);
  fs.writeFileSync(out, html, "utf8");
  console.log(
    "wrote",
    band.filename,
    band.products.map((p) => p.slug).join(","),
  );
  manifest.push({
    label: band.label,
    urlPath: band.urlPath,
    filename: band.filename,
    slugs: band.products.map((p) => p.slug),
    totalReviews: band.products.reduce((s, p) => s + p.reviews, 0),
  });
}

fs.writeFileSync(
  path.join(root, "compare/_bands-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("done", manifest.length);

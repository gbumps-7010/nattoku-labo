# -*- coding: utf-8 -*-
"""Generate /rankings/floor-cleaning.html and /rankings/index.html (floor 85% + trust 15%)."""
from __future__ import annotations

import html
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "products" / "data"
OUT_DIR = ROOT / "rankings"
NAV_V = "20260815a"
WF, WR = 0.85, 0.15
UPDATED = date.today().isoformat()


def load_products() -> list[dict]:
    rows = []
    for path in sorted(DATA_DIR.glob("*.json")):
        raw = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        perf = raw.get("performanceAnalysis") or {}
        floor = None
        comment = ""
        for key in ("floorCleaning", "floor", "hardwood", "hardFloor"):
            value = perf.get(key)
            if isinstance(value, dict) and value.get("score") is not None:
                floor = float(value["score"])
                comment = (value.get("comment") or "").strip()
                break
            if isinstance(value, (int, float)):
                floor = float(value)
                break
        if floor is None:
            continue
        rel = raw.get("reliabilityScore")
        if rel is None:
            rel = (raw.get("reliability") or {}).get("score")
        if rel is None:
            continue
        rows.append(
            {
                "id": raw.get("productId") or path.stem,
                "name": raw.get("productName") or path.stem,
                "manufacturer": raw.get("manufacturer") or "",
                "imageUrl": raw.get("imageUrl") or "",
                "floor": floor,
                "reliability": float(rel),
                "reviews": int(raw.get("totalReviews") or 0),
                "price": int(raw.get("price") or 0),
                "composite": round(WF * floor + WR * float(rel), 1),
                "floorComment": comment,
            }
        )
    rows.sort(key=lambda x: (-x["composite"], -x["floor"], -x["reliability"], -x["reviews"]))
    for i, row in enumerate(rows, 1):
        row["rank"] = i
    return rows


def yen(n: int) -> str:
    return "—" if not n else f"¥{n:,}"


def score_class(score: float) -> str:
    if score >= 90:
        return "excellent"
    if score >= 80:
        return "good"
    if score >= 70:
        return "average"
    return "poor"


def top_class(rank: int) -> str:
    if rank == 1:
        return " top-1"
    if rank == 2:
        return " top-2"
    if rank == 3:
        return " top-3"
    return ""


def product_url(pid: str) -> str:
    return f"https://nattoku-labo.com/products/{pid}"


def build_rows(products: list[dict]) -> str:
    chunks = []
    for p in products:
        url = product_url(p["id"])
        name = html.escape(p["name"])
        mfr = html.escape(p["manufacturer"])
        comment = html.escape((p.get("floorComment") or "").strip())
        tc = top_class(p["rank"])
        img = (
            f'<img src="{html.escape(p["imageUrl"])}" alt="{name}の製品画像" loading="lazy" width="56" height="56">'
            if p.get("imageUrl")
            else '<div class="img-ph" aria-hidden="true"></div>'
        )
        comment_row = ""
        if comment:
            comment_row = f"""
      <tr class="comment-row{tc}" data-price="{p['price']}" data-rank="{p['rank']}">
        <td class="comment-spacer" aria-hidden="true"></td>
        <td class="comment-cell" colspan="5">
          <p class="floor-comment"><span class="floor-comment-label">フローリング清掃の口コミ傾向</span>{comment}</p>
        </td>
      </tr>"""
        chunks.append(
            f"""
      <tr class="rank-row{tc}" data-price="{p['price']}" data-rank="{p['rank']}">
        <td class="rank"><span class="rank-num">{p['rank']}</span></td>
        <td class="product">
          <a class="product-link" href="{url}" target="_blank" rel="noopener">
            <span class="thumb">{img}</span>
            <span class="pinfo">
              <span class="pname">{name}</span>
              <span class="pmeta">{mfr}</span>
            </span>
          </a>
        </td>
        <td class="num floor"><span class="score {score_class(p['floor'])}">{p['floor']:.0f}</span></td>
        <td class="num"><span class="score {score_class(p['reliability'])}">{p['reliability']:.1f}</span></td>
        <td class="num muted">{p['reviews']:,}</td>
        <td class="num muted">{yen(p['price'])}</td>
      </tr>{comment_row}"""
        )
    return "".join(chunks)


def build_item_list_json(products: list[dict]) -> str:
    elements = []
    for p in products[:30]:
        elements.append(
            {
                "@type": "ListItem",
                "position": p["rank"],
                "url": product_url(p["id"]),
                "name": p["name"],
            }
        )
    payload = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "【ロボット掃除機ランキング】フローリング掃除のおすすめ機種",
        "description": "口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング",
        "url": "https://nattoku-labo.com/rankings/floor-cleaning",
        "numberOfItems": len(products),
        "itemListElement": elements,
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


CSS = r"""
:root {
  --primary: #1e40af;
  --secondary: #0f172a;
  --bg: #f8fafc;
  --card: #fff;
  --text: #1e293b;
  --muted: #64748b;
  --line: #e2e8f0;
  --excellent: #059669;
  --good: #0284c7;
  --average: #ca8a04;
  --poor: #dc2626;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: "Noto Sans JP", sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
}
header.hero {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff;
  padding: 1.75rem 1rem 2rem;
}
.wrap { max-width: 1080px; margin: 0 auto; padding: 0 1rem; }
.crumb { font-size: 0.78rem; opacity: 0.85; margin-bottom: 0.75rem; }
.crumb a { color: #bfdbfe; text-decoration: none; }
.crumb a:hover { text-decoration: underline; }
h1 {
  font-size: clamp(1.35rem, 3.5vw, 1.85rem);
  font-weight: 900;
  line-height: 1.35;
  margin-bottom: 0.65rem;
}
.lede { font-size: 0.95rem; opacity: 0.95; max-width: 42rem; }
main { padding: 1.25rem 0 2rem; }
footer.page-footer {
  border-top: 1px solid var(--line);
  padding: 1.5rem 1rem 2.5rem;
  color: var(--muted);
  font-size: 0.82rem;
  text-align: center;
}
footer.page-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
  margin: 0 0.35rem;
}
footer.page-footer a:hover { text-decoration: underline; }
.method {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  margin-bottom: 1rem;
}
.method h2 { font-size: 0.95rem; margin-bottom: 0.4rem; color: var(--primary); }
.method p { font-size: 0.9rem; color: #334155; }
.method p + p { margin-top: 0.55rem; }
.method-sub { font-size: 0.82rem !important; color: var(--muted) !important; }
.method code {
  background: #eff6ff;
  color: #1e3a8a;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85rem;
}
.filters {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}
.filters-label { font-size: 0.82rem; font-weight: 700; color: #334155; margin-bottom: 0.55rem; }
.filter-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.filter-chip {
  border: 1px solid var(--line);
  background: #fff;
  color: #334155;
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.filter-chip:hover { border-color: #93c5fd; color: var(--primary); }
.filter-chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.filter-meta { margin-top: 0.55rem; font-size: 0.78rem; color: var(--muted); }
.table-wrap {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.05);
}
.table-head {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--line);
  display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;
  align-items: baseline;
}
.table-head h2 { font-size: 1.05rem; }
.table-head span { font-size: 0.8rem; color: var(--muted); }
.swipe-hint {
  display: none;
  margin: 0 1rem 0.65rem;
  padding: 0.4rem 0.65rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.78rem;
  font-weight: 700;
}
@media (max-width: 760px) { .swipe-hint { display: block; } }
.scroll {
  overflow: auto;
  max-height: 42rem;
  -webkit-overflow-scrolling: touch;
  border-radius: 0 0 14px 14px;
}
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.88rem; min-width: 720px; }
th, td { padding: 0.75rem 0.85rem; text-align: left; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
th {
  position: sticky; top: 0; z-index: 5;
  background: #f8fafc; color: var(--muted);
  font-size: 0.72rem; letter-spacing: 0.03em; font-weight: 700; white-space: nowrap;
  box-shadow: 0 1px 0 var(--line);
}
.rank { width: 3rem; }
.rank-num {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1.7rem; height: 1.7rem;
  border-radius: 8px; background: #eff6ff; color: var(--primary);
  font-weight: 900; font-variant-numeric: tabular-nums;
}
tr.top-1.rank-row { background: #fffbeb; }
tr.top-2.rank-row { background: #f8fafc; }
tr.top-3.rank-row { background: #fff7ed; }
tr.top-1.comment-row { background: #fffef7; }
tr.top-2.comment-row { background: #f8fafc; }
tr.top-3.comment-row { background: #fffaf5; }
tr.top-1 .rank-num { background: #f59e0b; color: #fff; }
tr.top-2 .rank-num { background: #64748b; color: #fff; }
tr.top-3 .rank-num { background: #c2410c; color: #fff; }
tr.rank-row:hover { background: #eff6ff; }
tr.rank-row td { border-bottom: none; padding-bottom: 0.35rem; }
tr.comment-row td {
  padding-top: 0; padding-bottom: 0.95rem;
  border-bottom: 1px solid #e2e8f0; vertical-align: top;
}
tr.comment-row .comment-spacer { border-bottom: 1px solid #e2e8f0; }
.product-link {
  display: flex; align-items: center; gap: 0.7rem;
  text-decoration: none; color: inherit;
}
.product-link:hover .pname { color: var(--primary); text-decoration: underline; }
.thumb img, .img-ph {
  width: 56px; height: 56px; object-fit: contain;
  background: #f8fafc; border-radius: 8px; border: 1px solid var(--line);
  flex-shrink: 0;
}
.img-ph { display: block; }
.pname { display: block; font-weight: 700; font-size: 0.9rem; line-height: 1.35; }
.pmeta { display: block; color: var(--muted); font-size: 0.75rem; }
.floor-comment {
  margin: 0; padding: 0.55rem 0.7rem;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  color: #334155; font-size: 0.82rem; line-height: 1.7; font-weight: 500;
}
.floor-comment-label {
  display: inline-block; margin-right: 0.45rem;
  color: var(--primary); font-size: 0.72rem; font-weight: 800;
  letter-spacing: 0.02em; white-space: nowrap;
}
tr.top-1 .floor-comment { background: #fffbeb; border-color: #fde68a; }
tr.top-3 .floor-comment { background: #fff7ed; border-color: #fed7aa; }
.num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.score { display: inline-block; font-weight: 900; min-width: 2.4rem; }
.score.excellent { color: var(--excellent); }
.score.good { color: var(--good); }
.score.average { color: var(--average); }
.score.poor { color: var(--poor); }
.floor .score { font-size: 1.05rem; }
.muted { color: var(--muted); font-weight: 600; }
.notes { margin-top: 1.35rem; display: grid; gap: 0.85rem; }
.notes section {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 12px; padding: 1rem 1.1rem;
}
.notes h2 { font-size: 0.95rem; margin-bottom: 0.45rem; }
.notes p, .notes li { font-size: 0.88rem; color: #334155; }
.notes ul { padding-left: 1.15rem; }
.notes li { margin: 0.25rem 0; }
.related { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.55rem; }
.related a {
  display: inline-block; padding: 0.35rem 0.7rem; border-radius: 999px;
  border: 1px solid var(--line); background: #fff; color: var(--primary);
  text-decoration: none; font-size: 0.8rem; font-weight: 700;
}
.related a:hover { background: #eff6ff; }
.more-links { margin-top: 1rem; font-size: 0.9rem; }
.more-links a { color: var(--primary); font-weight: 700; text-decoration: none; }
.more-links a:hover { text-decoration: underline; }
.empty-msg {
  display: none; padding: 1.25rem 1rem; text-align: center;
  color: var(--muted); font-size: 0.9rem;
}
.empty-msg.show { display: block; }
"""

JS = r"""
(function () {
  const chips = document.querySelectorAll(".filter-chip");
  const rows = document.querySelectorAll("#ranking-table tbody tr.rank-row, #ranking-table tbody tr.comment-row");
  const countEl = document.getElementById("filter-count");
  const emptyEl = document.getElementById("empty-msg");
  const table = document.getElementById("ranking-table");
  const scroll = document.querySelector(".table-wrap .scroll");
  const thead = table ? table.querySelector("thead") : null;

  function fitFiveProducts() {
    if (!scroll || !table || !thead) return;
    const visibleRanks = Array.from(table.querySelectorAll("tbody tr.rank-row"))
      .filter(function (row) { return row.style.display !== "none"; });
    if (!visibleRanks.length) {
      scroll.style.maxHeight = "";
      return;
    }
    const n = Math.min(5, visibleRanks.length);
    const lastRank = visibleRanks[n - 1];
    let last = lastRank.nextElementSibling;
    if (!last || !last.classList.contains("comment-row") || last.style.display === "none") {
      last = lastRank;
    }
    const prevMax = scroll.style.maxHeight;
    scroll.style.maxHeight = "none";
    scroll.scrollTop = 0;
    const top = thead.getBoundingClientRect().top;
    const bottom = last.getBoundingClientRect().bottom;
    const height = Math.ceil(bottom - top + 1);
    if (height > 0) {
      scroll.style.maxHeight = height + "px";
    } else if (prevMax) {
      scroll.style.maxHeight = prevMax;
    }
  }

  function applyFilter(min, max) {
    let shown = 0;
    rows.forEach(function (row) {
      const price = Number(row.getAttribute("data-price") || 0);
      const ok = price >= min && price < max;
      row.style.display = ok ? "" : "none";
      if (ok && row.classList.contains("rank-row")) shown += 1;
    });
    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.classList.toggle("show", shown === 0);
    if (table) table.style.display = shown === 0 ? "none" : "";
    requestAnimationFrame(fitFiveProducts);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      const min = Number(chip.getAttribute("data-min"));
      const maxRaw = chip.getAttribute("data-max");
      const max = maxRaw === "Infinity" ? Infinity : Number(maxRaw);
      applyFilter(min, max);
    });
  });

  window.addEventListener("resize", function () { requestAnimationFrame(fitFiveProducts); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(fitFiveProducts); });
  }
  window.addEventListener("load", function () { requestAnimationFrame(fitFiveProducts); });
  requestAnimationFrame(fitFiveProducts);
})();
"""


def write_floor_page(products: list[dict]) -> Path:
    count = len(products)
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【ロボット掃除機ランキング】フローリング掃除のおすすめ機種｜ナットクLabo</title>
  <meta name="description" content="口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング。口コミ信頼度も加味したおすすめ順で{count}製品を比較できます。">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://nattoku-labo.com/rankings/floor-cleaning">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="https://nattoku-labo.com/rankings/floor-cleaning">
  <meta property="og:title" content="【ロボット掃除機ランキング】フローリング掃除のおすすめ機種">
  <meta property="og:description" content="口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング。口コミ信頼度も加味したおすすめ順で比較できます。">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <style>{CSS}</style>
  <script type="application/ld+json">
{build_item_list_json(products)}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://nattoku-labo.com/"}},
      {{"@type": "ListItem", "position": 2, "name": "ランキング", "item": "https://nattoku-labo.com/rankings/"}},
      {{"@type": "ListItem", "position": 3, "name": "フローリング掃除", "item": "https://nattoku-labo.com/rankings/floor-cleaning"}}
    ]
  }}
  </script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="パンくず">
        <a href="/">ホーム</a> › <a href="/rankings/">ランキング</a> › フローリング掃除
      </nav>
      <h1>【ロボット掃除機ランキング】フローリング掃除のおすすめ機種</h1>
      <p class="lede">口コミに書かれた吸引力や水拭きの評価を数値化し、フローリング掃除の得意さを比較したランキングです。各製品には、実際の口コミからまとめたフローリング清掃の傾向コメントも掲載しています。</p>
    </div>
  </header>

  <main>
    <div class="wrap">
      <section class="method">
        <h2>このランキングの見方</h2>
        <p>
          「吸引力が強い」「水拭きがきれい」といった口コミを点数化し、フローリング掃除の得意さで並べています。
          口コミの信頼度を適切に加味するので、<strong>実体験に近いおすすめ順</strong>になっています。
          表の各製品には、床の仕上がりや水拭きに関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。
        </p>
        <p class="method-sub">
          ランキングの式：<code>フローリング点数 × 0.85 ＋ 口コミ信頼度 × 0.15</code>
        </p>
      </section>

      <section class="filters" aria-label="価格帯で絞り込み">
        <div class="filters-label">価格帯で絞り込み</div>
        <div class="filter-chips" role="group">
          <button type="button" class="filter-chip active" data-min="0" data-max="Infinity">すべて</button>
          <button type="button" class="filter-chip" data-min="0" data-max="50000">〜5万円</button>
          <button type="button" class="filter-chip" data-min="50000" data-max="70000">5〜7万円</button>
          <button type="button" class="filter-chip" data-min="70000" data-max="100000">7〜10万円</button>
          <button type="button" class="filter-chip" data-min="100000" data-max="150000">10〜15万円</button>
          <button type="button" class="filter-chip" data-min="150000" data-max="200000">15〜20万円</button>
          <button type="button" class="filter-chip" data-min="200000" data-max="Infinity">20万円〜</button>
        </div>
        <p class="filter-meta"><span id="filter-count">{count}</span>製品を表示中（順位は全体順位のまま）</p>
      </section>

      <section class="table-wrap">
        <div class="table-head">
          <h2>全機種ランキング</h2>
          <span>各製品にフローリング清掃の口コミコメント付き</span>
        </div>
        <p class="swipe-hint">← 表は横にスワイプできます →</p>
        <div class="scroll">
          <table id="ranking-table">
            <thead>
              <tr>
                <th>順位</th>
                <th>製品</th>
                <th>フローリング</th>
                <th>口コミ信頼度</th>
                <th>口コミ数</th>
                <th>価格目安</th>
              </tr>
            </thead>
            <tbody>
              {build_rows(products)}
            </tbody>
          </table>
        </div>
        <p class="empty-msg" id="empty-msg">この価格帯に該当する製品はありません。</p>
      </section>

      <div class="notes">
        <section>
          <h2>注意事項</h2>
          <ul>
            <li>点数はECサイトの口コミを横断分析した値です。実機テストの計測値ではありません。</li>
            <li>価格は調査時点の目安です。購入前に各販売ページでご確認ください。</li>
            <li>カーペット性能やペット毛などは、今後の機能別ランキングで比較できます。</li>
          </ul>
        </section>
        <section>
          <h2>価格帯で比較する</h2>
          <div class="related">
            <a href="/compare/robot-vacuum-under-5man">〜5万円</a>
            <a href="/compare/robot-vacuum-5-7man">5〜7万円</a>
            <a href="/compare/robot-vacuum-7-10man">7〜10万円</a>
            <a href="/compare/robot-vacuum-10-15man">10〜15万円</a>
            <a href="/compare/robot-vacuum-15-20man">15〜20万円</a>
            <a href="/compare/robot-vacuum-20man-plus">20万円〜</a>
            <a href="/compare/">比較一覧</a>
          </div>
          <p class="more-links"><a href="/rankings/">ランキング一覧へ →</a>　<a href="/">製品一覧へ →</a>　<a href="/about">このサイトについて →</a></p>
        </section>
      </div>
    </div>
  </main>

  <footer class="page-footer">
    <div>
      <a href="/">ホーム</a>
      <a href="/rankings/">ランキング</a>
      <a href="/compare/">徹底比較</a>
      <a href="/about">サイトについて</a>
    </div>
    <p style="margin-top:0.65rem">ナットクLabo · 更新 {UPDATED}</p>
  </footer>
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
  <script>{JS}</script>
</body>
</html>
"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "floor-cleaning.html"
    out.write_text(page, encoding="utf-8")
    return out


def write_hub(count: int) -> Path:
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ロボット掃除機ランキング一覧｜ナットクLabo</title>
  <meta name="description" content="口コミ分析に基づくロボット掃除機の機能別ランキング一覧。フローリング掃除など、気になる性能からおすすめ機種を探せます。">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://nattoku-labo.com/rankings/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="https://nattoku-labo.com/rankings/">
  <meta property="og:title" content="ロボット掃除機ランキング一覧">
  <meta property="og:description" content="口コミ分析に基づくロボット掃除機の機能別ランキング一覧。">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <style>
    :root {{ --primary:#1e40af; --secondary:#0f172a; --bg:#f8fafc; --text:#1e293b; --muted:#64748b; --line:#e2e8f0; }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    body {{ font-family:"Noto Sans JP",sans-serif; background:var(--bg); color:var(--text); line-height:1.75; }}
    header.hero {{ background:linear-gradient(135deg,var(--primary),var(--secondary)); color:#fff; padding:1.75rem 1rem 2rem; }}
    .wrap {{ max-width:920px; margin:0 auto; padding:0 1rem; }}
    .crumb {{ font-size:0.78rem; opacity:0.85; margin-bottom:0.75rem; }}
    .crumb a {{ color:#bfdbfe; text-decoration:none; }}
    h1 {{ font-size:clamp(1.25rem,4.6vw,1.9rem); font-weight:900; line-height:1.35; margin-bottom:0.65rem; }}
    .lede {{ font-size:0.95rem; opacity:0.95; max-width:40rem; }}
    .list {{ padding:1.5rem 0 2.5rem; display:grid; gap:0.85rem; }}
    a.band {{
      display:block; text-decoration:none; background:#fff; border:1px solid var(--line);
      border-radius:14px; padding:1.1rem 1.2rem; color:#1e3a8a;
      transition:border-color .15s ease, box-shadow .15s ease;
    }}
    a.band:hover {{ border-color:#93c5fd; box-shadow:0 8px 24px rgba(30,64,175,0.08); }}
    a.band strong {{ display:block; font-size:1.05rem; margin-bottom:0.2rem; color:#0f172a; }}
    a.band span {{ font-size:0.9rem; font-weight:600; color:#1e40af; }}
    a.band .meta {{ display:block; margin-top:0.35rem; font-size:0.82rem; font-weight:500; color:var(--muted); }}
    footer.page-footer {{ text-align:center; color:var(--muted); font-size:0.8rem; padding:1.5rem 1rem 2rem; }}
    footer.page-footer a {{ color:var(--primary); font-weight:700; text-decoration:none; margin:0 0.35rem; }}
  </style>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="パンくず"><a href="/">ホーム</a> › ランキング</nav>
      <h1>ロボット掃除機ランキング一覧</h1>
      <p class="lede">口コミ分析の点数をもとに、気になる機能からおすすめ機種を探せます。</p>
    </div>
  </header>
  <div class="wrap list">
    <a class="band" href="/rankings/floor-cleaning">
      <strong>【ロボット掃除機ランキング】フローリング掃除のおすすめ機種</strong>
      <span>フローリング清掃ランキングを見る →</span>
      <span class="meta">吸引力・水拭きの口コミを数値化 / 掲載{count}製品</span>
    </a>
  </div>
  <footer class="page-footer">
    <a href="/">ホーム</a>
    <a href="/compare/">徹底比較</a>
    <a href="/about">サイトについて</a>
    <p style="margin-top:0.65rem">ナットクLabo</p>
  </footer>
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
</body>
</html>
"""
    out = OUT_DIR / "index.html"
    out.write_text(page, encoding="utf-8")
    return out


def main() -> None:
    products = load_products()
    floor = write_floor_page(products)
    hub = write_hub(len(products))
    print(f"wrote {floor} ({len(products)} products)")
    print(f"wrote {hub}")


if __name__ == "__main__":
    main()

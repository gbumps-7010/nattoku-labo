# -*- coding: utf-8 -*-
"""Generate feature ranking pages under /rankings/ (feature 85% + trust 15%)."""
from __future__ import annotations

import html
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "products" / "data"
OUT_DIR = ROOT / "rankings"
NAV_V = "20260815b"
WF, WR = 0.85, 0.15
UPDATED = date.today().isoformat()

RANKINGS = [
    {
        "slug": "floor-cleaning",
        "tab_label": "フローリング",
        "perf_keys": ("floorCleaning", "floor", "hardwood", "hardFloor"),
        "crumb": "フローリング掃除",
        "h1": "【ロボット掃除機ランキング】フローリング掃除のおすすめ機種",
        "meta_description": "口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング。口コミ信頼度も加味したおすすめ順で{count}製品を比較できます。",
        "og_description": "口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング。口コミ信頼度も加味したおすすめ順で比較できます。",
        "lede": "口コミに書かれた吸引力や水拭きの評価を数値化し、フローリング掃除の得意さを比較したランキングです。各製品には、実際の口コミからまとめたフローリング清掃の傾向コメントも掲載しています。",
        "method_body": (
            "「吸引力が強い」「水拭きがきれい」といった口コミを点数化し、フローリング掃除の得意さで並べています。"
            "口コミの信頼度を適切に加味するので、<strong>実体験に近いおすすめ順</strong>になっています。"
            "表の各製品には、床の仕上がりや水拭きに関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "フローリング点数",
        "score_col": "フローリング",
        "comment_label": "フローリング清掃の口コミ傾向",
        "table_note": "各製品にフローリング清掃の口コミコメント付き",
        "hub_title": "【ロボット掃除機ランキング】フローリング掃除のおすすめ機種",
        "hub_cta": "フローリング清掃ランキングを見る →",
        "hub_meta": "吸引力・水拭きの口コミを数値化",
        "schema_description": "口コミの吸引力・水拭き評価を数値化したフローリング掃除ランキング",
        "related_note": "カーペット掃除・静音性は別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/carpet-cleaning", "カーペット掃除ランキング"),
            ("/rankings/quietness", "静音性ランキング"),
        ],
    },
    {
        "slug": "carpet-cleaning",
        "tab_label": "カーペット",
        "perf_keys": ("carpetCleaning", "carpet"),
        "crumb": "カーペット掃除",
        "h1": "【ロボット掃除機ランキング】カーペット掃除のおすすめ機種",
        "meta_description": "口コミのカーペット清掃評価を数値化したランキング。口コミ信頼度も加味したおすすめ順で{count}製品を比較できます。",
        "og_description": "口コミのカーペット清掃評価を数値化したランキング。口コミ信頼度も加味したおすすめ順で比較できます。",
        "lede": "口コミに書かれたカーペット清掃の評価を数値化し、ラグや絨毯掃除の得意さを比較したランキングです。各製品には、実際の口コミからまとめたカーペット清掃の傾向コメントも掲載しています。",
        "method_body": (
            "「カーペットのゴミが取れる」「ラグを巻き込まない」といった口コミを点数化し、カーペット掃除の得意さで並べています。"
            "口コミの信頼度を適切に加味するので、<strong>実体験に近いおすすめ順</strong>になっています。"
            "表の各製品には、カーペット検知や吸引力に関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "カーペット点数",
        "score_col": "カーペット",
        "comment_label": "カーペット清掃の口コミ傾向",
        "table_note": "各製品にカーペット清掃の口コミコメント付き",
        "hub_title": "【ロボット掃除機ランキング】カーペット掃除のおすすめ機種",
        "hub_cta": "カーペット清掃ランキングを見る →",
        "hub_meta": "カーペット清掃の口コミを数値化",
        "schema_description": "口コミのカーペット清掃評価を数値化したランキング",
        "related_note": "フローリング掃除・静音性は別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "フローリング掃除ランキング"),
            ("/rankings/quietness", "静音性ランキング"),
        ],
    },
    {
        "slug": "quietness",
        "tab_label": "静音性",
        "perf_keys": ("quietness", "noiseLevel", "quietOperation"),
        "crumb": "静音性",
        "h1": "【ロボット掃除機ランキング】静音性のおすすめ機種",
        "meta_description": "口コミの静音性評価を数値化したランキング。口コミ信頼度も加味したおすすめ順で{count}製品を比較できます。",
        "og_description": "口コミの静音性評価を数値化したランキング。口コミ信頼度も加味したおすすめ順で比較できます。",
        "lede": "口コミに書かれた運転音・静音性の評価を数値化し、在宅中や夜間でも使いやすい機種を比較したランキングです。各製品には、実際の口コミからまとめた静音性の傾向コメントも掲載しています。",
        "method_body": (
            "「音が静か」「テレビの邪魔にならない」といった口コミを点数化し、静音性の高さで並べています。"
            "口コミの信頼度を適切に加味するので、<strong>実体験に近いおすすめ順</strong>になっています。"
            "表の各製品には、運転音や生活への影響に関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "静音性点数",
        "score_col": "静音性",
        "comment_label": "静音性の口コミ傾向",
        "table_note": "各製品に静音性の口コミコメント付き",
        "hub_title": "【ロボット掃除機ランキング】静音性のおすすめ機種",
        "hub_cta": "静音性ランキングを見る →",
        "hub_meta": "運転音・静音性の口コミを数値化",
        "schema_description": "口コミの静音性評価を数値化したランキング",
        "related_note": "フローリング掃除・カーペット掃除は別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "フローリング掃除ランキング"),
            ("/rankings/carpet-cleaning", "カーペット掃除ランキング"),
        ],
    },
]


def load_products(perf_keys: tuple[str, ...]) -> list[dict]:
    rows = []
    for path in sorted(DATA_DIR.glob("*.json")):
        raw = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        perf = raw.get("performanceAnalysis") or {}
        feature = None
        comment = ""
        for key in perf_keys:
            value = perf.get(key)
            if isinstance(value, dict) and value.get("score") is not None:
                feature = float(value["score"])
                comment = (value.get("comment") or "").strip()
                break
            if isinstance(value, (int, float)):
                feature = float(value)
                break
        if feature is None:
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
                "feature": feature,
                "reliability": float(rel),
                "reviews": int(raw.get("totalReviews") or 0),
                "price": int(raw.get("price") or 0),
                "composite": round(WF * feature + WR * float(rel), 1),
                "comment": comment,
            }
        )
    rows.sort(
        key=lambda x: (-x["composite"], -x["feature"], -x["reliability"], -x["reviews"])
    )
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


def build_feature_tabs(active_slug: str | None = None) -> str:
    items = []
    for cfg in RANKINGS:
        is_active = cfg["slug"] == active_slug
        active_cls = " active" if is_active else ""
        aria = ' aria-current="page"' if is_active else ""
        label = html.escape(cfg["tab_label"])
        items.append(
            f'<a class="rank-tab{active_cls}" href="/rankings/{cfg["slug"]}"{aria}>{label}</a>'
        )
    all_active = " active" if active_slug is None else ""
    all_aria = ' aria-current="page"' if active_slug is None else ""
    items.append(
        f'<a class="rank-tab rank-tab-all{all_active}" href="/rankings/"{all_aria}>一覧</a>'
    )
    return f"""
  <nav class="rank-tabs" aria-label="機能別ランキング">
    <div class="wrap rank-tabs-inner">
      {"".join(items)}
    </div>
  </nav>"""


def build_rows(products: list[dict], comment_label: str) -> str:
    chunks = []
    for p in products:
        url = product_url(p["id"])
        name = html.escape(p["name"])
        mfr = html.escape(p["manufacturer"])
        comment = html.escape((p.get("comment") or "").strip())
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
          <p class="floor-comment"><span class="floor-comment-label">{html.escape(comment_label)}</span>{comment}</p>
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
        <td class="num floor"><span class="score {score_class(p['feature'])}">{p['feature']:.0f}</span></td>
        <td class="num"><span class="score {score_class(p['reliability'])}">{p['reliability']:.1f}</span></td>
        <td class="num muted">{p['reviews']:,}</td>
        <td class="num muted">{yen(p['price'])}</td>
      </tr>{comment_row}"""
        )
    return "".join(chunks)


def build_item_list_json(products: list[dict], cfg: dict) -> str:
    elements = [
        {
            "@type": "ListItem",
            "position": p["rank"],
            "url": product_url(p["id"]),
            "name": p["name"],
        }
        for p in products[:30]
    ]
    payload = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": cfg["h1"],
        "description": cfg["schema_description"],
        "url": f"https://nattoku-labo.com/rankings/{cfg['slug']}",
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
.rank-tabs {
  position: sticky;
  top: calc(60px + env(safe-area-inset-top, 0px));
  z-index: 20;
  background: #fff;
  border-bottom: 1px solid var(--line);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}
@media (max-width: 768px) {
  .rank-tabs { top: calc(55px + env(safe-area-inset-top, 0px)); }
}
.rank-tabs-inner {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0.55rem 1rem;
  scrollbar-width: thin;
}
.rank-tab {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  color: #334155;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
}
.rank-tab:hover { border-color: #93c5fd; color: var(--primary); background: #eff6ff; }
.rank-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.rank-tab-all {
  margin-left: auto;
  font-weight: 700;
  color: var(--primary);
  background: #eff6ff;
  border-color: #bfdbfe;
}
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
.top-cards {
  margin: 1.35rem 0 0;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 1rem 1.1rem 1.25rem;
}
.top-cards h2 { font-size: 1.05rem; margin-bottom: 0.35rem; }
.top-cards .section-sub {
  font-size: 0.88rem;
  color: var(--muted);
  margin-bottom: 1rem;
}
.top-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 720px) {
  .top-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1100px) {
  .top-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
.aff-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 0.95rem 0.85rem 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
}
.aff-card-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.7rem;
  height: 1.7rem;
  border-radius: 8px;
  background: #eff6ff;
  color: var(--primary);
  font-weight: 900;
  font-size: 0.85rem;
  margin-right: 0.35rem;
}
.aff-card.rank-1 .aff-card-rank { background: #f59e0b; color: #fff; }
.aff-card.rank-2 .aff-card-rank { background: #64748b; color: #fff; }
.aff-card.rank-3 .aff-card-rank { background: #c2410c; color: #fff; }
.aff-card-head {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.aff-card-head img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  flex-shrink: 0;
}
.aff-card-title {
  font-weight: 800;
  font-size: 0.92rem;
  line-height: 1.35;
  color: var(--secondary);
}
.aff-card-title a {
  color: inherit;
  text-decoration: none;
}
.aff-card-title a:hover { color: var(--primary); text-decoration: underline; }
.aff-card-brand {
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 600;
  margin-top: 0.1rem;
}
.aff-card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}
.aff-card-stats span strong { color: var(--excellent); font-variant-numeric: tabular-nums; }
.aff-card-detail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1e40af;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}
.aff-card-detail:hover {
  color: #fff;
  background: #2563eb;
  border-color: #1d4ed8;
}
.aff-card-body { min-width: 0; width: 100%; }
.aff-card-direct {
  text-align: center;
  margin-bottom: 0.55rem;
  position: relative;
}
.aff-card-direct .official-hp-btn {
  display: block;
  width: 100%;
  text-align: center;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1.4;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: linear-gradient(145deg, #0e7490 0%, #0d9488 42%, #059669 100%);
  box-shadow: 0 6px 16px rgba(13, 148, 136, 0.28);
}
.aff-card-direct .official-hp-btn:hover { filter: brightness(1.05); }
.aff-card-moshimo { width: 100%; min-width: 0; }
.aff-card-moshimo iframe {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border: 0;
  display: block;
}
.aff-card-status {
  color: var(--muted);
  font-weight: 600;
  text-align: center;
  padding: 0.75rem 0;
  font-size: 0.82rem;
}
.aff-card-status.error { color: #dc2626; }
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

AFFILIATE_JS = r"""
(function () {
  function normalizeMoshimoEasyLinkHtml(html) {
    if (typeof html !== "string") return html;
    return html.replace(
      /(["'])\/\/dn\.msmstatic\.com\/site\/cardlink\/bundle\.js/g,
      "$1https://dn.msmstatic.com/site/cardlink/bundle.js",
    );
  }

  function injectMoshimoIframe(container, html) {
    if (!container || !html) return;
    container.innerHTML = "";
    const safe = normalizeMoshimoEasyLinkHtml(html);
    const iframe = document.createElement("iframe");
    iframe.title = "価格・購入先（もしもアフィリエイト）";
    iframe.setAttribute("scrolling", "no");
    iframe.loading = "lazy";
    iframe.srcdoc =
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<base target="_blank" rel="noopener noreferrer">' +
      "<style>*,*::before,*::after{box-sizing:border-box}" +
      "html,body{width:100%;max-width:100%;min-width:0;margin:0;padding:0;background:#fff;color:#0f172a;overflow-x:hidden}" +
      "body{display:flex;flex-direction:column;align-items:stretch}" +
      '[id^="msmaflink-"]{width:100%!important;max-width:100%!important;min-width:0!important;margin-left:auto;margin-right:auto}' +
      '[id^="msmaflink-"] *{max-width:100%!important;min-width:0}' +
      '[id^="msmaflink-"] table{width:100%!important;table-layout:fixed}' +
      '[id^="msmaflink-"] img{height:auto!important;object-fit:contain}' +
      "</style></head><body>" +
      safe +
      "</body></html>";
    iframe.style.cssText = "width:100%;max-width:100%;min-width:0;border:0;display:block;";
    iframe.addEventListener("load", function () {
      const resize = function () {
        try {
          const doc = iframe.contentDocument;
          if (!doc) return;
          const h = Math.max(
            doc.body ? doc.body.scrollHeight : 0,
            doc.documentElement ? doc.documentElement.scrollHeight : 0,
          );
          if (h > 40) iframe.style.height = h + "px";
        } catch (e) {}
      };
      resize();
      const id = window.setInterval(resize, 400);
      window.setTimeout(function () { window.clearInterval(id); }, 10000);
    });
    container.appendChild(iframe);
  }

  function buildOfficialHpButton(directHtml) {
    if (!directHtml) return null;
    const hrefM = String(directHtml).match(/href=["']([^"']+)["']/i);
    if (!hrefM) return null;
    const wrap = document.createElement("div");
    wrap.className = "aff-card-direct";
    const a = document.createElement("a");
    a.className = "official-hp-btn";
    a.href = hrefM[1];
    a.target = "_blank";
    a.rel = "noopener sponsored nofollow";
    a.textContent = "公式ホームページ";
    wrap.appendChild(a);
    const pixM = String(directHtml).match(
      /<img[^>]+src=["']([^"']+)["'][^>]*(?:width=["']?1\b|height=["']?1\b)/i,
    );
    if (pixM) {
      const img = document.createElement("img");
      img.src = pixM[1];
      img.width = 1;
      img.height = 1;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.style.cssText =
        "position:absolute;width:1px;height:1px;border:none;opacity:0;pointer-events:none;";
      wrap.appendChild(img);
    }
    return wrap;
  }

  async function mountCard(el) {
    const slug = el.getAttribute("data-slug");
    const body = el.querySelector(".aff-card-body");
    const status = el.querySelector(".aff-card-status");
    try {
      const res = await fetch("/products/data/" + slug + ".json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const aff = data.affiliate || {};
      const hasMoshimo = !!(aff.moshimo && String(aff.moshimo).trim());
      const hasDirect = !!(aff.direct && String(aff.direct).trim());
      if (!hasMoshimo && !hasDirect) {
        if (status) {
          status.textContent = "準備中";
          status.classList.add("error");
        }
        return;
      }
      if (!body) return;
      body.innerHTML = "";
      if (hasDirect) {
        const btn = buildOfficialHpButton(aff.direct);
        if (btn) {
          body.appendChild(btn);
        } else {
          const directSlot = document.createElement("div");
          directSlot.className = "aff-card-direct";
          directSlot.innerHTML = String(aff.direct);
          body.appendChild(directSlot);
        }
      }
      if (hasMoshimo) {
        const moshimoSlot = document.createElement("div");
        moshimoSlot.className = "aff-card-moshimo";
        injectMoshimoIframe(moshimoSlot, aff.moshimo);
        body.appendChild(moshimoSlot);
      }
    } catch (err) {
      if (status) {
        status.textContent = "読込失敗";
        status.classList.add("error");
      }
    }
  }

  document.querySelectorAll(".aff-card[data-slug]").forEach(mountCard);
})();
"""


def build_top_cards(products: list[dict], score_col: str) -> str:
    top = products[:10]
    if not top:
        return ""
    cards = []
    for p in top:
        url = product_url(p["id"])
        name = html.escape(p["name"])
        mfr = html.escape(p["manufacturer"])
        rank = p["rank"]
        rank_cls = f" rank-{rank}" if rank <= 3 else ""
        img = (
            f'<img src="{html.escape(p["imageUrl"])}" alt="" width="56" height="56" loading="lazy">'
            if p.get("imageUrl")
            else ""
        )
        cards.append(
            f"""
        <article class="aff-card{rank_cls}" data-slug="{html.escape(p['id'])}">
          <div class="aff-card-head">
            {img}
            <div>
              <div class="aff-card-title">
                <span class="aff-card-rank">{rank}</span>
                <a href="{url}" target="_blank" rel="noopener">{name}</a>
              </div>
              <div class="aff-card-brand">{mfr} · {yen(p['price'])}</div>
            </div>
          </div>
          <div class="aff-card-stats">
            <span>{html.escape(score_col)} <strong>{p['feature']:.0f}</strong></span>
            <span>口コミ信頼度 <strong>{p['reliability']:.1f}</strong></span>
            <span>口コミ <strong>{p['reviews']:,}</strong></span>
          </div>
          <a class="aff-card-detail" href="{url}" target="_blank" rel="noopener">詳細分析を見る →</a>
          <div class="aff-card-body">
            <span class="aff-card-status">価格読込中…</span>
          </div>
        </article>"""
        )
    return f"""
      <section class="top-cards" aria-label="上位10製品">
        <h2>上位10製品</h2>
        <p class="section-sub">ランキング上位の製品カードです。詳細分析ページと最新価格を確認できます。</p>
        <div class="top-cards-grid">
          {"".join(cards)}
        </div>
      </section>"""


def write_ranking_page(cfg: dict, products: list[dict]) -> Path:
    count = len(products)
    slug = cfg["slug"]
    related_links = "".join(
        f'<a href="{href}">{html.escape(label)}</a>'
        for href, label in cfg.get("related_rankings", [])
    )
    meta_desc = cfg["meta_description"].format(count=count)
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(cfg["h1"])}｜ナットクLabo</title>
  <meta name="description" content="{html.escape(meta_desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://nattoku-labo.com/rankings/{slug}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="https://nattoku-labo.com/rankings/{slug}">
  <meta property="og:title" content="{html.escape(cfg["h1"])}">
  <meta property="og:description" content="{html.escape(cfg["og_description"])}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <style>{CSS}</style>
  <script type="application/ld+json">
{build_item_list_json(products, cfg)}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{"@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://nattoku-labo.com/"}},
      {{"@type": "ListItem", "position": 2, "name": "ランキング", "item": "https://nattoku-labo.com/rankings/"}},
      {{"@type": "ListItem", "position": 3, "name": "{html.escape(cfg["crumb"])}", "item": "https://nattoku-labo.com/rankings/{slug}"}}
    ]
  }}
  </script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="パンくず">
        <a href="/">ホーム</a> › <a href="/rankings/">ランキング</a> › {html.escape(cfg["crumb"])}
      </nav>
      <h1>{html.escape(cfg["h1"])}</h1>
      <p class="lede">{cfg["lede"]}</p>
    </div>
  </header>
{build_feature_tabs(slug)}

  <main>
    <div class="wrap">
      <section class="method">
        <h2>このランキングの見方</h2>
        <p>{cfg["method_body"]}</p>
        <p class="method-sub">
          ランキングの式：<code>{html.escape(cfg["formula_label"])} × 0.85 ＋ 口コミ信頼度 × 0.15</code>
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
          <span>{html.escape(cfg["table_note"])}</span>
        </div>
        <p class="swipe-hint">← 表は横にスワイプできます →</p>
        <div class="scroll">
          <table id="ranking-table">
            <thead>
              <tr>
                <th>順位</th>
                <th>製品</th>
                <th>{html.escape(cfg["score_col"])}</th>
                <th>口コミ信頼度</th>
                <th>口コミ数</th>
                <th>価格目安</th>
              </tr>
            </thead>
            <tbody>
              {build_rows(products, cfg["comment_label"])}
            </tbody>
          </table>
        </div>
        <p class="empty-msg" id="empty-msg">この価格帯に該当する製品はありません。</p>
      </section>

{build_top_cards(products, cfg["score_col"])}

      <div class="notes">
        <section>
          <h2>注意事項</h2>
          <ul>
            <li>点数はECサイトの口コミを横断分析した値です。実機テストの計測値ではありません。</li>
            <li>価格は調査時点の目安です。購入前に各販売ページでご確認ください。</li>
            <li>{html.escape(cfg["related_note"])}</li>
          </ul>
        </section>
        <section>
          <h2>ほかのランキング・比較</h2>
          <div class="related">
            {related_links}
            <a href="/rankings/">ランキング一覧</a>
            <a href="/compare/">価格帯比較</a>
          </div>
          <div class="related" style="margin-top:0.65rem">
            <a href="/compare/robot-vacuum-under-5man">〜5万円</a>
            <a href="/compare/robot-vacuum-5-7man">5〜7万円</a>
            <a href="/compare/robot-vacuum-7-10man">7〜10万円</a>
            <a href="/compare/robot-vacuum-10-15man">10〜15万円</a>
            <a href="/compare/robot-vacuum-15-20man">15〜20万円</a>
            <a href="/compare/robot-vacuum-20man-plus">20万円〜</a>
          </div>
          <p class="more-links"><a href="/">製品一覧へ →</a>　<a href="/about">このサイトについて →</a></p>
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
  <script>{AFFILIATE_JS}</script>
</body>
</html>
"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{slug}.html"
    out.write_text(page, encoding="utf-8")
    return out


def write_hub(entries: list[tuple[dict, int]]) -> Path:
    bands = []
    for cfg, count in entries:
        bands.append(
            f"""
    <a class="band" href="/rankings/{cfg["slug"]}">
      <strong>{html.escape(cfg["hub_title"])}</strong>
      <span>{html.escape(cfg["hub_cta"])}</span>
      <span class="meta">{html.escape(cfg["hub_meta"])} / 掲載{count}製品</span>
    </a>"""
        )
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ロボット掃除機ランキング一覧｜ナットクLabo</title>
  <meta name="description" content="口コミ分析に基づくロボット掃除機の機能別ランキング一覧。フローリング・カーペット・静音性など、気になる性能からおすすめ機種を探せます。">
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
  <link rel="stylesheet" href="/products/css/navigation.css?v=20260815b">
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
    .rank-tabs {{
      position: sticky;
      top: calc(60px + env(safe-area-inset-top, 0px));
      z-index: 20;
      background: #fff;
      border-bottom: 1px solid var(--line);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }}
    @media (max-width: 768px) {{
      .rank-tabs {{ top: calc(55px + env(safe-area-inset-top, 0px)); }}
    }}
    .rank-tabs-inner {{
      display: flex; gap: 0.35rem; overflow-x: auto; -webkit-overflow-scrolling: touch;
      padding: 0.55rem 1rem; scrollbar-width: thin; max-width: 920px; margin: 0 auto;
    }}
    .rank-tab {{
      flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
      padding: 0.45rem 0.9rem; border-radius: 999px; border: 1px solid var(--line);
      background: #fff; color: #334155; text-decoration: none; font-size: 0.84rem;
      font-weight: 800; white-space: nowrap;
    }}
    .rank-tab:hover {{ border-color: #93c5fd; color: var(--primary); background: #eff6ff; }}
    .rank-tab.active {{ background: var(--primary); border-color: var(--primary); color: #fff; }}
    .rank-tab-all {{ margin-left: auto; font-weight: 700; color: var(--primary); background: #eff6ff; border-color: #bfdbfe; }}
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
{build_feature_tabs(None)}
  <div class="wrap list">
    {"".join(bands)}
  </div>
  <footer class="page-footer">
    <a href="/">ホーム</a>
    <a href="/compare/">徹底比較</a>
    <a href="/about">サイトについて</a>
    <p style="margin-top:0.65rem">ナットクLabo</p>
  </footer>
  <script src="/products/js/navigation.js?v=20260815b"></script>
</body>
</html>
"""
    out = OUT_DIR / "index.html"
    out.write_text(page, encoding="utf-8")
    return out


def main() -> None:
    entries: list[tuple[dict, int]] = []
    for cfg in RANKINGS:
        products = load_products(tuple(cfg["perf_keys"]))
        out = write_ranking_page(cfg, products)
        entries.append((cfg, len(products)))
        print(f"wrote {out} ({len(products)} products)")
        if products:
            top = products[0]
            print(f"  #1 {top['name']} feature={top['feature']} rel={top['reliability']} s={top['composite']}")
    hub = write_hub(entries)
    print(f"wrote {hub}")


if __name__ == "__main__":
    main()

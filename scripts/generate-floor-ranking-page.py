# -*- coding: utf-8 -*-
"""Generate feature ranking pages under /rankings/ (feature 85% + trust 15%)."""
from __future__ import annotations

import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "lib"))
from format_prose import clause_lines, format_prose, ja_wrap  # noqa: E402
DATA_DIR = ROOT / "products" / "data"
OUT_DIR = ROOT / "rankings"
NAV_V = "20261005a"
PERKS_V = "20261004b"
PROSE_V = "20261005a"
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
            "口コミの信頼度を適切に加味するので、実体験に近いおすすめ順になっています。"
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
        "related_note": "カーペット掃除・静音性・段差の乗り越えは別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/carpet-cleaning", "カーペット掃除ランキング"),
            ("/rankings/quietness", "静音性ランキング"),
            ("/rankings/step-climbing", "段差ランキング"),
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
            "口コミの信頼度を適切に加味するので、実体験に近いおすすめ順になっています。"
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
        "related_note": "フローリング掃除・静音性・段差の乗り越えは別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "フローリング掃除ランキング"),
            ("/rankings/quietness", "静音性ランキング"),
            ("/rankings/step-climbing", "段差ランキング"),
        ],
    },
    {
        "slug": "quietness",
        "tab_label": "静音性",
        "perf_keys": ("quietness", "noiseLevel", "quietOperation"),
        "crumb": "静音ロボット掃除機ランキング",
        "h1": "静音ロボット掃除機ランキング｜静かでおすすめの機種を口コミで比較",
        "meta_description": "口コミの「静か」「うるさい」の声を数値化して、{count}機種を静音性の高い順に比較。夜間や在宅ワーク中、集合住宅でも使いやすい機種を、実際の口コミ付きで選べます。",
        "og_description": "口コミの「静か」「うるさい」の声を数値化して、静音性の高い順に比較。夜間や在宅ワーク中、集合住宅でも使いやすい機種を、実際の口コミ付きで選べます。",
        "lede": "口コミに書かれた運転音・静音性の評価を数値化し、在宅中や夜間でも使いやすい機種を比較したランキングです。各製品には、実際の口コミからまとめた静音性の傾向コメントも掲載しています。",
        "method_body": (
            "「音が静か」「テレビの邪魔にならない」といった口コミを点数化し、静音性の高さで並べています。"
            "口コミの信頼度を適切に加味するので、実体験に近いおすすめ順になっています。"
            "表の各製品には、運転音や生活への影響に関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "静音性点数",
        "score_col": "静音性",
        "comment_label": "静音性の口コミ傾向",
        "table_note": "各製品に静音性の口コミコメント付き",
        "hub_title": "静音ロボット掃除機ランキング｜静かでおすすめの機種を口コミで比較",
        "hub_cta": "静音性ランキングを見る →",
        "hub_meta": "運転音・静音性の口コミを数値化",
        "schema_description": "口コミの静音性評価を数値化したランキング",
        "related_note": "フローリング掃除・カーペット掃除・段差の乗り越えは別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "フローリング掃除ランキング"),
            ("/rankings/carpet-cleaning", "カーペット掃除ランキング"),
            ("/rankings/step-climbing", "段差ランキング"),
        ],
    },
    {
        "slug": "step-climbing",
        "tab_label": "段差",
        "perf_keys": ("stepClimbing",),
        "crumb": "段差に強いロボット掃除機ランキング",
        "h1": "段差に強いロボット掃除機ランキング｜段差の乗り越えを口コミで比較",
        "meta_description": "敷居やラグ、玄関の段差で「止まる」「乗り越えられる」という口コミを数値化して、{count}機種を段差に強い順に比較。段差の多い家に合う機種を、実際の口コミ付きで選べます。",
        "og_description": "敷居やラグ、玄関の段差で「止まる」「乗り越えられる」という口コミを数値化して、段差に強い順に比較。段差の多い家に合う機種を、実際の口コミ付きで選べます。",
        "lede": "口コミに書かれた段差の乗り越えの評価を数値化し、敷居やラグのある家でも止まりにくい機種を比較したランキングです。各製品には、実際の口コミからまとめた段差の傾向コメントも掲載しています。",
        "method_body": (
            "「敷居を問題なく越える」「ラグの端で止まる」といった口コミを点数化し、段差の乗り越えの得意さで並べています。"
            "口コミの信頼度を適切に加味するので、実体験に近いおすすめ順になっています。"
            "メーカーが公表する乗り越えられる段差の高さとは別の、使った人の声にもとづく評価です。"
        ),
        "formula_label": "段差点数",
        "score_col": "段差",
        "comment_label": "段差の乗り越えの口コミ傾向",
        "table_note": "各製品に段差の乗り越えの口コミコメント付き",
        "hub_title": "段差に強いロボット掃除機ランキング｜段差の乗り越えを口コミで比較",
        "hub_cta": "段差ランキングを見る →",
        "hub_meta": "段差の乗り越えの口コミを数値化",
        "schema_description": "口コミの段差乗り越え評価を数値化したランキング",
        "related_note": "フローリング掃除・カーペット掃除・静音性は別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "フローリング掃除ランキング"),
            ("/rankings/carpet-cleaning", "カーペット掃除ランキング"),
            ("/rankings/quietness", "静音性ランキング"),
        ],
        "article": "step",
    },
]

DIMS_DIR = ROOT / "scripts" / "data" / "dims"
PICK_MIN_REVIEWS = 50
CHEAP_MAX = 50000


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


def heading_lines(text: str) -> str:
    """見出しを「｜」の位置で改行できるよう、区切りごとに span.clause で包む。"""
    parts = [p for p in text.split("｜")]
    return "".join(
        f'<span class="clause">{html.escape(p)}{"｜" if i < len(parts) - 1 else ""}</span>'
        for i, p in enumerate(parts)
    )


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


LOW_REVIEW_THRESHOLD = 20


def ref_badge(reviews: int) -> str:
    """Mark low-sample scores as 参考値 (keep in ranking, do not exclude)."""
    if int(reviews or 0) >= LOW_REVIEW_THRESHOLD:
        return ""
    return (
        '<span class="ref-badge" title="口コミ数が少ないため参考値">'
        "参考値</span>"
    )


def build_rows(products: list[dict], comment_label: str) -> str:
    chunks = []
    for p in products:
        url = product_url(p["id"])
        name = html.escape(p["name"])
        mfr = html.escape(p["manufacturer"])
        comment = format_prose((p.get("comment") or "").strip())
        if not comment:
            comment = (
                f'<span class="comment-empty">{html.escape(comment_label)}'
                "に関する口コミは見つかりませんでした</span>"
            )
        tc = top_class(p["rank"])
        badge = ref_badge(p["reviews"])
        img = (
            f'<img src="{html.escape(p["imageUrl"])}" alt="{name}の製品画像" loading="lazy" width="56" height="56">'
            if p.get("imageUrl")
            else '<div class="img-ph" aria-hidden="true"></div>'
        )
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
        <td class="rank"><span class="rank-num">{p['rank']}</span>{badge}</td>
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
  --muted: #0f172a;
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
/* 句読点・｜の位置で改行する（収まらない節だけ節の中で折り返す） */
h1 .clause, .lede .clause { display: inline-block; word-break: auto-phrase; text-wrap: pretty; }
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
  color: #1e293b;
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
.method p { font-size: 0.9rem; color: #1e293b; }
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
  color: #1e293b;
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
.rank-nav {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0.75rem 0.85rem 0.65rem;
  padding: 0.45rem 0.5rem;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 12px;
}
.rank-nav-btn {
  flex-shrink: 0;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid #93c5fd;
  border-radius: 10px;
  background: #fff;
  color: #1e40af;
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rank-nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.rank-nav-btn:not(:disabled):active { background: #dbeafe; }
.rank-nav-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.rank-nav-pos {
  font-size: 0.78rem;
  font-weight: 800;
  color: #1e40af;
  text-align: center;
}
.rank-nav-hint {
  font-size: 0.68rem;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  line-height: 1.45;
}
.rank-nav-track {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: #bfdbfe;
  overflow: hidden;
  cursor: pointer;
}
.rank-nav-thumb {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 18%;
  border-radius: 999px;
  background: #2563eb;
  pointer-events: none;
}
.scroll-stage {
  position: relative;
  margin: 0 0.65rem 0.75rem;
  border: 1.5px solid #93c5fd;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}
.scroll-stage::before,
.scroll-stage::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1.35rem;
  pointer-events: none;
  z-index: 4;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.scroll-stage::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(30, 64, 175, 0.16), transparent);
}
.scroll-stage::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(30, 64, 175, 0.22), transparent);
}
.scroll-stage.can-up::before { opacity: 1; }
.scroll-stage.can-down::after { opacity: 1; }
.scroll {
  overflow: auto;
  max-height: 42rem;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  scrollbar-width: auto;
}
.scroll:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.88rem; min-width: 720px; }
th, td { padding: 0.75rem 0.85rem; text-align: left; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
th {
  position: sticky; top: 0; z-index: 5;
  background: #f8fafc; color: var(--muted);
  font-size: 0.72rem; letter-spacing: 0.03em; font-weight: 700; white-space: nowrap;
  box-shadow: 0 1px 0 var(--line);
}
.rank { width: 4.2rem; }
.ref-badge {
  display: inline-block;
  margin: 0.25rem 0 0;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.comment-empty { color: #64748b; font-weight: 600; }
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
  color: #1e293b; font-size: 0.82rem; line-height: 1.7; font-weight: 500;
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
.notes p, .notes li { font-size: 0.88rem; color: #1e293b; }
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
  color: #1e293b;
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
  border-radius: 10px;
  background: #0f766e;
  border: 1px solid #0d9488;
  box-shadow: 0 1px 4px rgba(13, 148, 136, 0.18);
}
.aff-card-direct .official-hp-btn:hover { background: #0d9488; }
.aff-card-body > .op-slim { margin: 0 0 0.75rem; }
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
  const stage = document.getElementById("rank-scroll-stage");
  const prevBtn = document.querySelector('.rank-nav-btn[data-dir="-1"]');
  const nextBtn = document.querySelector('.rank-nav-btn[data-dir="1"]');
  const posEl = document.querySelector(".rank-nav-pos");
  const track = document.querySelector(".rank-nav-track");
  const thumb = document.querySelector(".rank-nav-thumb");
  const thead = table ? table.querySelector("thead") : null;

  function visibleRankRows() {
    if (!table) return [];
    return Array.from(table.querySelectorAll("tbody tr.rank-row"))
      .filter(function (row) { return row.style.display !== "none"; });
  }

  function updateRankNav() {
    if (!scroll) return;
    const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
    const top = scroll.scrollTop;
    const canUp = top > 2;
    const canDown = top < max - 2;
    if (stage) {
      stage.classList.toggle("can-up", canUp);
      stage.classList.toggle("can-down", canDown);
    }
    if (prevBtn) prevBtn.disabled = !canUp;
    if (nextBtn) nextBtn.disabled = !canDown;
    if (thumb) {
      if (max <= 0) {
        thumb.style.width = "100%";
        thumb.style.left = "0%";
      } else {
        const ratio = Math.min(1, scroll.clientHeight / Math.max(scroll.scrollHeight, 1));
        const thumbW = Math.max(12, Math.round(ratio * 100));
        const left = (top / max) * (100 - thumbW);
        thumb.style.width = thumbW + "%";
        thumb.style.left = left + "%";
      }
    }
    const ranks = visibleRankRows();
    if (posEl && ranks.length) {
      const box = scroll.getBoundingClientRect();
      const inView = ranks.filter(function (row) {
        const b = row.getBoundingClientRect();
        return b.bottom > box.top + 10 && b.top < box.bottom - 10;
      });
      const shown = inView.length ? inView : ranks.slice(0, 1);
      const first = shown[0].getAttribute("data-rank") || "1";
      const last = shown[shown.length - 1].getAttribute("data-rank") || first;
      posEl.textContent = first === last
        ? first + "位を表示 · 全" + ranks.length + "製品"
        : first + "〜" + last + "位を表示 · 全" + ranks.length + "製品";
    }
  }

  function fitFiveProducts() {
    if (!scroll || !table || !thead) return;
    const visibleRanks = visibleRankRows();
    if (!visibleRanks.length) {
      scroll.style.maxHeight = "";
      updateRankNav();
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
    updateRankNav();
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

  if (scroll) {
    scroll.addEventListener("scroll", updateRankNav, { passive: true });
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (!scroll) return;
      scroll.scrollBy({ top: -Math.max(120, scroll.clientHeight * 0.92), behavior: "smooth" });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!scroll) return;
      scroll.scrollBy({ top: Math.max(120, scroll.clientHeight * 0.92), behavior: "smooth" });
    });
  }
  if (track && thumb) {
    track.addEventListener("click", function (ev) {
      if (!scroll) return;
      const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      if (max <= 0) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      scroll.scrollTo({ top: ratio * max, behavior: "smooth" });
    });
  }

  window.addEventListener("resize", function () { requestAnimationFrame(fitFiveProducts); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(fitFiveProducts); });
  }
  window.addEventListener("load", function () { requestAnimationFrame(fitFiveProducts); });
  requestAnimationFrame(fitFiveProducts);
})();
"""

ARTICLE_CSS = r"""
.picks { margin: 1.25rem 0 1.5rem; }
.picks h2, .article-sec h2 { font-size: 1.15rem; font-weight: 900; color: #0f172a; margin-bottom: 0.4rem; }
.picks .section-sub { font-size: 0.86rem; color: #475569; margin-bottom: 0.85rem; }
.picks-grid { display: grid; gap: 0.85rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.pick-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.55rem; }
.pick-card:first-child { border: 2px solid var(--primary); box-shadow: 0 8px 22px rgba(30,64,175,0.08); }
.pick-label { font-size: 0.78rem; font-weight: 800; color: var(--primary); }
.pick-head { display: flex; gap: 0.7rem; align-items: center; }
.pick-head img, .pick-head .img-ph { width: 64px; height: 64px; object-fit: contain; border-radius: 10px; background: #f1f5f9; flex: 0 0 auto; }
.pick-head h3 { font-size: 1rem; font-weight: 900; line-height: 1.35; }
.pick-head h3 a { color: #0f172a; text-decoration: none; }
.pick-meta { font-size: 0.8rem; color: #475569; }
.pick-stats { list-style: none; display: flex; flex-wrap: wrap; gap: 0.3rem 0.8rem; font-size: 0.82rem; color: #334155; }
.pick-card > p { font-size: 0.85rem; color: #334155; line-height: 1.7; }
.pick-actions { margin-top: auto; display: grid; gap: 0.45rem; }
.btn-primary, .btn-sub { display: block; text-align: center; border-radius: 10px; padding: 0.65rem 0.8rem; font-weight: 800; font-size: 0.9rem; text-decoration: none; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: #1e3a8a; }
.btn-sub { background: #eff6ff; color: var(--primary); border: 1px solid #bfdbfe; }
.btn-sub:hover { background: #dbeafe; }
.article { margin: 1.75rem 0 0.5rem; display: grid; gap: 1.1rem; }
.article-sec { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 1.1rem 1.15rem; }
.article-sec p { font-size: 0.93rem; line-height: 1.85; color: #1e293b; }
.article-sec p + p, .article-sec p + .table-scroll, .article-sec .table-scroll + p { margin-top: 0.7rem; }
.article-sec a { color: var(--primary); font-weight: 700; }
.article-sec .em-key { background: linear-gradient(transparent 62%, #fde68a 62%); font-weight: 800; }
.table-scroll { overflow-x: auto; margin-top: 0.75rem; }
table.mini { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 520px; }
table.mini th, table.mini td { border-bottom: 1px solid var(--line); padding: 0.5rem 0.55rem; text-align: left; vertical-align: top; }
table.mini th { background: #f8fafc; font-weight: 800; color: #0f172a; white-space: nowrap; }
table.mini td.num { white-space: nowrap; font-weight: 700; }
ul.tips { list-style: none; display: grid; gap: 0.55rem; }
ul.tips li { font-size: 0.92rem; line-height: 1.8; padding-left: 1.1rem; position: relative; }
ul.tips li::before { content: "✓"; position: absolute; left: 0; color: var(--primary); font-weight: 900; }
.mid-cta { margin-top: 0.9rem; }
.mid-cta .btn-sub { display: inline-block; }
.faq details { border-top: 1px solid var(--line); padding: 0.65rem 0; }
.faq details:first-of-type { border-top: none; }
.faq summary { cursor: pointer; font-weight: 800; color: #0f172a; font-size: 0.95rem; }
.faq .faq-a { margin-top: 0.45rem; }
.aff-card { scroll-margin-top: 130px; }
.picks, .article-sec, .top-cards, .table-wrap { scroll-margin-top: 120px; }
.picks-note { font-size: 0.82rem; color: #475569; margin-top: 0.75rem; line-height: 1.7; }
.picks-jump { margin-top: 0.75rem; text-align: center; }
.picks-jump .btn-sub { display: inline-block; padding: 0.6rem 1.4rem; }
@media (max-width: 768px) {
  /* スマホでは結論を1台1行に近い簡単な表示にして、表までの距離を縮める */
  .picks-grid { gap: 0.55rem; }
  .pick-card { padding: 0.75rem 0.8rem; gap: 0.35rem; }
  .pick-card > p:not(.pick-label), .pick-meta, .pick-stats li:nth-child(3) { display: none; }
  .pick-head img, .pick-head .img-ph { width: 44px; height: 44px; }
  .pick-head h3 { font-size: 0.95rem; }
  .pick-stats { font-size: 0.8rem; }
  .pick-actions { grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .btn-primary, .btn-sub { padding: 0.55rem 0.4rem; font-size: 0.82rem; }
}
.sticky-cta { display: none; }
@media (max-width: 768px) {
  .sticky-cta:not([hidden]) {
    display: flex; gap: 0.45rem; position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
    padding: 0.6rem 0.75rem calc(0.6rem + env(safe-area-inset-bottom, 0px));
    background: rgba(255,255,255,0.97); border-top: 1px solid var(--line); box-shadow: 0 -6px 18px rgba(15,23,42,0.08);
  }
  .sticky-cta a { flex: 1 1 auto; text-align: center; border-radius: 10px; padding: 0.7rem 0.6rem; font-weight: 800; font-size: 0.88rem; text-decoration: none; background: var(--primary); color: #fff; }
  .sticky-cta a.sticky-sub { flex: 0 0 auto; background: #eff6ff; color: var(--primary); border: 1px solid #bfdbfe; }
  body { padding-bottom: 4.5rem; }
}
"""

STICKY_JS = r"""
(function () {
  var bar = document.getElementById("sticky-cta");
  var picks = document.getElementById("picks");
  var prices = document.getElementById("price-check");
  if (!bar || !picks || !prices || !("IntersectionObserver" in window)) return;
  var pastPicks = false, pricesVisible = false;
  function update() { bar.hidden = !(pastPicks && !pricesVisible); }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { pastPicks = !e.isIntersecting && e.boundingClientRect.top < 0; });
    update();
  }).observe(picks);
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { pricesVisible = e.isIntersecting; });
    update();
  }).observe(prices);
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
      try {
        const win = iframe.contentWindow;
        if (win && win.ResizeObserver && iframe.contentDocument.body) {
          new win.ResizeObserver(resize).observe(iframe.contentDocument.body);
        }
      } catch (e) {}
    });
    container.appendChild(iframe);
  }

  function extractOfficialHref(directHtml) {
    const s = String(directHtml);
    const hrefM = s.match(/href=["']([^"']+)["']/i);
    if (hrefM) return hrefM[1].indexOf("//") === 0 ? "https:" + hrefM[1] : hrefM[1];
    const a8 = s.match(/"ejp"\s*:\s*"([^"]*)"\s*\+\s*"([^"]*)"/i);
    if (a8) return a8[1] + a8[2];
    const a8b = s.match(/"h"\s*\+\s*"(ttps:\/\/[^"]+)"/i);
    if (a8b) return "h" + a8b[1];
    return null;
  }

  function buildOfficialHpButton(directHtml) {
    if (!directHtml) return null;
    const href = extractOfficialHref(directHtml);
    if (!href) return null;
    const wrap = document.createElement("div");
    wrap.className = "aff-card-direct";
    const a = document.createElement("a");
    a.className = "official-hp-btn";
    a.href = href;
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
          const perksApi = window.NattokuOfficialPerks;
          if (perksApi && perksApi.has(data.manufacturer, slug)) {
            btn.querySelector("a").textContent = "公式ストアで特典を確認する";
            body.appendChild(perksApi.build({ maker: data.manufacturer, productId: slug, button: btn, mode: "slim" }) || btn);
          } else {
            body.appendChild(btn);
          }
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


def load_dims() -> dict[str, dict]:
    dims: dict[str, dict] = {}
    for path in sorted(DIMS_DIR.glob("*.json")):
        dims.update(json.loads(path.read_text(encoding="utf-8")).get("products") or {})
    return dims


def climb_label(r: dict) -> str:
    if not r.get("climb"):
        return "公表なし"
    return f"{r['climb']:g}mm・2段" if r.get("climb2") else f"{r['climb']:g}mm"


def first_sentence(text: str, limit: int = 70) -> str:
    s = (text or "").strip()
    m = re.match(r"(.+?[。！])", s)
    s = m.group(1) if m else s
    return s if len(s) <= limit else s[: limit - 1] + "…"


_MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_MD_EM = re.compile(r"\*\*(.+?)\*\*")


def prose(text: str) -> str:
    """記事の本文用：**…** を強調、[名前](URL) をリンクにする（ガイド記事と同じ書き方）。"""
    out = html.escape(ja_wrap(text.strip()), quote=False)
    out = _MD_EM.sub(r'<strong class="em-key">\1</strong>', out)
    return _MD_LINK.sub(lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', out)


def p_tag(text: str, cls: str = "") -> str:
    attr = f' class="{cls}"' if cls else ""
    return f"<p{attr}>{prose(text)}</p>"


def plink(r: dict) -> str:
    return f'[{r["name"]}](/products/{r["id"]})'


def step_picks(products: list[dict]) -> list[tuple[str, dict]]:
    """結論ボックスの3台：口コミ50件以上の1位 → 5万円以下（50件以上）の1位 → 総合1位（参考値のことがある）。"""
    picks: list[tuple[str, dict]] = []
    seen: set[str] = set()

    def add(label: str, r: dict | None) -> None:
        if r and r["id"] not in seen:
            picks.append((label, r))
            seen.add(r["id"])

    reliable = [r for r in products if r["reviews"] >= PICK_MIN_REVIEWS]
    add(f"口コミ{PICK_MIN_REVIEWS}件以上で段差に最も強い", reliable[0] if reliable else None)
    cheap = [r for r in reliable if r["price"] and r["price"] <= CHEAP_MAX]
    add("予算5万円以下で段差に最も強い", cheap[0] if cheap else None)
    if products:
        top = products[0]
        add("総合1位" + ("（口コミが少なく参考値）" if top["reviews"] < LOW_REVIEW_THRESHOLD else ""), top)
    return picks


def build_step_picks(products: list[dict]) -> str:
    cards = []
    picks = step_picks(products)
    top = products[0] if products else None
    note = ""
    if top and picks and picks[0][1]["id"] != top["id"]:
        note = (
            f"ランキング表の1位は{top['name']}（段差{top['feature']:.0f}点）ですが、口コミが{top['reviews']:,}件と少ないため、"
            f"ここでは口コミ{PICK_MIN_REVIEWS}件以上の機種を先に挙げています。"
        )
    for label, r in picks:
        url = f"/products/{r['id']}"
        img = (
            f'<img src="{html.escape(r["imageUrl"])}" alt="" width="64" height="64" loading="lazy">'
            if r.get("imageUrl") else '<div class="img-ph" aria-hidden="true"></div>'
        )
        quote = first_sentence(r.get("comment") or "")
        cards.append(f"""
          <article class="pick-card">
            <p class="pick-label">{html.escape(label)}</p>
            <div class="pick-head">
              {img}
              <div>
                <h3><a href="{url}">{html.escape(r['name'])}</a></h3>
                <p class="pick-meta">{html.escape(r['manufacturer'])} · {yen(r['price'])}</p>
              </div>
            </div>
            <ul class="pick-stats">
              <li>段差 <strong>{r['feature']:.0f}点</strong>（{r['rank']}位）</li>
              <li>口コミ <strong>{r['reviews']:,}件</strong>{ref_badge(r['reviews'])}</li>
              <li>メーカー公表 <strong>{html.escape(climb_label(r))}</strong></li>
            </ul>
            {p_tag("口コミでは「" + quote + "」") if quote else ""}
            <div class="pick-actions">
              <a class="btn-primary" href="{url}">口コミ分析を見る</a>
              <a class="btn-sub" href="#price-{html.escape(r['id'])}">最新価格を見る ▼</a>
            </div>
          </article>""")
    return f"""
      <section class="picks" id="picks" aria-label="段差で選ぶならこの3台">
        <h2>結論：段差で選ぶならこの3台</h2>
        {p_tag("ランキングの順位に加えて、口コミの件数と予算も考えて選んだ3台です。点数はランキング表と同じ値です。", "section-sub")}
        <div class="picks-grid">{"".join(cards)}</div>
        {p_tag(note, "picks-note") if note else ""}
        <p class="picks-jump"><a class="btn-sub" href="#ranking">全機種ランキングを見る ▼</a></p>
      </section>"""


STEP_TOPICS = [
    ("敷居", r"敷居"),
    ("ラグ・カーペットの端", r"ラグ|カーペット|マット"),
    ("家具の脚・台座", r"家具|台座|脚"),
    ("玄関・落下", r"玄関|落下"),
    ("乗り上げて動けなくなる", r"乗り上げ|スタック|動けな|立ち往生"),
]


def build_step_article(products: list[dict]) -> tuple[str, list[tuple[str, str]]]:
    n = len(products)
    known = [r for r in products if r.get("climb")]
    bands = [
        ("20mm未満", lambda c: c < 20),
        ("20mm", lambda c: c == 20),
        ("21〜39mm", lambda c: 20 < c < 40),
        ("40mm以上", lambda c: c >= 40),
    ]
    band_rows = []
    band_avg: dict[str, float] = {}
    for label, test in bands:
        grp = [r for r in known if test(r["climb"])]
        if not grp:
            continue
        avg = sum(r["feature"] for r in grp) / len(grp)
        band_avg[label] = avg
        names = "、".join(r["name"] for r in sorted(grp, key=lambda r: -r["feature"])[:3])
        band_rows.append(
            f"<tr><td>{label}</td><td class=\"num\">{len(grp)}機種</td><td class=\"num\">{avg:.1f}点</td><td>{html.escape(names)}{' ほか' if len(grp) > 3 else ''}</td></tr>"
        )
    two = [r for r in known if r.get("climb2")]
    common = max(bands, key=lambda b: sum(1 for r in known if b[1](r["climb"])))[0]
    common_n = sum(1 for r in known if dict(bands)[common](r["climb"]))

    reliable = [r for r in known if r["reviews"] >= PICK_MIN_REVIEWS]
    low_spec_high = sorted([r for r in reliable if r["climb"] <= 20 and r["feature"] >= 80], key=lambda r: -r["feature"])
    high_spec_low = sorted([r for r in reliable if r["climb"] > 20 and r["feature"] <= 72], key=lambda r: r["feature"])
    avg_all = sum(r["feature"] for r in products) / n

    topic_counts = [(label, sum(1 for r in products if re.search(pat, r.get("comment") or ""))) for label, pat in STEP_TOPICS]
    topic_counts.sort(key=lambda x: -x[1])
    topics_txt = "、".join(f"「{label}」（{cnt}機種）" for label, cnt in topic_counts if cnt)
    picks = step_picks(products)
    pick1 = picks[0][1] if picks else products[0]
    cheap_pick = next((r for label, r in picks if "5万円" in label), None)

    # 1. 家の段差の目安
    sec1 = [
        p_tag(
            "ロボット掃除機が止まりやすいのは、部屋の境目の**敷居**、**ラグやカーペットの端**、**家具の脚や台座**です。"
            "高さは家ごとに違うので、まず掃除させたい場所の段差を実際に測り、その高さを越えられる機種を選ぶのが確実です。"
        ),
        p_tag(
            f"メーカーが「乗り越えられる段差」を公表しているのは掲載{n}機種のうち{len(known)}機種で、"
            f"いちばん多いのは**{common}**（{common_n}機種）です。"
            + (f"40mm以上を公表しているのは{sum(1 for r in known if r['climb'] >= 40)}機種で、"
               f"{'・'.join(r['name'] for r in two)}は2段になった段差の合計値（2段）として公表しています。" if two else "")
        ),
        f"""<div class="table-scroll"><table class="mini">
          <thead><tr><th>メーカー公表の段差</th><th>機種数</th><th>口コミの段差評価（平均）</th><th>主な機種</th></tr></thead>
          <tbody>{"".join(band_rows)}</tbody></table></div>""",
    ]
    # 2. 公表値と口コミ
    sec2 = []
    if "20mm" in band_avg and "40mm以上" in band_avg:
        sec2.append(p_tag(
            f"公表値が高い機種ほど、口コミの段差評価も高い傾向があります。公表20mmの機種は平均{band_avg['20mm']:.1f}点、"
            f"40mm以上の機種は平均{band_avg['40mm以上']:.1f}点でした（全機種の平均は{avg_all:.1f}点）。"
        ))
    if low_spec_high or high_spec_low:
        parts = []
        for r in low_spec_high[:2]:
            parts.append(f"{plink(r)}は公表{climb_label(r)}ですが、口コミの段差評価は{r['feature']:.0f}点と高めです（口コミ{r['reviews']:,}件）。")
        for i, r in enumerate(high_spec_low[:2]):
            lead = ("反対に" if low_spec_high else "たとえば") if i == 0 else "同じように"
            parts.append(f"{lead}{plink(r)}は公表{climb_label(r)}でも、口コミでは{r['feature']:.0f}点にとどまっています（口コミ{r['reviews']:,}件）。")
        sec2.append(p_tag(
            "ただし例外もあります。" + "".join(parts)
            + "公表値は「条件がそろえば越えられる高さ」なので、段差の形や素材によって結果が変わります。**公表値と口コミの両方**を見て選ぶのがおすすめです。"
        ))
    # 3. 口コミで多い声
    sec3 = [p_tag(
        f"各機種の段差に関する口コミをまとめたコメントで、よく出てくる場所は{topics_txt}です。"
        "敷居やラグの端は越えられても、**家具の脚や台座に乗り上げて止まる**という声は評価の高い機種にも見られます。"
        "気になる場所がある場合は、ランキング表のコメントで同じ状況の声があるかを確かめてください。"
    )]
    # 4. 対策
    sec4 = [
        "<ul class=\"tips\">"
        + "".join(f"<li>{prose(t)}</li>" for t in [
            "**段差解消スロープを置く**：敷居や玄関マットの手前に置くと、越えられなかった段差を越えやすくなります。",
            "**アプリで進入禁止エリアを設定する**：家具の台座など、乗り上げて止まりやすい場所を掃除の範囲から外せます。",
            "**ラグの端を固定する**：めくれた端に乗り上げて止まるのを防げます。毛足の長いラグは避けるのも手です。",
            "**段差に強い機種を選ぶ**：段差が多い家では、このランキングの上位や、公表値が高い機種を候補にしましょう。",
        ])
        + "</ul>",
        f'<p class="mid-cta"><a class="btn-sub" href="#price-check">段差に強い上位機種の価格を見る ▼</a></p>',
    ]
    # FAQ
    faqs = [
        ("ロボット掃除機は何cmの段差まで越えられますか？",
         f"メーカー公表値では{common}がいちばん多く（公表している{len(known)}機種のうち{common_n}機種）、"
         f"40mm以上を公表している機種は{sum(1 for r in known if r['climb'] >= 40)}機種です。敷居やラグの高さを測り、それより余裕のある機種を選ぶと安心です。"),
        ("段差に強くて安い機種はありますか？",
         (f"口コミ{PICK_MIN_REVIEWS}件以上で5万円以下の機種では、{cheap_pick['name']}（{yen(cheap_pick['price'])}）の段差評価が{cheap_pick['feature']:.0f}点で最も高く、総合でも{cheap_pick['rank']}位です。"
          if cheap_pick else "5万円以下の機種は、ランキング表の価格帯フィルターで絞り込んで比べられます。")),
        ("公表されている段差の高さが大きければ安心ですか？",
         "公表値が高い機種ほど口コミの評価も高い傾向はありますが、例外もあります。公表値は条件がそろったときの値なので、口コミで同じような段差の声を確かめるのがおすすめです。"),
        ("段差に強いいちばんのおすすめはどれですか？",
         f"口コミの件数も考えると、{pick1['name']}（段差{pick1['feature']:.0f}点・口コミ{pick1['reviews']:,}件・公表{climb_label(pick1)}）がおすすめです。"),
    ]
    faq_html = "".join(
        f"<details><summary>{html.escape(q)}</summary><div class=\"faq-a\">{p_tag(a)}</div></details>" for q, a in faqs
    )
    data_note = [
        p_tag(
            "段差の点数は、ECサイトの口コミのうち段差の乗り越えに触れたものを分析して数値化した値です。"
            "順位は「段差点数×0.85＋口コミ信頼度×0.15」で決めています。"
            f"口コミが{LOW_REVIEW_THRESHOLD}件未満の機種は「参考値」と表示していますが、ランキングからは外していません。"
        ),
        p_tag(
            f"メーカー公表の段差は、各メーカーの公式サイト・取扱説明書・国内代理店の仕様表で確認した値です。公表値が見つからなかった{n - len(known)}機種は「公表なし」としています。"
        ),
    ]
    sections = [
        ("step-guide", "家の段差の目安と、必要な乗り越え性能", sec1),
        ("step-spec", "メーカー公表値と口コミ評価のちがい", sec2),
        ("step-voices", "口コミで多い段差の声", sec3),
        ("step-tips", "段差が苦手な家での対策", sec4),
    ]
    body = "".join(
        f'<section class="article-sec" id="{sid}"><h2>{html.escape(title)}</h2>{"".join(parts)}</section>'
        for sid, title, parts in sections if parts
    )
    body += f'<section class="article-sec faq" id="faq"><h2>よくある質問</h2>{faq_html}</section>'
    body += f'<section class="article-sec" id="data"><h2>データについて</h2>{"".join(data_note)}</section>'
    return f'<div class="article">{body}</div>', faqs


def faq_jsonld(faqs: list[tuple[str, str]]) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"\*\*|\[|\]\([^)]*\)", "", a)}}
            for q, a in faqs
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def build_top_cards(products: list[dict], score_col: str, extra: list[dict] | None = None) -> str:
    top = products[:10]
    for r in extra or []:
        if r not in top:
            top.append(r)
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
        <article class="aff-card{rank_cls}" id="price-{html.escape(p['id'])}" data-slug="{html.escape(p['id'])}">
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
            {ref_badge(p['reviews'])}
          </div>
          <a class="aff-card-detail" href="{url}" target="_blank" rel="noopener">詳細分析を見る →</a>
          <div class="aff-card-body">
            <span class="aff-card-status">価格読込中…</span>
          </div>
        </article>"""
        )
    return f"""
      <section class="top-cards" id="price-check" aria-label="上位10製品">
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
    picks_html = article_html = faq_ld = sticky_html = article_css = sticky_js = ""
    extra_cards: list[dict] = []
    if cfg.get("article") == "step":
        dims = load_dims()
        for r in products:
            d = dims.get(r["id"]) or {}
            r["climb"] = d.get("climbHeightMm")
            r["climb2"] = bool(d.get("climbTwoStep"))
        picks = step_picks(products)
        extra_cards = [r for _, r in picks]
        picks_html = build_step_picks(products)
        article_html, faqs = build_step_article(products)
        faq_ld = f'\n  <script type="application/ld+json">\n{faq_jsonld(faqs)}\n  </script>'
        if picks:
            lead = picks[0][1]
            sticky_html = (
                f'\n  <div class="sticky-cta" id="sticky-cta" hidden>'
                f'<a href="#price-{html.escape(lead["id"])}">{html.escape(lead["name"])}の価格を見る</a>'
                f'<a class="sticky-sub" href="#price-check">上位の価格一覧</a></div>'
            )
            sticky_js = f"<script>{STICKY_JS}</script>"
        article_css = ARTICLE_CSS
    method_html = f"""
      <section class="method">
        <h2>このランキングの見方</h2>
        <p>{format_prose(cfg["method_body"])}</p>
        <p class="method-sub">
          ランキングの式：<code>{html.escape(cfg["formula_label"])} × 0.85 ＋ 口コミ信頼度 × 0.15</code>
        </p>
      </section>
"""
    # 記事付きのページは結論を最初に置き、見方は表のあとへ回す
    method_top, method_after = ("", method_html) if picks_html else (method_html, "")
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
  <meta property="og:image" content="https://nattoku-labo.com/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://nattoku-labo.com/og-default.png">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <link rel="stylesheet" href="/products/css/prose.css?v={PROSE_V}">
  <style>{CSS}{article_css}</style>
  <script type="application/ld+json">
{build_item_list_json(products, cfg)}
  </script>{faq_ld}
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
      <h1>{heading_lines(cfg["h1"])}</h1>
      <p class="lede">{clause_lines(cfg["lede"])}</p>
    </div>
  </header>
{build_feature_tabs(slug)}

  <main>
    <div class="wrap">
{method_top}{picks_html}
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

      <section class="table-wrap" id="ranking">
        <div class="table-head">
          <h2>全機種ランキング</h2>
          <span>{html.escape(cfg["table_note"])}</span>
        </div>
        <div class="rank-nav" role="group" aria-label="ランキング表のスクロール">
          <button type="button" class="rank-nav-btn" data-dir="-1" aria-label="表を上へ">▲</button>
          <div class="rank-nav-meta">
            <div class="rank-nav-pos">先頭5製品を表示</div>
            <div class="rank-nav-track" aria-hidden="true"><div class="rank-nav-thumb"></div></div>
            <div class="rank-nav-hint">表の中を上下に動かすと続きの順位が出ます。ページ全体は表の外をスクロールしてください</div>
          </div>
          <button type="button" class="rank-nav-btn" data-dir="1" aria-label="表を下へ">▼</button>
        </div>
        <div class="scroll-stage" id="rank-scroll-stage">
        <div class="scroll" tabindex="0" aria-label="全機種ランキング表">
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
        </div>
        <p class="empty-msg" id="empty-msg">この価格帯に該当する製品はありません。</p>
      </section>
{method_after}{article_html}
{build_top_cards(products, cfg["score_col"], extra_cards)}

      <div class="notes">
        <section>
          <h2>注意事項</h2>
          <ul>
            <li>点数はECサイトの口コミを横断分析した値です。実機テストの計測値ではありません。</li>
            <li>価格はメーカー公式ストアの販売価格（調査時点）です。購入前に各販売ページでご確認ください。</li>
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
  </footer>{sticky_html}
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
  <script>{JS}</script>
  <script src="/products/js/official-perks.js?v={PERKS_V}"></script>
  <script>{AFFILIATE_JS}</script>{sticky_js}
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
  <meta property="og:image" content="https://nattoku-labo.com/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://nattoku-labo.com/og-default.png">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <link rel="stylesheet" href="/products/css/prose.css?v={PROSE_V}">
  <style>
    :root {{ --primary:#1e40af; --secondary:#0f172a; --bg:#f8fafc; --text:#1e293b; --muted:#0f172a; --line:#e2e8f0; }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    body {{ font-family:"Noto Sans JP",sans-serif; background:var(--bg); color:var(--text); line-height:1.75; }}
    header.hero {{ background:linear-gradient(135deg,var(--primary),var(--secondary)); color:#fff; padding:1.75rem 1rem 2rem; }}
    .wrap {{ max-width:920px; margin:0 auto; padding:0 1rem; }}
    .crumb {{ font-size:0.78rem; opacity:0.85; margin-bottom:0.75rem; }}
    .crumb a {{ color:#bfdbfe; text-decoration:none; }}
    h1 {{ font-size:clamp(1.25rem,4.6vw,1.9rem); font-weight:900; line-height:1.35; margin-bottom:0.65rem; }}
    .lede {{ font-size:0.95rem; opacity:0.95; max-width:40rem; }}
    h1 .clause, .lede .clause {{ display:inline-block; word-break:auto-phrase; text-wrap:pretty; }}
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
      <p class="lede">{clause_lines("口コミ分析の点数をもとに、気になる機能からおすすめ機種を探せます。")}</p>
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
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
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

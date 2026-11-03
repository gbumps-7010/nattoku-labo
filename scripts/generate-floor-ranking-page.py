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
        "tab_label": "水拭き・床",
        "perf_keys": ("floorCleaning", "floor", "hardwood", "hardFloor"),
        "crumb": "水拭き・フローリング",
        "h1": "水拭きロボット掃除機ランキング｜フローリングの仕上がりを口コミで比較",
        "meta_description": "口コミの「水拭きで床がサラサラ」「ベタつきが取れる」といった声を数値化して、{count}機種を水拭き・フローリング掃除の評価順に比較。ローラー・回転などモップの方式や、モップ自動洗浄の有無もまとめました。",
        "og_description": "口コミの水拭き・フローリング掃除の評価を数値化したランキング。モップの方式やモップ自動洗浄の有無もまとめました。",
        "lede": "口コミに書かれた水拭きの仕上がりや、フローリングのゴミの取れ具合を数値化して比べたランキングです。モップの方式やステーションの機能、口コミで多い声もまとめています。",
        "method_body": (
            "「水拭きで床がサラサラになる」「髪の毛やホコリがしっかり取れる」といった口コミを点数化し、フローリング掃除（水拭き・吸引）の評価で並べています。"
            "点数は水拭きだけでなく、フローリングのゴミの吸い取りも含めた評価です。"
            "口コミの信頼度も加味するので、実体験に近いおすすめ順になっています。"
            "表の各製品には、水拭きや床の仕上がりに関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "水拭き・フローリング点数",
        "score_col": "水拭き・床",
        "comment_label": "水拭き・フローリングの口コミ傾向",
        "table_note": "各製品に水拭き・フローリングの口コミコメント付き",
        "hub_title": "水拭きロボット掃除機ランキング｜フローリングの仕上がりを口コミで比較",
        "hub_cta": "水拭き・フローリングランキングを見る →",
        "hub_meta": "水拭き・吸引の口コミを数値化",
        "schema_description": "口コミの水拭き・フローリング掃除の評価を数値化したランキング",
        "related_note": "カーペット掃除・静音性・段差の乗り越えは別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/carpet-cleaning", "カーペット・ラグランキング"),
            ("/rankings/quietness", "静音性ランキング"),
            ("/rankings/step-climbing", "段差ランキング"),
        ],
        "article": "mop",
    },
    {
        "slug": "carpet-cleaning",
        "tab_label": "カーペット・ラグ",
        "perf_keys": ("carpetCleaning", "carpet"),
        "crumb": "カーペット・ラグ",
        "h1": "カーペット・ラグに強いロボット掃除機おすすめランキング｜口コミで比較",
        "meta_description": "口コミの「カーペットのゴミが取れる」「ラグを巻き込まない」といった声を数値化して、{count}機種をカーペット・ラグ掃除の評価順に比較。口コミ信頼度も加味したおすすめ順です。",
        "og_description": "口コミのカーペット・ラグ掃除の評価を数値化したランキング。口コミ信頼度も加味したおすすめ順で比較できます。",
        "lede": "口コミに書かれたカーペット・ラグ掃除の評価を数値化し、ラグや絨毯の掃除の得意さを比較したランキングです。各製品には、実際の口コミからまとめたカーペット清掃の傾向コメントも掲載しています。",
        "method_body": (
            "「カーペットのゴミが取れる」「ラグを巻き込まない」といった口コミを点数化し、カーペット掃除の得意さで並べています。"
            "口コミの信頼度を適切に加味するので、実体験に近いおすすめ順になっています。"
            "表の各製品には、カーペット検知や吸引力に関する口コミ傾向も記載しているので、点数だけでなく具体的な声も比較できます。"
        ),
        "formula_label": "カーペット点数",
        "score_col": "カーペット",
        "comment_label": "カーペット・ラグ清掃の口コミ傾向",
        "table_note": "各製品にカーペット・ラグ清掃の口コミコメント付き",
        "hub_title": "カーペット・ラグに強いロボット掃除機おすすめランキング｜口コミで比較",
        "hub_cta": "カーペット・ラグランキングを見る →",
        "hub_meta": "カーペット・ラグ清掃の口コミを数値化",
        "schema_description": "口コミのカーペット・ラグ掃除の評価を数値化したランキング",
        "related_note": "水拭き・フローリング掃除・静音性・段差の乗り越えは別のランキングでも比較できます。",
        "related_rankings": [
            ("/rankings/floor-cleaning", "水拭き・フローリングランキング"),
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
        "meta_description": "口コミの「静か」「うるさい」の声を数値化して、{count}機種を静音性の高い順に比較。メーカー公表の運転音（dB）やステーションのゴミ収集音、夜や集合住宅で使うときのコツもまとめました。",
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
            ("/rankings/floor-cleaning", "水拭き・フローリングランキング"),
            ("/rankings/carpet-cleaning", "カーペット・ラグランキング"),
            ("/rankings/step-climbing", "段差ランキング"),
        ],
        "article": "quiet",
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
            ("/rankings/floor-cleaning", "水拭き・フローリングランキング"),
            ("/rankings/carpet-cleaning", "カーペット・ラグランキング"),
            ("/rankings/quietness", "静音性ランキング"),
        ],
        "article": "step",
    },
]

DIMS_DIR = ROOT / "scripts" / "data" / "dims"
PICK_MIN_REVIEWS = 50
CHEAP_MAX = 50000


# 口コミがこれ未満の機種は点数が安定しないためランキングに載せない（2026-11-03 決定）。
# 点数・順位の式は変えず、載せる機種を絞るだけ。除外した機種名は EXCLUDED に残す。
MIN_RANK_REVIEWS = 10
EXCLUDED: dict[tuple[str, ...], list[str]] = {}


def load_products(perf_keys: tuple[str, ...]) -> list[dict]:
    rows = []
    excluded: list[str] = []
    for path in sorted(DATA_DIR.glob("*.json")):
        raw = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            continue
        # 管理表で HP掲載 を外した製品（hpPublish: false）は載せない
        if (raw.get("affiliate") or {}).get("hpPublish") is False:
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
        if int(raw.get("totalReviews") or 0) < MIN_RANK_REVIEWS:
            excluded.append(raw.get("productName") or path.stem)
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
    EXCLUDED[perf_keys] = excluded
    return rows


def low_sample_note(cfg: dict) -> str:
    """見方ボックスの一文：載せていない機種の数と、参考値の基準。"""
    n = len(EXCLUDED.get(tuple(cfg["perf_keys"]), []))
    head = f"口コミが{MIN_RANK_REVIEWS}件未満の{n}機種は、点数が安定しないためこのランキングに載せていません。" if n else ""
    return head + f"{LOW_REVIEW_THRESHOLD}件未満の機種は「参考値」と表示しています。"


def heading_lines(text: str) -> str:
    """見出しを「｜」の位置で改行できるよう、区切りごとに span.clause で包む。"""
    # 「｜」は別の span にして、スマホ幅では隠して改行だけにする（「｜」だけが1行になるのを防ぐ）
    return '<span class="h-sep">｜</span>'.join(
        f'<span class="clause">{html.escape(p)}</span>' for p in text.split("｜")
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
    """Mark low-sample scores as 参考値 (10–19件 stay in the ranking; under 10 are excluded upstream)."""
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
        # 静音ランキングでは、自動ゴミ収集の有無を製品名の下に出して絞り込みにも使う
        auto_attr = auto_tag = ""
        if "auto_empty" in p:
            ae = p["auto_empty"]
            auto_attr = f' data-auto="{"yes" if ae is True else "no" if ae is False else "unknown"}"'
            if ae is True:
                auto_tag = '<span class="auto-tag yes">自動ゴミ収集あり</span>'
            elif ae is False:
                auto_tag = '<span class="auto-tag no">自動ゴミ収集なし</span>'
        # 水拭きランキングでは、モップの方式と自動洗浄の有無を出し、自動洗浄で絞り込めるようにする
        elif "mop_wash" in p:
            mw = p["mop_wash"]
            auto_attr = f' data-auto="{"yes" if mw is True else "no" if mw is False else "unknown"}"'
            if p.get("mop_style"):
                auto_tag = f'<span class="auto-tag no">{html.escape(p["mop_style"])}</span>'
            if mw is True:
                auto_tag += '<span class="auto-tag yes">モップ自動洗浄</span>'

        img = (
            f'<img src="{html.escape(p["imageUrl"])}" alt="{name}の製品画像" loading="lazy" width="56" height="56">'
            if p.get("imageUrl")
            else '<div class="img-ph" aria-hidden="true"></div>'
        )
        comment_row = f"""
      <tr class="comment-row{tc}" data-price="{p['price']}" data-rank="{p['rank']}"{auto_attr}>
        <td class="comment-spacer" aria-hidden="true"></td>
        <td class="comment-cell" colspan="5">
          <p class="floor-comment"><span class="floor-comment-label">{html.escape(comment_label)}</span>{comment}</p>
        </td>
      </tr>"""
        chunks.append(
            f"""
      <tr class="rank-row{tc}" data-price="{p['price']}" data-rank="{p['rank']}"{auto_attr}>
        <td class="rank"><span class="rank-num">{p['rank']}</span>{badge}</td>
        <td class="product">
          <a class="product-link" href="{url}" target="_blank" rel="noopener">
            <span class="thumb">{img}</span>
            <span class="pinfo">
              <span class="pname">{name}</span>
              <span class="pmeta">{mfr}</span>{auto_tag}
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
@media (max-width: 768px) {
  h1 .h-sep { display: none; }
  h1 .clause { display: block; }
}
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
.auto-tag { display: inline-block; margin-top: 0.2rem; font-size: 0.68rem; font-weight: 800; border-radius: 999px; padding: 0.05rem 0.5rem; }
.auto-tag.yes { background: #dcfce7; color: #166534; }
.auto-tag.no { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.auto-tag + .auto-tag { margin-left: 0.25rem; }
.filters-label-2 { margin-top: 0.7rem; }
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
  const chips = document.querySelectorAll(".filter-chip:not(.auto-chip)");
  const autoChips = document.querySelectorAll(".auto-chip");
  let curMin = 0, curMax = Infinity, curAuto = "all";
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
    curMin = min; curMax = max;
    let shown = 0;
    rows.forEach(function (row) {
      const price = Number(row.getAttribute("data-price") || 0);
      const auto = row.getAttribute("data-auto");
      const ok = price >= min && price < max && (curAuto === "all" || auto === curAuto);
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

  autoChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      autoChips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      curAuto = chip.getAttribute("data-auto") || "all";
      applyFilter(curMin, curMax);
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
.tradeoff-box, .caution-box { border-radius: 12px; padding: 0.85rem 1rem; margin-top: 0.85rem; }
.tradeoff-box { background: #eff6ff; border: 1px solid #bfdbfe; }
.caution-box { background: #fff7ed; border: 2px solid #f59e0b; margin: 0 0 0.9rem; }
.tradeoff-title, .caution-title { font-weight: 900; font-size: 0.95rem; margin-bottom: 0.4rem; }
.tradeoff-title { color: #1e3a8a; }
.caution-title { color: #9a3412; }
.caution-title::before { content: "⚠ "; }
.caution-key { background: #fef2f2; border: 2px solid #dc2626; border-radius: 10px; padding: 0.75rem 0.9rem; margin: 0.5rem 0 0.7rem; font-size: 1rem !important; line-height: 1.75 !important; color: #7f1d1d !important; }
.caution-key strong { color: #b91c1c; font-size: 1.05rem; }
.caution-key-label { display: inline-block; background: #dc2626; color: #fff; font-size: 0.75rem; font-weight: 900; border-radius: 6px; padding: 0.1rem 0.5rem; margin-right: 0.5rem; vertical-align: 0.1em; }
.article-sec > .caution-key { margin-top: 1rem; }
.tradeoff-box ul, .caution-box ul { list-style: disc; padding-left: 1.2rem; display: grid; gap: 0.3rem; }
.tradeoff-box li, .caution-box li { font-size: 0.88rem; line-height: 1.75; color: #1e293b; }
table.mini.ref { min-width: 0; }
.src-note { font-size: 0.78rem !important; color: #475569 !important; margin-top: 0.4rem; }
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


def build_pick_section(
    products: list[dict],
    picks: list[tuple[str, dict]],
    theme: str,
    score_name: str,
    spec_item,
    sub: str | None = None,
    after_grid: str = "",
) -> str:
    """結論ボックス（カード）。theme は見出しの言葉（「段差」「静かさ」）、score_name は点数の項目名。
    spec_item(label, r) はカードの3行目（メーカー公表値など）を (見出し, 値) で返す。"""
    cards = []
    top = products[0] if products else None
    note = ""
    # 1位の機種を口コミ件数の少なさで先頭から外したときだけ、その理由を書く
    if top and picks and picks[0][1]["id"] != top["id"] and top["reviews"] < PICK_MIN_REVIEWS:
        note = (
            f"ランキング表の1位は{top['name']}（{score_name}{top['feature']:.0f}点）ですが、口コミが{top['reviews']:,}件と少ないため、"
            f"ここでは口コミ{PICK_MIN_REVIEWS}件以上の機種を先に挙げています。"
        )
    for label, r in picks:
        spec_label, spec_value = spec_item(label, r)
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
              <li>{html.escape(score_name)} <strong>{r['feature']:.0f}点</strong>（{r['rank']}位）</li>
              <li>口コミ <strong>{r['reviews']:,}件</strong>{ref_badge(r['reviews'])}</li>
              <li>{html.escape(spec_label)} <strong>{html.escape(spec_value)}</strong></li>
            </ul>
            {p_tag("口コミでは" + (quote if quote.startswith("「") else "「" + quote + "」")) if quote else ""}
            <div class="pick-actions">
              <a class="btn-primary" href="{url}">口コミ分析を見る</a>
              <a class="btn-sub" href="#price-{html.escape(r['id'])}">最新価格を見る ▼</a>
            </div>
          </article>""")
    return f"""
      <section class="picks" id="picks" aria-label="{html.escape(theme)}で選ぶならこの{len(picks)}台">
        <h2>結論：{html.escape(theme)}で選ぶならこの{len(picks)}台</h2>
        {p_tag(sub or f"ランキングの順位に加えて、口コミの件数と予算も考えて選んだ{len(picks)}台です。点数はランキング表と同じ値です。", "section-sub")}
        <div class="picks-grid">{"".join(cards)}</div>{after_grid}
        {p_tag(note, "picks-note") if note else ""}
        <p class="picks-jump"><a class="btn-sub" href="#ranking">全機種ランキングを見る ▼</a></p>
      </section>"""


def build_step_picks(products: list[dict]) -> str:
    return build_pick_section(
        products, step_picks(products), "段差", "段差", lambda label, r: ("メーカー公表", climb_label(r))
    )


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
            f"口コミが{MIN_RANK_REVIEWS}件未満の機種は点数が安定しないため載せておらず、{LOW_REVIEW_THRESHOLD}件未満の機種は「参考値」と表示しています。"
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


def noise_label(r: dict) -> str:
    return f"{r['db']:g}dB" if r.get("db") else "公表なし"


def quiet_cheap_top(products: list[dict]) -> dict | None:
    cheap = [r for r in products if r["reviews"] >= PICK_MIN_REVIEWS and r["price"] and r["price"] <= CHEAP_MAX]
    return cheap[0] if cheap else None


def quiet_picks(products: list[dict]) -> list[tuple[str, dict]]:
    """結論ボックスの3台（すべて口コミ50件以上）。自動ゴミ収集の有無で使い勝手が大きく変わるので分けて選ぶ：
    自動ゴミ収集ありで最も静か → 自動ゴミ収集なしで最も静か → 5万円以下・自動ゴミ収集ありで最も静か。
    重なったら 5万円以下で最も静か → 集合住宅との相性が最も高い で埋める。順位・点数はランキング表のまま。"""
    picks: list[tuple[str, dict]] = []
    seen: set[str] = set()

    def add(label: str, r: dict | None) -> None:
        if r and r["id"] not in seen and len(picks) < 3:
            picks.append((label, r))
            seen.add(r["id"])

    def first(rs: list[dict]) -> dict | None:
        # その条件での1位がすでに別の観点で選ばれていたら、2位を「最も〜」とは書かずに次の観点へ進む
        return rs[0] if rs and rs[0]["id"] not in seen else None

    reliable = [r for r in products if r["reviews"] >= PICK_MIN_REVIEWS]
    auto = [r for r in reliable if r.get("auto_empty") is True]
    manual = [r for r in reliable if r.get("auto_empty") is False]
    add("自動ゴミ収集ありで最も静か", first(auto))
    add("自動ゴミ収集なしで最も静か", first(manual))
    add("5万円以下・自動ゴミ収集ありで最も静か", first([r for r in auto if r["price"] and r["price"] <= CHEAP_MAX]))
    add("5万円以下で最も静か", first([r for r in reliable if r["price"] and r["price"] <= CHEAP_MAX]))
    apt = sorted(
        [r for r in reliable if r.get("apartment") is not None and r["id"] not in seen],
        key=lambda r: (-r["apartment"], -r["feature"]),
    )
    add("マンション・集合住宅との相性が最も高い", apt[0] if apt else None)
    return picks


def build_quiet_picks(products: list[dict]) -> str:
    def spec(label: str, r: dict) -> tuple[str, str]:
        if "集合住宅" in label:
            return ("集合住宅との相性", f"{r['apartment']:.0f}点")
        return ("メーカー公表の運転音", noise_label(r))

    picks = quiet_picks(products)
    sub = (
        f"口コミ{PICK_MIN_REVIEWS}件以上の機種から、**自動ゴミ収集の「あり」「なし」を分けて**選んだ{len(picks)}台です。"
        "点数と順位はランキング表と同じ値です。"
    )
    tradeoff = """
        <div class="tradeoff-box" role="note">
          <p class="tradeoff-title">自動ゴミ収集の「あり」「なし」で選び方が変わります</p>
          <ul>
            <li><strong>ありの機種</strong>：ゴミ捨ては数週間に1回で済みます。その代わり、掃除のあとにステーションがゴミを吸い上げる<strong>大きめの音（数秒〜十数秒）</strong>が出ます。</li>
            <li><strong>なしの機種</strong>：ゴミを吸い上げる音がないぶん静かですが、<strong>ダストボックスのゴミを毎回手で捨てる</strong>必要があります。</li>
          </ul>
        </div>"""
    return build_pick_section(products, picks, "静かさ", "静音性", spec, sub=sub, after_grid=tradeoff)


# 全国環境研協議会 騒音小委員会「騒音の目安（都心・近郊用）」（環境省「騒音の目安について」に掲載）の図から読んだおおよその値
NOISE_REFS = [
    (40, "図書館の館内・戸建住宅地（昼間）"),
    (50, "書店の店内・高層住宅地域（昼間）"),
    (55, "役所の窓口周辺"),
    (60, "銀行の窓口周辺・博物館の館内"),
    (65, "ファミリーレストランの店内"),
    (70, "コーヒーショップの店内・バスの車内"),
]
NOISE_REF_URL = "https://www.env.go.jp/air/ippan/index.html"


def noise_like(db: float) -> str:
    """公表の運転音に近い生活音（目安）。"""
    if db <= 47:
        return "美術館・図書館の館内くらい"
    if db <= 52:
        return "書店の店内くらい"
    if db <= 57:
        return "役所の窓口周辺くらい"
    if db <= 61:
        return "銀行の窓口周辺くらい"
    if db <= 65:
        return "ファミリーレストランの店内くらい"
    return "コーヒーショップの店内くらい"


QUIET_TOPICS = [
    ("ステーションのゴミ収集の音", r"収集|ゴミ捨て|ステーション"),
    ("夜・寝ている間", r"夜|寝"),
    ("在宅ワーク・家にいる時間", r"在宅|テレワーク|仕事|会議"),
    ("吸引の強さ・モードで音が変わる", r"モード|吸引力"),
    ("テレビや会話のじゃま", r"テレビ|会話"),
]


def _corr(xs: list[float], ys: list[float]) -> float | None:
    n = len(xs)
    if n < 3:
        return None
    mx, my = sum(xs) / n, sum(ys) / n
    sx = sum((x - mx) ** 2 for x in xs) ** 0.5
    sy = sum((y - my) ** 2 for y in ys) ** 0.5
    if not sx or not sy:
        return None
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy)


def build_quiet_article(products: list[dict]) -> tuple[str, list[tuple[str, str]]]:
    n = len(products)
    avg_all = sum(r["feature"] for r in products) / n
    picks = quiet_picks(products)
    pick1 = picks[0][1] if picks else products[0]
    cheap_pick = quiet_cheap_top(products)
    apt_pick = max(
        (r for r in products if r["reviews"] >= PICK_MIN_REVIEWS and r.get("apartment") is not None),
        key=lambda r: (r["apartment"], r["feature"]),
        default=None,
    )

    # メーカー公表の運転音
    known = sorted([r for r in products if r.get("db")], key=lambda r: (r["db"], -r["feature"]))
    db_rows = "".join(
        f'<tr><td><a href="/products/{r["id"]}">{html.escape(r["name"])}</a></td><td class="num">{r["db"]:g}dB</td>'
        f'<td>{html.escape(noise_like(r["db"]))}</td>'
        f'<td class="num">{r["feature"]:.0f}点</td><td class="num">{r["rank"]}位</td>'
        f'<td>{"あり" if r.get("auto_empty") is True else "なし" if r.get("auto_empty") is False else "—"}</td></tr>'
        for r in known
    )
    ref_rows = "".join(f'<tr><td class="num">{db}dB前後</td><td>{html.escape(label)}</td></tr>' for db, label in NOISE_REFS)
    corr = _corr([r["db"] for r in known], [r["feature"] for r in known])
    makers = sorted({r["manufacturer"] for r in known})
    quietest = known[0] if known else None
    loud = [r for r in products if re.search(r"うるさ|大き", r.get("comment") or "")]

    # ステーションのゴミ収集
    auto = [r for r in products if r.get("auto_empty") is True]
    auto_loud = [r for r in auto if re.search(r"収集|ゴミ捨て|ステーション", r.get("comment") or "")]
    no_auto = [r for r in products if r.get("auto_empty") is False]
    rel_auto = [r for r in auto if r["reviews"] >= PICK_MIN_REVIEWS]
    rel_manual = [r for r in no_auto if r["reviews"] >= PICK_MIN_REVIEWS]

    topic_counts = [(label, sum(1 for r in products if re.search(pat, r.get("comment") or ""))) for label, pat in QUIET_TOPICS]
    topic_counts.sort(key=lambda x: -x[1])
    topics_txt = "、".join(f"「{label}」（{cnt}機種）" for label, cnt in topic_counts if cnt)

    # 1. 音の種類
    sec1 = [
        p_tag(
            "ロボット掃除機の音は、おもに**本体の吸引音**、**ブラシやタイヤの走行音**、そして**ステーションがゴミを吸い上げる音**の3つです。"
            "掃除中は静かでも、掃除のあとにステーションが短いあいだ大きな音を出す機種が多いので、どの音が気になるかで選び方が変わります。"
        ),
        p_tag(
            f"掲載{n}機種の口コミの静音性の平均は{avg_all:.1f}点です。"
            f"静音性の口コミで「うるさい」「音が大きい」といった声が出ている機種は{len(loud)}機種あり、"
            "上位の機種でも**吸引を強くしたときや、ゴミ収集のときの音**を指摘する声があります。"
        ),
    ]
    # 2. 公表値と口コミ
    sec2 = []
    if known:
        sec2.append(
            f"""<div class="caution-box" role="note">
          <p class="caution-title">dBの数字を見るときの注意</p>
          <p class="caution-key" role="alert"><span class="caution-key-label">必ずお読みください</span><strong>測り方（距離・運転モード・床の材質）はメーカーごとに違います。</strong><br>別のメーカーどうしで、dBの数字をそのまま比べることはできません。</p>
          <ul>
            <li><strong>運転音（dB）を公表しているのは、掲載{n}機種のうち{len(known)}機種だけ</strong>です。残りの{n - len(known)}機種は公表値がないため、口コミの静音性の点数で比べてください。</li>
            <li>dBは<strong>10dB上がると、耳にはおよそ2倍うるさく</strong>聞こえます。数dBの差でも感じ方は変わります。</li>
          </ul>
        </div>"""
        )
        sec2.append(p_tag(
            "dBの数字だけではどれくらいの音か想像しにくいので、身近な場所の音の大きさを目安として並べました。"
            "ロボット掃除機の値はメーカーが本体の近くで測った値で、下の場所の値とは測り方が違うため、**おおよそのイメージ**としてご覧ください。"
        ))
        sec2.append(
            f"""<div class="table-scroll"><table class="mini ref">
          <thead><tr><th>音の大きさ</th><th>身近な場所の例</th></tr></thead>
          <tbody>{ref_rows}</tbody></table></div>
          <p class="src-note">出典：全国環境研協議会 騒音小委員会「騒音の目安（都心・近郊用）」（<a href="{NOISE_REF_URL}" target="_blank" rel="noopener">環境省「騒音の目安について」</a>）の図から、おおよその値を読み取りました。</p>"""
        )
        sec2.append(p_tag(
            f"運転音（dB）を公表しているのは掲載{n}機種のうち{len(known)}機種（{'・'.join(makers)}）で、"
            f"もっとも小さいのは{plink(quietest)}の**{quietest['db']:g}dB**（{noise_like(quietest['db'])}）です。"
        ))
        if corr is not None:
            if corr <= -0.5:
                trend = "公表値が小さい機種ほど口コミの静音性も高い傾向がはっきり見られます"
            elif corr <= -0.2:
                trend = "公表値が小さい機種ほど口コミの静音性も高い傾向はありますが、例外も多くあります"
            else:
                trend = "公表値と口コミの静音性には、はっきりした関係は見られません"
            sec2.append(p_tag(f"公表値と口コミの静音性を比べると、{trend}。数字だけでなく、**実際に使った人の声**もあわせて確かめるのがおすすめです。"))
        sec2.append('<p class="caution-key"><span class="caution-key-label">必ずお読みください</span><strong>測り方（距離・運転モード・床の材質）はメーカーごとに違います。</strong><br>別のメーカーどうしで、dBの数字をそのまま比べることはできません。</p>')
        sec2.append(
            f"""<div class="table-scroll"><table class="mini">
          <thead><tr><th>機種</th><th>メーカー公表の運転音</th><th>生活音でいうと（目安）</th><th>口コミの静音性</th><th>ランキング</th><th>自動ゴミ収集</th></tr></thead>
          <tbody>{db_rows}</tbody></table></div>"""
        )
    # 3. ゴミ収集の音
    sec3 = [p_tag(
        f"掲載{n}機種のうち{len(auto)}機種は、ゴミを自動で吸い上げるステーションが付いています。"
        f"そのうち{len(auto_loud)}機種では、静音性の口コミで**ステーションの音**に触れています。"
        "集合住宅や、家族が寝ている時間に使う場合は、ゴミ収集の音も確かめておくと安心です。"
        + (f"自動ゴミ収集のない機種（{'・'.join(r['name'] for r in no_auto[:4])}{'など' if len(no_auto) > 4 else ''}）には、この音がありません。" if no_auto else "")
    )]
    if rel_auto and rel_manual:
        sec3.append(p_tag(
            "ただし、自動ゴミ収集がないと**ダストボックスのゴミを毎回手で捨てる**ことになります。"
            f"口コミ{PICK_MIN_REVIEWS}件以上で最も静かなのは、自動ゴミ収集ありでは{plink(rel_auto[0])}（静音性{rel_auto[0]['feature']:.0f}点・{rel_auto[0]['rank']}位）、"
            f"なしでは{plink(rel_manual[0])}（静音性{rel_manual[0]['feature']:.0f}点・{rel_manual[0]['rank']}位）です。"
            "ランキング表の上にある「自動ゴミ収集で絞り込み」で、どちらか一方だけを表示することもできます。"
        ))
    # 4. 口コミで多い声
    sec4 = [p_tag(
        f"各機種の静音性の口コミをまとめたコメントで、よく出てくる場面は{topics_txt}です。"
        "とくに**夜や在宅中に使えるか**を気にする声が多く、「寝ている間でも気にならない」という評価がある一方で、"
        "「夜は使いにくい」という声もあります。気になる場面がある場合は、ランキング表のコメントで同じ状況の声を探してください。"
    )]
    # 5. 使い方のコツ
    sec5 = [
        '<ul class="tips">'
        + "".join(f"<li>{prose(t)}</li>" for t in [
            "**外出中にスケジュールで動かす**：アプリで時間を決めておけば、音を気にせず毎日掃除できます。",
            "**静音（エコ）モードを使う**：吸引を弱めると音は小さくなります。そのぶんカーペットのゴミは取りにくくなるので、部屋ごとに使い分けるのがおすすめです。",
            "**ゴミ収集のタイミングを確かめる**：機種によっては、アプリでゴミ収集の時間帯や回数を変えられます。夜に掃除するなら、収集を朝に回せるかを確かめておきましょう。",
            "**集合住宅では夜遅い時間を避ける**：走行音やぶつかる音が床に響くことがあります。ラグを敷くと響きにくくなります。",
        ])
        + "</ul>",
        '<p class="mid-cta"><a class="btn-sub" href="#price-check">静かな上位機種の価格を見る ▼</a></p>',
    ]
    faqs = [
        ("いちばん静かなロボット掃除機はどれですか？",
         (
             f"口コミ{PICK_MIN_REVIEWS}件以上では、自動ゴミ収集ありなら{rel_auto[0]['name']}（静音性{rel_auto[0]['feature']:.0f}点）、"
             f"なしなら{rel_manual[0]['name']}（静音性{rel_manual[0]['feature']:.0f}点）です。"
             "自動ゴミ収集がない機種はゴミを吸い上げる音がないぶん静かですが、ゴミ捨ては手作業になります。"
             if rel_auto and rel_manual
             else f"口コミの件数も考えると、{pick1['name']}（静音性{pick1['feature']:.0f}点・口コミ{pick1['reviews']:,}件）がおすすめです。"
         )
         + (f"メーカー公表の運転音では、{quietest['name']}の{quietest['db']:g}dBがもっとも小さい値です（運転音を公表している{len(known)}機種のなか）。" if quietest else "")),
        ("夜に使っても大丈夫ですか？",
         "静かな機種なら「寝ている間でも気にならない」という口コミもありますが、ステーションのゴミ収集の音は大きめです。"
         "夜に使うなら、静音モードにして、ゴミ収集を朝に回せるかを確かめておくと安心です。"),
        ("静かで安いロボット掃除機はありますか？",
         (f"口コミ{PICK_MIN_REVIEWS}件以上で5万円以下の機種では、{cheap_pick['name']}（{yen(cheap_pick['price'])}）の静音性が{cheap_pick['feature']:.0f}点で最も高く、総合でも{cheap_pick['rank']}位です。"
          if cheap_pick else "5万円以下の機種は、ランキング表の価格帯フィルターで絞り込んで比べられます。")),
        ("マンションや集合住宅に向いている機種は？",
         (f"口コミの分析で集合住宅との相性が最も高いのは{apt_pick['name']}（{apt_pick['apartment']:.0f}点・静音性{apt_pick['feature']:.0f}点）です。"
          if apt_pick else "")
         + "集合住宅では、運転音に加えて、走行やぶつかる音が床に響かないかも口コミで確かめるのがおすすめです。"),
        ("何dBなら静かといえますか？",
         (f"当サイトで運転音を公表している{len(known)}機種では、{known[0]['db']:g}dB〜{known[-1]['db']:g}dBでした。" if known else "")
         + "身近な音でいうと、40dB前後が図書館の館内、50dB前後が書店の店内、60dB前後が銀行の窓口周辺くらいです（全国環境研協議会「騒音の目安」より）。"
         + "ただし測り方がメーカーごとに違うので、同じメーカーの機種どうしで比べるときの目安にしてください。"),
    ]
    faq_html = "".join(
        f'<details><summary>{html.escape(q)}</summary><div class="faq-a">{p_tag(a)}</div></details>' for q, a in faqs
    )
    data_note = [
        p_tag(
            "静音性の点数は、ECサイトの口コミのうち運転音や静かさに触れたものを分析して数値化した値です。"
            "順位は「静音性点数×0.85＋口コミ信頼度×0.15」で決めています。"
            f"口コミが{MIN_RANK_REVIEWS}件未満の機種は点数が安定しないため載せておらず、{LOW_REVIEW_THRESHOLD}件未満の機種は「参考値」と表示しています。"
        ),
        p_tag(
            "メーカー公表の運転音は、各メーカーの公式サイト・取扱説明書で確認した値です。"
            f"公表値が見つからなかった{n - len(known)}機種は「公表なし」としています。"
            "集合住宅との相性は、口コミの内容から集合住宅での使いやすさを評価した点数です。"
        ),
    ]
    sections = [
        ("quiet-source", "ロボット掃除機の音は3種類", sec1),
        ("quiet-spec", "メーカー公表の運転音（dB）と口コミ評価", sec2),
        ("quiet-station", "見落としやすいステーションのゴミ収集音", sec3),
        ("quiet-voices", "口コミで多い音の声", sec4),
        ("quiet-tips", "音を気にせず使うコツ", sec5),
    ]
    body = "".join(
        f'<section class="article-sec" id="{sid}"><h2>{html.escape(title)}</h2>{"".join(parts)}</section>'
        for sid, title, parts in sections if parts
    )
    body += f'<section class="article-sec faq" id="faq"><h2>よくある質問</h2>{faq_html}</section>'
    body += f'<section class="article-sec" id="data"><h2>データについて</h2>{"".join(data_note)}</section>'
    return f'<div class="article">{body}</div>', faqs


def load_quiet_extras(products: list[dict]) -> None:
    """静音ランキング用に、公表の運転音・自動ゴミ収集の有無・集合住宅との相性を足す。"""
    for r in products:
        spec_path = DATA_DIR / "specs" / f"{r['id']}.json"
        spec = json.loads(spec_path.read_text(encoding="utf-8")) if spec_path.exists() else {}
        raw = json.loads((DATA_DIR / f"{r['id']}.json").read_text(encoding="utf-8"))
        r["db"] = (spec.get("cleaning") or {}).get("noiseDb")
        r["auto_empty"] = (spec.get("station") or {}).get("autoEmpty")
        apt = ((raw.get("attributeScores") or {}).get("apartment") or {}).get("overall")
        r["apartment"] = float(apt) if isinstance(apt, (int, float)) else None


MOP_STYLES = [
    ("ローラーモップ", "回転するローラーで床をこすりながら、ステーションや本体でローラーを洗い続ける方式です。ベタつきや乾いた汚れを取りやすく、上位機種に多い方式です。"),
    ("回転モップ", "円形のモップを2枚回転させて、床に押し付けながら拭く方式です。壁際や家具の脚まわりでモップを伸ばせる機種もあります。"),
    ("振動モップ", "板状のモップを細かく振動させて、床をこすって拭く方式です。"),
    ("パッド・シート", "固定のモップパッドや使い捨てシートで床を拭く方式です。安い機種に多く、毎日の軽い汚れ取り向きです。"),
]


def mop_style(text: str | None) -> str | None:
    """スペックのモップ表記を4つの方式に分ける（表記がなければ None、モップなしは「水拭きなし」）。"""
    if text is None:
        return None
    t = str(text).strip()
    if not t:
        return None
    if t == "なし":
        return "水拭きなし"
    if "ローラー" in t or "RevoRoll" in t or "Roll" in t:
        return "ローラーモップ"
    if "振動" in t or "VibraRise" in t:
        return "振動モップ"
    if "回転" in t or "DuoScrub" in t or "MopExtend" in t or "DualClean" in t:
        return "回転モップ"
    return "パッド・シート"


def load_mop_extras(products: list[dict]) -> None:
    """水拭きランキング用に、モップの方式・持ち上げ・ステーションの機能を足す（スペック未確認は None）。"""
    for r in products:
        spec_path = DATA_DIR / "specs" / f"{r['id']}.json"
        spec = json.loads(spec_path.read_text(encoding="utf-8")) if spec_path.exists() else {}
        mop = spec.get("mop") or {}
        st = spec.get("station") or {}
        r["mop_style"] = mop_style(mop.get("type")) if spec else None
        lift = mop.get("liftMm")
        r["mop_lift"] = lift if isinstance(lift, (int, float)) and lift > 0 else None
        r["mop_detach"] = mop.get("autoDetach") if spec else None
        r["mop_wash"] = st.get("mopWash") if spec else None
        r["hot_wash"] = st.get("hotWaterWash") if spec else None
        r["hot_dry"] = st.get("hotAirDry") if spec else None
        r["detergent"] = st.get("detergentDispenser") if spec else None
        r["mop_spec"] = bool(spec)


def mop_picks(products: list[dict]) -> list[tuple[str, dict]]:
    """結論ボックスの3台（すべて口コミ50件以上）：モップ自動洗浄ありで最も高い → 5万円以下で最も高い
    → ローラーモップで最も高い → 回転モップで最も高い。重なったら次の観点へ進み、最大3台。順位・点数はランキング表のまま。"""
    picks: list[tuple[str, dict]] = []
    seen: set[str] = set()

    def add(label: str, r: dict | None) -> None:
        if r and r["id"] not in seen and len(picks) < 3:
            picks.append((label, r))
            seen.add(r["id"])

    def first(rs: list[dict]) -> dict | None:
        # その条件での1位がすでに別の観点で選ばれていたら、2位を「最も〜」とは書かずに次の観点へ進む
        return rs[0] if rs and rs[0]["id"] not in seen else None

    reliable = [r for r in products if r["reviews"] >= PICK_MIN_REVIEWS and r.get("mop_style") not in (None, "水拭きなし")]
    add("モップ自動洗浄ありで最も高い", first([r for r in reliable if r.get("mop_wash") is True]))
    add("予算5万円以下で最も高い", first([r for r in reliable if r["price"] and r["price"] <= CHEAP_MAX]))
    add("ローラーモップで最も高い", first([r for r in reliable if r.get("mop_style") == "ローラーモップ"]))
    add("回転モップで最も高い", first([r for r in reliable if r.get("mop_style") == "回転モップ"]))
    return picks


def mop_label(r: dict) -> str:
    style = r.get("mop_style") or "確認中"
    if r.get("mop_wash") is True:
        return f"{style}・自動洗浄あり"
    if r.get("mop_wash") is False:
        return f"{style}・自動洗浄なし"
    return style


def build_mop_picks(products: list[dict]) -> str:
    picks = mop_picks(products)
    sub = (
        f"口コミ{PICK_MIN_REVIEWS}件以上の機種から、**モップ自動洗浄の有無と予算、モップの方式**で分けて選んだ{len(picks)}台です。"
        "点数と順位はランキング表と同じ値です。"
    )
    tradeoff = """
        <div class="tradeoff-box" role="note">
          <p class="tradeoff-title">モップ自動洗浄の「あり」「なし」で手間が変わります</p>
          <ul>
            <li><strong>ありの機種</strong>：掃除のあとにステーションがモップを洗い、機種によっては乾燥まで行います。そのぶん<strong>価格は高めで、ステーションも大きく</strong>なります。</li>
            <li><strong>なしの機種</strong>：本体は安く済みますが、<strong>掃除のたびにモップを外して手で洗う（またはシートを替える）</strong>必要があります。</li>
          </ul>
        </div>"""
    return build_pick_section(
        products, picks, "水拭き", "水拭き・床", lambda label, r: ("モップ", mop_label(r)), sub=sub, after_grid=tradeoff
    )


MOP_TOPICS = [
    ("床がサラサラ・ピカピカになる", r"サラサラ|ツルツル|ピカピカ|さっぱり|スッキリ"),
    ("ベタつき・皮脂汚れが取れる", r"ベタ|べた|皮脂|足跡"),
    ("拭きムラ・水跡が残る", r"ムラ|水跡|拭き跡|跡が|筋"),
    ("モップの臭い・手入れ", r"臭|ニオイ|におい|手入れ|乾燥"),
    ("髪の毛・ホコリの取れ具合", r"髪|ホコリ"),
]


def build_mop_article(products: list[dict]) -> tuple[str, list[tuple[str, str]]]:
    n = len(products)
    picks = mop_picks(products)
    pick1 = picks[0][1] if picks else products[0]
    with_mop = [r for r in products if r.get("mop_style") not in (None, "水拭きなし")]
    no_mop = [r for r in products if r.get("mop_style") == "水拭きなし"]
    reliable_mop = [r for r in with_mop if r["reviews"] >= PICK_MIN_REVIEWS]

    # 1. モップの方式
    style_rows = []
    style_stats: dict[str, tuple[int, float, int]] = {}
    for style, desc in MOP_STYLES:
        rs = [r for r in with_mop if r["mop_style"] == style]
        if not rs:
            continue
        prices = sorted(r["price"] for r in rs if r["price"])
        med = prices[len(prices) // 2] if prices else 0
        avg = sum(r["feature"] for r in rs) / len(rs)
        style_stats[style] = (len(rs), avg, med)
        style_rows.append(
            f'<tr><td><strong>{html.escape(style)}</strong><br><small>{html.escape(desc)}</small></td>'
            f'<td class="num">{len(rs)}機種</td><td class="num">{yen(med)}</td><td class="num">{avg:.1f}点</td></tr>'
        )
    ranked_styles = sorted(style_stats.items(), key=lambda kv: -kv[1][1])
    sec1 = [
        p_tag(
            "ロボット掃除機の水拭きは、モップの動かし方で大きく4つの方式に分かれます。"
            f"掲載{n}機種のうち、水拭きができるのは{len(with_mop)}機種です"
            + (f"（{'・'.join(r['name'] for r in no_mop)}は水拭き機能がありません）。" if no_mop else "。")
        ),
        f"""<div class="table-scroll"><table class="mini">
          <thead><tr><th>モップの方式</th><th>機種数</th><th>価格の中央値</th><th>水拭き・床の平均点</th></tr></thead>
          <tbody>{"".join(style_rows)}</tbody></table></div>""",
    ]
    if len(ranked_styles) >= 2:
        top_avg = round(ranked_styles[0][1][1], 1)
        tops = [st for st, v in ranked_styles if round(v[1], 1) == top_avg]
        lo = ranked_styles[-1]
        sec1.append(p_tag(
            f"口コミの点数の平均は**{'と'.join(tops)}{'がともに' if len(tops) > 1 else 'が'}{top_avg:.1f}点で最も高く**、{lo[0]}は{lo[1][1]:.1f}点でした。"
            "ただし方式ごとに価格帯も違うため、**予算の中でどの方式を選べるか**で考えるのが現実的です。"
        ))

    # 2. ステーションの自動化
    feats = [
        ("モップの自動洗浄", "mop_wash"),
        ("温水でのモップ洗浄", "hot_wash"),
        ("モップの温風乾燥", "hot_dry"),
        ("洗剤の自動投入", "detergent"),
    ]
    feat_rows = []
    for label, key in feats:
        known = [r for r in with_mop if r.get(key) is not None]
        hit = [r for r in known if r.get(key) is True]
        cheap = sorted([r for r in hit if r["reviews"] >= PICK_MIN_REVIEWS and r["price"]], key=lambda r: r["price"])
        cheapest = (
            f'<a href="/products/{cheap[0]["id"]}">{html.escape(cheap[0]["name"])}</a>（{yen(cheap[0]["price"])}）'
            if cheap else "—"
        )
        feat_rows.append(
            f'<tr><td>{html.escape(label)}</td><td class="num">{len(hit)}/{len(known)}機種</td><td>{cheapest}</td></tr>'
        )
    sec2 = [
        p_tag(
            "水拭きで手間がかかるのは、**モップを洗う・乾かす作業**です。"
            "ステーションがどこまで自動で行うかは機種によって違うので、メーカーが公表しているスペックで比べました。"
        ),
        f"""<div class="table-scroll"><table class="mini">
          <thead><tr><th>ステーションの機能</th><th>付いている機種</th><th>口コミ{PICK_MIN_REVIEWS}件以上で最も安い機種</th></tr></thead>
          <tbody>{"".join(feat_rows)}</tbody></table></div>""",
        p_tag(
            "**モップを乾かす機能がない機種は、濡れたモップが臭いやすい**ので、こまめに外して洗う必要があります。"
            "毎日水拭きするなら、自動洗浄と乾燥まで付いた機種を選ぶと手間がかなり減ります。"
        ),
    ]

    # 3. カーペットとの両立
    lift = [r for r in with_mop if r.get("mop_lift")]
    detach = [r for r in with_mop if r.get("mop_detach") is True]
    lift_known = [r for r in with_mop if r.get("mop_spec")]
    sec3 = [p_tag(
        "ラグやカーペットがある家では、水拭き中にカーペットを濡らさない仕組みが大切です。"
        f"モップを持ち上げる機能（メーカー公表）があるのは{len(with_mop)}機種のうち{len(lift)}機種"
        + (f"、モップをステーションで自動で取り外せるのは{'・'.join(r['name'] for r in detach)}の{len(detach)}機種" if detach else "")
        + "です。"
        "持ち上げの高さは機種によって違い、毛足の長いラグでは持ち上げても触れることがあります。"
        "カーペットの掃除の評価は[カーペット・ラグランキング](/rankings/carpet-cleaning)で比べられます。"
    )]
    if len(lift_known) < len(with_mop):
        sec3.append(p_tag(f"※スペックを確認できていない{len(with_mop) - len(lift_known)}機種は、上の数に含めていません。"))

    # 4. 口コミで多い声
    topic_counts = [(label, sum(1 for r in products if re.search(pat, r.get("comment") or ""))) for label, pat in MOP_TOPICS]
    topic_counts.sort(key=lambda x: -x[1])
    # 1〜2機種しか出てこない内容は「よく出てくる」に入れない
    topics_txt = "、".join(f"「{label}」（{cnt}機種）" for label, cnt in topic_counts if cnt >= 3)
    mop_mention = sum(1 for r in products if re.search(r"水拭き|モップ", r.get("comment") or ""))
    sec4 = [p_tag(
        f"各機種の口コミをまとめたコメントのうち、{n}機種中{mop_mention}機種で水拭きやモップに触れています。"
        f"よく出てくる内容は{topics_txt}です。"
        "気になる点がある機種は、ランキング表のコメントで同じ悩みの声を探してください。"
    )]

    # 5. コツ
    sec5 = [
        '<ul class="tips">'
        + "".join(f"<li>{prose(t)}</li>" for t in [
            "**先に床のモノを片付ける**：コードや小物があるとモップが引っかかりやすく、拭き残しの原因になります。",
            "**水量はアプリで部屋ごとに変える**：フローリングは少なめ、キッチンなど汚れやすい場所は多めにすると、水跡やムラを防ぎやすくなります。",
            "**無垢材や水に弱い床は取扱説明書を確認する**：床材によっては水拭きを勧めていない場合があります。",
            "**モップは定期的に交換する**：使い続けると汚れが落ちにくくなり、臭いの原因にもなります。交換の目安はメーカーの案内を確認してください。",
        ])
        + "</ul>",
        '<p class="mid-cta"><a class="btn-sub" href="#price-check">水拭きの評価が高い機種の価格を見る ▼</a></p>',
    ]

    cheap_mop = next((r for r in reliable_mop if r["price"] and r["price"] <= CHEAP_MAX), None)
    roller = next((r for r in reliable_mop if r["mop_style"] == "ローラーモップ"), None)
    rotary = next((r for r in reliable_mop if r["mop_style"] == "回転モップ"), None)
    best = reliable_mop[0] if reliable_mop else pick1
    faqs = [
        ("水拭きがいちばん得意なロボット掃除機はどれですか？",
         f"口コミ{PICK_MIN_REVIEWS}件以上の機種で順位が最も高いのは、{best['name']}（水拭き・床{best['feature']:.0f}点・口コミ{best['reviews']:,}件・{best['rank']}位）です。"
         "点数は水拭きとフローリングのゴミの取れ具合をあわせた口コミ評価です。"),
        ("安いロボット掃除機でも水拭きはできますか？",
         (f"できます。口コミ{PICK_MIN_REVIEWS}件以上で5万円以下の機種では、{cheap_mop['name']}（{yen(cheap_mop['price'])}）の評価が最も高く、{cheap_mop['feature']:.0f}点です。"
          if cheap_mop else "5万円以下の機種は、ランキング表の価格帯フィルターで絞り込んで比べられます。")
         + "ただし安い機種はモップを手で洗う方式が多いので、手間も含めて考えてください。"),
        ("ローラーモップと回転モップはどちらがいいですか？",
         "ローラーモップは床をこすりながらローラーを洗い続けるので、ベタつきなどの汚れに強いのが特長です。"
         "回転モップは押し付ける力が強く、壁際でモップを伸ばせる機種もあります。"
         + (f"口コミの評価が高いのは、ローラーモップでは{roller['name']}（{roller['feature']:.0f}点）、回転モップでは{rotary['name']}（{rotary['feature']:.0f}点）です。" if roller and rotary else "")),
        ("カーペットがあっても水拭きできますか？",
         f"モップを持ち上げる機能がある機種なら、カーペットの上ではモップを上げて掃除できます（掲載機種のうち{len(lift)}機種）。"
         "毛足の長いラグでは触れることもあるので、気になる場合はアプリでラグを進入禁止にするか、モップを自動で取り外せる機種を選ぶと安心です。"),
        ("水拭きだけのロボットと、吸引と水拭きの両方ができる機種はどちらがいいですか？",
         "当サイトで比べているのは、吸引と水拭きの両方ができる機種です。"
         "ゴミを吸ってから拭くので、1台で床掃除をまとめて任せたい場合に向いています。"),
    ]
    faq_html = "".join(
        f'<details><summary>{html.escape(q)}</summary><div class="faq-a">{p_tag(a)}</div></details>' for q, a in faqs
    )
    data_note = [
        p_tag(
            "水拭き・床の点数は、ECサイトの口コミのうちフローリング掃除（水拭き・吸引）に触れたものを分析して数値化した値です。"
            "順位は「水拭き・フローリング点数×0.85＋口コミ信頼度×0.15」で決めています。"
            f"口コミが{MIN_RANK_REVIEWS}件未満の機種は点数が安定しないため載せておらず、{LOW_REVIEW_THRESHOLD}件未満の機種は「参考値」と表示しています。"
        ),
        p_tag(
            "モップの方式・持ち上げ・ステーションの機能は、各メーカーの公式サイト・取扱説明書で確認した内容です。"
            "方式は当サイトで4つに分けたもので、メーカーの呼び方とは違う場合があります。"
        ),
    ]
    sections = [
        ("mop-type", "水拭きのモップは4つの方式", sec1),
        ("mop-station", "モップを洗う・乾かす手間はステーションで変わる", sec2),
        ("mop-carpet", "カーペットがある家はモップの持ち上げを確認", sec3),
        ("mop-voices", "口コミで多い水拭きの声", sec4),
        ("mop-tips", "水拭きを上手に使うコツ", sec5),
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
    picks_html = article_html = faq_ld = sticky_html = article_css = sticky_js = auto_filter = ""
    extra_cards: list[dict] = []
    if cfg.get("article") in ("step", "quiet", "mop"):
        if cfg["article"] == "step":
            dims = load_dims()
            for r in products:
                d = dims.get(r["id"]) or {}
                r["climb"] = d.get("climbHeightMm")
                r["climb2"] = bool(d.get("climbTwoStep"))
            picks = step_picks(products)
            picks_html = build_step_picks(products)
            article_html, faqs = build_step_article(products)
        elif cfg["article"] == "mop":
            load_mop_extras(products)
            picks = mop_picks(products)
            picks_html = build_mop_picks(products)
            article_html, faqs = build_mop_article(products)
            auto_filter = """
        <div class="filters-label filters-label-2">モップ自動洗浄で絞り込み</div>
        <div class="filter-chips" role="group">
          <button type="button" class="filter-chip auto-chip active" data-auto="all">すべて</button>
          <button type="button" class="filter-chip auto-chip" data-auto="yes">モップ自動洗浄あり</button>
          <button type="button" class="filter-chip auto-chip" data-auto="no">モップ自動洗浄なし</button>
        </div>"""
        else:
            load_quiet_extras(products)
            picks = quiet_picks(products)
            picks_html = build_quiet_picks(products)
            article_html, faqs = build_quiet_article(products)
            auto_filter = """
        <div class="filters-label filters-label-2">自動ゴミ収集で絞り込み</div>
        <div class="filter-chips" role="group">
          <button type="button" class="filter-chip auto-chip active" data-auto="all">すべて</button>
          <button type="button" class="filter-chip auto-chip" data-auto="yes">自動ゴミ収集あり</button>
          <button type="button" class="filter-chip auto-chip" data-auto="no">自動ゴミ収集なし</button>
        </div>"""
        extra_cards = [r for _, r in picks]
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
        <p class="method-sub">{format_prose(low_sample_note(cfg))}</p>
        <p class="method-sub">集計の元データ：Amazon・楽天市場に投稿された公開レビューです。文章は転載せず、内容を分類して点数にしています。</p>
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
        </div>{auto_filter}
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
            <a href="/guides/robot-vacuum-cheap">〜5万円</a>
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

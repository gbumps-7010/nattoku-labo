# -*- coding: utf-8 -*-
"""Generate keyword guide articles under /guides/ (size, budget, pets, makers).

Data:
  - products/data/*.json            口コミ分析（点数・価格・消耗品コスト）
  - scripts/data/dims/*.json        メーカー公表の本体寸法・重さ・段差・障害物回避

Usage: python scripts/generate-guide-articles.py
"""
from __future__ import annotations

import html
import importlib.util
import json
import re
import statistics
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "lib"))
from format_prose import ja_wrap, product_name_html  # noqa: E402

_spec = importlib.util.spec_from_file_location(
    "maker_pages", ROOT / "drafts" / "build-manufacturer-compare-preview.py"
)
mp = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mp)

DATA_DIR = ROOT / "products" / "data"
DIMS_DIR = ROOT / "scripts" / "data" / "dims"
OUT_DIR = ROOT / "guides"
SITE = "https://nattoku-labo.com"
NAV_V = "20261005a"
PROSE_V = "20261005a"
TODAY = date.today()
UPDATED = TODAY.isoformat()
UPDATED_JA = f"{TODAY.year}年{TODAY.month}月{TODAY.day}日"
YEAR = TODAY.year
MIN_REVIEWS = 50
WF, WR = 0.85, 0.15

AXES = [
    ("floor", "フローリング"),
    ("carpet", "カーペット"),
    ("pet", "ペット毛"),
    ("quiet", "静音性"),
    ("step", "段差"),
    ("maint", "お手入れ"),
    ("app", "アプリ"),
    ("battery", "バッテリー"),
]
AXIS_LABEL = dict(AXES)

GUIDES = [
    {"slug": "robot-vacuum-thin", "label": "薄型ロボット掃除機のおすすめ", "group": "サイズで選ぶ",
     "meta": "高さ順に比較・家具下に入る機種"},
    {"slug": "robot-vacuum-height", "label": "ロボット掃除機の高さ一覧", "group": "サイズで選ぶ",
     "meta": "全機種の高さ・隙間の測り方"},
    {"slug": "robot-vacuum-small", "label": "小さいロボット掃除機のおすすめ", "group": "サイズで選ぶ",
     "meta": "本体幅・ステーションの大きさで比較"},
    {"slug": "robot-vacuum-cheap", "label": "安いロボット掃除機のおすすめ", "group": "予算で選ぶ",
     "meta": "5万円以下を口コミで比較"},
    {"slug": "robot-vacuum-cost-performance", "label": "コスパの良いロボット掃除機", "group": "予算で選ぶ",
     "meta": "本体＋消耗品の3年総額で比較"},
    {"slug": "robot-vacuum-cat", "label": "猫がいる家のロボット掃除機", "group": "暮らしで選ぶ",
     "meta": "猫毛・猫砂・静音性で比較"},
    {"slug": "robot-vacuum-pet", "label": "ペットがいる家のロボット掃除機", "group": "暮らしで選ぶ",
     "meta": "抜け毛・排泄物回避・手入れで比較"},
    {"slug": "robot-vacuum-makers", "label": "ロボット掃除機のおすすめメーカー", "group": "メーカーで選ぶ",
     "meta": "主要6社を口コミデータで比較"},
]
GUIDE_BY_SLUG = {g["slug"]: g for g in GUIDES}


# ---------------------------------------------------------------- data

def _num(v):
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def load_dims() -> dict[str, dict]:
    dims: dict[str, dict] = {}
    if not DIMS_DIR.exists():
        return dims
    for path in sorted(DIMS_DIR.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        checked = payload.get("checkedAt") or ""
        for slug, d in (payload.get("products") or {}).items():
            item = dict(d)
            item["checkedAt"] = checked
            dims[slug] = item
    return dims


def _sentences(text: str) -> list[str]:
    return [s + "。" for s in (text or "").split("。") if s.strip()]


def cat_sentences(raw: dict) -> list[str]:
    texts: list[str] = []
    perf = raw.get("performanceAnalysis") or {}
    for key in ("petHairRemoval", "floorCleaning", "quietness", "carpetCleaning"):
        node = perf.get(key)
        if isinstance(node, dict):
            texts.append(node.get("comment") or "")
    for det in ((raw.get("attributeScores") or {}).get("petOwner") or {}).get("details") or []:
        if isinstance(det, dict):
            texts.append(det.get("comment") or "")
    out: list[str] = []
    for t in texts:
        for s in _sentences(t):
            if "猫" in s and s not in out:
                out.append(s.strip())
    return out


def load_products() -> list[dict]:
    dims = load_dims()
    rows: list[dict] = []
    for meta in mp.MANUFACTURERS:
        for r in mp.load_manufacturer(meta["id"]):
            raw = json.loads((DATA_DIR / f"{r['id']}.json").read_text(encoding="utf-8"))
            perf = raw.get("performanceAnalysis") or {}
            attrs = raw.get("attributeScores") or {}
            r["maker"] = meta
            r["annual"] = int((raw.get("operationalCost") or {}).get("annual") or 0)
            r["tco3"] = r["price"] + 3 * r["annual"]
            r["pet_owner"] = _num((attrs.get("petOwner") or {}).get("overall"))
            r["apartment"] = _num((attrs.get("apartment") or {}).get("overall"))
            r["cat_quotes"] = cat_sentences(raw)
            r["price_checked"] = raw.get("priceCheckedAt") or ""
            r["floor_comment_full"] = ((perf.get("floorCleaning") or {}).get("comment") or "")
            d = dims.get(r["id"]) or {}
            size = d.get("dimensionsMm") or {}
            r["h"] = _num(size.get("h"))
            r["w"] = _num(size.get("w"))
            r["d"] = _num(size.get("d"))
            r["foot"] = max(r["w"], r["d"]) if r["w"] and r["d"] else None
            r["weight"] = _num(d.get("weightKg"))
            r["climb"] = _num(d.get("climbHeightMm"))
            r["climb2"] = bool(d.get("climbTwoStep"))
            r["avoid"] = (d.get("obstacleAvoidance") or "").strip()
            r["pet_waste"] = d.get("recognizesPetWaste") if d else None
            r["has_dims"] = bool(d)
            r["lift_lidar"] = bool(d.get("liftLidar"))
            st = d.get("stationDimensionsMm")
            r["station"] = st if isinstance(st, dict) and st.get("h") else None
            r["dim_sources"] = d.get("sources") or []
            r["dim_note"] = (d.get("note") or "").strip()
            r["dim_checked"] = d.get("checkedAt") or ""
            rows.append(r)
    return rows


def reliable(rows: list[dict]) -> list[dict]:
    return [r for r in rows if r["reviews"] >= MIN_REVIEWS]


def by_overall(rows: list[dict]) -> list[dict]:
    return sorted(rows, key=lambda r: (-(r.get("overall") or 0), -r["rel"], -r["reviews"]))


def composite(feature: float, rel: float) -> float:
    return round(WF * feature + WR * rel, 1)


def mean(vals) -> float | None:
    vals = [v for v in vals if v is not None]
    return round(statistics.mean(vals), 1) if vals else None


# ---------------------------------------------------------------- formatting

def yen(n: int) -> str:
    return f"¥{int(n):,}"


def _cm_num(mm: float) -> str:
    return f"{mm / 10:.2f}".rstrip("0").rstrip(".")


def cm(mm) -> str:
    return "—" if mm is None else f"{_cm_num(mm)}cm"


def wd(r: dict) -> str:
    if not r.get("w") or not r.get("d"):
        return "—"
    return f"{_cm_num(r['w'])}×{_cm_num(r['d'])}cm"


def kg(x) -> str:
    return "—" if x is None else f"{x:g}kg"


def mm(x) -> str:
    return "—" if x is None else f"{x:g}mm"


def score_txt(v) -> str:
    return "—" if v is None else f"{v:.0f}"


def ordinal(i: int) -> str:
    return "最も" if i == 1 else f"{i}番目に"


def join_ja(items: list[str]) -> str:
    items = [i for i in items if i]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return "、".join(items[:-1]) + "、" + items[-1]


_MD_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_MD_EM = re.compile(r"\*\*(.+?)\*\*")


def prose(text: str) -> str:
    """**…** だけをマーカーにする。各文の結論（得意・苦手・選ぶべき機種など）に付け、用語には付けない。"""
    out = html.escape(ja_wrap(text.strip()), quote=False)
    out = _MD_EM.sub(r'<strong class="em-key">\1</strong>', out)
    return _MD_LINK.sub(lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', out)


def plain(text: str) -> str:
    return _MD_EM.sub(r"\1", _MD_LINK.sub(lambda m: m.group(1), text))


def P(text: str, cls: str = "") -> str:
    c = f' class="{cls}"' if cls else ""
    return f"<p{c}>{prose(text)}</p>"


def climb_txt(r: dict) -> str:
    if not r.get("climb"):
        return mm(r.get("climb"))
    return f"{mm(r['climb'])}・2段" if r.get("climb2") else mm(r["climb"])


def plink(r: dict) -> str:
    return f"[{r['name']}](/products/{r['id']})"


def gl(slug: str) -> str:
    return f"[{GUIDE_BY_SLUG[slug]['label']}](/guides/{slug})"


def score_band(v) -> str:
    if v is None:
        return ""
    return "s90" if v >= 90 else "s80" if v >= 80 else "s70" if v >= 70 else "s60"


def sc_cell(v, digits: int = 0) -> str:
    if v is None:
        return '<span class="sc">—</span>'
    return f'<span class="sc {score_band(v)}">{v:.{digits}f}</span>'


def product_cell(r: dict) -> str:
    img = (
        f'<img src="{html.escape(r["img"])}" alt="" width="44" height="44" loading="lazy">'
        if r.get("img") else ""
    )
    thin = ' <span class="thin-tag">口コミ少</span>' if r["reviews"] < MIN_REVIEWS else ""
    return (
        f'<a class="pcell" href="/products/{html.escape(r["id"])}">{img}'
        f'<span class="pcell-txt"><span class="pcell-name">{product_name_html(r["name"])}</span>'
        f'<span class="pcell-mfr">{html.escape(r["maker"]["name_en"])}{thin}</span></span></a>'
    )


def data_table(columns: list[tuple[str, callable]], rows: list[dict], label: str) -> str:
    head = "".join(f"<th scope=\"col\">{html.escape(c[0])}</th>" for c in columns)
    body = []
    for r in rows:
        body.append("<tr>" + "".join(f"<td>{fn(r)}</td>" for _, fn in columns) + "</tr>")
    return f"""
        <div class="dt-wrap" role="region" aria-label="{html.escape(label)}" tabindex="0">
          <table class="dt">
            <thead><tr>{head}</tr></thead>
            <tbody>{''.join(body)}</tbody>
          </table>
        </div>
        <p class="dt-hint">表は横にスクロールできます。製品名から詳細分析ページへ移動できます。</p>"""


_AUTO_MARK = re.compile(r'<strong class="em-key[^"]*">(.*?)</strong>', re.S)


def keep_quote_marks(block: str) -> str:
    """共通の自動マーカーのうち、口コミの「」を丸ごと囲むものだけ残す（定型句や途中で切れた引用は外す）。"""
    def repl(m: re.Match) -> str:
        before = block[: m.start()].rstrip("\u2060")
        after = block[m.end():].lstrip("\u2060")
        return m.group(0) if before.endswith("「") and after.startswith("」") else m.group(1)
    return _AUTO_MARK.sub(repl, block)


def pick_card(anchor: str, heading: str, lead: str, r: dict, chips: list[str] | None = None) -> str:
    block = keep_quote_marks(mp.article_pick(anchor_id=anchor, heading=heading, lead="LEAD", product=r))
    block = block.replace('<p class="lead">LEAD</p>', f'<p class="lead">{prose(lead)}</p>', 1)
    if chips:
        extra = "".join(f'<span class="chip spec">{html.escape(c)}</span>' for c in chips)
        block = re.sub(
            r'(<p class="meta">.*?)(\s*</p>)',
            lambda m: m.group(1) + extra + m.group(2),
            block,
            count=1,
            flags=re.S,
        )
    return block


def conclusion_box(title: str, items: list[tuple[str, dict, str, str]]) -> str:
    lis = []
    for badge, r, reason, anchor in items:
        lis.append(
            f"""
            <li>
              <span class="c-badge">{html.escape(badge)}</span>
              <div class="c-body">
                <a class="c-name" href="#{html.escape(anchor)}">{html.escape(r['name'])}</a>
                <span class="c-price">{yen(r['price'])}</span>
                <p>{prose(reason)}</p>
              </div>
            </li>"""
        )
    return f"""
        <div class="conclusion" aria-label="結論">
          <p class="conclusion-title">{html.escape(title)}</p>
          <ol class="conclusion-list">{''.join(lis)}</ol>
        </div>"""


def know_box(items: list[tuple[str, str]]) -> str:
    lis = []
    for i, (title, body) in enumerate(items, 1):
        lis.append(
            f"""
            <li class="know-item">
              <span class="know-num" aria-hidden="true">{i}</span>
              <div class="know-body">
                <strong>{html.escape(title)}</strong>
                <p>{prose(body)}</p>
              </div>
            </li>"""
        )
    return f"""
        <div class="know" aria-labelledby="know-heading">
          <h2 id="know-heading">この記事でわかること</h2>
          <p class="know-note">{prose("２大ECサイトの口コミ分析と、メーカー公表のスペックをもとに解説します。")}</p>
          <ul class="know-list">{''.join(lis)}</ul>
        </div>"""


def points_list(items: list[tuple[str, str]]) -> str:
    lis = "".join(
        f'<li class="point"><h3>{html.escape(t)}</h3>{"".join(P(x) for x in body.split(chr(10)) if x.strip())}</li>'
        for t, body in items
    )
    return f'<ol class="points">{lis}</ol>'


def chips_links(rows: list[dict]) -> str:
    return '<div class="model-chips">' + "".join(
        f'<a class="model-chip" href="/products/{html.escape(r["id"])}">{html.escape(r["name"])}'
        f'<span>{html.escape(cm(r["h"]) if r.get("h") else yen(r["price"]))}</span></a>'
        for r in rows
    ) + "</div>"


def mini_table(headers: list[str], rows: list[list[str]]) -> str:
    th = "".join(f"<th>{html.escape(h)}</th>" for h in headers)
    tb = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in row) + "</tr>" for row in rows)
    return f'<div class="mini-wrap"><table class="mini"><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table></div>'


# ---------------------------------------------------------------- page shell

CSS = r"""
:root {
  --primary:#1e40af; --secondary:#0f172a; --bg:#f1f5f9; --card:#fff;
  --text:#1e293b; --muted:#0f172a; --line:#e2e8f0; --good:#059669;
}
* { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; }
body {
  font-family:"Noto Sans JP",sans-serif; background:var(--bg); color:var(--text);
  line-height:1.8; font-size:16px; overflow-x:clip;
}
.wrap { max-width:1000px; margin:0 auto; padding:0 1rem; }
@media (min-width:720px) { .wrap { padding:0 1.25rem; } }
header.hero {
  background:linear-gradient(135deg,var(--primary),var(--secondary));
  color:#fff; padding:1.6rem 1rem 1.8rem;
}
.crumb { font-size:.78rem; opacity:.85; margin-bottom:.55rem; }
.crumb a { color:#bfdbfe; text-decoration:none; }
.crumb a:hover { text-decoration:underline; }
h1 {
  font-size:clamp(1.15rem,3.4vw,1.85rem); font-weight:900; line-height:1.4; margin-bottom:.55rem;
  text-wrap:balance; overflow-wrap:break-word;
}
header.hero .lede { font-size:.95rem; color:#e0e7ff; max-width:44rem; }
header.hero .lede .em-key { color:#fff; background:none; }
.hero-meta { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.85rem; }
.hero-chip {
  background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.24);
  border-radius:999px; padding:.22rem .7rem; font-size:.74rem; font-weight:700;
}
main { padding:1.25rem 0 3rem; }
.know {
  background:linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%);
  border:1px solid #93c5fd; border-radius:14px;
  padding:1.1rem 1.15rem 1.15rem; margin:0 0 1.25rem;
  box-shadow:0 4px 14px rgba(30,64,175,.08);
}
.know h2 { font-size:1.05rem; margin:0 0 .45rem; color:#1e3a8a; border:0; padding:0; font-weight:900; }
.know-note {
  margin:0 0 .85rem; padding:.55rem .7rem; background:rgba(255,255,255,.75);
  border:1px solid #bfdbfe; border-radius:8px; font-size:.84rem; line-height:1.6;
  color:#1e40af; font-weight:700;
}
.know-list { list-style:none; display:grid; gap:.65rem; }
.know-item {
  display:flex; gap:.75rem; align-items:flex-start; background:#fff;
  border:1px solid #dbeafe; border-radius:10px; padding:.75rem .85rem;
}
.know-num {
  flex-shrink:0; width:1.65rem; height:1.65rem; border-radius:999px; background:#1e40af;
  color:#fff; font-size:.8rem; font-weight:900; display:flex; align-items:center;
  justify-content:center; line-height:1;
}
.know-body > strong { display:block; font-size:.92rem; color:#0f172a; margin-bottom:.2rem; }
.know-body p { margin:0; font-size:.84rem; line-height:1.65; color:#1e293b; font-weight:500; }
.conclusion {
  background:#fff; border:2px solid #fbbf24; border-radius:14px; padding:1rem 1.05rem 1.05rem;
  margin:0 0 1.25rem; box-shadow:0 4px 14px rgba(180,83,9,.08);
}
.conclusion-title { font-size:1.02rem; font-weight:900; color:#92400e; margin-bottom:.65rem; }
.conclusion-list { list-style:none; display:grid; gap:.6rem; }
.conclusion-list li { display:flex; gap:.7rem; align-items:flex-start; }
.c-badge {
  flex-shrink:0; min-width:5.6rem; text-align:center; background:#fef3c7; color:#92400e;
  border:1px solid #fcd34d; border-radius:8px; padding:.2rem .45rem; font-size:.74rem;
  font-weight:900; line-height:1.5;
}
.c-body { min-width:0; }
.c-name { font-weight:900; color:#1e40af; text-decoration:none; font-size:.95rem; }
.c-name:hover { text-decoration:underline; }
.c-price { margin-left:.45rem; font-size:.8rem; font-weight:800; color:#334155; }
.c-body p { font-size:.85rem; line-height:1.65; margin-top:.15rem; }
@media (max-width:560px) {
  .conclusion-list li { flex-direction:column; gap:.3rem; }
  .c-badge { min-width:0; }
}
.intro p { margin:0 0 .85rem; font-size:.95rem; }
.toc-box {
  margin:1.25rem 0 0; padding:1rem 1.1rem; background:#f8fafc;
  border:1px solid var(--line); border-radius:10px;
}
.toc-title { font-size:.95rem; font-weight:900; margin-bottom:.55rem; color:var(--secondary); }
.toc-list { margin:0; padding-left:1.25rem; }
.toc-list > li { margin:.3rem 0; font-weight:700; font-size:.9rem; }
.toc-list a { color:var(--primary); text-decoration:none; }
.toc-list a:hover { text-decoration:underline; }
section.chapter { margin:2rem 0 2.25rem; }
section.chapter > h2 {
  font-size:1.2rem; font-weight:900; margin:0 0 .75rem; color:var(--secondary);
  padding-bottom:.4rem; border-bottom:2px solid #bfdbfe; scroll-margin-top:84px;
}
section.chapter > p, .chapter-body > p { margin:0 0 .85rem; font-size:.95rem; }
section.chapter h3 { font-size:1.02rem; font-weight:900; color:#0f172a; margin:1.2rem 0 .5rem; }
.points { list-style:none; counter-reset:pt; display:grid; gap:.75rem; margin:.5rem 0 1rem; }
.point {
  counter-increment:pt; background:#fff; border:1px solid var(--line); border-radius:12px;
  padding:.85rem 1rem .5rem;
}
.point h3 { margin:0 0 .4rem !important; font-size:.98rem !important; color:#1e3a8a !important; }
.point h3::before {
  content:counter(pt); display:inline-flex; align-items:center; justify-content:center;
  width:1.45rem; height:1.45rem; margin-right:.5rem; border-radius:999px; background:#1e40af;
  color:#fff; font-size:.78rem; vertical-align:2px;
}
.point p { font-size:.9rem; margin:0 0 .5rem; }
.callout {
  background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px;
  padding:.75rem .95rem; margin:.85rem 0 1rem; font-size:.9rem; color:#1e293b;
}
.callout p { margin:0 0 .35rem; }
.callout p:last-child { margin:0; }
.callout.warn { background:#fffbeb; border-color:#fcd34d; color:#78350f; }
.steps { margin:.5rem 0 1rem 1.3rem; }
.steps li { margin:.35rem 0; font-size:.92rem; }
.steps li strong { color:#0f172a; }
.model-chips { display:flex; flex-wrap:wrap; gap:.4rem; margin:.4rem 0 .9rem; }
.model-chip {
  display:inline-flex; align-items:center; gap:.4rem; padding:.3rem .65rem; border-radius:999px;
  background:#fff; border:1px solid #bfdbfe; color:#1e3a8a; font-size:.8rem; font-weight:800;
  text-decoration:none;
}
.model-chip span { font-weight:700; color:#475569; font-size:.74rem; }
.model-chip:hover { background:#eff6ff; }
.quote-list { list-style:none; display:grid; gap:.55rem; margin:.5rem 0 1rem; }
.quote-list li {
  background:#fff; border:1px solid var(--line); border-radius:10px; padding:.6rem .8rem;
}
.quote-list .q-name { font-size:.82rem; font-weight:900; color:#1e40af; text-decoration:none; }
.quote-list .q-name:hover { text-decoration:underline; }
.quote-list p { font-size:.87rem; line-height:1.7; margin-top:.15rem; }
.mini-wrap { overflow-x:auto; margin:.5rem 0 1rem; }
table.mini { border-collapse:collapse; width:100%; min-width:420px; background:#fff; font-size:.85rem; }
table.mini th, table.mini td { border:1px solid var(--line); padding:.45rem .6rem; text-align:left; }
table.mini th { background:#f1f5f9; font-weight:800; font-size:.8rem; white-space:nowrap; }
table.mini td { white-space:nowrap; }
table.mini td:first-child { white-space:normal; min-width:9.5em; }
table.mini td a { color:var(--primary); font-weight:700; text-decoration:none; }
table.mini td a:hover { text-decoration:underline; }
.dt-wrap {
  overflow-x:auto; background:#fff; border:1px solid #cbd5e1; border-radius:12px; margin:.6rem 0 .3rem;
}
table.dt { border-collapse:separate; border-spacing:0; width:max-content; min-width:100%; font-size:.82rem; }
table.dt th, table.dt td {
  padding:.5rem .55rem; border-bottom:1px solid var(--line); text-align:center; white-space:nowrap;
  vertical-align:middle;
}
table.dt thead th { background:#f1f5f9; font-size:.76rem; font-weight:800; color:#0f172a; }
table.dt th:first-child, table.dt td:first-child {
  position:sticky; left:0; z-index:2; background:#fff; text-align:left;
  box-shadow:4px 0 8px -6px rgba(15,23,42,.35); white-space:normal; min-width:11.5rem; max-width:13rem;
}
table.dt thead th:first-child { background:#f1f5f9; z-index:3; }
table.dt tbody tr:hover td { background:#f8fafc; }
.pcell { display:flex; align-items:center; gap:.5rem; text-decoration:none; color:inherit; }
.pcell img { width:44px; height:44px; object-fit:contain; border:1px solid var(--line); border-radius:8px; background:#fff; flex-shrink:0; }
.pcell-txt { display:flex; flex-direction:column; min-width:0; }
.pcell-name { font-weight:800; font-size:.8rem; line-height:1.3; color:#1e3a8a; }
.pcell-mfr { font-size:.7rem; color:#475569; font-weight:600; }
.pcell:hover .pcell-name { text-decoration:underline; }
.thin-tag { display:inline-block; margin-left:.25rem; padding:0 .3rem; border-radius:4px; background:#fef3c7; color:#92400e; font-size:.64rem; font-weight:800; }
.sc { font-weight:900; font-variant-numeric:tabular-nums; padding:.1rem .35rem; border-radius:6px; }
.sc.s90 { color:#047857; background:#ecfdf5; }
.sc.s80 { color:#1d4ed8; background:#eff6ff; }
.sc.s70 { color:#a16207; background:#fffbeb; }
.sc.s60 { color:#b91c1c; background:#fef2f2; }
.dt-hint { font-size:.76rem; color:#475569; margin:0 0 1rem; }
.yes { color:#047857; font-weight:800; }
.no { color:#64748b; }
.articles { display:flex; flex-direction:column; gap:2rem; margin-top:.75rem; }
.article-pick h3 {
  font-size:1.08rem; font-weight:900; margin:0 0 .85rem; color:#0f172a;
  padding:.7rem 1rem; border:1px solid var(--line);
  background:#f8fafc;
  border-radius:10px; scroll-margin-top:84px;
}
.maker-nav { display:flex; flex-wrap:wrap; gap:.45rem; margin:.25rem 0 1.4rem; }
.maker-nav a {
  display:inline-flex; align-items:center; gap:.4rem; padding:.35rem .75rem .35rem .4rem;
  border-radius:999px; background:#fff; border:1px solid #bfdbfe; color:#1e3a8a;
  font-size:.82rem; font-weight:800; text-decoration:none;
}
.maker-nav a span {
  display:inline-flex; align-items:center; justify-content:center; width:1.35rem; height:1.35rem;
  border-radius:999px; background:#1e3a8a; color:#fff; font-size:.72rem;
}
.maker-nav a:hover { background:#eff6ff; }
.maker-sec {
  margin:0 0 2rem; border:1px solid #cbd5e1; border-radius:14px; background:#fff;
  overflow:hidden; scroll-margin-top:84px; box-shadow:0 2px 10px rgba(15,23,42,.06);
}
.maker-head {
  padding:1rem 1.15rem .95rem; color:#fff;
  background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 100%);
}
.maker-rank {
  display:inline-block; margin-bottom:.35rem; padding:.1rem .55rem; border-radius:999px;
  background:rgba(255,255,255,.18); font-size:.74rem; font-weight:800; letter-spacing:.02em;
}
section.chapter .maker-head h3 {
  margin:0; color:#fff; font-size:1.5rem; font-weight:900; line-height:1.3; letter-spacing:.02em;
}
.maker-en { margin-left:.55rem; font-size:.9rem; font-weight:700; color:#bfdbfe; letter-spacing:.04em; }
.maker-stats { list-style:none; display:flex; flex-wrap:wrap; gap:.35rem .5rem; margin:.6rem 0 0; padding:0; }
.maker-stats li {
  padding:.15rem .6rem; border-radius:6px; background:rgba(15,23,42,.28);
  font-size:.78rem; font-weight:700; color:#e0e7ff;
}
.maker-stats b { margin:0 .15rem; font-size:.95rem; color:#fff; }
.maker-body { padding:1.1rem 1.15rem .4rem; }
.maker-body > p { margin:0 0 .85rem; font-size:.95rem; }
@media (max-width:560px) {
  section.chapter .maker-head h3 { font-size:1.3rem; }
  .maker-en { display:block; margin:.1rem 0 0; }
  .maker-body { padding:1rem .9rem .3rem; }
}
.aff-mount { margin:0 0 1rem; min-height:2rem; }
.aff-status { margin:0; font-size:.84rem; color:#0f172a; font-weight:600; }
.aff-status.error { color:#b45309; }
.aff-moshimo { display:block; width:100%; max-width:100%; min-width:0; overflow:hidden; }
.aff-moshimo iframe { width:100%; max-width:100%; min-width:0; border:0; display:block; }
.aff-direct { margin:.55rem 0 0; width:100%; }
.official-hp-btn {
  display:block; width:100%; text-align:center; text-decoration:none; padding:.85rem 1.1rem;
  border-radius:10px; background:#0f766e; color:#fff; border:1px solid #0d9488;
  font-weight:800; font-size:.95rem; line-height:1.35;
}
.official-hp-btn:hover { background:#0d9488; }
.article-copy { width:100%; min-width:0; }
.meta-block { margin:0 0 1rem; padding:.85rem .95rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; }
.article-copy .meta { display:flex; flex-wrap:wrap; gap:.5rem; margin:0 0 .65rem; }
.chip {
  display:inline-flex; align-items:center; padding:.45rem .85rem; border-radius:999px;
  background:#e2e8f0; color:#0f172a; font-size:.9rem; font-weight:900; line-height:1.25;
}
.chip.accent { background:#dbeafe; color:#1e40af; border:1px solid #93c5fd; }
.chip.spec { background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; }
.price-caution { margin:0; font-size:.8rem; line-height:1.65; color:#0f172a; font-weight:600; }
.article-copy .lead { margin:0 0 1rem; font-size:.92rem; line-height:1.75; color:#1e293b; }
.panel { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:.75rem .8rem .85rem; margin-bottom:.75rem; }
.panel.panel-neg { background:#fff7f7; border-color:#fecdd3; }
.panel h4 { margin:0 0 .55rem; font-size:.92rem; font-weight:900; color:#1e40af; }
.panel-neg h4 { color:#be123c; }
.panel.trend-panel { background:#f8fafc; border-color:#bfdbfe; }
.trend-summary { margin:0; font-size:.9rem; line-height:1.75; }
.trend-kw-title { margin:.75rem 0 .45rem; font-size:.78rem; font-weight:800; color:#334155; }
.trend-keywords { display:flex; flex-wrap:wrap; gap:.4rem; }
.trend-chip {
  display:inline-flex; padding:.3rem .6rem; border-radius:999px; background:#eff6ff;
  border:1px solid #bfdbfe; color:#1e40af; font-size:.76rem; font-weight:700;
}
.pros-cons-groups { display:flex; flex-direction:column; gap:.85rem; }
.pros-cons-group { display:flex; flex-direction:column; gap:.55rem; }
.pros-cons-group-neg { padding-top:.85rem; border-top:1px dashed #fecdd3; }
.pros-cons-label { margin:0; font-size:.92rem; font-weight:900; }
.pros-cons-label-good { color:#047857; }
.pros-cons-label-warn { color:#be123c; }
.entry-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:.55rem; }
.entry-stack { display:flex; flex-direction:column; gap:.55rem; }
.entry { border:1px solid #e2e8f0; border-radius:10px; padding:.55rem .65rem; background:#f8fafc; }
.entry.good { border-color:#a7f3d0; background:#ecfdf5; }
.entry.warn, .entry.issue { border-color:#fecdd3; background:#fff1f2; }
.entry.fit { border-color:#bfdbfe; background:#eff6ff; }
.entry-head { display:flex; flex-wrap:wrap; align-items:baseline; gap:.35rem .65rem; margin-bottom:.25rem; }
.entry-label { font-size:.86rem; font-weight:900; color:#0f172a; }
.entry-score { font-size:.8rem; font-weight:900; color:#334155; }
.entry.good .entry-score { color:#047857; }
.entry.warn .entry-score, .entry.issue .entry-score { color:#e11d48; }
.entry.fit .entry-score { color:#1d4ed8; }
.entry-body { margin:0; font-size:.84rem; line-height:1.7; line-break:strict; overflow-wrap:anywhere; }
.article-copy .more { margin:.85rem 0 0; padding-top:.85rem; border-top:1px solid #eef2f7; }
.article-copy .more a {
  display:inline-flex; align-items:center; min-height:2.6rem; padding:.65rem 1.15rem;
  border-radius:10px; background:#1e40af; color:#fff; font-size:.9rem; font-weight:800;
  text-decoration:none;
}
.article-copy .more a:hover { background:#1d4ed8; }
.faq { display:grid; gap:.6rem; }
.faq details { background:#fff; border:1px solid var(--line); border-radius:12px; padding:.15rem .95rem; }
.faq summary {
  cursor:pointer; list-style:none; font-weight:900; font-size:.95rem; color:#0f172a;
  padding:.75rem 0 .75rem 2rem; position:relative;
}
.faq summary::-webkit-details-marker { display:none; }
.faq summary::before {
  content:"Q"; position:absolute; left:0; top:.72rem; width:1.45rem; height:1.45rem;
  border-radius:999px; background:#1e40af; color:#fff; font-size:.78rem;
  display:flex; align-items:center; justify-content:center;
}
.faq details[open] summary { border-bottom:1px dashed var(--line); }
.faq .faq-a { padding:.7rem 0 .8rem 2rem; position:relative; font-size:.92rem; }
.faq .faq-a::before {
  content:"A"; position:absolute; left:0; top:.75rem; width:1.45rem; height:1.45rem;
  border-radius:999px; background:#f59e0b; color:#fff; font-size:.78rem; font-weight:900;
  display:flex; align-items:center; justify-content:center;
}
.faq .faq-a p { margin:0 0 .4rem; }
.summary-box { background:#fff; border:1px solid var(--line); border-radius:12px; padding:1rem 1.1rem; }
.summary-box p { margin:0 0 .75rem; font-size:.95rem; }
.summary-box ul { margin:0; padding-left:1.2rem; }
.summary-box li { margin:.3rem 0; font-weight:700; font-size:.92rem; }
a { color:var(--primary); }
.prose a, .chapter a { font-weight:700; }
.notes { background:#fff; border:1px solid var(--line); border-radius:12px; padding:1rem 1.1rem; margin-top:2rem; }
.notes h2 { font-size:1rem; font-weight:900; margin-bottom:.45rem; }
.notes ul { padding-left:1.2rem; }
.notes li { font-size:.84rem; margin:.25rem 0; }
.sources { margin-top:.75rem; }
.sources summary { cursor:pointer; font-weight:800; font-size:.86rem; color:#1e40af; }
.sources ul { margin-top:.45rem; }
.sources li { font-size:.78rem; }
.related { margin-top:1.5rem; }
.related h2 { font-size:1rem; font-weight:900; margin-bottom:.55rem; }
.related-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:.55rem; }
.related-grid a {
  display:block; background:#fff; border:1px solid var(--line); border-radius:10px;
  padding:.65rem .8rem; text-decoration:none; color:#1e3a8a; font-weight:800; font-size:.88rem;
}
.related-grid a span { display:block; font-size:.74rem; font-weight:600; color:#475569; margin-top:.1rem; }
.related-grid a:hover { border-color:#93c5fd; background:#eff6ff; }
footer.page-footer { text-align:center; color:var(--muted); font-size:.8rem; padding:1.5rem 1rem 2rem; }
footer.page-footer a { color:var(--primary); font-weight:700; text-decoration:none; margin:0 .35rem; }
"""


def toc_html(sections: list[tuple[str, str, str]]) -> str:
    lis = "".join(
        f'<li><a href="#{html.escape(sid)}">{html.escape(title)}</a></li>' for sid, title, _ in sections
    )
    return f"""
        <nav class="toc-box" aria-label="目次">
          <p class="toc-title">目次</p>
          <ol class="toc-list">{lis}</ol>
        </nav>"""


def faq_html(faqs: list[tuple[str, str]]) -> str:
    items = []
    for q, a in faqs:
        paras = "".join(P(x) for x in a.split("\n") if x.strip())
        items.append(
            f'<details><summary>{html.escape(q)}</summary><div class="faq-a">{paras}</div></details>'
        )
    return f'<div class="faq">{"".join(items)}</div>'


def faq_jsonld(faqs: list[tuple[str, str]]) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": plain(a).replace("\n", "")},
            }
            for q, a in faqs
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=2)


def related_html(current: str) -> str:
    links = "".join(
        f'<a href="/guides/{g["slug"]}">{html.escape(g["label"])}<span>{html.escape(g["meta"])}</span></a>'
        for g in GUIDES
        if g["slug"] != current
    )
    return f"""
      <section class="related" aria-label="関連ガイド">
        <h2>あわせて読みたい選び方ガイド</h2>
        <div class="related-grid">{links}</div>
      </section>
      <section class="related" aria-label="ほかの比較">
        <h2>ランキング・徹底比較</h2>
        <div class="related-grid">
          <a href="/rankings/">機能別ランキング<span>フローリング・カーペット・静音性</span></a>
          <a href="/compare/">価格帯別の徹底比較<span>〜5万円から20万円〜まで</span></a>
          <a href="/makers/">メーカー別全機種比較<span>主要6メーカーの全ラインナップ</span></a>
        </div>
      </section>"""


def notes_html(extra: list[str], sources_rows: list[dict] | None = None) -> str:
    base = [
        "点数は２大ECサイトの口コミを分析した値です。実機で計測した値ではありません。",
        "総合点は「8つの性能の平均点×0.85＋口コミ信頼度×0.15」で、製品ページと同じ計算です。",
        f"口コミが{MIN_REVIEWS}件未満の製品は点数が揺れやすいため、おすすめ機種からは外し、比較表に「口コミ少」と表示しています。",
        "価格はメーカー公式ストアの販売価格（調査時点）です。セールで変わるため、購入前に販売ページで確認してください。",
    ]
    lis = "".join(f"<li>{prose(x)}</li>" for x in base + extra)
    src = ""
    if sources_rows:
        items = []
        for r in sources_rows:
            links = "、".join(
                f'<a href="{html.escape(s.get("url") or "")}" target="_blank" rel="noopener">{html.escape(s.get("label") or "出典")}</a>'
                for s in r["dim_sources"][:2]
                if s.get("url")
            )
            if links:
                items.append(f"<li><strong>{html.escape(r['name'])}</strong>：{links}</li>")
        if items:
            src = f"""
        <details class="sources">
          <summary>寸法・スペックの出典（メーカー公式サイトほか）</summary>
          <ul>{''.join(items)}</ul>
        </details>"""
    return f"""
      <aside class="notes" aria-label="注意事項">
        <h2>データについて</h2>
        <ul>{lis}</ul>{src}
      </aside>"""


def render_page(art: dict) -> Path:
    slug = art["slug"]
    url = f"{SITE}/guides/{slug}"
    sections = art["sections"] + [
        ("faq", "よくある質問", faq_html(art["faqs"])),
        ("summary", "まとめ", art["summary"]),
    ]
    body = "".join(
        f"""
      <section class="chapter" id="{html.escape(sid)}">
        <h2>{html.escape(title)}</h2>
        {content}
      </section>"""
        for sid, title, content in sections
    )
    picks = art.get("picks") or []
    seen: set[str] = set()
    uniq_picks = []
    for r in picks:
        if r["id"] not in seen:
            seen.add(r["id"])
            uniq_picks.append(r)
    aff = {
        r["id"]: {"moshimo": r.get("moshimo") or "", "direct": r.get("direct") or ""}
        for r in uniq_picks
        if r.get("moshimo") or r.get("direct")
    }
    aff_json = json.dumps(aff, ensure_ascii=False).replace("</", "<\\/")
    article_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": art["h1"],
        "description": art["description"],
        "url": url,
        "mainEntityOfPage": url,
        "inLanguage": "ja",
        "datePublished": art.get("published", UPDATED),
        "dateModified": UPDATED,
        "author": {"@type": "Organization", "name": "ナットクLabo", "url": f"{SITE}/about"},
        "publisher": {"@type": "Organization", "name": "ナットクLabo", "url": f"{SITE}/"},
    }
    if uniq_picks and uniq_picks[0].get("img"):
        article_ld["image"] = uniq_picks[0]["img"]
    item_ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": art["h1"],
        "numberOfItems": len(uniq_picks),
        "itemListElement": [
            {"@type": "ListItem", "position": i, "url": f"{SITE}/products/{r['id']}", "name": r["name"]}
            for i, r in enumerate(uniq_picks, 1)
        ],
    }
    crumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "ホーム", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "選び方ガイド", "item": f"{SITE}/guides/"},
            {"@type": "ListItem", "position": 3, "name": art["crumb"], "item": url},
        ],
    }
    ld_blocks = [article_ld, crumb_ld] + ([item_ld] if uniq_picks else [])
    ld_html = "".join(
        f'\n  <script type="application/ld+json">\n{json.dumps(b, ensure_ascii=False, indent=2)}\n  </script>'
        for b in ld_blocks
    )
    hero_chips = "".join(f'<span class="hero-chip">{html.escape(c)}</span>' for c in art.get("chips", []))
    intro = "".join(P(x) for x in art.get("intro", []))
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(art["title"])}｜ナットクLabo</title>
  <meta name="description" content="{html.escape(art["description"])}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="{url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{html.escape(art["title"])}">
  <meta property="og:description" content="{html.escape(art["description"])}">
  <meta property="article:modified_time" content="{UPDATED}">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <link rel="stylesheet" href="/products/css/prose.css?v={PROSE_V}">
  <style>{CSS}</style>{ld_html}
  <script type="application/ld+json">
{faq_jsonld(art["faqs"])}
  </script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="パンくず"><a href="/">ホーム</a> › <a href="/guides/">選び方ガイド</a> › {html.escape(art["crumb"])}</nav>
      <h1>{html.escape(art["h1"])}</h1>
      <p class="lede">{prose(art["lede"])}</p>
      <div class="hero-meta">{hero_chips}<span class="hero-chip">更新 {UPDATED_JA}</span></div>
    </div>
  </header>

  <main>
    <div class="wrap prose">
      {art["conclusion"]}
      {know_box(art["know"])}
      <div class="intro">{intro}</div>
      {toc_html(sections)}
      {body}
      {notes_html(art.get("notes", []), art.get("sources"))}
      {related_html(slug)}
    </div>
  </main>

  <footer class="page-footer">
    <div>
      <a href="/">ホーム</a>
      <a href="/guides/">選び方ガイド</a>
      <a href="/rankings/">ランキング</a>
      <a href="/compare/">徹底比較</a>
      <a href="/about">サイトについて</a>
    </div>
    <p style="margin-top:0.65rem">ナットクLabo · 更新 {UPDATED}</p>
  </footer>
  <script>
    window.__AFFILIATE__ = {aff_json};
  </script>
  <script src="/products/js/official-perks.js?v={mp.PERKS_V}"></script>
  <script>
{mp.AFFILIATE_JS}
  </script>
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
</body>
</html>
"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{slug}.html"
    out.write_text(page, encoding="utf-8")
    return out


def pick_lead_tail(r: dict) -> str:
    """Short, data-backed caveat appended to pick leads."""
    bits = []
    if r.get("step") is not None and r["step"] < 70:
        bits.append(f"段差の評価は{r['step']:.0f}点と控えめなので、**敷居や玄関の段差が多い家は注意**してください。")
    elif r.get("carpet") is not None and r["carpet"] < 60:
        bits.append(f"カーペットの評価は{r['carpet']:.0f}点と低めなので、**ラグが多い部屋には向きません**。")
    return "".join(bits)


def top_axes(r: dict, n: int = 2) -> list[tuple[str, float]]:
    vals = [(AXIS_LABEL[k], r[k]) for k, _ in AXES if r.get(k) is not None]
    return sorted(vals, key=lambda x: -x[1])[:n]


def size_chips(r: dict) -> list[str]:
    chips = []
    if r.get("h"):
        chips.append(f"高さ {cm(r['h'])}")
    if r.get("w"):
        chips.append(f"幅×奥行 {wd(r)}")
    if r.get("weight"):
        chips.append(f"重さ {kg(r['weight'])}")
    return chips


def pet_waste_cell(r: dict) -> str:
    if not r.get("has_dims"):
        return '<span class="no">—</span>'
    v = r.get("pet_waste")
    if v is True:
        return '<span class="yes">対応（公式）</span>'
    if v is False:
        return '<span class="no">非対応</span>'
    return '<span class="no">記載なし</span>'


# ---------------------------------------------------------------- articles

def build_thin(rows: list[dict]) -> dict | None:
    sized = [r for r in rows if r.get("h")]
    if len(sized) < 30:
        return None
    hs = sorted(r["h"] for r in sized)
    thr = 90.0 if sum(1 for h in hs if h <= 90) >= 6 else 95.0
    thin = sorted([r for r in sized if r["h"] <= thr], key=lambda r: (r["h"], -(r["overall"] or 0)))
    others = [r for r in sized if r["h"] > thr]
    ultra = [r for r in thin if r["h"] <= 80]
    pool = by_overall(reliable(thin))
    picks = pool[:5]
    min_h = hs[0]
    thinnest = [r for r in sized if r["h"] == min_h]
    med = statistics.median(hs)
    bins = [
        ("8cm以下", lambda h: h <= 80),
        ("8cm超〜9cm", lambda h: 80 < h <= 90),
        ("9cm超〜10cm", lambda h: 90 < h <= 100),
        ("10cm超〜11cm", lambda h: 100 < h <= 110),
        ("11cm超", lambda h: h > 110),
    ]
    bin_rows = [[label, f"{sum(1 for h in hs if fn(h))}機種"] for label, fn in bins]
    lifts = [r for r in sized if r["lift_lidar"]]
    thr_cm = cm(thr)

    step_thin, step_other = mean(r["step"] for r in thin), mean(r["step"] for r in others)
    carpet_thin, carpet_other = mean(r["carpet"] for r in thin), mean(r["carpet"] for r in others)
    ov_thin, ov_other = mean(r["overall"] for r in thin), mean(r["overall"] for r in others)
    climb_thin = mean(r["climb"] for r in thin)
    climb_other = mean(r["climb"] for r in others)
    stations = [r["station"]["h"] for r in thin if r.get("station")]

    sec_std = [
        P(
            f"当サイトに掲載している{len(sized)}機種の本体の高さは、{cm(min_h)}から{cm(hs[-1])}まで幅があり、"
            f"真ん中の値（中央値）は{cm(med)}です。高さの分布は次のとおりです。"
        ),
        mini_table(["本体の高さ", "機種数"], bin_rows),
        P(
            f"本記事では、**高さ{thr_cm}以下を「薄型」**、**8cm以下を「超薄型」**として扱います。"
            f"該当するのは{len(thin)}機種で、そのうち超薄型は{len(ultra)}機種です。"
        ),
        P(
            "背が高くなる主な理由は、**本体の上に載ったレーザーセンサー（LiDAR）**です。"
            "部屋の形を測って効率よく掃除するためのセンサーですが、出っ張りのぶん家具の下に入りにくくなります。"
            "薄型モデルは、センサーを本体に内蔵したり、レーザー以外の方式で走行したりして背を低くしています。"
        ),
    ]
    if lifts:
        sec_std.append(
            P(
                f"{join_ja([plink(r) for r in lifts])}は、レーザーセンサーを本体に格納できるタイプです。"
                "低い家具の下ではセンサーを下げて入り込めるため、**地図の精度と薄さを両立しやすい**のが特長です"
                "（表の高さは格納時の値です）。"
            )
        )

    step_head = f"口コミの段差評価の平均は、薄型{step_thin}点、それ以外の機種{step_other}点で、"
    if step_thin < step_other - 2:
        step_msg = step_head + "**薄型のほうがやや低め**です。"
    elif step_thin > step_other + 2:
        step_msg = step_head + "**薄いからといって段差に弱いわけではありません**。"
    else:
        step_msg = step_head + "**大きな差はありません**。"
    if climb_thin and climb_other:
        step_msg += f"メーカー公表の乗り越えられる段差は、薄型が平均{climb_thin:g}mm、それ以外が平均{climb_other:g}mmです。"
        high_climb = sorted([r for r in thin if (r["climb"] or 0) >= 40], key=lambda r: -r["climb"])
        low_climb = [r for r in thin if r["climb"] and r["climb"] < 20]
        if climb_thin > climb_other + 5 and high_climb:
            step_msg += (
                f"ただし薄型の平均は、{join_ja([f'{r['name']}（{climb_txt(r)}）' for r in high_climb])}が押し上げています。"
                + ("「2段」は、2段になった段差を合計した公表値です。" if any(r["climb2"] for r in high_climb) else "")
            )
            if low_climb:
                step_msg += f"{join_ja(sorted({r['name'] for r in low_climb}))}は{min(r['climb'] for r in low_climb):g}〜{max(r['climb'] for r in low_climb):g}mmです。"
    carpet_msg = ""
    if carpet_thin is not None and carpet_other is not None:
        carpet_msg = f"カーペット評価の平均は薄型{carpet_thin}点、それ以外{carpet_other}点です。"

    points = [
        (
            "家具下の隙間は「本体の高さ＋1cm」を目安にする",
            "隙間と本体の高さがほぼ同じだと、本体の上面が家具に当たり、入り込んだまま動けなくなることがあります。"
            "床から家具のいちばん低い部分までを測り、**本体の高さより1cmほど余裕がある機種**を選ぶと安心です。\n"
            f"測り方は{gl('robot-vacuum-height')}でくわしく解説しています。",
        ),
        (
            "上部センサーの出っ張りを確認する",
            "同じメーカーでも、レーザーセンサーが上に突き出たモデルと、出っ張りのないモデルがあります。"
            "**カタログの「高さ」がセンサーを含んだ値か**を確認しましょう。本記事の高さは、各メーカーの公表値です。",
        ),
        (
            "段差とカーペットの口コミを確かめる",
            step_msg + carpet_msg + "\n"
            "敷居や厚手のラグが多い家では、**高さだけで決めず**、製品ページの段差・カーペットの口コミもあわせて確認してください。",
        ),
        (
            "ステーションの置き場所も考える",
            (
                f"本体が薄くても、ゴミ収集やモップ洗浄の**ステーションは別に置き場所が必要**です。"
                f"薄型{len(thin)}機種のうち公表値がわかるものでは、充電台・ステーションの高さは{cm(min(stations))}〜{cm(max(stations))}です。"
                if stations else
                "本体が薄くても、ゴミ収集やモップ洗浄の**ステーションは別に置き場所が必要**です。"
            )
            + "壁ぎわのスペースもあわせて確認しましょう。",
        ),
    ]

    cards = []
    for i, r in enumerate(picks, 1):
        lead = (
            f"本体の高さは{cm(r['h'])}、幅×奥行は{wd(r)}です。"
            f"高さ{thr_cm}以下で口コミ{MIN_REVIEWS}件以上の{len(pool)}機種のなかで、**総合点が{ordinal(i)}高い**機種です（{r['overall']:.1f}点）。"
        )
        ax = top_axes(r)
        if ax:
            lead += f"口コミでは**{ax[0][0]}（{ax[0][1]:.0f}点）や{ax[1][0]}（{ax[1][1]:.0f}点）の評価が高め**です。"
        if r.get("pet_waste") is True:
            lead += "ペットの排泄物を認識して避ける機能もメーカーが公表しています。"
        lead += pick_lead_tail(r)
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}（高さ{cm(r['h'])}）", lead, r, size_chips(r)))

    table = data_table(
        [
            ("製品", product_cell),
            ("高さ", lambda r: f"<strong>{cm(r['h'])}</strong>"),
            ("幅×奥行", wd),
            ("総合点", lambda r: sc_cell(r["overall"], 1)),
            ("段差（口コミ）", lambda r: sc_cell(r["step"])),
            ("段差（公表）", climb_txt),
            ("口コミ数", lambda r: f"{r['reviews']:,}件"),
            ("価格", lambda r: yen(r["price"])),
        ],
        thin,
        "薄型ロボット掃除機の高さ比較表",
    )

    conclusion = conclusion_box(
        f"結論：高さ{thr_cm}以下で選ぶならこの3台",
        [
            (f"{i}位", r, f"高さ{cm(r['h'])}・総合点{r['overall']:.1f}点・口コミ{r['reviews']}件。", f"pick-{i}")
            for i, r in enumerate(picks[:3], 1)
        ],
    )

    faqs = [
        (
            "いちばん薄いロボット掃除機はどれですか？",
            f"当サイト掲載{len(sized)}機種では、{join_ja([plink(r) for r in thinnest])}の**{cm(min_h)}が最も薄い**機種です（メーカー公表値）。",
        ),
        (
            "ソファの下の隙間が10cmでも入りますか？",
            "本体の高さに1cmほど余裕がある機種を選ぶと安心です。"
            f"隙間が10cmなら**高さ9cm以下が目安**で、当サイト掲載機種では{sum(1 for h in hs if h <= 90)}機種が当てはまります。",
        ),
        (
            "薄型だと掃除の性能は落ちますか？",
            f"口コミ分析の総合点の平均は、薄型が{ov_thin}点、それ以外の機種が{ov_other}点です。"
            + ("**平均では大きな差はなく**、薄型でも評価の高い機種はあります。" if ov_thin and ov_other and abs(ov_thin - ov_other) < 3
               else "平均には差があるため、**薄さだけでなく総合点もあわせて比べる**のがおすすめです。"),
        ),
        (
            "家具の下で止まってしまうのを防ぐ方法は？",
            "**隙間に余裕のある機種を選ぶ**のが基本です。それでも引っかかる場合は、アプリで進入禁止エリアを設定できる機種なら、その家具の下だけ入らないようにできます。",
        ),
    ]
    if lifts:
        faqs.append(
            (
                "格納式のレーザーセンサーとは何ですか？",
                "本体上部のレーザーセンサーを下げて、**背を低くできる仕組み**です。"
                f"当サイト掲載機種では{join_ja([r['name'] for r in lifts])}が該当します。",
            )
        )

    summary = f"""
        <div class="summary-box">
          {P(f"家具の下まで掃除したいなら、まず隙間を測り、**本体の高さ＋1cmを目安**に選びましょう。高さ{thr_cm}以下の薄型は{len(thin)}機種あり、総合点で選ぶなら**{plink(picks[0])}が最有力**です。")}
          {P("薄型は段差やステーションの置き場所にも違いが出やすいため、気になる機種は製品ページの口コミもあわせて確認してください。")}
          <ul>
            <li>全機種の高さを一覧で見る → {prose(gl('robot-vacuum-height'))}</li>
            <li>本体の幅で選ぶ → {prose(gl('robot-vacuum-small'))}</li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-thin",
        "crumb": "薄型ロボット掃除機",
        "title": f"薄型ロボット掃除機のおすすめ{len(picks)}選｜高さ{thr_cm}以下を口コミで比較【{YEAR}年】",
        "h1": f"薄型ロボット掃除機のおすすめ｜高さ{thr_cm}以下の機種を口コミ分析で比較",
        "description": (
            f"ソファやベッドの下に入る薄型ロボット掃除機を、メーカー公表の本体の高さと口コミ分析で比較。"
            f"高さ{thr_cm}以下の{len(thin)}機種から、総合点・段差・口コミ件数でおすすめを選びました。"
        ),
        "lede": (
            f"家具の下に入るかどうかは**「本体の高さ」で決まります**。掲載{len(sized)}機種の高さをメーカー公表値で調べ、"
            "薄型モデルだけを口コミ分析の点数で比べました。"
        ),
        "chips": [f"高さ{thr_cm}以下・{len(thin)}機種", "メーカー公表値＋口コミ分析"],
        "know": [
            ("薄型と呼べる高さの目安", f"掲載{len(sized)}機種の高さの分布から、薄型の基準を数字で示します。"),
            (f"高さ{thr_cm}以下のおすすめ機種", "総合点と口コミ信頼度で、薄型モデルから失敗しにくい機種を選びました。"),
            ("薄型ならではの注意点", "段差やステーションなど、薄さと引きかえになりやすい点を口コミから確認します。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ソファやベッドの下は、ホコリがたまりやすいのに掃除機が届きにくい場所です。"
            "ロボット掃除機に任せたいなら、**本体が家具の下に入るかどうか**がいちばんの分かれ目になります。",
            "本記事では、メーカーが公表している本体の高さと、ナットクLaboが分析した口コミの点数を組み合わせて、"
            "薄型ロボット掃除機のおすすめを紹介します。",
        ],
        "sections": [
            ("standard", "薄型ロボット掃除機の高さの目安", "".join(sec_std)),
            ("points", "薄型を選ぶときの4つのチェックポイント", points_list(points)),
            ("picks", f"薄型ロボット掃除機のおすすめ{len(picks)}選", P(
                f"高さ{thr_cm}以下・口コミ{MIN_REVIEWS}件以上の機種を、総合点の高い順に紹介します。"
            ) + f'<div class="articles">{"".join(cards)}</div>'),
            ("table", "薄型ロボット掃除機の高さ比較表", P(
                f"高さ{thr_cm}以下の{len(thin)}機種を、薄い順に並べました。口コミが少ない機種も参考として載せています。"
            ) + table),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": [f"本体の高さ・寸法・乗り越えられる段差は、メーカー公式サイト等の公表値です（{thin[0]['dim_checked']}確認）。"],
        "sources": thin,
    }


def build_height(rows: list[dict]) -> dict | None:
    sized = sorted([r for r in rows if r.get("h")], key=lambda r: (r["h"], r["name"]))
    if len(sized) < 30:
        return None
    missing = [r for r in rows if not r.get("h")]
    hs = [r["h"] for r in sized]
    avg_h = statistics.mean(hs)
    med = statistics.median(hs)
    rel_sized = reliable(sized)

    gaps = [(9, 80.0), (10, 90.0), (11, 100.0), (12, 110.0)]
    gap_html = []
    picks: list[dict] = []
    cards = []
    used: set[str] = set()
    for gap, max_h in gaps:
        fits = [r for r in sized if r["h"] <= max_h]
        best = next((r for r in by_overall(reliable(fits)) if r["id"] not in used), None)
        gap_html.append(f"<h3>隙間{gap}cmなら：高さ{cm(max_h)}以下の{len(fits)}機種</h3>")
        if fits:
            gap_html.append(chips_links(fits if len(fits) <= 14 else by_overall(fits)[:14]))
            if len(fits) > 14:
                gap_html.append(P(f"ほか{len(fits) - 14}機種。全機種は下の高さ一覧表で確認できます。"))
        if best:
            used.add(best["id"])
            picks.append(best)
            aid = f"gap-{gap}"
            gap_html.append(P(f"この条件で総合点が最も高いのは**[{best['name']}](#{aid})**（高さ{cm(best['h'])}・総合点{best['overall']:.1f}点）です。"))
            lead = (
                f"本体の高さは{cm(best['h'])}で、**隙間{gap}cmの家具下にも入ります**。"
                f"高さ{cm(max_h)}以下で口コミ{MIN_REVIEWS}件以上の機種のなかで、**総合点が最も高い**機種です（{best['overall']:.1f}点）。"
                f"幅×奥行は{wd(best)}です。"
            ) + pick_lead_tail(best)
            cards.append(pick_card(aid, f"隙間{gap}cmなら：{best['name']}（高さ{cm(best['h'])}）", lead, best, size_chips(best)))

    no_enter = [r for r in sized if re.search(r"進入(しない|できない)", r["dim_note"])]
    measure = """
        <ol class="steps">
          <li><strong>床から家具のいちばん低い部分までを測る。</strong>脚の付け根ではなく、天板の裏の横木や幕板など、出っ張っている部分の下端が基準です。</li>
          <li><strong>手前だけでなく奥や中央も測る。</strong>ベッドやソファは中央に補強材があり、奥のほうが低いことがあります。</li>
          <li><strong>ラグの上なら厚みを差し引く。</strong>毛足の長いラグでは、本体が沈んだり浮いたりして実際の余裕が変わります。</li>
          <li><strong>「本体の高さ＋1cm」以上あるか確認する。</strong>ぎりぎりだと上面が当たって止まる原因になります。</li>
        </ol>"""

    sec_avg = [
        P(
            f"当サイトに掲載している{len(sized)}機種（メーカー公表値）の本体の高さは、**平均{cm(round(avg_h, 1))}**、"
            f"**中央値{cm(med)}**です。最も低い機種は{cm(hs[0])}、最も高い機種は{cm(hs[-1])}でした。"
        ),
        P(
            "高さを大きく左右するのは、**本体の上に載ったレーザーセンサー（LiDAR）の出っ張り**です。"
            "センサーを内蔵した機種や、レーザー以外の方式で走行する機種は背が低く、家具の下に入りやすくなります。"
        ),
        P(
            f"迷ったら、**ソファやベッドの下が{cm(round(med) + 10)}以上あるか**を確認しましょう。"
            "中央値に1cmの余裕を足した高さで、これだけあれば掲載機種の半数以上が入ります。"
            f"それより低い場合は、{gl('robot-vacuum-thin')}から選ぶのが近道です。"
        ),
    ]
    sec_measure = [
        P("同じ「高さ10cm」の家具でも、測る場所によって数値が変わります。次の順番で測ると失敗しにくくなります。"),
        measure,
    ]
    if no_enter:
        sec_measure.append(
            f'<div class="callout">{P("機種によっては、センサーが低い隙間を検知して、**あえて家具の下に入らない仕様**のものもあります。" + "メーカーの注意書きで確認できた例：" + join_ja([plink(r) for r in no_enter]) + "。")}</div>'
        )

    widths = [r["foot"] for r in sized if r.get("foot")]
    weights = [r["weight"] for r in sized if r.get("weight")]
    st_h = [r["station"]["h"] for r in sized if r.get("station")]
    climbs = [r["climb"] for r in sized if r.get("climb")]
    other_points = [
        (
            "本体の幅（直径）",
            f"掲載機種の本体の幅・奥行のうち長いほうは{cm(min(widths))}〜{cm(max(widths))}です。**椅子の脚の間や家具のすき間を通れるか**は、こちらで決まります。"
            f"くわしくは{gl('robot-vacuum-small')}で比較しています。" if widths else "",
        ),
        (
            "重さ",
            f"本体の重さは{kg(min(weights))}〜{kg(max(weights))}です。2階建てで本体を持ち運ぶなら、**軽い機種のほうが負担は少なく**なります。" if weights else "",
        ),
        (
            "乗り越えられる段差",
            f"メーカー公表の段差は{mm(min(climbs))}〜{mm(max(climbs))}です。"
            "表で「2段」とある機種は、2段になった段差を合計した値で、**1段の段差ならこれより低く**なります。"
            "数値は理想的な条件での値なので、**口コミの段差評価もあわせて確認**しましょう。" if climbs else "",
        ),
        (
            "ステーションの高さ",
            f"充電台やステーションの高さは、公表値がわかる機種で{cm(min(st_h))}〜{cm(max(st_h))}です。"
            "自動ゴミ収集やモップ洗浄の機能が付くほど大きくなり、棚の下などに置く場合は**本体よりもこちらが問題になりがち**です。" if st_h else "",
        ),
    ]
    other_points = [p for p in other_points if p[1]]

    table = data_table(
        [
            ("製品", product_cell),
            ("高さ", lambda r: f"<strong>{cm(r['h'])}</strong>"),
            ("幅×奥行", wd),
            ("重さ", lambda r: kg(r["weight"])),
            ("段差（公表）", climb_txt),
            ("総合点", lambda r: sc_cell(r["overall"], 1)),
            ("価格", lambda r: yen(r["price"])),
        ],
        sized,
        "ロボット掃除機の高さ一覧表",
    )
    table_intro = P(f"掲載{len(sized)}機種を、本体の低い順に並べました。高さはメーカー公表値です。")
    if missing:
        table_intro += P(f"{join_ja([r['name'] for r in missing])}は、公表値を確認できなかったため表から外しています。")

    irobot = [r for r in sized if r["maker"]["id"] == "iRobot"]
    faqs = [
        (
            "ロボット掃除機の高さの平均はどれくらいですか？",
            f"当サイト掲載{len(sized)}機種の**平均は{cm(round(avg_h, 1))}**、中央値は{cm(med)}です（メーカー公表値）。",
        ),
        (
            "家具の下に入るには、隙間が何cmあればいいですか？",
            "**本体の高さ＋1cmが目安**です。たとえば高さ9cmの機種なら、隙間は10cm以上あると安心です。",
        ),
    ]
    if irobot:
        faqs.append(
            (
                "ルンバの高さはどれくらいですか？",
                "当サイト掲載のルンバは、" + "、".join(f"{r['name']}が{cm(r['h'])}" for r in irobot) + "です（メーカー公表値）。",
            )
        )
    faqs.append(
        (
            "家具の下で止まってしまうのを防ぐには？",
            "**隙間に余裕のある機種を選ぶ**のが基本です。それでも引っかかる場合は、アプリで進入禁止エリアを設定するか、家具の脚にかさ上げ材を使って隙間を広げる方法があります。",
        )
    )

    conclusion = conclusion_box(
        "結論：家具下の隙間に合わせて選ぶ",
        [(f"隙間{g}cm", r, f"高さ{cm(r['h'])}・総合点{r['overall']:.1f}点。", f"gap-{g}") for (g, _), r in zip(gaps, picks)][:3],
    )

    summary = f"""
        <div class="summary-box">
          {P(f"ロボット掃除機の高さは平均{cm(round(avg_h, 1))}です。家具の下を掃除させたいなら、隙間を正しく測り、**本体の高さ＋1cmを目安**に選びましょう。")}
          <ul>
            <li>薄型モデルのおすすめを見る → {prose(gl('robot-vacuum-thin'))}</li>
            <li>本体の幅で選ぶ → {prose(gl('robot-vacuum-small'))}</li>
            <li>全機種を性能で比べる → <a href="/rankings/">機能別ランキング</a></li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-height",
        "crumb": "ロボット掃除機の高さ",
        "title": f"ロボット掃除機の高さ一覧｜家具下の隙間の測り方と全{len(sized)}機種を比較【{YEAR}年】",
        "h1": f"ロボット掃除機の高さ一覧｜家具下の隙間の測り方と全{len(sized)}機種の比較",
        "description": (
            f"ロボット掃除機{len(sized)}機種の本体の高さをメーカー公表値で一覧化。平均{cm(round(avg_h, 1))}・最薄{cm(hs[0])}などの目安と、"
            "ソファやベッド下の隙間の測り方、隙間別に入る機種を紹介します。"
        ),
        "lede": (
            f"ソファやベッドの下に入るかは、本体の高さと家具下の隙間で決まります。掲載{len(sized)}機種の高さを一覧にし、"
            "隙間の測り方と、隙間ごとに入る機種をまとめました。"
        ),
        "chips": [f"全{len(sized)}機種の高さ", "メーカー公表値"],
        "know": [
            ("ロボット掃除機の高さの平均", f"掲載{len(sized)}機種の平均・最小・最大を数字で示します。"),
            ("家具下の隙間の正しい測り方", "測る場所と余裕の目安を、手順に沿って解説します。"),
            ("隙間別に入る機種と高さ一覧表", "隙間9〜12cmごとに入る機種と、全機種の高さを一覧で確認できます。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "「買ったのにソファの下に入らなかった」「家具の下で止まってしまう」というのは、ロボット掃除機でよくある失敗です。"
            "原因のほとんどは、**本体の高さと家具下の隙間が合っていない**ことにあります。",
            "本記事では、ナットクLaboに掲載している機種の高さをメーカー公表値で調べ、一覧表にまとめました。"
            "口コミ分析の総合点もあわせて載せているので、入る機種のなかから評価の高いものを選べます。",
        ],
        "sections": [
            ("average", "ロボット掃除機の高さの平均と目安", "".join(sec_avg)),
            ("measure", "家具下の隙間の測り方", "".join(sec_measure)),
            ("by-gap", "隙間別｜家具の下に入るロボット掃除機", P(
                "家具下の隙間ごとに、入る機種（本体の高さ＋1cm以内）と、そのなかで総合点が最も高い機種をまとめました。"
            ) + "".join(gap_html)),
            ("picks", "隙間別のおすすめ機種", f'<div class="articles">{"".join(cards)}</div>'),
            ("table", f"全{len(sized)}機種の高さ一覧表", table_intro + table),
            ("other", "高さ以外に確認したい寸法", points_list(other_points)),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": [f"本体の高さ・寸法・重さ・段差は、メーカー公式サイト等の公表値です（{sized[0]['dim_checked']}確認）。"],
        "sources": sized,
    }


def build_small(rows: list[dict]) -> dict | None:
    sized = [r for r in rows if r.get("foot")]
    if len(sized) < 30:
        return None
    foots = sorted(r["foot"] for r in sized)
    thr = next(
        (t for t in (300.0, 320.0, 330.0, 340.0) if len(reliable([r for r in sized if r["foot"] <= t])) >= 4),
        340.0,
    )
    compact = sorted([r for r in sized if r["foot"] <= thr], key=lambda r: (r["foot"], r["h"] or 0))
    others = [r for r in sized if r["foot"] > thr]
    pool = by_overall(reliable(compact))
    picks = pool[:5]
    smallest = [r for r in sized if r["foot"] == foots[0]]
    med = statistics.median(foots)
    batt_c, batt_o = mean(r["battery"] for r in compact), mean(r["battery"] for r in others)
    ov_c, ov_o = mean(r["overall"] for r in compact), mean(r["overall"] for r in others)
    apt = [r for r in pool if r.get("apartment") is not None]
    apt_best = max(apt, key=lambda r: (r["apartment"], r["overall"])) if apt else None
    st_rows = [r for r in compact if r.get("station")]
    thr_cm = cm(thr)

    bins = [
        ("30cm以下", lambda f: f <= 300),
        ("30cm超〜33cm", lambda f: 300 < f <= 330),
        ("33cm超〜35cm", lambda f: 330 < f <= 350),
        ("35cm超", lambda f: f > 350),
    ]
    sec_std = [
        P(
            f"ロボット掃除機の大きさは、**本体の幅と奥行のうち長いほう（丸型なら直径）**で比べるのがわかりやすいです。"
            f"当サイト掲載{len(sized)}機種では{cm(foots[0])}〜{cm(foots[-1])}で、中央値は{cm(med)}でした。"
        ),
        mini_table(["本体の幅・奥行（長いほう）", "機種数"], [[l, f"{sum(1 for f in foots if fn(f))}機種"] for l, fn in bins]),
        P(f"本記事では、**{thr_cm}以下の機種を「小さいロボット掃除機」**として紹介します。該当するのは{len(compact)}機種です。"),
    ]
    merits = [
        (
            "椅子の脚や家具のすき間に入り込める",
            "ダイニングチェアの脚の間や、ソファと壁のすき間など、**大きな機種では入れない場所まで届きます**。"
            "物が多い部屋でも、障害物の間をすり抜けやすくなります。",
        ),
        (
            "ワンルームや狭い部屋でも置き場所に困りにくい",
            "本体が小さいと、充電台やステーションを置いたときの**圧迫感も抑えられます**。"
            + (f"小さい機種のうち公表値がわかるものでは、充電台・ステーションの高さは{cm(min(r['station']['h'] for r in st_rows))}〜{cm(max(r['station']['h'] for r in st_rows))}です。" if st_rows else ""),
        ),
        (
            "バッテリーや連続運転は口コミで確認する",
            (f"口コミのバッテリー評価の平均は、小さい機種が{batt_c}点、それ以外が{batt_o}点です。" if batt_c is not None and batt_o is not None else "")
            + "広い家や部屋数の多い家では、途中で充電に戻る回数が増えることがあります。**ワンルーム〜2LDK程度なら気になりにくい**でしょう。",
        ),
    ]

    cards = []
    for i, r in enumerate(picks, 1):
        lead = (
            f"本体の幅×奥行は{wd(r)}、高さは{cm(r['h'])}です。"
            f"{thr_cm}以下で口コミ{MIN_REVIEWS}件以上の{len(pool)}機種のなかで、**総合点が{ordinal(i)}高い**機種です（{r['overall']:.1f}点）。"
        )
        if r.get("apartment") is not None and r["apartment"] >= 85:
            lead += f"マンション・集合住宅との相性を示す適合度も{r['apartment']:.0f}点と高めです。"
        lead += pick_lead_tail(r)
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}（幅{cm(r['foot'])}）", lead, r, size_chips(r)))

    table = data_table(
        [
            ("製品", product_cell),
            ("幅×奥行", lambda r: f"<strong>{wd(r)}</strong>"),
            ("高さ", lambda r: cm(r["h"])),
            ("重さ", lambda r: kg(r["weight"])),
            ("ステーション（幅×奥行×高さ）", lambda r: (
                f"{_cm_num(r['station']['w'])}×{_cm_num(r['station']['d'])}×{_cm_num(r['station']['h'])}cm"
                if r.get("station") and r["station"].get("w") and r["station"].get("d") else "—"
            )),
            ("総合点", lambda r: sc_cell(r["overall"], 1)),
            ("バッテリー", lambda r: sc_cell(r["battery"])),
            ("価格", lambda r: yen(r["price"])),
        ],
        compact,
        "小さいロボット掃除機のサイズ比較表",
    )

    conclusion = conclusion_box(
        f"結論：本体{thr_cm}以下で選ぶならこの3台",
        [(f"{i}位", r, f"幅×奥行{wd(r)}・総合点{r['overall']:.1f}点。", f"pick-{i}") for i, r in enumerate(picks[:3], 1)],
    )

    faqs = [
        (
            "いちばん小さいロボット掃除機はどれですか？",
            f"当サイト掲載{len(sized)}機種では、{join_ja([plink(r) for r in smallest])}の**{wd(smallest[0])}が最も小さい**機種です（メーカー公表値）。",
        ),
        (
            "小さいロボット掃除機は性能が低いですか？",
            f"口コミ分析の総合点の平均は、小さい機種が{ov_c}点、それ以外が{ov_o}点です。"
            "**小さくても評価の高い機種はある**ので、大きさと総合点の両方で比べるのがおすすめです。",
        ),
        (
            "一人暮らしにはどの機種が向いていますか？",
            (f"マンション・集合住宅との相性（適合度）が最も高いのは**{plink(apt_best)}**（{apt_best['apartment']:.0f}点）です。" if apt_best else "")
            + "ワンルームなら、本体の小ささに加えて静音性や価格もあわせて比べると選びやすくなります。"
            + f"予算重視なら{gl('robot-vacuum-cheap')}も参考にしてください。",
        ),
        (
            "薄さも重視したい場合は？",
            f"家具の下に入るかは**幅ではなく高さで決まります**。{gl('robot-vacuum-thin')}や{gl('robot-vacuum-height')}で確認してください。",
        ),
    ]

    summary = f"""
        <div class="summary-box">
          {P(f"小さいロボット掃除機は、**椅子の脚まわりや狭い部屋の掃除に向いています**。本体{thr_cm}以下の{len(compact)}機種のうち、総合点で選ぶなら**{plink(picks[0])}が最有力**です。")}
          <ul>
            <li>高さ（薄さ）で選ぶ → {prose(gl('robot-vacuum-thin'))}</li>
            <li>予算で選ぶ → {prose(gl('robot-vacuum-cheap'))}</li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-small",
        "crumb": "小さいロボット掃除機",
        "title": f"小さいロボット掃除機のおすすめ{len(picks)}選｜コンパクトな機種を口コミで比較【{YEAR}年】",
        "h1": "小さいロボット掃除機のおすすめ｜本体の幅とステーションの大きさで比較",
        "description": (
            f"小さいロボット掃除機を、メーカー公表の本体サイズと口コミ分析で比較。幅・奥行{thr_cm}以下の{len(compact)}機種から、"
            "総合点・バッテリー・ステーションの大きさを見ておすすめを選びました。"
        ),
        "lede": (
            f"椅子の脚まわりや狭い部屋には、本体の小さいロボット掃除機が向いています。掲載{len(sized)}機種のサイズを調べ、"
            "コンパクトな機種を口コミ分析の点数で比べました。"
        ),
        "chips": [f"幅{thr_cm}以下・{len(compact)}機種", "メーカー公表値＋口コミ分析"],
        "know": [
            ("「小さい」の目安になるサイズ", f"掲載{len(sized)}機種の本体サイズの分布から、コンパクトの基準を示します。"),
            ("小さい機種のメリットと注意点", "すき間に入れる良さと、バッテリーなど気をつけたい点を口コミから確認します。"),
            ("小さいロボット掃除機のおすすめ", "総合点と口コミ信頼度で、失敗しにくい機種を選びました。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ロボット掃除機は、機種によって本体の大きさが意外と違います。"
            "数cmの差でも、**椅子の脚の間を通れるか、家具のすき間に入れるか**が変わり、掃除の仕上がりに影響します。",
            "本記事では、メーカー公表の本体サイズとナットクLaboの口コミ分析をもとに、小さいロボット掃除機のおすすめを紹介します。",
        ],
        "sections": [
            ("standard", "小さいロボット掃除機のサイズの目安", "".join(sec_std)),
            ("merits", "小さいロボット掃除機のメリットと注意点", points_list(merits)),
            ("picks", f"小さいロボット掃除機のおすすめ{len(picks)}選", P(
                f"本体{thr_cm}以下・口コミ{MIN_REVIEWS}件以上の機種を、総合点の高い順に紹介します。"
            ) + f'<div class="articles">{"".join(cards)}</div>'),
            ("table", "小さいロボット掃除機のサイズ比較表", P(
                f"本体{thr_cm}以下の{len(compact)}機種を、小さい順に並べました。"
            ) + table),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": [f"本体・ステーションの寸法と重さは、メーカー公式サイト等の公表値です（{compact[0]['dim_checked']}確認）。"],
        "sources": compact,
    }


def build_cheap(rows: list[dict]) -> dict:
    cheap = sorted([r for r in rows if r["price"] <= 50000], key=lambda r: r["price"])
    others = [r for r in rows if r["price"] > 50000]
    pool = by_overall(reliable(cheap))
    picks = pool[:6]
    groups = [
        ("3万円以下", 0, 30000),
        ("3万円台", 30001, 39999),
        ("4万円台", 40000, 50000),
    ]
    group_rows = []
    for label, lo, hi in groups:
        cands = by_overall(reliable([r for r in cheap if lo <= r["price"] <= hi]))
        if cands:
            b = cands[0]
            group_rows.append([label, f'<a href="/products/{b["id"]}">{html.escape(b["name"])}</a>', yen(b["price"]), f"{b['overall']:.1f}点", f"{b['reviews']}件"])
    diffs = []
    for k, label in AXES:
        a, b = mean(r[k] for r in cheap), mean(r[k] for r in others)
        if a is not None and b is not None:
            diffs.append((label, a, b, round(b - a, 1)))
    diffs.sort(key=lambda x: -x[3])
    few = [r for r in cheap if r["reviews"] < MIN_REVIEWS]
    weak = [r for r in reliable(cheap) if (r["carpet"] is not None and r["carpet"] < 60) or (r["step"] is not None and r["step"] < 65)]
    upkeep = sorted([r for r in cheap if r["annual"] >= 25000], key=lambda r: -r["annual"])
    mop_reviewed = [r for r in reliable(cheap) if "水拭き" in r["floor_comment_full"]]

    sec_market = [
        P(
            f"当サイトに掲載しているロボット掃除機のうち、**5万円以下で買えるのは{len(cheap)}機種**です。"
            f"最も安い機種は{yen(cheap[0]['price'])}（{cheap[0]['name']}）でした。"
        ),
        P(
            "5万円を超える機種と比べて、口コミの点数がどこで下がりやすいかを性能ごとに並べると、次のようになります。"
        ),
        mini_table(
            ["性能", "5万円以下の平均", "5万円超の平均", "差"],
            [[l, f"{a}点", f"{b}点", f"{d:+.1f}"] for l, a, b, d in diffs],
        ),
        P(
            f"**差が大きいのは{diffs[0][0]}と{diffs[1][0]}**です。"
            f"反対に**{diffs[-1][0]}は差が小さく**、安い機種でも十分な評価を得ています。"
            "安いモデルを選ぶときは、差が出やすい性能が自分の家で重要かどうかを考えると失敗しにくくなります。"
        ),
    ]

    points = [
        (
            "口コミの件数と信頼度で「当たり外れ」を避ける",
            "安い機種は口コミが少なく、**評価が安定していない**こともあります。"
            f"本記事では、**口コミ{MIN_REVIEWS}件以上の機種だけ**をおすすめに選んでいます。"
            + (f"5万円以下で口コミが{MIN_REVIEWS}件未満の機種は{join_ja([f'{r['name']}（{r['reviews']}件）' for r in few])}です。" if few else ""),
        ),
        (
            "カーペットや段差が多い家は要注意",
            "安い機種は、**カーペットの清掃や段差の乗り越えで評価が分かれやすい**傾向があります。"
            + (f"口コミ{MIN_REVIEWS}件以上の機種のうち、カーペット60点未満または段差65点未満なのは{join_ja([f'{r['name']}' for r in weak])}です。" if weak else ""),
        ),
        (
            "本体価格だけでなく消耗品代も見る",
            "ゴミパックやモップ、ブラシなどの消耗品は、**機種によって年間の費用が大きく違います**。"
            + (f"5万円以下でも、{join_ja([f'{r['name']}（年{yen(r['annual'])}）' for r in upkeep[:3]])}のように消耗品代が高めの機種があります。" if upkeep else "")
            + f"\n本体と消耗品を合わせた総額は{gl('robot-vacuum-cost-performance')}で比べています。",
        ),
    ]

    cards = []
    for i, r in enumerate(picks, 1):
        ax = top_axes(r)
        lead = (
            f"{yen(r['price'])}で、5万円以下・口コミ{MIN_REVIEWS}件以上の{len(pool)}機種のなかで**総合点が{ordinal(i)}高い**機種です（{r['overall']:.1f}点）。"
        )
        if ax:
            lead += f"特に**{ax[0][0]}（{ax[0][1]:.0f}点）と{ax[1][0]}（{ax[1][1]:.0f}点）の口コミ評価が高め**です。"
        lead += f"消耗品代の目安は年{yen(r['annual'])}です。" + pick_lead_tail(r)
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}（{yen(r['price'])}）", lead, r))

    table = data_table(
        [
            ("製品", product_cell),
            ("価格", lambda r: f"<strong>{yen(r['price'])}</strong>"),
            ("総合点", lambda r: sc_cell(r["overall"], 1)),
            ("口コミ信頼度", lambda r: sc_cell(r["rel"], 1)),
            ("口コミ数", lambda r: f"{r['reviews']:,}件"),
            ("フローリング", lambda r: sc_cell(r["floor"])),
            ("カーペット", lambda r: sc_cell(r["carpet"])),
            ("静音性", lambda r: sc_cell(r["quiet"])),
            ("消耗品／年", lambda r: yen(r["annual"]) if r["annual"] else "—"),
        ],
        cheap,
        "5万円以下のロボット掃除機比較表",
    )

    conclusion = conclusion_box(
        "結論：5万円以下ならこの3台",
        [(f"{i}位", r, f"総合点{r['overall']:.1f}点・口コミ{r['reviews']}件・信頼度{r['rel']:.1f}。", f"pick-{i}") for i, r in enumerate(picks[:3], 1)],
    )

    faqs = [
        (
            "1万円台のロボット掃除機はどうですか？",
            f"当サイトの分析対象で最も安いのは{yen(cheap[0]['price'])}の{plink(cheap[0])}で、**1万円台の機種は分析していません**。"
            "価格だけで選ぶと、口コミが少なく評価が安定しない機種に当たることもあるため、**口コミの件数もあわせて確認する**のがおすすめです。",
        ),
        (
            "安いロボット掃除機でも水拭きはできますか？",
            (f"5万円以下でも、口コミで**水拭きが評価されている機種があります**（{join_ja([plink(r) for r in mop_reviewed[:5]])}など）。" if mop_reviewed else "")
            + "ただし、モップの自動洗浄まで付いた全自動モデルは**5万円を超える機種が中心**です。",
        ),
        (
            "安い機種と高い機種のいちばんの違いは何ですか？",
            f"口コミの点数で差が大きいのは**{diffs[0][0]}と{diffs[1][0]}**です（平均{diffs[0][3]:+.1f}点差・{diffs[1][3]:+.1f}点差）。"
            f"一方、{diffs[-1][0]}の差は{diffs[-1][3]:+.1f}点で、安い機種でも十分な評価を得ています。",
        ),
        (
            "セールで安く買える時期はありますか？",
            "**大手ECサイトの大型セール**（Amazonのプライムデーやブラックフライデー、楽天市場のスーパーセールなど）では、ロボット掃除機も値下げされることがあります。"
            "本記事の価格はメーカー公式ストアの通常の販売価格なので、購入前に最新価格を確認してください。",
        ),
    ]

    summary = f"""
        <div class="summary-box">
          {P(f"5万円以下でも、口コミの評価が高いロボット掃除機はあります。総合点で選ぶなら**{plink(picks[0])}が最有力**です。")}
          {P("安い機種は**カーペット・段差・消耗品代で差が出やすい**ので、自分の家で重要なポイントを確認してから選びましょう。")}
          <ul>
            <li>維持費まで含めて比べる → {prose(gl('robot-vacuum-cost-performance'))}</li>
            <li>5万円以下の全機種を表で比べる → <a href="/compare/robot-vacuum-under-5man">〜5万円の徹底比較</a></li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-cheap",
        "crumb": "安いロボット掃除機",
        "title": f"安いロボット掃除機のおすすめ{len(picks)}選｜5万円以下を口コミで比較【{YEAR}年】",
        "h1": "安いロボット掃除機のおすすめ｜3万円以下・5万円以下を口コミ分析で比較",
        "description": (
            f"5万円以下で買える安いロボット掃除機{len(cheap)}機種を、２大ECサイトの口コミ分析で比較。"
            "3万円以下・4万円台など予算別のおすすめと、安いモデルで妥協しやすいポイントを解説します。"
        ),
        "lede": (
            f"5万円以下で買えるロボット掃除機{len(cheap)}機種を、口コミ分析の点数で比べました。"
            "安いモデルで差が出やすい性能や、消耗品代まで含めた選び方も解説します。"
        ),
        "chips": [f"5万円以下・{len(cheap)}機種", "口コミ分析"],
        "know": [
            ("安いモデルで差が出やすい性能", "5万円以下と5万円超の口コミ評価を、性能ごとに比べます。"),
            ("5万円以下のおすすめランキング", f"口コミ{MIN_REVIEWS}件以上の機種から、総合点の高い順に紹介します。"),
            ("安さだけで選ぶと後悔しやすい点", "口コミの少なさ・苦手な床・消耗品代など、事前に確認したい点をまとめました。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ロボット掃除機は10万円を超える全自動モデルが話題になりがちですが、毎日の床掃除を任せるだけなら、**5万円以下でも十分に満足できる機種**があります。",
            "一方で、安いモデルには苦手な床や消耗品代など、**買ってから気づく違い**もあります。"
            "本記事では、ナットクLaboの口コミ分析をもとに、5万円以下のロボット掃除機のおすすめと選び方を紹介します。",
        ],
        "sections": [
            ("market", "安いロボット掃除機の価格帯と特徴", "".join(sec_market)),
            ("points", "安いロボット掃除機を選ぶときの3つのポイント", points_list(points)),
            ("picks", f"安いロボット掃除機のおすすめ{len(picks)}選", P(
                f"5万円以下・口コミ{MIN_REVIEWS}件以上の機種を、総合点の高い順に紹介します。"
            ) + f'<div class="articles">{"".join(cards)}</div>'),
            ("budget", "予算別の最有力機種", P("予算の上限ごとに、総合点が最も高い機種をまとめました。")
             + mini_table(["予算", "機種", "価格", "総合点", "口コミ数"], group_rows)),
            ("table", "5万円以下のロボット掃除機比較表", P(
                f"5万円以下の{len(cheap)}機種を、安い順に並べました。"
            ) + table),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": ["消耗品代は、ゴミパック・モップ・ブラシなどを推奨周期で交換した場合の年間目安です。"],
    }


def build_cost(rows: list[dict]) -> dict:
    rel_rows = reliable(rows)
    qualified = sorted([r for r in rel_rows if r["overall"] >= 85], key=lambda r: (r["tco3"], -r["overall"]))
    picks = qualified[:5]
    cheapest = min(rows, key=lambda r: r["price"])
    annuals = [r["annual"] for r in rows if r["annual"]]
    band_rows = []
    hrefs = {
        "band-under5": "/compare/robot-vacuum-under-5man", "band-5-7": "/compare/robot-vacuum-5-7man",
        "band-7-10": "/compare/robot-vacuum-7-10man", "band-10-15": "/compare/robot-vacuum-10-15man",
        "band-15-20": "/compare/robot-vacuum-15-20man", "band-over20": "/compare/robot-vacuum-20man-plus",
    }
    for label, lo, hi, aid in mp.PRICE_BANDS:
        cands = by_overall([r for r in rel_rows if lo <= r["price"] < hi])
        if cands:
            b = cands[0]
            band_rows.append([
                f'<a href="{hrefs[aid]}">{label}</a>',
                f'<a href="/products/{b["id"]}">{html.escape(b["name"])}</a>',
                f"{b['overall']:.1f}点", yen(b["price"]), yen(b["tco3"]),
            ])
    upkeep = sorted([r for r in rows if r["price"] < 100000 and r["annual"] >= 25000], key=lambda r: -r["annual"] / r["price"])
    hi_end = [r for r in rel_rows if r["price"] >= 70000]
    lo_end = [r for r in rel_rows if r["price"] < 70000]

    sec_def = [
        P(
            "「コスパが良い」は人によって意味が変わります。本記事では、口コミの評価が十分に高い機種のなかで、"
            "**買ってから3年間に払うお金が少ない**順に並べることを「コスパが良い」と定義しました。"
        ),
        '<div class="callout">'
        + P(f"条件1：口コミ{MIN_REVIEWS}件以上・総合点85点以上（評価が安定して高い）")
        + P("条件2：3年総額＝本体価格＋消耗品代（年間）×3年が安い")
        + "</div>",
        P(
            "消耗品代は、ゴミパック・モップ・ブラシ・フィルターなどを推奨周期で交換した場合の年間目安です。"
            f"掲載機種では年{yen(min(annuals))}〜{yen(max(annuals))}と幅があり、**本体価格だけでは本当の負担がわかりません**。"
            "3年は、バッテリーの劣化や買い替えを考え始める一つの目安として採用しています。"
        ),
    ]

    cards = []
    for i, r in enumerate(picks, 1):
        lead = (
            f"本体{yen(r['price'])}＋消耗品 年{yen(r['annual'])}×3年で、**3年総額は{yen(r['tco3'])}**です。"
            f"総合点85点以上の{len(qualified)}機種のなかで、**3年総額が{ordinal(i)}安い**機種です（総合点{r['overall']:.1f}点）。"
        ) + pick_lead_tail(r)
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}（3年総額{yen(r['tco3'])}）", lead, r,
                               [f"3年総額 {yen(r['tco3'])}", f"消耗品 年{yen(r['annual'])}"]))

    upkeep_html = ""
    if upkeep:
        upkeep_html = P(
            "本体が手ごろでも、**消耗品代が高いと3年で大きな差**になります。"
            "10万円未満で消耗品代が年2.5万円以上の機種は次のとおりです。"
        ) + mini_table(
            ["機種", "本体価格", "消耗品／年", "3年総額"],
            [[f'<a href="/products/{r["id"]}">{html.escape(r["name"])}</a>', yen(r["price"]), yen(r["annual"]), yen(r["tco3"])] for r in upkeep],
        ) + P("ゴミパックの交換頻度やモップの種類で費用は変わるため、気になる機種は製品ページの消耗品の内訳も確認してください。")

    table = data_table(
        [
            ("製品", product_cell),
            ("3年総額", lambda r: f"<strong>{yen(r['tco3'])}</strong>"),
            ("本体価格", lambda r: yen(r["price"])),
            ("消耗品／年", lambda r: yen(r["annual"])),
            ("総合点", lambda r: sc_cell(r["overall"], 1)),
            ("口コミ信頼度", lambda r: sc_cell(r["rel"], 1)),
            ("口コミ数", lambda r: f"{r['reviews']:,}件"),
        ],
        sorted(rel_rows, key=lambda r: r["tco3"]),
        "3年総額の比較表",
    )

    conclusion = conclusion_box(
        "結論：3年総額で見たコスパ上位3台",
        [(f"{i}位", r, f"3年総額{yen(r['tco3'])}・総合点{r['overall']:.1f}点。", f"pick-{i}") for i, r in enumerate(picks[:3], 1)],
    )

    faqs = [
        (
            "いちばん安い機種がコスパ最強ではないのですか？",
            f"本体が最も安いのは{plink(cheapest)}（{yen(cheapest['price'])}）ですが、消耗品代が年{yen(cheapest['annual'])}かかるため、3年総額は{yen(cheapest['tco3'])}になります。"
            f"本記事の1位の{plink(picks[0])}は3年総額{yen(picks[0]['tco3'])}で、**総額で見ると順位が入れ替わります**。",
        ),
        (
            "消耗品代はどれくらいかかりますか？",
            f"掲載機種の年間消耗品代は{yen(min(annuals))}〜{yen(max(annuals))}で、**中央値は{yen(int(statistics.median(annuals)))}**です。"
            "自動ゴミ収集の紙パックや、交換式モップのある機種は**高くなりやすい**傾向があります。",
        ),
        (
            "全自動（モップ洗浄付き）モデルはコスパが悪いですか？",
            f"7万円以上の機種の総合点の平均は{mean(r['overall'] for r in hi_end)}点、7万円未満は{mean(r['overall'] for r in lo_end)}点です"
            f"（口コミ{MIN_REVIEWS}件以上）。モップ洗浄などで手間は減りますが、3年総額は高くなりがちです。"
            "**水拭きの手間をお金で解決したいかどうか**で判断しましょう。",
        ),
        (
            "互換品の消耗品を使えば安くなりますか？",
            "互換品は安く手に入ることがありますが、**品質や適合はメーカーが保証していません**。"
            "本記事の消耗品代は純正品の目安です。保証期間中は純正品を使うのが安心です。",
        ),
    ]

    summary = f"""
        <div class="summary-box">
          {P(f"ロボット掃除機のコスパは、**本体価格だけでなく消耗品代まで含めて考える**のがポイントです。総合点85点以上で3年総額が最も安いのは**{plink(picks[0])}**でした。")}
          <ul>
            <li>本体価格の安さで選ぶ → {prose(gl('robot-vacuum-cheap'))}</li>
            <li>予算帯ごとに比べる → <a href="/compare/">価格帯別の徹底比較</a></li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-cost-performance",
        "crumb": "コスパの良いロボット掃除機",
        "title": f"コスパ最強のロボット掃除機は？本体＋消耗品の3年総額と口コミで比較【{YEAR}年】",
        "h1": "コスパの良いロボット掃除機おすすめ｜本体価格＋消耗品の3年総額と口コミ評価で比較",
        "description": (
            "ロボット掃除機のコスパを「本体価格＋消耗品の3年総額」と口コミ分析の総合点で比較。"
            "総合点85点以上の機種から3年総額が安い順に、価格帯別のコスパ機種も紹介します。"
        ),
        "lede": (
            "本体が安くても、消耗品代が高ければ結局は割高になります。"
            "口コミ評価が高い機種に絞り、本体＋消耗品の3年総額で本当にコスパの良いロボット掃除機を比べました。"
        ),
        "chips": ["3年総額で比較", f"総合点85点以上・{len(qualified)}機種"],
        "know": [
            ("コスパを測る基準", "「評価の高さ」と「3年間の総額」の2つでコスパを定義します。"),
            ("3年総額で見たおすすめ機種", "総合点85点以上の機種を、3年総額が安い順に紹介します。"),
            ("維持費が高い機種の見分け方", "本体は安くても消耗品代がかさむ機種を、データで確認できます。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ロボット掃除機は、買ったあとにもゴミパックやモップ、ブラシなどの消耗品代がかかります。"
            "当サイトの分析では、**年間の消耗品代が本体価格の半分を超える機種**もありました。",
            "そこで本記事では、口コミの評価が十分に高い機種だけを対象に、本体と消耗品を合わせた3年間の総額で比べました。",
        ],
        "sections": [
            ("definition", "この記事での「コスパ」の考え方", "".join(sec_def)),
            ("picks", "3年総額で選ぶコスパの良いロボット掃除機", P(
                f"口コミ{MIN_REVIEWS}件以上・総合点85点以上の機種を、3年総額の安い順に紹介します。"
            ) + f'<div class="articles">{"".join(cards)}</div>'),
            ("bands", "価格帯別のコスパ機種", P(
                f"予算が決まっている人向けに、価格帯ごとの総合点トップ（口コミ{MIN_REVIEWS}件以上）と3年総額をまとめました。"
            ) + mini_table(["価格帯", "機種", "総合点", "本体価格", "3年総額"], band_rows)),
            ("upkeep", "本体が安くても維持費が高い機種に注意", upkeep_html or P("該当する機種はありません。")),
            ("table", "3年総額の比較表", P(
                f"口コミ{MIN_REVIEWS}件以上の{len(rel_rows)}機種を、3年総額の安い順に並べました。"
            ) + table),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": ["消耗品代は、ゴミパック・モップ・ブラシなどを推奨周期で交換した場合の年間目安です。電気代は含みません。"],
    }


def cat_score(r: dict) -> float | None:
    if None in (r.get("pet"), r.get("quiet"), r.get("maint")):
        return None
    feat = r["pet"] * 0.5 + r["quiet"] * 0.3 + r["maint"] * 0.2
    return composite(feat, r["rel"])


def build_cat(rows: list[dict]) -> dict:
    for r in rows:
        r["cat"] = cat_score(r)
    pool = sorted([r for r in reliable(rows) if r["cat"] is not None], key=lambda r: (-r["cat"], -r["reviews"]))
    picks = pool[:5]
    budget = next((r for r in pool if r["price"] <= 50000 and r not in picks), None)
    waste = [r for r in rows if r.get("pet_waste") is True]
    quoted = [r for r in pool if r["cat_quotes"]]

    points = [
        (
            "細い猫毛を吸い取れて、ブラシに絡みにくいか",
            "猫の毛は細くて軽く、床やラグに入り込みやすいのが特徴です。"
            "口コミのペット毛評価に加えて、**ゴム製ブラシや毛絡み防止の構造か**どうかも確認しましょう。",
        ),
        (
            "トイレまわりの猫砂を拾えるか",
            "トイレから運ばれる猫砂は、掃除機をかけてもすぐ散らばる悩みの種です。"
            "口コミでも**「猫砂をしっかり吸う」という評価がある機種が複数**あります（下の口コミ一覧を参照）。",
        ),
        (
            "猫が怖がりにくい静かさか",
            "猫は音に敏感で、運転音に驚いて逃げてしまうこともあります。"
            "**口コミの静音性評価が高い機種**なら、在宅中に動かしても猫のストレスを抑えやすくなります。",
        ),
        (
            "吐き戻しや粗相を避けられるか",
            "毛玉の吐き戻しや粗相に乗り上げると、床に広げてしまうおそれがあります。"
            + (f"ペットの排泄物を認識して避ける機能をメーカーが公表しているのは、当サイト掲載機種では{join_ja([plink(r) for r in waste])}です。" if waste else "")
            + "ただし**液体や形の崩れたものは認識しにくい**ため、過信は禁物です。",
        ),
        (
            "毛でいっぱいになるゴミ捨てを自動化できるか",
            "換毛期はダストボックスがすぐ毛でいっぱいになります。自動ゴミ収集ステーション付きなら、**ゴミ捨ての回数を大きく減らせます**。",
        ),
    ]

    quote_items = "".join(
        f'<li><a class="q-name" href="/products/{html.escape(r["id"])}">{html.escape(r["name"])}</a><p>{prose(r["cat_quotes"][0])}</p></li>'
        for r in quoted[:10]
    )

    cards = []
    for i, r in enumerate(picks, 1):
        lead = (
            f"口コミ{MIN_REVIEWS}件以上の{len(pool)}機種のなかで、**猫向けスコアが{ordinal(i)}高い**機種です（{r['cat']:.1f}点）。"
            f"**ペット毛{r['pet']:.0f}点・静音性{r['quiet']:.0f}点・お手入れ{r['maint']:.0f}点**と、猫のいる家で大事な性能がそろっています。"
        )
        if r["cat_quotes"]:
            lead += f"口コミでは「{r['cat_quotes'][0].rstrip('。')}」と評価されています。"
        if r.get("pet_waste") is True:
            lead += "ペットの排泄物を認識して避ける機能もメーカーが公表しています。"
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}", lead, r, [f"猫向けスコア {r['cat']:.1f}"]))
    if budget:
        lead = (
            f"**5万円以下で猫向けスコアが最も高い**機種です（{budget['cat']:.1f}点）。"
            f"ペット毛{budget['pet']:.0f}点・静音性{budget['quiet']:.0f}点で、予算を抑えたい人に向いています。"
        )
        cards.append(pick_card("pick-budget", f"予算5万円以下なら：{budget['name']}（{yen(budget['price'])}）", lead, budget,
                               [f"猫向けスコア {budget['cat']:.1f}"]))

    table = data_table(
        [
            ("製品", product_cell),
            ("猫向けスコア", lambda r: sc_cell(r["cat"], 1)),
            ("ペット毛", lambda r: sc_cell(r["pet"])),
            ("静音性", lambda r: sc_cell(r["quiet"])),
            ("お手入れ", lambda r: sc_cell(r["maint"])),
            ("排泄物の回避", pet_waste_cell),
            ("価格", lambda r: yen(r["price"])),
        ],
        pool,
        "猫がいる家向けのロボット掃除機比較表",
    )

    tips = [
        ("最初は猫が見ている前で短く動かす", "いきなり長時間動かすより、**猫が様子を見られる状況で短時間から始める**と慣れやすくなります。"),
        ("留守中に動かすなら吐き戻しをチェック", "外出前に床を確認するか、AIで障害物を避ける機種でも**液体の汚れは避けにくい**点を覚えておきましょう。"),
        ("トイレまわりはエリア設定を活用", "猫砂が多い場所を重点的に掃除するエリアに設定したり、**トイレの近くは進入禁止**にしたりすると、トラブルを防げます。"),
        ("ステーションは猫の通り道を避けて置く", "猫がぶつかったり上に乗ったりしにくい**壁ぎわに置く**と、ドッキングの失敗も減らせます。"),
        ("ブラシの毛絡みは週1回を目安に確認", "毛が絡みにくい構造でも、ブラシの軸や車輪に毛がたまることがあります。**定期的に取り除くと吸引力を保てます**。"),
    ]

    conclusion_items = [(f"{i}位", r, f"猫向けスコア{r['cat']:.1f}点・ペット毛{r['pet']:.0f}点・静音性{r['quiet']:.0f}点。", f"pick-{i}") for i, r in enumerate(picks[:2], 1)]
    if budget:
        conclusion_items.append(("5万円以下", budget, f"猫向けスコア{budget['cat']:.1f}点。予算を抑えるならこの機種。", "pick-budget"))
    conclusion = conclusion_box("結論：猫がいる家ならこの3台", conclusion_items)

    faqs = [
        (
            "猫はロボット掃除機を怖がりますか？",
            "猫によって反応はさまざまです。**運転音が静かな機種**を選び、**猫が見ている前で短時間から慣らす**と受け入れやすくなります。"
            "本記事の比較表では、機種ごとの静音性評価を確認できます。",
        ),
        (
            "猫の吐いたものや粗相は避けてくれますか？",
            (f"**ペットの排泄物を認識して避ける機能**をメーカーが公表している機種（{join_ja([plink(r) for r in waste])}）もあります。" if waste else "")
            + "ただし**液体や形の崩れたものは認識しにくく**、口コミでも「液体状の排泄物は対象外」という指摘があります。留守中に動かすときは注意しましょう。",
        ),
        (
            "猫砂は吸えますか？",
            "**多くの機種で吸えます**が、粒が大きい猫砂や大量に散らばった場合は取り残すことがあります。"
            "口コミで猫砂の吸引が評価されている機種は、上の口コミ一覧で確認できます。",
        ),
        (
            "長毛の猫でも大丈夫ですか？",
            "長い毛はブラシや車輪に絡まりやすいため、**毛絡み防止の構造をもつ機種がおすすめ**です。"
            "口コミでは、長毛の猫がいる家庭からの高評価がある機種もあります。",
        ),
    ]
    summary = f"""
        <div class="summary-box">
          {P(f"猫がいる家では、猫毛の吸引だけでなく、**静かさとお手入れのしやすさも大切**です。3つをまとめた猫向けスコアで選ぶなら**{plink(picks[0])}が最有力**です。")}
          <ul>
            <li>犬も含めたペット全般で選ぶ → {prose(gl('robot-vacuum-pet'))}</li>
            <li>静かさを最優先する → <a href="/rankings/quietness">静音性ランキング</a></li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-cat",
        "crumb": "猫がいる家のロボット掃除機",
        "title": f"猫がいる家のロボット掃除機おすすめ{len(picks) + (1 if budget else 0)}選｜猫毛・猫砂・静音性を口コミで比較【{YEAR}年】",
        "h1": "猫がいる家のロボット掃除機おすすめ｜猫毛・猫砂・静音性を口コミ分析で比較",
        "description": (
            "猫を飼っている家に合うロボット掃除機を、口コミ分析のペット毛・静音性・お手入れの点数で比較。"
            "猫毛や猫砂、吐き戻し対策など、猫の家ならではの選び方と使い方のコツも解説します。"
        ),
        "lede": (
            "猫の抜け毛や猫砂は、毎日掃除してもすぐたまります。ペット毛・静音性・お手入れの口コミ評価をまとめた「猫向けスコア」で、"
            "猫のいる家に合うロボット掃除機を比べました。"
        ),
        "chips": ["猫向けスコアで比較", f"口コミに「猫」が登場する{len(quoted)}機種"],
        "know": [
            ("猫の家で重視したい5つのポイント", "猫毛・猫砂・音・吐き戻し・ゴミ捨ての5つから、選び方を整理します。"),
            ("口コミに「猫」が登場する機種", "猫を飼っている人の口コミで、どんな点が評価されているかを紹介します。"),
            ("猫向けスコアで選んだおすすめ", "ペット毛・静音性・お手入れの点数を組み合わせて、おすすめを選びました。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "猫と暮らしていると、床の抜け毛や、トイレから運ばれる猫砂の掃除に追われがちです。"
            "ロボット掃除機に任せれば毎日の負担は減りますが、猫が音を怖がったり、吐き戻しに乗り上げたりといった、**猫の家ならではの心配**もあります。",
            "本記事では、ナットクLaboが分析した口コミのなかから、猫を飼っている人の声と、ペット毛・静音性・お手入れの点数をもとに、猫のいる家に合うロボット掃除機を紹介します。",
        ],
        "sections": [
            ("points", "猫がいる家で重視したい5つのポイント", points_list(points)),
            ("voices", "口コミに「猫」が登場する機種", P(
                f"当サイトの分析では、口コミ{MIN_REVIEWS}件以上の機種のうち{len(quoted)}機種で、猫に関する評価が見られました。猫向けスコアの高い順に一部を紹介します。"
            ) + f'<ul class="quote-list">{quote_items}</ul>'),
            ("picks", "猫がいる家におすすめのロボット掃除機", '<div class="callout">'
             + P("猫向けスコア＝（ペット毛×50%＋静音性×30%＋お手入れ×20%）×0.85＋口コミ信頼度×0.15")
             + "</div>" + P(f"口コミ{MIN_REVIEWS}件以上の機種を、猫向けスコアの高い順に紹介します。")
             + f'<div class="articles">{"".join(cards)}</div>'),
            ("table", "猫向けスコアの比較表", P(
                f"口コミ{MIN_REVIEWS}件以上の{len(pool)}機種を、猫向けスコアの高い順に並べました。排泄物の回避は、メーカーの公表内容です。"
            ) + table),
            ("tips", "猫と暮らす家での使い方のコツ", points_list(tips)),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks + ([budget] if budget else []),
        "notes": ["猫向けスコアは、本記事のために口コミ分析の点数を組み合わせた独自の指標です。",
                  "排泄物の回避は、メーカー公式サイト等で認識・回避の記載を確認できたものを「対応（公式）」としています。"],
    }


def build_pet(rows: list[dict]) -> dict:
    for r in rows:
        r["petc"] = composite(r["pet_owner"], r["rel"]) if r.get("pet_owner") is not None else None
    pool = sorted([r for r in reliable(rows) if r["petc"] is not None], key=lambda r: (-r["petc"], -r["reviews"]))
    picks = pool[:5]
    waste_all = [r for r in rows if r.get("pet_waste") is True]
    waste_pick = next((r for r in pool if r.get("pet_waste") is True and r not in picks), None)
    budget = next((r for r in pool if r["price"] <= 50000 and r not in picks), None)
    extra = [x for x in (waste_pick, budget) if x]

    points = [
        ("抜け毛をしっかり吸い取れるか", "まずは**口コミのペット毛評価**を確認しましょう。床だけでなく、**ラグやカーペットに絡んだ毛を取れるか**も差が出やすいポイントです。"),
        ("ブラシに毛が絡みにくいか", "毛がブラシに巻き付くと、吸引力が落ちるうえ、取り除く手間がかかります。**ゴム製ブラシや毛絡み防止構造の機種**が人気です。"),
        (
            "排泄物を避けるAI認識があるか",
            "カメラやAIで障害物を認識し、**ペットの排泄物を避ける機能**をもつ機種があります。"
            + (f"当サイト掲載機種でメーカーが公表しているのは{join_ja([plink(r) for r in waste_all])}です。" if waste_all else "")
            + "\n**液体や形の崩れたものは認識しにくい**ため、トイレトレーニング中は特に注意しましょう。",
        ),
        ("ゴミ捨てとお手入れを自動化できるか", "ペットの毛は量が多く、ダストボックスがすぐいっぱいになります。自動ゴミ収集やモップ洗浄のステーションがあると、**毎日の手入れが楽になります**。"),
        ("水拭きで足跡や皮脂汚れまでケアできるか", "肉球の足跡やよだれの汚れは、**吸引だけでは落ちません**。水拭き対応の機種なら、床のベタつきも抑えられます。"),
    ]
    dog_cat = [
        P(
            "犬の場合は、**散歩のあとの砂や泥、長毛犬の毛の絡まり**に注意が必要です。"
            "口コミでも、長毛種の毛はブラシや車輪に絡まりやすいという指摘がある機種があり、**毛絡み防止の構造かどうかが満足度を左右**します。"
        ),
        P(
            "猫の場合は、**細い毛と猫砂、運転音への反応**がポイントです。"
            f"猫に絞った選び方は{gl('robot-vacuum-cat')}でくわしく解説しています。"
        ),
    ]

    cards = []
    for i, r in enumerate(picks, 1):
        lead = (
            f"ペットのいる家庭との相性を示す適合度は{r['pet_owner']:.0f}点、口コミのペット毛評価は{r['pet']:.0f}点です。"
            f"口コミ{MIN_REVIEWS}件以上の{len(pool)}機種のなかで、**ペット向けの加重点が{ordinal(i)}高い**機種です（{r['petc']:.1f}点）。"
        )
        if r.get("pet_waste") is True:
            lead += "**ペットの排泄物を認識して避ける機能**もメーカーが公表しています。"
        lead += pick_lead_tail(r)
        cards.append(pick_card(f"pick-{i}", f"{i}位：{r['name']}", lead, r, [f"ペット適合度 {r['pet_owner']:.0f}"]))
    if waste_pick:
        lead = (
            f"排泄物を認識して避ける機能をメーカーが公表している機種のなかで、ペット向けの加重点が最も高い機種です（{waste_pick['petc']:.1f}点）。"
            "**留守中に動かすことが多い家庭に向いています**。"
        )
        cards.append(pick_card("pick-waste", f"排泄物の回避を重視するなら：{waste_pick['name']}", lead, waste_pick,
                               [f"ペット適合度 {waste_pick['pet_owner']:.0f}"]))
    if budget:
        lead = (
            f"**5万円以下でペット向けの加重点が最も高い**機種です（{budget['petc']:.1f}点）。"
            f"ペット毛{budget['pet']:.0f}点で、予算を抑えつつ抜け毛対策をしたい人に向いています。"
        ) + pick_lead_tail(budget)
        cards.append(pick_card("pick-budget", f"予算5万円以下なら：{budget['name']}（{yen(budget['price'])}）", lead, budget,
                               [f"ペット適合度 {budget['pet_owner']:.0f}"]))

    table = data_table(
        [
            ("製品", product_cell),
            ("ペット適合度", lambda r: sc_cell(r["pet_owner"])),
            ("ペット毛", lambda r: sc_cell(r["pet"])),
            ("お手入れ", lambda r: sc_cell(r["maint"])),
            ("フローリング", lambda r: sc_cell(r["floor"])),
            ("排泄物の回避", pet_waste_cell),
            ("価格", lambda r: yen(r["price"])),
        ],
        pool,
        "ペットがいる家向けのロボット掃除機比較表",
    )

    c_items = [(f"{i}位", r, f"ペット適合度{r['pet_owner']:.0f}点・ペット毛{r['pet']:.0f}点。", f"pick-{i}") for i, r in enumerate(picks[:2], 1)]
    if waste_pick:
        c_items.append(("排泄物回避", waste_pick, "排泄物を認識して避ける機能をメーカーが公表。", "pick-waste"))
    elif budget:
        c_items.append(("5万円以下", budget, f"ペット適合度{budget['pet_owner']:.0f}点。", "pick-budget"))
    conclusion = conclusion_box("結論：ペットがいる家ならこの3台", c_items)

    faqs = [
        (
            "ペットのうんちを踏んで広げてしまいませんか？",
            "その心配がある場合は、**ペットの排泄物を認識して避ける機能をもつ機種**を選びましょう。"
            + (f"当サイト掲載機種では{join_ja([plink(r) for r in waste_all])}がメーカーで公表されています。" if waste_all else "")
            + "ただし完全ではないため、**留守中の運転前に床を確認する**習慣をつけると安心です。",
        ),
        (
            "多頭飼いでも使えますか？",
            "**使えます**。口コミでも、犬や猫の多頭飼いの家庭から高い評価を得ている機種があります。"
            "毛の量が多いので、**自動ゴミ収集付きでお手入れの評価が高い機種**を選ぶと、手間を大きく減らせます。",
        ),
        (
            "毛が絡まない機種はありますか？",
            "**完全に絡まない機種はありません**が、ゴム製ブラシや毛を切る機構などで絡みにくくした機種は多くあります。"
            "口コミのペット毛評価やお手入れ評価が高い機種は、毛絡みの不満が少ない傾向です。",
        ),
        (
            "ペットがロボット掃除機にいたずらしませんか？",
            "上に乗ったり、追いかけたりするペットもいます。最初は**ペットが見ている前で動かして慣れさせ**、ステーションは通り道を避けて置くとトラブルを減らせます。",
        ),
    ]

    summary = f"""
        <div class="summary-box">
          {P(f"ペットがいる家では、**抜け毛の吸引・毛絡み・排泄物の回避・お手入れの4つ**が満足度を左右します。ペットのいる家庭との相性で選ぶなら**{plink(picks[0])}が最有力**です。")}
          <ul>
            <li>猫に絞って選ぶ → {prose(gl('robot-vacuum-cat'))}</li>
            <li>予算を抑えて選ぶ → {prose(gl('robot-vacuum-cheap'))}</li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-pet",
        "crumb": "ペットがいる家のロボット掃除機",
        "title": f"ペットがいる家のロボット掃除機おすすめ{len(picks) + len(extra)}選｜抜け毛・排泄物回避で比較【{YEAR}年】",
        "h1": "ペットがいる家のロボット掃除機おすすめ｜抜け毛・排泄物回避・お手入れで比較",
        "description": (
            "犬や猫などペットがいる家に合うロボット掃除機を、口コミ分析のペット適合度・ペット毛・お手入れの点数で比較。"
            "排泄物を避けるAI認識の有無や、犬と猫で違う選び方も解説します。"
        ),
        "lede": (
            "犬や猫の抜け毛は、ロボット掃除機がいちばん活躍する場面のひとつです。ペットのいる家庭との相性を示す口コミ分析の「ペット適合度」をもとに、"
            "おすすめの機種を比べました。"
        ),
        "chips": ["ペット適合度で比較", f"口コミ{MIN_REVIEWS}件以上・{len(pool)}機種"],
        "know": [
            ("ペットがいる家の選び方", "抜け毛・毛絡み・排泄物・お手入れ・水拭きの5つのポイントを解説します。"),
            ("犬と猫で違う注意点", "長毛犬の毛絡みや猫砂など、ペットの種類ごとのポイントを整理します。"),
            ("ペット適合度で選んだおすすめ", "口コミ分析の点数で、ペットのいる家で評価の高い機種を紹介します。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ペットと暮らしていると、床の抜け毛は毎日の悩みです。ロボット掃除機を使えば、**留守中や寝ている間にも床をきれいに保てます**。",
            "ただし、毛がブラシに絡んだり、排泄物に乗り上げてしまったりと、ペットのいる家ならではの失敗もあります。"
            "本記事では、ナットクLaboの口コミ分析から、ペットのいる家庭で評価の高いロボット掃除機を紹介します。",
        ],
        "sections": [
            ("points", "ペットがいる家のロボット掃除機の選び方", points_list(points)),
            ("dog-cat", "犬と猫で気をつけたいポイントの違い", "".join(dog_cat)),
            ("picks", "ペットがいる家におすすめのロボット掃除機", '<div class="callout">'
             + P("ペット向けの加重点＝ペット適合度×0.85＋口コミ信頼度×0.15")
             + P("ペット適合度は、口コミの「ペット毛」「床掃除」「お手入れ」などから算出した、ペットのいる家庭との相性を示す点数です。")
             + "</div>" + f'<div class="articles">{"".join(cards)}</div>'),
            ("table", "ペット適合度の比較表", P(
                f"口コミ{MIN_REVIEWS}件以上の{len(pool)}機種を、ペット向けの加重点が高い順に並べました。排泄物の回避は、メーカーの公表内容です。"
            ) + table),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks + extra,
        "notes": ["排泄物の回避は、メーカー公式サイト等で認識・回避の記載を確認できたものを「対応（公式）」としています。"],
    }


MAKER_INTRO = {
    "ECOVACS": "「DEEBOT（ディーボット）」シリーズを展開するメーカーです。",
    "Anker": "モバイルバッテリーで知られるアンカーが、「Eufy（ユーフィ）」ブランドで展開しています。",
    "Dreame": "コードレス掃除機でも知られるメーカーで、ロボット掃除機は2万円台から全自動の上位機まで揃えています。",
    "Roborock": "ロボット掃除機を主力とするメーカーで、「Qrevo」「Saros」などのシリーズを展開しています。",
    "iRobot": "「ルンバ」で知られる、ロボット掃除機の草分け的なブランドです。",
    "SwitchBot": "スマートホーム機器で知られるメーカーで、同社のハブや家電と連携させやすい点が特徴です。",
}


def build_makers(rows: list[dict]) -> dict:
    stats = []
    for m in mp.MANUFACTURERS:
        rs = [r for r in rows if r["maker"]["id"] == m["id"]]
        st = {
            "m": m, "rows": rs, "n": len(rs),
            "pmin": min(r["price"] for r in rs), "pmax": max(r["price"] for r in rs),
            "ov": mean(r["overall"] for r in rs), "rel": mean(r["rel"] for r in rs),
            "rev": round(statistics.mean(r["reviews"] for r in rs)),
            "under5": sum(1 for r in reliable(rs) if r["price"] <= 50000),
            "spread": round(max(r["overall"] for r in rs) - min(r["overall"] for r in rs), 1),
            "best": (by_overall(reliable(rs)) or by_overall(rs))[0],
        }
        for k, _ in AXES:
            st[k] = mean(r[k] for r in rs)
        stats.append(st)
    cross = {k: mean(s[k] for s in stats) for k, _ in AXES}
    for s in stats:
        rel_axes = sorted(((AXIS_LABEL[k], s[k], round(s[k] - cross[k], 1)) for k, _ in AXES), key=lambda x: -x[2])
        s["strong"], s["weak"] = rel_axes[0], rel_axes[-1]
        cheap_pool = [r for r in s["rows"] if r["price"] <= 50000]
        s["budget_best"] = (by_overall(reliable(cheap_pool)) or by_overall(cheap_pool) or [None])[0]

    def strong_cell(s):
        name, val, diff = s["strong"]
        return f"{name}（{val}点）" if diff >= 1 else "目立った得意なし"

    def weak_cell(s):
        name, val, diff = s["weak"]
        return f"{name}（{val}点）" if diff <= -1 else "目立った苦手なし"

    def axes_sentence(s):
        sn, sv, sd = s["strong"]
        wn, wv, wd_ = s["weak"]
        if sd >= 1 and wd_ <= -1:
            return (
                f"8つの性能を6社平均と比べると、**得意なのは{sn}**（{sv}点、平均より{sd:+.1f}点）、"
                f"**苦手なのは{wn}**（{wv}点、{wd_:+.1f}点）です。"
            )
        if sd >= 1:
            return (
                f"8つの性能を6社平均と比べると、**とくに得意なのは{sn}**（{sv}点、平均より{sd:+.1f}点）です。"
                f"**6社平均を大きく下回る性能はなく**、最も差が小さい{wn}でも{wd_:+.1f}点です。"
            )
        if wd_ <= -1:
            return (
                f"8つの性能を6社平均と比べると、平均を大きく上回る性能はなく、"
                f"とくに**{wn}が低め**です（{wv}点、{wd_:+.1f}点）。"
            )
        return "8つの性能はいずれも6社平均に近く、**目立った得意・苦手はありません**。"

    def rank_of(s, key):
        order = sorted(stats, key=lambda x: -x[key])
        return order.index(s) + 1

    most_rev = max(rows, key=lambda r: r["reviews"])
    cheapest = min(rows, key=lambda r: r["price"])

    table = mini_table(
        ["メーカー", "掲載機種", "価格帯", "平均総合点", "平均信頼度", "得意", "苦手"],
        [[
            f'<a href="/makers/{s["m"]["slug"]}">{html.escape(s["m"]["name_full"])}</a>',
            f"{s['n']}機種", f"{yen(s['pmin'])}〜{yen(s['pmax'])}", f"{s['ov']}点", f"{s['rel']}",
            strong_cell(s), weak_cell(s),
        ] for s in sorted(stats, key=lambda x: -x["ov"])],
    )

    purposes = [
        ("総合力で選びたい", "ov", "平均総合点"),
        ("口コミの安定感を重視", "rel", "平均信頼度"),
        ("静かに使いたい", "quiet", "静音性の平均"),
        ("ペットの毛対策", "pet", "ペット毛の平均"),
        ("カーペットが多い", "carpet", "カーペットの平均"),
        ("段差が多い家", "step", "段差の平均"),
        ("お手入れを楽にしたい", "maint", "お手入れの平均"),
        ("5万円以下の選択肢が多い", "under5", "5万円以下・口コミ50件以上の機種数"),
    ]
    purpose_rows = []
    for label, key, desc in purposes:
        best = max(stats, key=lambda s: (s[key], s["ov"]))
        val = f"{best[key]}機種" if key == "under5" else f"{best[key]}点" if key != "rel" else f"{best[key]}"
        purpose_rows.append([label, f'<a href="/makers/{best["m"]["slug"]}">{html.escape(best["m"]["name_full"])}</a>', f"{desc} {val}"])

    sections_maker = []
    picks = []
    cards = []
    ranked = sorted(stats, key=lambda x: -x["ov"])
    maker_nav = '<nav class="maker-nav" aria-label="メーカーへ移動">' + "".join(
        f'<a href="#maker-{s["m"]["slug"]}"><span>{i}</span>{html.escape(s["m"]["name_ja"])}</a>'
        for i, s in enumerate(ranked, 1)
    ) + "</nav>"
    for s in ranked:
        m = s["m"]
        best = s["best"]
        picks.append(best)
        text = (
            f"{m['name_full']}は、{MAKER_INTRO.get(m['id'], '')}"
            f"当サイトでは{s['n']}機種（{yen(s['pmin'])}〜{yen(s['pmax'])}）を分析しています。"
            f"平均総合点は{s['ov']}点（6社中{rank_of(s, 'ov')}位）、口コミ信頼度の平均は{s['rel']}（{rank_of(s, 'rel')}位）です。"
        )
        text2 = axes_sentence(s)
        extras = []
        if most_rev["maker"]["id"] == m["id"]:
            extras.append(f"{most_rev['name']}は口コミ{most_rev['reviews']}件と、**当サイト掲載製品で最も多くの口コミ**が集まっています。")
        if cheapest["maker"]["id"] == m["id"]:
            extras.append(f"**掲載製品で最も安い{cheapest['name']}**（{yen(cheapest['price'])}）もこのメーカーです。")
        bb = s["budget_best"]
        if bb and bb["id"] != best["id"] and bb["reviews"] >= MIN_REVIEWS:
            extras.append(
                f"5万円以下で選ぶなら、**{plink(bb)}が最有力**です（{yen(bb['price'])}・総合点{bb['overall']:.1f}点）。"
            )
        if rank_of(s, "rev") == len(stats):
            extras.append(f"1機種あたりの口コミ件数は平均{s['rev']}件と6社で最も少なく、**機種によっては評価が揺れやすい**点に注意してください。")
        aid = f"maker-{m['slug']}"
        lead = (
            f"{m['name_ja']}の機種のなかで、口コミ{MIN_REVIEWS}件以上かつ総合点が最も高いのが**{best['name']}**です"
            f"（総合点{best['overall']:.1f}点）。"
        ) if best["reviews"] >= MIN_REVIEWS else f"{m['name_ja']}の機種のなかで、総合点が最も高いのが**{best['name']}**です（総合点{best['overall']:.1f}点）。"
        card = pick_card(f"{aid}-pick", f"{m['name_ja']}の代表機種：{best['name']}", lead, best)
        head = (
            f'<div class="maker-head">'
            f'<span class="maker-rank">平均総合点 6社中{rank_of(s, "ov")}位</span>'
            f'<h3>{html.escape(m["name_ja"])}<span class="maker-en">{html.escape(m["name_en"])}</span></h3>'
            f'<ul class="maker-stats">'
            f'<li>分析<b>{s["n"]}</b>機種</li>'
            f'<li>{yen(s["pmin"])}〜{yen(s["pmax"])}</li>'
            f'<li>平均総合点<b>{s["ov"]}</b>点</li>'
            f"</ul></div>"
        )
        sections_maker.append(
            f'<section class="maker-sec" id="{aid}">{head}<div class="maker-body">'
            + P(text) + P(text2) + "".join(P(x) for x in extras)
            + P(f"全ラインナップの比較は[{m['name_ja']}の全機種比較](/makers/{m['slug']})で確認できます。")
            + f'<div class="articles">{card}</div></div></section>'
        )

    top = max(stats, key=lambda s: s["ov"])
    rel_top = max(stats, key=lambda s: s["rel"])
    budget_top = max(stats, key=lambda s: (s["under5"], s["ov"]))
    spreads = sorted(stats, key=lambda s: -s["spread"])

    conclusion = conclusion_box(
        "結論：迷ったらこの3メーカーから",
        [
            ("総合力", top["best"], f"{top['m']['name_full']}は平均総合点{top['ov']}点で6社トップ。代表機種は{top['best']['name']}。", f"maker-{top['m']['slug']}-pick"),
            ("口コミの安定感", rel_top["best"], f"{rel_top['m']['name_full']}は平均信頼度{rel_top['rel']}で6社トップ。代表機種は{rel_top['best']['name']}。", f"maker-{rel_top['m']['slug']}-pick"),
            (
                "予算重視",
                budget_top["budget_best"],
                f"{budget_top['m']['name_full']}は5万円以下・口コミ{MIN_REVIEWS}件以上の機種が{budget_top['under5']}機種と最多。"
                f"{budget_top['budget_best']['name']}は総合点{budget_top['budget_best']['overall']:.1f}点。",
                f"maker-{budget_top['m']['slug']}",
            ),
        ],
    )

    faqs = [
        (
            "結局どのメーカーがいちばんおすすめですか？",
            f"口コミ分析の平均総合点では**{top['m']['name_full']}**（{top['ov']}点）が最も高く、口コミの安定感では**{rel_top['m']['name_full']}**（平均信頼度{rel_top['rel']}）が最も高くなりました。"
            "ただし同じメーカーでも機種による差が大きいため、メーカーを決めたら機種ごとの点数も確認しましょう。",
        ),
        (
            "ルンバとほかのメーカーの違いは何ですか？",
            "ルンバ（iRobot）は、口コミ信頼度の平均が"
            f"{next(s['rel'] for s in stats if s['m']['id'] == 'iRobot')}と高く、**評価が安定している**のが強みです。"
            f"一方で、口コミの静音性の平均は{next(s['quiet'] for s in stats if s['m']['id'] == 'iRobot')}点と**6社のなかでは低め**です。",
        ),
        (
            "日本メーカーのロボット掃除機は比較していないのですか？",
            "当サイトでは現在、ECサイトで口コミが多く集まっている主要6メーカーを分析しています。**国内メーカーの機種は分析対象に含めていません**。",
        ),
        (
            "同じメーカーなら、どの機種を選べばいいですか？",
            "メーカーごとの全機種比較ページで、予算別・機能別のおすすめを紹介しています。"
            + "、".join(f"[{s['m']['name_ja']}](/makers/{s['m']['slug']})" for s in stats) + "から確認できます。",
        ),
    ]

    caution = [
        P(
            "メーカーの平均点は、**どんな価格帯の機種を出しているかに左右されます**。"
            f"たとえば同じメーカー内でも、総合点の差は{spreads[0]['m']['name_ja']}で最大{spreads[0]['spread']}点、"
            f"{spreads[-1]['m']['name_ja']}でも{spreads[-1]['spread']}点あります。"
        ),
        P(
            "メーカーは「候補を絞るための入り口」と考え、最終的には**予算や家の環境に合わせて機種ごとに比べる**のがおすすめです。"
            f"予算から選ぶなら{gl('robot-vacuum-cheap')}や{gl('robot-vacuum-cost-performance')}も参考にしてください。"
        ),
    ]

    summary = f"""
        <div class="summary-box">
          {P(f"口コミ分析で見ると、**総合力は{top['m']['name_ja']}**、**口コミの安定感は{rel_top['m']['name_ja']}**、**予算重視なら{budget_top['m']['name_ja']}**が有力です。メーカーで候補を絞ったら、全機種比較ページで自分に合う1台を選びましょう。")}
          <ul>
            <li>メーカー別の全機種比較 → <a href="/makers/">メーカー比較一覧</a></li>
            <li>機能で選ぶ → <a href="/rankings/">機能別ランキング</a></li>
          </ul>
        </div>"""

    return {
        "slug": "robot-vacuum-makers",
        "crumb": "おすすめメーカー",
        "title": f"ロボット掃除機のおすすめメーカー6社を比較｜口コミでわかる特徴と選び方【{YEAR}年】",
        "h1": "ロボット掃除機のおすすめメーカー6社を比較｜口コミデータでわかる特徴と選び方",
        "description": (
            f"ロボット掃除機の主要6メーカー（エコバックス・アンカー・ドリーミー・ロボロック・ルンバ・スイッチボット）を、{len(rows)}機種の口コミ分析で比較。"
            "メーカーごとの得意・苦手と代表機種、目的別のおすすめメーカーを紹介します。"
        ),
        "lede": (
            f"主要6メーカー・{len(rows)}機種の口コミ分析データを集計し、メーカーごとの得意・苦手を数字で比べました。"
            "目的別のおすすめメーカーと代表機種もあわせて紹介します。"
        ),
        "chips": [f"6メーカー・{len(rows)}機種", "口コミ分析"],
        "know": [
            ("主要6メーカーの比較表", "平均総合点・信頼度・得意な性能を、ひとつの表で比べられます。"),
            ("メーカーごとの特徴と代表機種", "口コミデータからわかる各社の強みと、いま選ぶならどの機種かを紹介します。"),
            ("目的別のおすすめメーカー", "静音・ペット・段差など、重視する点ごとに向いているメーカーがわかります。"),
        ],
        "conclusion": conclusion,
        "intro": [
            "ロボット掃除機は**メーカーごとに得意分野が違い**、同じ価格帯でも「静かさ」「段差」「お手入れ」などで評価が分かれます。",
            f"本記事では、ナットクLaboが分析した主要6メーカー・{len(rows)}機種の口コミデータを集計し、メーカーごとの特徴と選び方を紹介します。",
        ],
        "sections": [
            ("table", "主要6メーカーの比較表", P(
                "得意・苦手は、8つの性能それぞれの平均点を6社平均と比べ、差が最も大きいものを表示しています。"
                "差が1点未満の場合は「目立った得意（苦手）なし」としています。"
            ) + table),
            ("purpose", "目的別のおすすめメーカー", P("重視したい点ごとに、平均点が最も高いメーカーをまとめました。")
             + mini_table(["重視したい点", "おすすめメーカー", "根拠"], purpose_rows)),
            ("makers", "メーカーごとの特徴と代表機種", maker_nav + "".join(sections_maker)),
            ("caution", "メーカー選びで注意したいこと", "".join(caution)),
        ],
        "faqs": faqs,
        "summary": summary,
        "picks": picks,
        "notes": ["メーカーの平均点は、当サイトで分析している機種の単純平均です。"],
    }


# ---------------------------------------------------------------- hub

def build_hub(built: list[dict]) -> Path:
    groups: dict[str, list[str]] = {}
    for g in GUIDES:
        if any(b["slug"] == g["slug"] for b in built):
            groups.setdefault(g["group"], []).append(
                f'<a class="band" href="/guides/{g["slug"]}"><strong>{html.escape(g["label"])}</strong>'
                f'<span>記事を読む →</span><span class="meta">{html.escape(g["meta"])}</span></a>'
            )
    blocks = "".join(
        f'<section class="hub-section"><h2 class="hub-title">{html.escape(name)}</h2><div class="list">{"".join(items)}</div></section>'
        for name, items in groups.items()
    )
    item_ld = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "ロボット掃除機の選び方ガイド",
        "url": f"{SITE}/guides/",
        "description": "薄型・小さい・安い・コスパ・ペット・メーカーなど、目的別にロボット掃除機の選び方とおすすめを解説するガイド一覧。",
    }
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ロボット掃除機の選び方ガイド（目的別）｜ナットクLabo</title>
  <meta name="description" content="薄型・高さ・小さい・安い・コスパ・猫・ペット・おすすめメーカーなど、目的別にロボット掃除機の選び方とおすすめ機種を口コミ分析で解説します。">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="{SITE}/guides/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="{SITE}/guides/">
  <meta property="og:title" content="ロボット掃除機の選び方ガイド（目的別）">
  <meta property="og:description" content="目的別にロボット掃除機の選び方とおすすめ機種を口コミ分析で解説します。">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <link rel="stylesheet" href="/products/css/prose.css?v={PROSE_V}">
  <style>
    :root {{ --primary:#1e40af; --secondary:#0f172a; --bg:#f8fafc; --text:#1e293b; --muted:#64748b; --line:#e2e8f0; }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    body {{ font-family:"Noto Sans JP",sans-serif; background:var(--bg); color:var(--text); line-height:1.75; overflow-x:clip; }}
    header.hero {{ background:linear-gradient(135deg,var(--primary),var(--secondary)); color:#fff; padding:1.75rem 1rem 2rem; }}
    .wrap {{ max-width:920px; margin:0 auto; padding:0 1rem; }}
    .crumb {{ font-size:0.78rem; opacity:0.85; margin-bottom:0.75rem; }}
    .crumb a {{ color:#bfdbfe; text-decoration:none; }}
    h1 {{ font-size:clamp(1.25rem,4.6vw,1.9rem); font-weight:900; line-height:1.35; margin-bottom:0.65rem; }}
    header.hero .lede {{ font-size:0.95rem; color:#e0e7ff; max-width:40rem; }}
    header.hero .lede .em-key {{ color:#fff; background:none; }}
    .hub-section {{ padding:1.5rem 0 0.4rem; }}
    .hub-section:last-of-type {{ padding-bottom:2.5rem; }}
    h2.hub-title {{ font-size:1.15rem; font-weight:900; color:#0f172a; margin-bottom:0.65rem; }}
    .list {{ display:grid; gap:0.85rem; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }}
    a.band {{ display:block; text-decoration:none; background:#fff; border:1px solid var(--line); border-radius:14px; padding:1.1rem 1.2rem; color:#1e3a8a; transition:border-color .15s ease, box-shadow .15s ease; }}
    a.band:hover {{ border-color:#93c5fd; box-shadow:0 8px 24px rgba(30,64,175,0.08); }}
    a.band strong {{ display:block; font-size:1.02rem; margin-bottom:0.2rem; color:#0f172a; }}
    a.band span {{ font-size:0.88rem; font-weight:600; color:#1e40af; }}
    a.band .meta {{ display:block; margin-top:0.35rem; font-size:0.82rem; font-weight:500; color:var(--muted); }}
    footer.page-footer {{ text-align:center; color:var(--muted); font-size:0.8rem; padding:1.5rem 1rem 2rem; }}
    footer.page-footer a {{ color:var(--primary); font-weight:700; text-decoration:none; margin:0 0.35rem; }}
  </style>
  <script type="application/ld+json">
{json.dumps(item_ld, ensure_ascii=False, indent=2)}
  </script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb" aria-label="パンくず"><a href="/">ホーム</a> › 選び方ガイド</nav>
      <h1>ロボット掃除機の選び方ガイド</h1>
      <p class="lede">{prose("サイズ・予算・暮らし方・メーカーなど、目的別にロボット掃除機の選び方とおすすめ機種を、口コミ分析のデータで解説します。")}</p>
    </div>
  </header>
  <main class="wrap">{blocks}</main>
  <footer class="page-footer">
    <a href="/">ホーム</a>
    <a href="/rankings/">ランキング</a>
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


# ---------------------------------------------------------------- QA

def qa(paths: list[Path]) -> list[str]:
    warnings: list[str] = []
    for path in paths:
        text = path.read_text(encoding="utf-8")
        copy = re.sub(r"<script[\s\S]*?</script>", " ", text)
        copy = re.sub(r"<style[\s\S]*?</style>", " ", copy)
        copy = re.sub(r"<[^>]+>", " ", copy).replace("\u2060", "")
        for pat, msg in (
            (r"None|nan|\{|\}", "テンプレート変数の取り残し"),
            (r"ですです|ますます(?!増)", "語尾の重複"),
            (r"。。|、、|、。", "句読点の重複"),
            (r"\[[^\]]+\]\(", "Markdownリンクの取り残し"),
        ):
            m = re.search(pat, copy)
            if m:
                ctx = copy[max(0, m.start() - 20): m.end() + 20].replace("\n", " ")
                warnings.append(f"{path.name}: {msg}: …{ctx}…")
        for lead in re.findall(r'class="lead">(.*?)</p>', text, flags=re.S):
            lp = re.sub(r"<[^>]+>", "", lead).replace("\u2060", "").strip()
            if lp and not lp.endswith(("。", "！", "？")):
                warnings.append(f"{path.name}: lead が句点で終わっていない: {lp[-24:]}")
    return warnings


def main() -> None:
    rows = load_products()
    sized = sum(1 for r in rows if r.get("h"))
    print(f"products={len(rows)} with_dims={sized}")
    builders = [build_thin, build_height, build_small, build_cheap, build_cost, build_cat, build_pet, build_makers]
    built: list[dict] = []
    outs: list[Path] = []
    for fn in builders:
        art = fn(rows)
        if not art:
            print(f"skip {fn.__name__}: dimension data not ready")
            continue
        out = render_page(art)
        built.append(art)
        outs.append(out)
        print(f"wrote {out.relative_to(ROOT)}  picks={len({p['id'] for p in art['picks']})}  title={art['title']}")
    outs.append(build_hub(built))
    print(f"wrote {outs[-1].relative_to(ROOT)}")
    warnings = qa(outs)
    if warnings:
        print("\nQA warnings:")
        for w in warnings:
            print("  -", w)
    else:
        print("\nQA: no issues found")


if __name__ == "__main__":
    main()

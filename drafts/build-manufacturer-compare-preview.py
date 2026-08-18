# -*- coding: utf-8 -*-
"""Manufacturer compare pages (all makers): article layout + vertical table."""
from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "products" / "data"
OUT_DIR = ROOT / "makers"
NAV_V = "20260818g"
SITE = "https://nattoku-labo.com"
WF, WR = 0.85, 0.15

# id = products/data JSON の manufacturer 値
MANUFACTURERS = [
    {
        "id": "ECOVACS",
        "slug": "ecovacs",
        "name_ja": "エコバックス",
        "name_en": "ECOVACS",
        "name_full": "エコバックス（ECOVACS）",
    },
    {
        "id": "Anker",
        "slug": "anker",
        "name_ja": "アンカー",
        "name_en": "Anker",
        "name_full": "アンカー（Anker）",
    },
    {
        "id": "Dreame",
        "slug": "dreame",
        "name_ja": "ドリーミー",
        "name_en": "Dreame",
        "name_full": "ドリーミー（Dreame）",
    },
    {
        "id": "Roborock",
        "slug": "roborock",
        "name_ja": "ロボロック",
        "name_en": "Roborock",
        "name_full": "ロボロック（Roborock）",
    },
    {
        "id": "iRobot",
        "slug": "irobot",
        "name_ja": "ルンバ",
        "name_en": "iRobot",
        "name_full": "ルンバ（iRobot）",
    },
    {
        "id": "SwitchBot",
        "slug": "switchbot",
        "name_ja": "スイッチボット",
        "name_en": "SwitchBot",
        "name_full": "スイッチボット（SwitchBot）",
    },
]

FEATURE_KEYS = {
    "floor": "floorCleaning",
    "carpet": "carpetCleaning",
    "quiet": "quietness",
    "pet": "petHairRemoval",
    "maint": "maintenance",
    "battery": "batteryLife",
    "step": "stepClimbing",
}

# 製品ページの総合点と同じ8軸
OVERALL_AXIS_KEYS = (
    "floorCleaning",
    "carpetCleaning",
    "petHairRemoval",
    "quietness",
    "stepClimbing",
    "maintenance",
    "appStability",
    "batteryLife",
)

FEATURE_COMMENT_LABELS = {
    "floor": "フローリング清掃の口コミ傾向",
    "carpet": "カーペット清掃の口コミ傾向",
    "quiet": "静音性の口コミ傾向",
    "pet": "ペット毛の口コミ傾向",
    "maint": "メンテナンスの口コミ傾向",
    "battery": "バッテリーの口コミ傾向",
    "step": "段差乗り越えの口コミ傾向",
}

AXIS_META = [
    ("floor", "floorCleaning", "フローリング"),
    ("carpet", "carpetCleaning", "カーペット"),
    ("pet", "petHairRemoval", "ペット毛"),
    ("quiet", "quietness", "静音性"),
    ("step", "stepClimbing", "段差"),
    ("maint", "maintenance", "メンテナンス"),
    ("app", "appStability", "アプリ"),
    ("battery", "batteryLife", "バッテリー"),
]

ATTR_LABELS = {
    "petOwner": "ペットのいる家庭",
    "apartment": "マンション・集合住宅",
    "workingProfessional": "共働き・忙しい人",
    "familyHome": "家族世帯",
}

PRICE_BANDS = [
    ("〜5万円", 0, 50000, "band-under5"),
    ("5〜7万円", 50000, 70000, "band-5-7"),
    ("7〜10万円", 70000, 100000, "band-7-10"),
    ("10〜15万円", 100000, 150000, "band-10-15"),
    ("15〜20万円", 150000, 200000, "band-15-20"),
    ("20万円〜", 200000, 10**9, "band-over20"),
]


def sc(perf: dict, key: str):
    v = perf.get(key)
    if isinstance(v, dict) and v.get("score") is not None:
        return float(v["score"])
    return None


def weighted(feature: float | None, rel: float) -> float | None:
    if feature is None:
        return None
    return round(WF * feature + WR * rel, 2)


def round1(n: float) -> float:
    return round(n * 10) / 10


def feature_average(perf: dict) -> float | None:
    """製品ページと同じ：8軸 score の単純平均。"""
    scores: list[float] = []
    for key in OVERALL_AXIS_KEYS:
        if key == "petHairRemoval":
            raw = sc(perf, "petHairRemoval")
            if raw is None:
                raw = sc(perf, "petHair")
        elif key == "quietness":
            raw = sc(perf, "quietness")
            if raw is None:
                raw = sc(perf, "nightQuietness")
        else:
            raw = sc(perf, key)
        if raw is not None:
            scores.append(raw)
    if not scores:
        return None
    return round1(sum(scores) / len(scores))


def overall_score(feat_avg: float | None, rel: float) -> float | None:
    """総合点 = 機能平均点 × 0.85 ＋ 口コミ信頼度 × 0.15"""
    if feat_avg is None:
        return None
    return round1(WF * feat_avg + WR * rel)


def yen(n: int) -> str:
    return f"¥{n:,}"


def load_manufacturer(mfr_id: str) -> list[dict]:
    rows = []
    for path in sorted(DATA.glob("*.json")):
        d = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(d, dict) or d.get("manufacturer") != mfr_id:
            continue
        if not d.get("price"):
            continue
        perf = d.get("performanceAnalysis") or {}
        rel = float(
            d.get("reliabilityScore")
            or (d.get("reliability") or {}).get("score")
            or 0
        )
        feat_avg = feature_average(perf)
        overall = overall_score(feat_avg, rel)

        axes: list[dict] = []
        for short, key, label in AXIS_META:
            if key == "petHairRemoval":
                item = perf.get("petHairRemoval") or perf.get("petHair") or {}
                raw = sc(perf, "petHairRemoval")
                if raw is None:
                    raw = sc(perf, "petHair")
            elif key == "quietness":
                item = perf.get("quietness") or perf.get("nightQuietness") or {}
                raw = sc(perf, "quietness")
                if raw is None:
                    raw = sc(perf, "nightQuietness")
            else:
                item = perf.get(key) if isinstance(perf.get(key), dict) else {}
                raw = sc(perf, key)
            if not isinstance(item, dict):
                item = {}
            axes.append(
                {
                    "short": short,
                    "key": key,
                    "label": label,
                    "score": raw,
                    "comment": (item.get("comment") or "").strip(),
                }
            )

        complaints: list[dict] = []
        for c in (d.get("topComplaints") or [])[:3]:
            if not isinstance(c, dict):
                continue
            title = (c.get("title") or "").strip()
            desc = (c.get("description") or "").strip()
            if title or desc:
                complaints.append({"title": title, "description": desc})

        attributes: list[dict] = []
        for akey, alabel in ATTR_LABELS.items():
            node = (d.get("attributeScores") or {}).get(akey) or {}
            if not isinstance(node, dict):
                continue
            ov = node.get("overall")
            if ov is None:
                continue
            try:
                overall_attr = float(ov)
            except (TypeError, ValueError):
                continue
            reason_bits: list[str] = []
            details = node.get("details") or []
            if isinstance(details, list):
                ranked_details = []
                for det in details:
                    if not isinstance(det, dict):
                        continue
                    comment = (det.get("comment") or "").strip()
                    if not comment:
                        continue
                    try:
                        dscore = float(det.get("score"))
                    except (TypeError, ValueError):
                        dscore = 0.0
                    ranked_details.append((dscore, comment))
                ranked_details.sort(key=lambda x: -x[0])
                for _score, comment in ranked_details[:1]:
                    reason_bits.append(comment)
            attributes.append(
                {
                    "key": akey,
                    "label": alabel,
                    "overall": overall_attr,
                    "reason": " ".join(reason_bits).strip(),
                }
            )
        attributes.sort(key=lambda a: -a["overall"])

        row = {
            "id": d.get("productId") or path.stem,
            "name": d.get("productName") or path.stem,
            "price": int(d["price"]),
            "reviews": int(d.get("totalReviews") or 0),
            "rel": rel,
            "feat_avg": feat_avg,
            "overall": overall,
            "img": d.get("imageUrl") or "",
            "sat": (d.get("categoryC") or {}).get("userSatisfaction", {}).get("score"),
            "moshimo": ((d.get("affiliate") or {}).get("moshimo") or "").strip(),
            "direct": ((d.get("affiliate") or {}).get("direct") or "").strip(),
            "axes": axes,
            "complaints": complaints,
            "attributes": attributes,
        }
        for short, key in FEATURE_KEYS.items():
            item = perf.get(key) if isinstance(perf.get(key), dict) else {}
            raw = sc(perf, key)
            row[short] = raw
            row[f"{short}_w"] = weighted(raw, rel)
            row[f"{short}_comment"] = (item.get("comment") or "").strip()
        app_axis = next((a for a in axes if a["short"] == "app"), None)
        if app_axis:
            row["app"] = app_axis["score"]
            row["app_comment"] = app_axis["comment"]
        rows.append(row)
    rows.sort(key=lambda r: r["price"])
    return rows


def intro_paragraph(meta: dict, price_min: int, price_max: int, n: int) -> str:
    ja = meta["name_ja"]
    spread = price_max - price_min
    if spread >= 100_000:
        return (
            f"{ja}は、定価目安でおよそ{yen(price_min)}〜{yen(price_max)}と価格差の大きいメーカーです。"
            f"機種数が多く、「どれを選べばよいかわかりにくい」と感じる人も少なくありません。"
        )
    if n <= 6:
        return (
            f"{ja}は、定価目安でおよそ{yen(price_min)}〜{yen(price_max)}のラインナップです。"
            f"候補は絞りやすい一方、用途に合う1台を見極めることが大切です。"
        )
    return (
        f"{ja}は、定価目安でおよそ{yen(price_min)}〜{yen(price_max)}の製品を展開しています。"
        f"機種ごとの違いを整理し、自分に合う1台を選びやすくします。"
    )


def maker_switcher_html(current_slug: str) -> str:
    options = []
    for m in MANUFACTURERS:
        selected = " selected" if m["slug"] == current_slug else ""
        label = html.escape(f"{m['name_ja']}（{m['name_en']}）")
        href = html.escape(f"/makers/{m['slug']}")
        options.append(f'<option value="{href}"{selected}>{label}</option>')
    return f"""
      <div class="maker-switch">
        <label for="maker-switch-select">他メーカーの比較ページ</label>
        <select id="maker-switch-select" onchange="if(this.value) location.href=this.value;">
          {"".join(options)}
        </select>
      </div>"""


def load_ecovacs() -> list[dict]:
    """Backward-compatible alias."""
    return load_manufacturer("ECOVACS")


def best_by_weight(rows: list[dict], weight_key: str, pool: list[dict] | None = None):
    cands = pool if pool is not None else rows
    cands = [r for r in cands if r.get(weight_key) is not None]
    if not cands:
        return None
    return max(cands, key=lambda r: (r[weight_key], r["rel"], r["reviews"]))


def pick_band(rows: list[dict], lo: int, hi: int):
    cands = [r for r in rows if lo <= r["price"] < hi and r.get("overall") is not None]
    if not cands:
        cands = [r for r in rows if lo <= r["price"] < hi]
    if not cands:
        return None
    return max(cands, key=lambda r: (r.get("overall") or -1, r["rel"], r["reviews"]))


def scored_axes(product: dict) -> list[dict]:
    return [a for a in (product.get("axes") or []) if a.get("score") is not None]


def pick_strengths(product: dict, n: int = 3) -> list[dict]:
    return sorted(scored_axes(product), key=lambda a: -a["score"])[:n]


def pick_cautions(product: dict, n: int = 2) -> list[dict]:
    axes = scored_axes(product)
    if len(axes) <= 3:
        return []
    return sorted(axes, key=lambda a: a["score"])[:n]


def pick_trends(product: dict, preferred: list[str] | None = None, n: int = 3) -> list[dict]:
    by_short = {a["short"]: a for a in (product.get("axes") or []) if a.get("comment")}
    out: list[dict] = []
    seen: set[str] = set()
    for short in preferred or []:
        ax = by_short.get(short)
        if ax and short not in seen:
            out.append(ax)
            seen.add(short)
        if len(out) >= n:
            return out
    for ax in sorted(
        [a for a in (product.get("axes") or []) if a.get("comment") and a.get("score") is not None],
        key=lambda a: -a["score"],
    ):
        if ax["short"] in seen:
            continue
        out.append(ax)
        seen.add(ax["short"])
        if len(out) >= n:
            break
    return out


def pick_fit_audiences(product: dict, n: int = 3, min_score: float = 75.0) -> list[dict]:
    attrs = [a for a in (product.get("attributes") or []) if a["overall"] >= min_score]
    return attrs[:n]


def render_list_section(title: str, items_html: str, extra_class: str = "") -> str:
    if not items_html.strip():
        return ""
    cls = f"pick-section {extra_class}".strip()
    return f"""
        <div class="{cls}">
          <h4>{html.escape(title)}</h4>
          {items_html}
        </div>"""


def _clip(text: str, n: int = 90) -> str:
    """Truncate to whole sentences only. Never end with an ellipsis."""
    t = (text or "").strip()
    if not t:
        return t
    sentences: list[str] = []
    buf: list[str] = []
    for ch in t:
        buf.append(ch)
        if ch == "。":
            sentences.append("".join(buf).strip())
            buf = []
    if not sentences:
        # No sentence terminator — keep short text as-is; do not add "…"
        return t if len(t) <= n else t[:n].rstrip("、 ") + "。"

    out = ""
    for s in sentences:
        if not s:
            continue
        # Always keep the first sentence, even if it exceeds n
        if not out:
            out = s
            continue
        if len(out) + len(s) <= n:
            out += s
        else:
            break
    return out


# 行頭に来ると不自然な文字（助詞・句読点など）を直前に食い付かせる
_JA_NO_LINE_START = set("、。，．）］｝」』】〉》をにではがのともへやや")
# 行末に来ると不自然な開き記号
_JA_NO_LINE_END = set("（［｛「『【〈《")


def _ja_wrap(text: str) -> str:
    """Insert word joiners so 1–2 character orphans are less likely."""
    if not text:
        return text
    out: list[str] = []
    for i, ch in enumerate(text):
        if i > 0 and ch in _JA_NO_LINE_START:
            out.append("\u2060")
        out.append(ch)
        if ch in _JA_NO_LINE_END and i + 1 < len(text):
            out.append("\u2060")
    return "".join(out)


def render_entry(label: str, score_txt: str, body: str, tone: str = "") -> str:
    score_html = f'<span class="entry-score">{html.escape(score_txt)}</span>' if score_txt else ""
    body_html = (
        f'<p class="entry-body">{html.escape(_ja_wrap(body))}</p>' if body else ""
    )
    tone_cls = f" {tone}" if tone else ""
    return f"""
          <div class="entry{tone_cls}">
            <div class="entry-head">
              <span class="entry-label">{html.escape(label)}</span>
              {score_html}
            </div>
            {body_html}
          </div>"""


def article_pick(
    *,
    anchor_id: str,
    heading: str,
    lead: str,
    product: dict | None,
    trend_keys: list[str] | None = None,
) -> str:
    if not product:
        return f"""
      <article class="article-pick" id="{html.escape(anchor_id)}">
        <h3>{html.escape(heading)}</h3>
        <p class="lead">該当する製品はありません。</p>
      </article>"""

    strengths = pick_strengths(product, n=3)
    cautions = pick_cautions(product, n=2)
    strength_shorts = {a["short"] for a in strengths}
    cautions = [a for a in cautions if a["short"] not in strength_shorts][:2]
    used_shorts = strength_shorts | {a["short"] for a in cautions}
    preferred = [k for k in (trend_keys or []) if k not in used_shorts]
    trends = pick_trends(product, preferred or trend_keys, n=2)
    trends = [t for t in trends if t["short"] not in used_shorts][:2]
    fits = pick_fit_audiences(product, n=2)
    complaints = (product.get("complaints") or [])[:2]

    pros_cons = ""
    if strengths or cautions:
        left = ""
        right = ""
        if strengths:
            items = "".join(
                render_entry(
                    a["label"],
                    f"{a['score']:.0f}点",
                    _clip(a.get("comment") or "", 120),
                    "good",
                )
                for a in strengths
            )
            left = f'<div class="panel"><h4>強み</h4><div class="entry-stack">{items}</div></div>'
        if cautions:
            items = "".join(
                render_entry(
                    a["label"],
                    f"{a['score']:.0f}点",
                    _clip(a.get("comment") or "", 120),
                    "warn",
                )
                for a in cautions
            )
            right = f'<div class="panel panel-neg"><h4>注意点</h4><div class="entry-stack">{items}</div></div>'
        pros_cons = f'<div class="split">{left}{right}</div>'

    trends_html = ""
    if trends:
        items = "".join(
            render_entry(
                ax["label"],
                f"{ax['score']:.0f}点" if ax.get("score") is not None else "",
                _clip(ax.get("comment") or "", 120),
            )
            for ax in trends
        )
        trends_html = f'<div class="panel"><h4>口コミ傾向</h4><div class="entry-stack">{items}</div></div>'

    fit_html = ""
    if fits:
        items = []
        for a in fits:
            reason = (a.get("reason") or "").strip()
            if "。" in reason:
                reason = reason.split("。")[0] + "。"
            if not reason:
                reason = f"{a['label']}との相性が高いタイプです。"
            items.append(
                render_entry(
                    a["label"],
                    f"適合度 {a['overall']:.0f}点",
                    _clip(reason, 100),
                    "fit",
                )
            )
        fit_html = f'<div class="panel"><h4>向いている人</h4><div class="entry-stack">{"".join(items)}</div></div>'

    complaints_html = ""
    if complaints:
        items = "".join(
            render_entry(
                c.get("title") or "気になる点",
                "",
                _clip(c.get("description") or "", 120),
                "issue",
            )
            for c in complaints
        )
        complaints_html = f'<div class="panel panel-neg"><h4>よくある不満</h4><div class="entry-stack">{items}</div></div>'

    overall_txt = f"{product['overall']:.1f}" if product.get("overall") is not None else "—"

    return f"""
      <article class="article-pick" id="{html.escape(anchor_id)}" data-slug="{html.escape(product['id'])}">
        <h3>{html.escape(heading)}</h3>
        <div class="aff-mount" data-slug="{html.escape(product['id'])}">
          <p class="aff-status">かんたんリンクを読み込み中…</p>
        </div>
        <div class="article-copy">
          <div class="meta-block">
            <p class="meta">
              <span class="chip">{yen(product['price'])}</span>
              <span class="chip accent">総合点 {overall_txt}</span>
              <span class="chip">口コミ信頼度 {product['rel']:.1f}</span>
              <span class="chip">口コミ数 {product['reviews']:,}件</span>
            </p>
            <p class="price-caution">
              表示価格はメーカー公式の参考価格です。各ECサイトではセールが行われることが多いため、<strong>購入前に現在の販売価格の確認を強くおすすめ</strong>します。
            </p>
          </div>
          <p class="lead">{html.escape(lead)}</p>
          {pros_cons}
          {trends_html}
          {fit_html}
          {complaints_html}
          <p class="more"><a href="https://nattoku-labo.com/products/{html.escape(product['id'])}" target="_blank" rel="noopener">製品ページで詳しく見る →</a></p>
        </div>
      </article>"""



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
    // かんたんリンクのHTML/URL自体は変更しない。スマホでは製品ページと同じく枠内に収める。
    iframe.srcdoc =
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<base target="_blank" rel="noopener noreferrer">' +
      "<style>" +
      "*,*::before,*::after{box-sizing:border-box}" +
      "html,body{width:100%;max-width:100%;min-width:0;margin:0;padding:0;background:#fff;color:#0f172a;overflow-x:hidden}" +
      "body{display:block}" +
      '[id^="msmaflink-"]{width:100%!important;max-width:100%!important;min-width:0!important}' +
      "div.easyLink-box{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}" +
      "div.easyLink-box div.easyLink-img," +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box{" +
      "width:240px!important;min-width:240px!important;max-width:240px!important;" +
      "height:240px!important;flex:0 0 240px!important;flex-shrink:0!important;" +
      "margin-right:16px!important;box-sizing:border-box!important}" +
      "div.easyLink-box div.easyLink-img::before{display:none!important;padding-top:0!important;content:none!important}" +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box span{" +
      "width:240px!important;height:240px!important}" +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box span>img," +
      "div.easyLink-box img.js-item-image{" +
      "max-width:240px!important;max-height:240px!important;" +
      "width:auto!important;height:auto!important;min-width:0!important;object-fit:contain!important}" +
      "@media screen and (max-width:480px){" +
      "div.easyLink-box{display:block!important}" +
      "div.easyLink-box div.easyLink-img," +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box{" +
      "width:min(220px,100%)!important;min-width:0!important;max-width:100%!important;" +
      "height:auto!important;aspect-ratio:1!important;flex-basis:auto!important;margin:0 auto 12px!important}" +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box span{width:100%!important;height:auto!important;aspect-ratio:1!important}" +
      "div.easyLink-box div.easyLink-img p.easyLink-img-box span>img," +
      "div.easyLink-box img.js-item-image{max-width:100%!important;max-height:220px!important}" +
      "div.easyLink-box div.easyLink-info{min-width:0!important;width:100%!important}" +
      "div.easyLink-box div.easyLink-info p.easyLink-info-btn a{width:100%!important;max-width:100%!important;min-width:0!important}" +
      "}" +
      "</style></head><body>" +
      safe +
      "</body></html>";
    iframe.style.cssText = "width:100%;max-width:100%;min-width:0;border:0;display:block;";

    function fitHeight() {
      try {
        const d = iframe.contentDocument;
        if (!d || !d.body) return;
        const mount = d.querySelector('[id^="msmaflink-"]') || d.body;
        const r = mount.getBoundingClientRect();
        let h = Math.max(Math.ceil(r.height), mount.offsetHeight || 0, mount.scrollHeight || 0);
        if (!h) {
          h = Math.max(
            d.documentElement ? d.documentElement.scrollHeight : 0,
            d.body.scrollHeight,
          );
        }
        h = Math.min(Math.max(h, 120), 1200);
        iframe.style.height = Math.ceil(h + 12) + "px";
      } catch (e) {}
    }

    iframe.addEventListener("load", function () {
      fitHeight();
      const id = window.setInterval(fitHeight, 400);
      window.setTimeout(function () { window.clearInterval(id); }, 12000);
    });
    window.addEventListener("resize", fitHeight);
    container.appendChild(iframe);
  }

  function extractOfficialHref(directHtml) {
    if (!directHtml) return null;
    const hrefM = String(directHtml).match(/href=["']([^"']+)["']/i);
    if (hrefM) {
      let href = hrefM[1];
      if (href.indexOf("//") === 0) href = "https:" + href;
      return href;
    }
    const a8 = String(directHtml).match(/"ejp"\s*:\s*"([^"]*)"\s*\+\s*"([^"]*)"/i);
    if (a8) return a8[1] + a8[2];
    const a8b = String(directHtml).match(/"h"\s*\+\s*"(ttps:\/\/[^"]+)"/i);
    if (a8b) return "h" + a8b[1];
    return null;
  }

  function buildOfficialHpButton(directHtml) {
    const href = extractOfficialHref(directHtml);
    if (!href) return null;
    const wrap = document.createElement("div");
    wrap.className = "aff-direct";
    const a = document.createElement("a");
    a.className = "official-hp-btn";
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener sponsored nofollow";
    a.textContent = "メーカー公式ホームページ";
    wrap.appendChild(a);
    // 1x1計測ピクセルがあれば残す（かんたんリンクHTMLは改変しない）
    const pixM = String(directHtml).match(
      /<img[^>]+src=["']([^"']+)["'][^>]*(?:width=["']?1\b|height=["']?1\b)/i
    );
    if (pixM) {
      const img = document.createElement("img");
      img.src = pixM[1];
      img.width = 1;
      img.height = 1;
      img.alt = "";
      img.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";
      wrap.style.position = "relative";
      wrap.appendChild(img);
    }
    return wrap;
  }

  function mount(el) {
    const slug = el.getAttribute("data-slug");
    const pack = (window.__AFFILIATE__ || {})[slug];
    if (!pack) {
      el.innerHTML = '<p class="aff-status error">かんたんリンク未設定</p>';
      return;
    }
    const hasMoshimo = !!(pack.moshimo && String(pack.moshimo).trim());
    const hasDirect = !!(pack.direct && String(pack.direct).trim());
    if (!hasMoshimo && !hasDirect) {
      el.innerHTML = '<p class="aff-status error">かんたんリンク未設定</p>';
      return;
    }
    el.innerHTML = "";
    if (hasMoshimo) {
      const slot = document.createElement("div");
      slot.className = "aff-moshimo";
      injectMoshimoIframe(slot, pack.moshimo);
      el.appendChild(slot);
    }
    if (hasDirect) {
      const btn = buildOfficialHpButton(pack.direct);
      if (btn) el.appendChild(btn);
    }
  }

  document.querySelectorAll(".aff-mount[data-slug]").forEach(mount);
})();
"""


def score_band_class(v) -> str:
    if v is None:
        return ""
    try:
        n = float(v)
    except (TypeError, ValueError):
        return ""
    if n >= 90:
        return "s90"
    if n >= 80:
        return "s80"
    if n >= 70:
        return "s70"
    return "s60"


def build_vertical_table(rows: list[dict]) -> str:
    heads = []
    for r in rows:
        img = (
            f'<img class="product-photo" src="{html.escape(r["img"])}" alt="" width="96" height="96" loading="lazy">'
            if r.get("img")
            else ""
        )
        heads.append(
            f"""
            <th scope="col" class="product-col">
              <div class="product-head">
                <a href="https://nattoku-labo.com/products/{html.escape(r['id'])}" target="_blank" rel="noopener">
                  {img}
                  <div class="product-name">{html.escape(r['name'])}</div>
                </a>
                <div class="product-price">{yen(r['price'])}</div>
                <a class="detail-page-link" href="https://nattoku-labo.com/products/{html.escape(r['id'])}" target="_blank" rel="noopener">詳細を見る →</a>
              </div>
            </th>"""
        )

    def cells(fn):
        return "".join(f"<td>{fn(r)}</td>" for r in rows)

    def num_cells(key, fmt="{:.0f}"):
        out = []
        for r in rows:
            v = r.get(key)
            band = score_band_class(v)
            cls = f"score {band}".strip()
            out.append(f"<td class='{cls}'>{'—' if v is None else fmt.format(v)}</td>")
        return "".join(out)

    def feature_cells(raw_key: str, w_key: str):
        out = []
        for r in rows:
            v = r.get(raw_key)
            w = r.get(w_key)
            cls = f"score {score_band_class(v)}".strip()
            label = "—" if v is None else f"{v:.0f}"
            tip = "" if w is None else f" title='加重 {w:.1f}'"
            out.append(f"<td class='{cls}'{tip}>{label}</td>")
        return "".join(out)

    return f"""
    <p class="swipe-hint">← 表は横にスワイプできます →</p>
    <div class="compare-scroll-wrap">
      <div class="compare-scroll">
        <table class="compare">
          <thead>
            <tr>
              <th scope="col">比較項目</th>
              {''.join(heads)}
            </tr>
          </thead>
          <tbody>
            <tr class="row-group"><td>口コミ信頼度</td>{num_cells('rel', '{:.1f}')}</tr>
            <tr><td>口コミ件数</td>{cells(lambda r: f"{r['reviews']:,}")}</tr>
            <tr><td>満足度</td>{cells(lambda r: '—' if r.get('sat') is None else f"{r['sat']}")}</tr>
            <tr class="row-group"><td>フローリング</td>{feature_cells('floor', 'floor_w')}</tr>
            <tr><td>カーペット</td>{feature_cells('carpet', 'carpet_w')}</tr>
            <tr><td>静音性</td>{feature_cells('quiet', 'quiet_w')}</tr>
            <tr><td>ペット毛</td>{feature_cells('pet', 'pet_w')}</tr>
            <tr><td>メンテナンス</td>{feature_cells('maint', 'maint_w')}</tr>
            <tr><td>バッテリー</td>{feature_cells('battery', 'battery_w')}</tr>
            <tr><td>段差乗り越え</td>{feature_cells('step', 'step_w')}</tr>
            <tr class="row-group"><td>価格目安</td>{cells(lambda r: yen(r['price']))}</tr>
          </tbody>
        </table>
      </div>
    </div>"""


def build_toc(
    price_items: list[tuple[str, str]],
    feature_items: list[tuple[str, str]],
    persona_items: list[tuple[str, str]],
    *,
    brand_ja: str,
) -> str:
    def lis(items: list[tuple[str, str]]) -> str:
        return "".join(
            f'<li><a href="#{html.escape(aid)}">{html.escape(label)}</a></li>'
            for label, aid in items
        )

    return f"""
    <nav class="toc-box" aria-label="目次">
      <p class="toc-title">目次</p>
      <ol class="toc-list">
        <li><a href="#intro">この記事でわかること</a></li>
        <li>
          <a href="#table">{html.escape(brand_ja)}全製品を一覧比較</a>
        </li>
        <li>
          <a href="#price">予算別のおすすめ機種</a>
          <ol>{lis(price_items)}</ol>
        </li>
        <li>
          <a href="#feature">機能で選ぶおすすめ機種</a>
          <ol>{lis(feature_items)}</ol>
        </li>
        <li>
          <a href="#persona">こんな人におすすめの機種</a>
          <ol>{lis(persona_items)}</ol>
        </li>
        <li><a href="#summary">まとめ｜{html.escape(brand_ja)}の選び方</a></li>
      </ol>
    </nav>"""



def build_manufacturer_page(meta: dict) -> Path:
    rows = load_manufacturer(meta["id"])
    assert rows, f"no products for {meta['id']}"

    brand_ja = meta["name_ja"]
    brand_en = meta["name_en"]
    brand_full = meta["name_full"]
    slug = meta["slug"]

    prices = [r["price"] for r in rows]
    price_min, price_max = min(prices), max(prices)

    # Price bands — article style
    price_toc: list[tuple[str, str]] = []
    band_html = []
    for label, lo, hi, aid in PRICE_BANDS:
        cands = [r for r in rows if lo <= r["price"] < hi]
        p = pick_band(rows, lo, hi)
        price_toc.append((f"予算{label}", aid))
        if not p:
            band_html.append(
                article_pick(
                    anchor_id=aid,
                    heading=f"予算{label}のおすすめ",
                    lead=f"現時点で、この価格帯に該当する{brand_ja}製品はありません。",
                    product=None,
                )
            )
            continue
        ranked_band = sorted(
            cands,
            key=lambda r: (-(r.get("overall") or -1), -r["rel"], -r["reviews"]),
        )
        if len(cands) == 1:
            lead = f"この価格帯に該当するのは{p['name']}です。"
        else:
            lead = f"この価格帯（{len(cands)}製品）のなかで、総合点が最も高いのは{p['name']}です。"
        if len(ranked_band) > 1 and ranked_band[1].get("overall") is not None:
            second = ranked_band[1]
            lead += f" 2位は{second['name']}（総合点{second['overall']:.1f}）です。"
        band_html.append(
            article_pick(
                anchor_id=aid,
                heading=f"予算{label}なら：{p['name']}",
                lead=lead,
                product=p,
                trend_keys=["floor", "quiet", "maint"],
            )
        )

    # Feature ranking
    feature_slots = [
        (
            "フローリング",
            "floor",
            "floor_w",
            "feat-floor",
            "床掃除・水拭きの仕上がりを重視する人向け",
            "フローリング掃除が得意な機種",
        ),
        (
            "カーペット",
            "carpet",
            "carpet_w",
            "feat-carpet",
            "ラグや絨毯のゴミ取りを重視する人向け",
            "カーペット掃除が得意な機種",
        ),
        (
            "静音性",
            "quiet",
            "quiet_w",
            "feat-quiet",
            "在宅中・夜間の運転音が気になる人向け",
            "静音性に優れた機種",
        ),
        (
            "ペット毛",
            "pet",
            "pet_w",
            "feat-pet",
            "犬猫の抜け毛対策を重視する人向け",
            "ペットの毛に強い機種",
        ),
        (
            "メンテナンス",
            "maint",
            "maint_w",
            "feat-maint",
            "手入れの手間を減らしたい人向け",
            "手入れが楽な機種",
        ),
        (
            "バッテリー",
            "battery",
            "battery_w",
            "feat-battery",
            "広い家でも一気に掃除したい人向け",
            "バッテリー持ちが良い機種",
        ),
    ]
    feature_toc: list[tuple[str, str]] = []
    feature_html = []
    for label, raw_k, w_k, aid, audience, h3_base in feature_slots:
        feature_toc.append((h3_base, aid))
        ranked = sorted(
            [r for r in rows if r.get(w_k) is not None],
            key=lambda r: (-r[w_k], -r["rel"], -r["reviews"]),
        )
        top = ranked[0] if ranked else None
        second = ranked[1] if len(ranked) > 1 else None
        if not top:
            feature_html.append(
                article_pick(
                    anchor_id=aid,
                    heading=h3_base,
                    lead="該当する製品はありません。",
                    product=None,
                )
            )
            continue
        lead = (
            f"{audience}です。{brand_ja}製品のなかで「{label}」の評価が最も高いのは"
            f"{top['name']}です。"
        )
        if second:
            lead += f" 2位は{second['name']}です。"
        feature_html.append(
            article_pick(
                anchor_id=aid,
                heading=f"{h3_base}：{top['name']}",
                lead=lead,
                product=top,
                trend_keys=[raw_k, "floor", "maint"],
            )
        )

    # Personas
    personas = [
        (
            "コスパ重視の人",
            "floor",
            "floor_w",
            "persona-cost",
            [r for r in rows if r["price"] < 100000],
            "10万円未満に絞ったうえで、フローリング評価が最も高い機種を選んでいます。予算を抑えつつ床掃除の満足度を取りたい人向けです。",
        ),
        (
            "静かに使いたい人",
            "quiet",
            "quiet_w",
            "persona-quiet",
            rows,
            "静音性の評価が最も高い機種です。在宅ワークや夜間運転で音が気になる人向けです。",
        ),
        (
            "ペットのいる家",
            "pet",
            "pet_w",
            "persona-pet",
            rows,
            "ペット毛の評価が最も高い機種です。抜け毛の吸引を優先したい家庭向けです。",
        ),
        (
            "床をきれいにしたい人",
            "floor",
            "floor_w",
            "persona-floor",
            rows,
            "フローリングの評価が最も高い機種です。水拭きや床の仕上がりを最優先する人向けです。",
        ),
        (
            "手間を減らしたい人",
            "maint",
            "maint_w",
            "persona-maint",
            rows,
            "メンテナンスの評価が最も高い機種です。自動洗浄・手入れの楽さを重視する人向けです。",
        ),
        (
            "ハイエンドを探している人",
            "floor",
            "floor_w",
            "persona-high",
            [r for r in rows if r["price"] >= 150000] or rows,
            "15万円以上の上位機に絞り、フローリング評価が最も高い機種を選んでいます。予算に余裕がある人向けです。",
        ),
    ]
    persona_toc: list[tuple[str, str]] = []
    persona_html = []
    for title, raw_k, w_k, aid, pool, lead_base in personas:
        persona_toc.append((title, aid))
        top = best_by_weight(rows, w_k, pool)
        if not top:
            persona_html.append(
                article_pick(
                    anchor_id=aid,
                    heading=f"{title}向けのおすすめ",
                    lead="該当する製品はありません。",
                    product=None,
                )
            )
            continue
        persona_html.append(
            article_pick(
                anchor_id=aid,
                heading=f"{title}なら：{top['name']}",
                lead=lead_base,
                product=top,
                trend_keys=[raw_k, "floor", "quiet"],
            )
        )

    toc = build_toc(price_toc, feature_toc, persona_toc, brand_ja=brand_ja)
    switcher = maker_switcher_html(slug)
    intro = intro_paragraph(meta, price_min, price_max, len(rows))

    aff_map: dict[str, dict[str, str]] = {}
    for r in rows:
        if r.get("moshimo") or r.get("direct"):
            aff_map[r["id"]] = {
                "moshimo": r.get("moshimo") or "",
                "direct": r.get("direct") or "",
            }
    aff_json = json.dumps(aff_map, ensure_ascii=False).replace("</", "<\\/")

    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <title>【全機種比較】{html.escape(brand_ja)}ロボット掃除機｜口コミでわかるおすすめの選び方｜ナットクLabo</title>
  <meta name="description" content="{html.escape(brand_full)}のロボット掃除機{len(rows)}製品を口コミ分析データで横断比較。価格帯・機能・暮らし方別のおすすめも掲載します。">
  <link rel="canonical" href="{SITE}/makers/{slug}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="{SITE}/makers/{slug}">
  <meta property="og:title" content="【全機種比較】{html.escape(brand_ja)}ロボット掃除機｜口コミでわかるおすすめの選び方">
  <meta property="og:description" content="{html.escape(brand_full)}のロボット掃除機{len(rows)}製品を口コミ分析データで横断比較します。">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "【全機種比較】{html.escape(brand_ja)}ロボット掃除機｜口コミでわかるおすすめの選び方",
    "url": "{SITE}/makers/{slug}",
    "description": "{html.escape(brand_full)}のロボット掃除機{len(rows)}製品を口コミ分析データで横断比較します。"
  }}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{"@type": "ListItem", "position": 1, "name": "ホーム", "item": "{SITE}/"}},
      {{"@type": "ListItem", "position": 2, "name": "メーカー比較", "item": "{SITE}/makers/"}},
      {{"@type": "ListItem", "position": 3, "name": "{html.escape(brand_ja)}", "item": "{SITE}/makers/{slug}"}}
    ]
  }}
  </script>
  <style>
    :root {{
      --primary:#1e40af; --secondary:#0f172a; --bg:#f1f5f9; --card:#fff;
      --text:#1e293b; --muted:#64748b; --line:#e2e8f0; --good:#059669;
    }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    html {{ scroll-behavior:smooth; }}
    body {{
      font-family:"Noto Sans JP",sans-serif; background:var(--bg); color:var(--text);
      line-height:1.8; font-size:16px;
      overflow-x:clip;
    }}
    .crumb a {{ color:#bfdbfe; text-decoration:none; }}
    .crumb a:hover {{ text-decoration:underline; }}
    .maker-switch {{
      margin-top:.9rem; display:flex; flex-wrap:wrap; align-items:center; gap:.55rem .75rem;
    }}
    .maker-switch label {{
      font-size:.78rem; font-weight:800; opacity:.9;
    }}
    .maker-switch select {{
      min-width:min(100%, 16rem); padding:.45rem .7rem; border-radius:8px;
      border:1px solid rgba(255,255,255,.35); background:rgba(15,23,42,.35); color:#fff;
      font-weight:700; font-size:.86rem;
    }}
    .maker-switch select option {{ color:#0f172a; }}
    .wrap {{ max-width:1080px; margin:0 auto; padding:0 1rem; }}
    .wrap-wide {{ max-width:1080px; margin:0 auto; padding:0 1rem; }}
    .intro-block {{
      max-width:100%; margin:0 auto;
    }}
    @media (min-width:720px) {{
      .wrap, .wrap-wide {{ padding:0 1.25rem; }}
    }}
    @media (min-width:1200px) {{
      .wrap, .wrap-wide {{ padding:0 1.5rem; }}
    }}

    header.hero {{
      background:linear-gradient(135deg,var(--primary),var(--secondary));
      color:#fff; padding:1.6rem 1rem 1.8rem;
    }}
    .crumb {{ font-size:.78rem; opacity:.85; margin-bottom:.55rem; }}
    h1 {{
      font-size:clamp(1.15rem,3.4vw,1.85rem); font-weight:900; line-height:1.4; margin-bottom:.55rem;
      text-wrap:pretty; overflow-wrap:break-word;
    }}
    .lede {{ font-size:.95rem; opacity:.95; max-width:40rem; }}

    main {{ padding:1.25rem 0 3rem; }}
    .article-card {{
      background:transparent; border:0; border-radius:0;
      padding:0.35rem 0 1.6rem; margin-bottom:0.4rem;
    }}
    @media (min-width:720px) {{
      .article-card {{ padding:0.5rem 0 1.8rem; }}
    }}

    .know {{
      background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px;
      padding:.9rem 1rem; margin:0 0 1.1rem;
    }}
    .know h2 {{
      font-size:.95rem; margin:0 0 .45rem; color:#1e3a8a; border:0; padding:0;
    }}
    .know ul {{ margin:0; padding-left:1.15rem; }}
    .know li {{ margin:.2rem 0; font-size:.9rem; font-weight:700; color:#1e3a8a; }}

    .intro p {{ margin:0 0 .85rem; font-size:.95rem; }}
    .intro p:last-child {{ margin-bottom:0; }}

    .toc-box {{
      margin:1.25rem 0 0; padding:1rem 1.1rem; background:#f8fafc;
      border:1px solid var(--line); border-left:4px solid var(--primary); border-radius:10px;
    }}
    .toc-title {{
      font-size:.95rem; font-weight:900; margin-bottom:.55rem; color:var(--secondary);
    }}
    .toc-list {{ margin:0; padding-left:1.25rem; }}
    .toc-list > li {{ margin:.35rem 0; font-weight:800; font-size:.9rem; }}
    .toc-list ol {{ margin:.25rem 0 .45rem; padding-left:1.15rem; }}
    .toc-list ol li {{ font-weight:600; font-size:.84rem; margin:.18rem 0; }}
    .toc-list a {{ color:var(--primary); text-decoration:none; }}
    .toc-list a:hover {{ text-decoration:underline; }}

    section.chapter {{ margin:1.5rem 0 2rem; }}
    section.chapter > h2 {{
      font-size:1.2rem; font-weight:900; margin:0 0 .55rem; color:var(--secondary);
      padding-bottom:.4rem; border-bottom:2px solid #bfdbfe;
    }}
    .sec-lead {{
      margin:0 0 1rem; font-size:.92rem; line-height:1.7; color:#475569;
    }}
    .articles {{ display:flex; flex-direction:column; gap:2rem; }}
    .article-pick h3 {{
      font-size:1.08rem; font-weight:900; margin:0 0 .85rem; color:#0f172a;
      padding:.7rem .85rem .7rem 1rem;
      border-left:5px solid #2563eb;
      background:linear-gradient(90deg,#eff6ff 0%,#f8fafc 70%,transparent 100%);
      border-radius:0 10px 10px 0;
    }}
    .aff-mount {{
      margin:0 0 1rem; min-height:2rem;
    }}
    .aff-status {{
      margin:0; font-size:.84rem; color:#64748b; font-weight:600;
    }}
    .aff-status.error {{ color:#b45309; }}
    .aff-moshimo {{
      display:block; width:100%; max-width:100%; min-width:0;
      border:0; background:transparent; overflow:hidden;
    }}
    .aff-moshimo iframe {{
      width:100%; max-width:100%; min-width:0; border:0; display:block;
    }}
    .aff-direct {{
      margin:.55rem 0 0;
      width:100%;
      max-width:560px;
    }}
    .official-hp-btn {{
      display:block; width:100%; box-sizing:border-box;
      text-align:center; text-decoration:none;
      padding:.85rem 1.1rem; border-radius:10px;
      background:#0f766e; color:#fff; border:1px solid #0d9488;
      font-weight:800; font-size:.95rem; line-height:1.35;
      box-shadow:0 1px 4px rgba(13,148,136,.18);
    }}
    .official-hp-btn:hover {{
      background:#0d9488;
    }}
    .article-copy {{ width:100%; min-width:0; }}
    .meta-block {{
      margin:0 0 1rem; padding:.85rem .95rem;
      background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;
    }}
    .article-copy .meta {{
      display:flex; flex-wrap:wrap; gap:.5rem;
      margin:0 0 .65rem;
    }}
    .chip {{
      display:inline-flex; align-items:center;
      padding:.45rem .85rem; border-radius:999px;
      background:#e2e8f0; color:#0f172a;
      font-size:.92rem; font-weight:900; line-height:1.25;
    }}
    .chip.accent {{
      background:#dbeafe; color:#1e40af; border:1px solid #93c5fd;
    }}
    .price-caution {{
      margin:0; font-size:.8rem; line-height:1.65; color:#64748b; font-weight:600;
    }}
    .price-caution strong {{
      color:#b45309; font-weight:900;
    }}
    .article-copy .lead, .article-pick > .lead {{
      margin:0 0 1rem; font-size:.92rem; line-height:1.7; color:#475569;
    }}
    .split {{
      display:grid; grid-template-columns:1fr 1fr; gap:.75rem;
      margin:0 0 .75rem;
    }}
    @media (max-width:720px) {{
      .split {{ grid-template-columns:1fr; }}
    }}
    .panel {{
      background:#fff; border:1px solid #e2e8f0; border-radius:12px;
      padding:.75rem .8rem .85rem;
    }}
    .panel.panel-neg {{
      background:#fff7f7; border-color:#fecdd3;
    }}
    .panel h4 {{
      margin:0 0 .55rem; font-size:.92rem; font-weight:900; color:#1e40af;
    }}
    .panel-neg h4 {{ color:#be123c; }}
    .entry-stack {{
      display:flex; flex-direction:column; gap:.55rem;
    }}
    .entry {{
      border:1px solid #e2e8f0; border-radius:10px; padding:.55rem .65rem;
      background:#f8fafc;
    }}
    .entry.good {{ border-color:#a7f3d0; background:#ecfdf5; }}
    .entry.warn {{ border-color:#fecdd3; background:#fff1f2; }}
    .entry.fit {{ border-color:#bfdbfe; background:#eff6ff; }}
    .entry.issue {{ border-color:#fecdd3; background:#fff1f2; }}
    .entry-head {{
      display:flex; flex-wrap:wrap; align-items:baseline; gap:.35rem .65rem;
      justify-content:flex-start; margin-bottom:.25rem;
    }}
    .entry-label {{ font-size:.86rem; font-weight:900; color:#0f172a; }}
    .entry-score {{
      flex-shrink:0; font-size:.8rem; font-weight:900; color:#475569;
    }}
    .entry.good .entry-score {{ color:#047857; }}
    .entry.warn .entry-score {{ color:#e11d48; }}
    .entry.fit .entry-score {{ color:#1d4ed8; }}
    .entry.issue .entry-score {{ color:#e11d48; }}
    .entry.warn .entry-label,
    .entry.issue .entry-label {{
      color:#0f172a;
    }}
    .entry-body {{
      margin:0; font-size:.84rem; line-height:1.7; color:#475569; font-weight:500;
      line-break:strict; word-break:normal; overflow-wrap:anywhere;
      text-wrap:pretty;
    }}
    .entry.warn .entry-body,
    .entry.issue .entry-body {{
      color:#57534e;
    }}
    .article-copy .more {{
      margin:.85rem 0 0; padding-top:.85rem;
      border-top:1px solid #eef2f7;
    }}
    .article-copy .more a {{
      display:inline-flex; align-items:center; justify-content:center;
      gap:.35rem;
      min-height:2.6rem; padding:.65rem 1.15rem;
      border-radius:10px;
      background:#1e40af; color:#fff;
      font-size:.9rem; font-weight:800; line-height:1.2;
      text-decoration:none;
      box-shadow:0 1px 3px rgba(30,64,175,.25);
    }}
    .article-copy .more a:hover {{
      background:#1d4ed8;
    }}
    .summary-box {{
      background:#fff; border:1px solid var(--line); border-radius:12px;
      padding:1rem 1.1rem;
    }}
    .summary-box p {{ margin:0 0 .75rem; font-size:.95rem; }}
    .summary-box ul {{ margin:0; padding-left:1.2rem; }}
    .summary-box li {{ margin:.3rem 0; font-weight:700; }}
    .summary-box a {{ color:var(--primary); text-decoration:none; }}
    .summary-box a:hover {{ text-decoration:underline; }}

    /* compare table — page-centered block, directly under TOC */
    .table-chapter {{ margin-top:1.1rem; }}
    .table-panel {{
      background:#fff; border:1px solid var(--line); border-radius:14px;
      padding:.85rem .6rem 1rem; overflow:hidden;
    }}
    @media (min-width:720px) {{
      .table-panel {{ padding:1rem 1rem 1.15rem; }}
    }}
    .table-panel > h2 {{
      font-size:1.15rem; font-weight:900; margin:0 0 .45rem; color:var(--secondary);
    }}
    .table-chapter .sec-lead {{
      margin:0 0 .85rem; font-size:.88rem; color:#64748b;
    }}
    .swipe-hint {{
      margin:0 0 .45rem; text-align:center;
      font-size:.78rem; font-weight:800; color:#2563eb;
    }}
    .compare-scroll-wrap {{
      position:relative; overflow:hidden;
    }}
    .compare-scroll {{
      overflow-x:auto; overflow-y:hidden;
      overscroll-behavior-x:contain;
    }}
    table.compare {{
      width:max-content; min-width:100%;
      border-collapse:separate; border-spacing:0;
      font-size:.78rem;
    }}
    table.compare th, table.compare td {{
      border-bottom:1px solid #e2e8f0; padding:.45rem .4rem; text-align:center;
      vertical-align:middle;
    }}
    table.compare tbody td:not(:first-child),
    table.compare thead th.product-col {{
      position:relative; z-index:0;
    }}
    table.compare th:first-child, table.compare td:first-child {{
      position:sticky; left:0; z-index:6;
      background:#f8fafc; text-align:left; font-weight:800;
      min-width:7.5rem; width:7.5rem;
      box-shadow:4px 0 8px -6px rgba(15,23,42,.35);
      transform:translateZ(0);
    }}
    /* Cover any cell that tries to paint left of 比較項目 */
    table.compare th:first-child::before,
    table.compare td:first-child::before {{
      content:""; position:absolute; top:-1px; bottom:-1px; right:100%;
      width:2rem; background:#fff; pointer-events:none;
    }}
    table.compare thead th {{
      background:#f8fafc; vertical-align:bottom;
    }}
    table.compare thead th:first-child {{
      z-index:8; vertical-align:middle;
    }}
    .product-head {{
      display:flex; flex-direction:column; align-items:center; gap:.35rem;
      overflow:hidden; max-width:7.5rem;
    }}
    .product-photo {{
      width:96px; height:96px; object-fit:contain; border-radius:10px;
      border:1px solid var(--line); background:#fff;
    }}
    .product-name {{ font-size:.72rem; font-weight:800; line-height:1.35; max-width:7.5rem; }}
    a.detail-page-link {{
      display:inline-flex; align-items:center; justify-content:center; width:100%;
      padding:.4rem .35rem; font-size:.72rem; font-weight:800; color:#1e40af;
      background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; text-decoration:none;
    }}
    a.detail-page-link:hover {{ background:#2563eb; color:#fff; border-color:#1d4ed8; }}
    @media (max-width:720px) {{
      table.compare {{ font-size:.72rem; }}
      table.compare th:first-child, table.compare td:first-child {{
        min-width:5.2rem; width:5.2rem; font-size:.7rem; line-height:1.3;
      }}
      .product-head {{ max-width:6.2rem; }}
      .product-photo {{ width:68px; height:68px; }}
      .product-name {{ max-width:6.2rem; font-size:.68rem; }}
      a.detail-page-link {{ font-size:.66rem; padding:.32rem .25rem; }}
    }}
    td.score {{ font-weight:900; font-variant-numeric:tabular-nums; }}
    td.score.s90 {{ color:#047857; background:#ecfdf5; }}
    td.score.s80 {{ color:#1d4ed8; background:#eff6ff; }}
    td.score.s70 {{ color:#a16207; background:#fffbeb; }}
    td.score.s60 {{ color:#b91c1c; background:#fef2f2; }}
    tr.row-group td {{ border-top:2px solid #cbd5e1; }}
  </style>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb"><a href="/">ホーム</a> › <a href="/makers/">メーカー比較</a> › {html.escape(brand_ja)}</nav>
      <h1>【全機種比較】{html.escape(brand_ja)}ロボット掃除機｜口コミでわかるおすすめの選び方</h1>
      <p class="lede">口コミ分析データで、{html.escape(brand_full)}のロボット掃除機{len(rows)}製品を横断比較します。</p>
      {switcher}
    </div>
  </header>

  <main>
    <div class="wrap-wide">
      <div class="article-card intro-block" id="intro">
        <div class="know">
          <h2>この記事でわかること</h2>
          <ul>
            <li>{html.escape(brand_ja)}全{len(rows)}製品の違い（一覧比較）</li>
            <li>予算別・機能別・暮らし方別のおすすめ機種</li>
            <li>各おすすめに対応する口コミ傾向</li>
          </ul>
        </div>

        <div class="intro">
          <p>{html.escape(intro)}</p>
          <p>本記事では、ナットクLaboが分析した口コミデータを使い、全製品を比較表で俯瞰したうえで、価格帯・機能・暮らし方ごとのおすすめを解説します。</p>
        </div>

        {toc}
      </div>

      <section class="chapter table-chapter" id="table">
        <div class="table-panel">
          <h2>{html.escape(brand_ja)}全製品を一覧比較</h2>
          <p class="sec-lead">左列が比較項目、右に各製品です。点数は<strong>90点台が緑</strong>、<strong>80点台が青</strong>、<strong>70点台が黄</strong>、<strong>70点未満が赤</strong>です。セルにマウスを置くと加重点を表示します。</p>
          {build_vertical_table(rows)}
        </div>
      </section>
    </div>

    <div class="wrap">
      <section class="chapter article-card" id="price">
        <h2>予算別のおすすめ機種</h2>
        <p class="sec-lead">まず予算で絞りたい人向けです。各価格帯で総合点が最も高い機種を、強み・注意点・口コミ傾向付きで紹介します。</p>
        <div class="articles">{''.join(band_html)}</div>
      </section>

      <section class="chapter article-card" id="feature">
        <h2>機能で選ぶおすすめ機種</h2>
        <p class="sec-lead">「床をきれいにしたい」「静かに使いたい」など、機能の優先順位がはっきりしている人向けです。機能ごとに1機種ずつ、口コミ傾向付きで紹介します。</p>
        <div class="articles">{''.join(feature_html)}</div>
      </section>

      <section class="chapter article-card" id="persona">
        <h2>こんな人におすすめの機種</h2>
        <p class="sec-lead">暮らし方やこだわりに合わせて選ぶ場合の目安です。タイプごとに重視する機能を決め、機能評価85%・口コミ信頼度15%の加重点で1機種を選んでいます。</p>
        <div class="articles">{''.join(persona_html)}</div>
      </section>

      <section class="chapter article-card" id="summary">
        <h2>まとめ｜{html.escape(brand_ja)}の選び方</h2>
        <div class="summary-box">
          <p>{html.escape(brand_ja)}は、まず比較表で全体を把握し、そのあと「予算」「機能」「暮らし方」のどれかで絞るのがおすすめです。</p>
          <ul>
            <li>全体を見る → <a href="#table">{html.escape(brand_ja)}全製品を一覧比較</a></li>
            <li>予算で決める → <a href="#price">予算別のおすすめ機種</a></li>
            <li>性能で決める → <a href="#feature">機能で選ぶおすすめ機種</a></li>
            <li>暮らし方で決める → <a href="#persona">こんな人におすすめの機種</a></li>
          </ul>
        </div>
      </section>
    </div>
  </main>
  <script>
    window.__AFFILIATE__ = {aff_json};
  </script>
  <script>
{AFFILIATE_JS}
  </script>
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
</body>
</html>
"""
    out = OUT_DIR / f"{slug}.html"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out} ({len(rows)} {brand_en} products, affiliate={len(aff_map)})")
    return out


def build_index_page(counts: dict[str, int]) -> Path:
    cards = []
    for m in MANUFACTURERS:
        n = counts.get(m["id"], 0)
        cards.append(
            f"""
      <a class="maker-card" href="/makers/{html.escape(m['slug'])}">
        <span class="maker-card-name">{html.escape(m['name_full'])}</span>
        <span class="maker-card-meta">{n}製品を比較</span>
      </a>"""
        )
    page = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <title>メーカー別全機種比較｜ロボット掃除機の口コミ徹底比較｜ナットクLabo</title>
  <meta name="description" content="エコバックス、アンカー、ドリーミー、ロボロック、ルンバ、スイッチボットのロボット掃除機をメーカー別に全機種比較。口コミ分析データで選び方を整理します。">
  <link rel="canonical" href="{SITE}/makers/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ナットクLabo">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:url" content="{SITE}/makers/">
  <meta property="og:title" content="メーカー別全機種比較｜ロボット掃除機の口コミ徹底比較">
  <meta property="og:description" content="メーカーごとのロボット掃除機を全機種横断比較。口コミ分析データで選び方を整理します。">
  <meta name="twitter:card" content="summary_large_image">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <link rel="stylesheet" href="/products/css/navigation.css?v={NAV_V}">
  <style>
    body {{
      font-family:"Noto Sans JP",sans-serif; background:#f1f5f9; color:#1e293b;
      line-height:1.7; margin:0;
    }}
    header.hero {{
      background:linear-gradient(135deg,#1e40af,#0f172a); color:#fff; padding:1.6rem 1rem 1.8rem;
    }}
    .crumb {{ font-size:.78rem; opacity:.85; margin-bottom:.55rem; }}
    .crumb a {{ color:#bfdbfe; text-decoration:none; }}
    .wrap {{ max-width:960px; margin:0 auto; padding:0 1rem 2.5rem; }}
    h1 {{ font-size:clamp(1.25rem,3.6vw,1.75rem); font-weight:900; margin:.4rem 0 .55rem; }}
    .lede {{ opacity:.95; max-width:36rem; }}
    .grid {{
      display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
      gap:.85rem; margin-top:1.25rem;
    }}
    .maker-card {{
      display:flex; flex-direction:column; gap:.35rem;
      background:#fff; border:1px solid #e2e8f0; border-radius:12px;
      padding:1rem 1.05rem; text-decoration:none; color:inherit;
      box-shadow:0 1px 2px rgba(15,23,42,.04);
    }}
    .maker-card:hover {{ border-color:#93c5fd; box-shadow:0 4px 14px rgba(30,64,175,.12); }}
    .maker-card-name {{ font-weight:900; font-size:1.02rem; color:#0f172a; }}
    .maker-card-meta {{ font-size:.86rem; color:#64748b; font-weight:700; }}
  </style>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "メーカー別全機種比較",
    "url": "{SITE}/makers/",
    "description": "メーカーごとのロボット掃除機を全機種横断比較します。"
  }}
  </script>
</head>
<body>
  <header class="hero">
    <div class="wrap">
      <nav class="crumb"><a href="/">ホーム</a> › メーカー比較</nav>
      <h1>メーカー別・全機種比較</h1>
      <p class="lede">口コミ分析データをもとに、メーカーごとのロボット掃除機を横断比較します。</p>
    </div>
  </header>
  <main class="wrap">
    <div class="grid">{"".join(cards)}</div>
  </main>
  <script src="/products/js/navigation.js?v={NAV_V}"></script>
</body>
</html>
"""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / "index.html"
    out.write_text(page, encoding="utf-8")
    print(f"wrote {out}")
    return out


def qa_japanese(paths: list[Path]) -> list[str]:
    """Return list of Japanese QA warnings."""
    warnings: list[str] = []
    awkward = [
        (r"のが[A-Za-z0-9]", "「のが＋製品名」は「のは」が自然"),
        (r"現時点ではありません", "存在否定は「ありません」"),
        (r"顧客タイプ", "「暮らし方」に統一"),
        (r"同じ85:15", "比率の説明が不足"),
        (r"へのおすすめ|人へ：", "「なら：」「向け」に統一"),
        (r"適合 (?!\d)", "「適合度」に統一"),
    ]
    for path in paths:
        text = path.read_text(encoding="utf-8")
        plain = re.sub(r"<script[\s\S]*?</script>", " ", text)
        plain = re.sub(r"<style[\s\S]*?</style>", " ", plain)
        plain = re.sub(r"<[^>]+>", " ", plain)
        plain = plain.replace("\u2060", "")
        if "…" in plain or "..." in plain:
            # allow in draft note? check entry bodies only
            bodies = re.findall(r'class="entry-body">(.*?)</p>', text)
            ell = [b for b in bodies if "…" in b or "..." in b]
            if ell:
                warnings.append(f"{path.name}: entry-body に省略記号が {len(ell)} 件")
        # wrong brand leftovers in page copy (ignore maker switcher options)
        copy = re.sub(r'<div class="maker-switch">[\s\S]*?</div>', " ", text)
        copy = re.sub(r"<script[\s\S]*?</script>", " ", copy)
        copy = re.sub(r"<style[\s\S]*?</style>", " ", copy)
        copy = re.sub(r"<[^>]+>", " ", copy).replace("\u2060", "")
        slug = path.stem
        if slug not in ("ecovacs", "index"):
            if "エコバックス" in copy or re.search(r"\bECOVACS製品\b", copy):
                warnings.append(f"{path.name}: 他メーカーページにエコバックス表記が残存")
        for pat, msg in awkward:
            if re.search(pat, copy):
                warnings.append(f"{path.name}: {msg} （/{pat}/）")
        # double ですです
        if "ですです" in copy:
            warnings.append(f"{path.name}: 「ですです」の重複")
        # leads should end with 。
        for lead in re.findall(r'class="lead">(.*?)</p>', text):
            lead_plain = re.sub(r"<[^>]+>", "", lead).replace("\u2060", "").strip()
            if lead_plain and not lead_plain.endswith(("。", "！", "？")):
                warnings.append(f"{path.name}: lead が句点で終わっていない: {lead_plain[-24:]}")
        # h1 / summary presence
        if slug != "index" and f"{slug}" and "全機種比較" not in text:
            warnings.append(f"{path.name}: タイトル系文言「全機種比較」が見つからない")
    return warnings


def main() -> None:
    parser = argparse.ArgumentParser(description="Build manufacturer compare pages")
    parser.add_argument(
        "--only",
        nargs="*",
        help="Optional manufacturer ids (e.g. ECOVACS Anker). Default: all.",
    )
    args = parser.parse_args()
    targets = MANUFACTURERS
    if args.only:
        wanted = {x.lower() for x in args.only}
        targets = [
            m
            for m in MANUFACTURERS
            if m["id"].lower() in wanted or m["slug"].lower() in wanted
        ]
        assert targets, f"no manufacturers matched: {args.only}"

    counts: dict[str, int] = {}
    outs: list[Path] = []
    for meta in targets:
        rows = load_manufacturer(meta["id"])
        counts[meta["id"]] = len(rows)
        outs.append(build_manufacturer_page(meta))

    # Always refresh index with full counts
    all_counts = {m["id"]: len(load_manufacturer(m["id"])) for m in MANUFACTURERS}
    outs.append(build_index_page(all_counts))

    warnings = qa_japanese(outs)
    if warnings:
        print("\nJapanese QA warnings:")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("\nJapanese QA: no issues found")


if __name__ == "__main__":
    main()

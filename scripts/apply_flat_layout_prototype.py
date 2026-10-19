# -*- coding: utf-8 -*-
"""Prototype: soft frames + option-A hierarchy (lead first, pale fills)."""
from __future__ import annotations

import re
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "/* FLAT_LAYOUT_PROTOTYPE */"
CSS = """
    /* FLAT_LAYOUT_PROTOTYPE */
    /* Soft frames + hierarchy: 項目 → 一言結論 → 補足。左アクセントは使わない */
    /* Budget/condition label is the section break; product name is secondary */
    .articles > .article-pick {
      margin-top:2.4rem !important;
      padding-top:1.6rem !important;
      border-top:3px solid #cbd5e1 !important;
    }
    .articles > .article-pick:first-child {
      margin-top:0 !important;
      padding-top:.25rem !important;
      border-top:0 !important;
    }
    .article-pick h3,
    .article-pick h3.pick-heading {
      display:flex !important;
      flex-direction:column !important;
      gap:.45rem !important;
      background:transparent !important;
      box-shadow:none !important;
      border:0 !important;
      border-radius:0 !important;
      border-bottom:3px solid #1e3a8a !important;
      padding:0 0 .85rem !important;
      margin:0 0 1.2rem !important;
    }
    .article-pick .pick-label {
      display:block !important;
      font-size:clamp(1.28rem, 4.2vw, 1.6rem) !important;
      font-weight:900 !important;
      letter-spacing:.01em !important;
      color:#0f172a !important;
      line-height:1.3 !important;
    }
    .article-pick .pick-name {
      display:block !important;
      font-size:1.02rem !important;
      font-weight:800 !important;
      line-height:1.45 !important;
      color:#1e40af !important;
      text-wrap:balance !important;
    }
    .article-pick .pick-name::before {
      content:"おすすめ機種：" !important;
      color:#64748b !important;
      font-weight:800 !important;
      font-size:.86rem !important;
      margin-right:.3rem !important;
    }
    .meta-block {
      background:#f8fafc !important;
      border:1px solid #e8eef5 !important;
      border-radius:12px !important;
      padding:.8rem .9rem !important;
      margin:0 0 .9rem !important;
    }
    .article-copy .lead,
    .article-pick > .lead {
      margin:0 0 1rem !important;
      padding:.75rem .9rem !important;
      background:#f8fafc !important;
      border:1px solid #e8eef5 !important;
      border-radius:12px !important;
      font-size:.9rem !important;
      line-height:1.75 !important;
      color:#1e293b !important;
    }
    .panel,
    .panel.panel-neg,
    .panel.trend-panel,
    .panel.pros-cons {
      background:#fafbfc !important;
      border:1px solid #e8eef5 !important;
      border-radius:14px !important;
      padding:.9rem .9rem 1rem !important;
      margin:0 0 1rem !important;
      box-shadow:none !important;
    }
    .panel.panel-neg {
      background:#fffafb !important;
      border-color:#f1e4e7 !important;
    }
    .panel.trend-panel {
      background:#f7f9fc !important;
      border-color:#e4ebf5 !important;
    }
    .pros-cons-groups { gap:1rem !important; }
    .pros-cons-group { gap:.55rem !important; }
    .pros-cons-group-neg {
      border-top:1px dashed #edd5da !important;
      padding-top:.9rem !important;
      margin-top:.15rem !important;
    }
    .pros-cons-label,
    .panel h4,
    .panel.pros-cons h4,
    .panel.trend-panel h4,
    .panel.panel-neg h4,
    .know > h4,
    h4.pros-cons-label {
      display:block !important;
      width:auto !important;
      margin:0 0 .75rem !important;
      padding:0 0 .4rem !important;
      border-radius:0 !important;
      background:transparent !important;
      border-bottom:3px solid #cbd5e1 !important;
      font-size:1.28rem !important;
      font-weight:900 !important;
      letter-spacing:.02em !important;
      line-height:1.3 !important;
      color:#0f172a !important;
    }
    h4.pros-cons-label.pros-cons-label-good {
      color:#047857 !important;
      border-bottom-color:#34d399 !important;
    }
    h4.pros-cons-label.pros-cons-label-warn,
    .panel.panel-neg > h4 {
      color:#be123c !important;
      border-bottom-color:#fb7185 !important;
    }
    .panel.trend-panel > h4 {
      color:#1d4ed8 !important;
      border-bottom-color:#60a5fa !important;
    }

    .entry-grid {
      grid-template-columns:1fr !important;
      gap:.55rem !important;
    }
    @media (min-width:720px) {
      .entry-grid {
        grid-template-columns:1fr 1fr !important;
        gap:.55rem .65rem !important;
      }
    }
    .entry-stack { gap:.55rem !important; }

    .entry,
    .entry.good,
    .entry.warn,
    .entry.fit,
    .entry.issue {
      border:1px solid #e8eef5 !important;
      border-radius:12px !important;
      border-left:1px solid #e8eef5 !important;
      box-shadow:none !important;
      padding:.75rem .85rem .8rem !important;
      height:auto !important;
      background:#ffffff !important;
    }
    .entry.good {
      background:#f4faf7 !important;
      border-color:#d9ebe2 !important;
    }
    .entry.warn,
    .entry.issue {
      background:#fdf7f8 !important;
      border-color:#f0dde2 !important;
    }
    .entry.fit {
      background:#f5f8fd !important;
      border-color:#dce6f4 !important;
    }

    .entry-head {
      display:flex !important;
      align-items:center !important;
      justify-content:space-between !important;
      gap:.5rem !important;
      margin:0 0 .4rem !important;
    }
    .entry-label {
      font-size:.78rem !important;
      font-weight:800 !important;
      color:#334155 !important;
      letter-spacing:.04em !important;
    }
    /* fit/issue: ラベル自体が一言結論（途中省略の lead は入れない） */
    .entry.fit .entry-label,
    .entry.issue .entry-label {
      font-size:1rem !important;
      font-weight:900 !important;
      color:#0f172a !important;
      letter-spacing:.01em !important;
      line-height:1.45 !important;
    }
    .entry.fit .entry-head,
    .entry.issue .entry-head {
      align-items:flex-start !important;
      margin:0 0 .4rem !important;
    }
    .entry-score {
      flex-shrink:0 !important;
      display:inline-flex !important;
      align-items:center !important;
      padding:.12rem .5rem !important;
      border-radius:999px !important;
      background:rgba(255,255,255,.9) !important;
      border:1px solid rgba(148,163,184,.35) !important;
      font-size:.74rem !important;
      font-weight:900 !important;
      color:#334155 !important;
      line-height:1.2 !important;
    }
    .entry.good .entry-score {
      color:#047857 !important;
      border-color:#b7e0cd !important;
      background:#ffffff !important;
    }
    .entry.warn .entry-score,
    .entry.issue .entry-score {
      color:#e11d48 !important;
      border-color:#f0c4cd !important;
      background:#ffffff !important;
    }
    .entry.fit .entry-score {
      color:#1d4ed8 !important;
      border-color:#bfdbfe !important;
      background:#ffffff !important;
    }

    .entry-lead {
      margin:0 0 .35rem !important;
      font-size:1.05rem !important;
      font-weight:900 !important;
      line-height:1.35 !important;
      color:#0f172a !important;
      letter-spacing:.01em !important;
      /* 一言だけ：長文に見せない */
      max-width:100% !important;
    }
    .entry.warn .entry-lead,
    .entry.issue .entry-lead { color:#0f172a !important; }

    .entry .entry-body,
    .entry.good .entry-body,
    .entry.warn .entry-body,
    .entry.fit .entry-body,
    .entry.issue .entry-body,
    p.entry-body {
      margin:0 !important;
      font-size:.86rem !important;
      line-height:1.7 !important;
      color:#0f172a !important;
      font-weight:600 !important;
      opacity:1 !important;
    }

    .trend-summary {
      font-size:.86rem !important;
      line-height:1.7 !important;
      color:#1e293b !important;
    }
    .trend-kw-title {
      margin:1rem 0 .45rem !important;
      font-size:.92rem !important;
      font-weight:900 !important;
      letter-spacing:.04em !important;
      color:#0f172a !important;
    }
    .trend-chip {
      border:1px solid #e2e8f0 !important;
      background:#ffffff !important;
      color:#334155 !important;
      padding:.3rem .65rem !important;
      border-radius:8px !important;
      font-size:.74rem !important;
    }
    .know {
      background:#fafbfc !important;
      border:1px solid #e8eef5 !important;
      border-radius:14px !important;
      box-shadow:none !important;
      padding:.9rem !important;
      margin:0 0 1rem !important;
    }
    .know-note {
      background:transparent !important;
      border:0 !important;
      padding:0 !important;
      margin:0 0 .7rem !important;
      color:#1e293b !important;
    }
    .know-item {
      background:#ffffff !important;
      border:1px solid #e8eef5 !important;
      border-left:1px solid #e8eef5 !important;
      border-radius:10px !important;
      padding:.6rem .75rem !important;
      margin:0 0 .45rem !important;
    }
    .toc-box,
    .summary-box,
    .vs-card {
      background:#fafbfc !important;
      border:1px solid #e8eef5 !important;
      border-radius:14px !important;
      box-shadow:none !important;
      padding:.9rem 1rem !important;
    }
    .vs-table {
      border:1px solid #e2e8f0 !important;
      border-radius:10px !important;
      box-shadow:none !important;
    }
    .vs-table thead th { background:#f1f5f9 !important; }
    /* Decision block: stand out vs soft content cards */
    .verdict,
    .band-verdict {
      margin:1.4rem 0 0 !important;
      padding:0 !important;
      border:2px solid #1e3a8a !important;
      border-radius:16px !important;
      background:#ffffff !important;
      box-shadow:0 12px 32px rgba(30,58,138,.18) !important;
      overflow:hidden !important;
    }
    .band-verdict { margin:1.35rem 0 1.6rem !important; }
    .verdict-head,
    .band-verdict .verdict-head {
      display:flex !important;
      flex-wrap:wrap !important;
      align-items:center !important;
      gap:.45rem .7rem !important;
      margin:0 !important;
      padding:.75rem 1.1rem !important;
      background:#1e3a8a !important;
      color:#fff !important;
    }
    .verdict-badge {
      display:inline-flex !important;
      align-items:center !important;
      padding:.22rem .7rem !important;
      border-radius:999px !important;
      background:#fbbf24 !important;
      color:#78350f !important;
      font-size:.8rem !important;
      font-weight:900 !important;
      letter-spacing:.02em !important;
      line-height:1.3 !important;
    }
    .verdict-cond {
      font-size:.88rem !important;
      font-weight:800 !important;
      color:#dbeafe !important;
      letter-spacing:.02em !important;
    }
    .verdict-body,
    .band-verdict .verdict-body {
      padding:1rem 1.15rem 1.15rem !important;
      background:linear-gradient(180deg,#f8fbff 0%,#ffffff 55%) !important;
    }
    .verdict-source {
      margin:0 0 .5rem !important;
      font-size:.9rem !important;
      font-weight:800 !important;
      line-height:1.55 !important;
      color:#1e40af !important;
    }
    .verdict-kicker,
    .band-verdict > .verdict-kicker { display:none !important; }
    .verdict-pick,
    .band-verdict .verdict-pick {
      margin:0 0 .45rem !important;
      font-size:1.22rem !important;
      font-weight:900 !important;
      color:#0f172a !important;
      line-height:1.4 !important;
    }
    .verdict-why, .verdict-alt,
    .band-verdict .verdict-why,
    .band-verdict .verdict-alt {
      margin:0 0 .35rem !important;
      font-size:.9rem !important;
      line-height:1.65 !important;
      color:#1e293b !important;
      font-weight:600 !important;
    }
    .verdict-next,
    .band-verdict .verdict-next {
      margin:.65rem 0 0 !important;
      font-size:.95rem !important;
      font-weight:900 !important;
    }
    .verdict a,
    .band-verdict a {
      color:#1e40af !important;
      text-decoration:none !important;
      font-weight:900 !important;
    }
    .verdict a:hover,
    .band-verdict a:hover { text-decoration:underline !important; }
"""

WJ = "\u2060"
TAG_RE = re.compile(r"<[^>]+>")
ENTRY_RE = re.compile(
    r'(<div class="entry([^"]*)">\s*'
    r'<div class="entry-head">\s*'
    r'<span class="entry-label">([^<]*)</span>[\s\S]*?</div>\s*)'
    r'(?:<p class="entry-lead">[\s\S]*?</p>\s*)?'
    r'(<p class="entry-body">([\s\S]*?)</p>)',
    re.M,
)

# (required keywords in body, short phrase) — first match wins
LEAD_RULES_GOOD: list[tuple[tuple[str, ...], str]] = [
    (("水拭き", "サラサラ"), "吸引＋水拭きでサラサラ"),
    (("サラサラ",), "床がサラサラ"),
    (("自動ゴミ収集", "ゴミ捨て"), "ゴミ捨てがほぼ不要"),
    (("自動ゴミ収集",), "メンテが楽"),
    (("ダストバッグ",), "メンテが楽"),
    (("絶賛",), "吸引力が絶賛"),
    (("ペット", "評価"), "ペット毛に強い"),
    (("抜け毛",), "ペット毛に強い"),
    (("しっかり吸引",), "しっかり吸引"),
    (("静音",), "静か"),
    (("マッピング", "賢い"), "ルートが賢い"),
    (("フローリング", "評価"), "床掃除に強い"),
    (("掃除性能", "評価"), "掃除の評価が高い"),
]
LEAD_RULES_WARN: list[tuple[tuple[str, ...], str]] = [
    (("乗り上げ", "停止"), "乗り上げて停止"),
    (("引っかかり",), "引っかかって停止"),
    (("Wi-Fi",), "接続が不安定"),
    (("マッピング", "リセット"), "マップが不安定"),
    (("毛足",), "厚手カーペットは苦手"),
    (("厚手",), "厚手は苦手"),
    (("充電が切れ",), "途中で充電切れ"),
    (("ステーション", "戻れ"), "帰還に失敗しがち"),
    (("バッテリー",), "バッテリーに不安"),
    (("騒音",), "作動音が大きい"),
    (("故障",), "故障報告あり"),
    (("エラー",), "エラーが出やすい"),
]


def plain_text(html: str) -> str:
    text = TAG_RE.sub("", html)
    text = unescape(text)
    return text.replace(WJ, "").replace("\u200b", "").strip()


def match_rules(text: str, rules: list[tuple[tuple[str, ...], str]]) -> str:
    for keys, phrase in rules:
        if all(k in text for k in keys):
            return phrase
    return ""


def to_one_word(text: str) -> str:
    """Force a short phrase — not a sentence."""
    t = re.sub(r"\s+", "", text)
    t = re.sub(r"^(ただし、|ただ、|なお、|また、|しかし、)", "", t)
    t = re.sub(
        r"(です|ます|でした|ました|ています|ており|である|だ)$",
        "",
        t,
    )
    t = re.sub(
        r"(という声.*|といった声.*|との指摘.*|が見られます.*"
        r"|点の評価が高い|の評価が高い|が高評価|と高評価|"
        r"|声が上がっています|事例が複数報告されており.*"
        r"|完全な自律走行には課題があります)$",
        "",
        t,
    )
    t = re.sub(r"は絶賛されており$", "が絶賛", t)
    t = re.sub(r"な$", "", t)
    t = t.rstrip("…⋯、。．")
    if "、" in t:
        # keep the punchiest short clause
        parts = [p for p in t.split("、") if len(p) >= 4]
        if parts:
            short = min(parts, key=len) if any(len(p) <= 14 for p in parts) else parts[0]
            if len(short) <= 18:
                t = short
            else:
                t = parts[0]
    if len(t) <= 16:
        return t
    # cut at particle boundary, never ellipsis
    for i in range(min(16, len(t)), 7, -1):
        if t[i - 1] in "をがにはでと":
            return t[: i - 1] if i > 8 else t[:16]
    return t[:16]


def extract_lead(label: str, body_html: str, tone: str) -> str | None:
    """Short one-liner for good/warn. fit/issue: label is the lead (None)."""
    if any(t in tone for t in ("fit", "issue")):
        return None

    text = plain_text(body_html)
    if not text:
        return ""

    rules = LEAD_RULES_WARN if "warn" in tone else LEAD_RULES_GOOD
    hit = match_rules(text, rules)
    if hit:
        return hit

    # label-aware fallbacks
    if "warn" in tone:
        if "アプリ" in label:
            return "接続が不安定"
        if "段差" in label:
            return "乗り上げて停止"
        if "バッテリー" in label:
            return "途中で充電切れ"
        if "カーペット" in label:
            return "厚手は苦手"
    else:
        if "メンテナンス" in label and "自動ゴミ" in text:
            return "メンテが楽"
        if "ペット" in label:
            return "ペット毛に強い"
        if "フローリング" in label and "水拭き" in text:
            return "吸引＋水拭きでサラサラ"

    sentences = [s.strip() for s in re.split(r"[。．]", text) if s.strip()]
    if not sentences:
        return ""

    if "warn" in tone:
        for s in sentences:
            for sep in ("ですが、", "ますが、", "ものの、", "が、"):
                if sep in s:
                    after = s.split(sep, 1)[1].strip()
                    if len(after) >= 4:
                        return to_one_word(after)
        for s in sentences:
            if any(
                k in s
                for k in ("苦手", "停止", "切れ", "不安定", "指摘", "故障", "弱い")
            ):
                return to_one_word(s)

    return to_one_word(sentences[0])


def inject_leads(html: str) -> str:
    def repl(m: re.Match[str]) -> str:
        head, tone, label, body_tag, body_inner = (
            m.group(1),
            m.group(2),
            m.group(3),
            m.group(4),
            m.group(5),
        )
        lead = extract_lead(label, body_inner, tone)
        if lead is None:
            return f"{head}{body_tag}"
        if not lead:
            return m.group(0)
        lead_html = f'<p class="entry-lead">{escape(lead)}</p>\n            '
        return f"{head}{lead_html}{body_tag}"

    return ENTRY_RE.sub(repl, html)


VERDICT_RE = re.compile(
    r'(<(?:div|section) class="(?:verdict|band-verdict)"[^>]*>)\s*'
    r'(?:<div class="verdict-head">[\s\S]*?</div>\s*'
    r'<div class="verdict-body">\s*)?'
    r'(?:<p class="verdict-kicker">迷ったらこれ(?: · |・)([^<]+)</p>\s*)?'
    r'(?:<p class="verdict-source">[\s\S]*?</p>\s*)?'
    r'([\s\S]*?)'
    r'(?:</div>\s*)?'
    r'(</(?:div|section)>)',
    re.M,
)


def restyle_verdicts(html: str) -> str:
    """Promote verdict: badge header + review-analysis source line."""

    def repl(m: re.Match[str]) -> str:
        open_tag, label, inner, close = m.group(1), m.group(2), m.group(3), m.group(4)
        inner = inner.strip()
        if not label:
            head_m = re.search(r'class="verdict-cond">([^<]+)', m.group(0))
            label = head_m.group(1).strip() if head_m else "この条件"
        inner = re.sub(
            r'^<div class="verdict-body">\s*|\s*</div>$',
            "",
            inner,
        ).strip()
        inner = re.sub(r'<p class="verdict-source">[\s\S]*?</p>\s*', "", inner)
        inner = re.sub(r'<p class="verdict-kicker">[\s\S]*?</p>\s*', "", inner)
        indent = "        " if "band-verdict" in open_tag else "            "
        close_indent = "      " if "band-verdict" in open_tag else "          "
        return (
            f"{open_tag}\n"
            f'{indent}<div class="verdict-head">\n'
            f'{indent}  <span class="verdict-badge">迷ったらこれ</span>\n'
            f'{indent}  <span class="verdict-cond">{label.strip()}</span>\n'
            f"{indent}</div>\n"
            f'{indent}<div class="verdict-body">\n'
            f'{indent}  <p class="verdict-source">'
            f"口コミ分析の結果では、次の機種が第一候補です</p>\n"
            f"{indent}  {inner}\n"
            f"{indent}</div>\n"
            f"{close_indent}{close}"
        )

    return VERDICT_RE.sub(repl, html)


def apply_css(text: str) -> str:
    if MARKER in text:
        end = text.find("</style>", text.index(MARKER))
        if end == -1:
            return text
        head = text[:end]
        idx = head.rfind(MARKER)
        line_start = head.rfind("\n", 0, idx) + 1
        head = head[:line_start]
        return head + CSS + "\n  " + text[end:].lstrip()
    return text.replace("</style>", CSS + "\n  </style>", 1)


def apply(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    text = apply_css(text)
    text = inject_leads(text)
    text = restyle_verdicts(text)
    path.write_text(text, encoding="utf-8", newline="\n")
    return True


def iter_targets() -> list[Path]:
    paths: list[Path] = []
    for folder in ("makers", "guides", "compare"):
        for path in sorted((ROOT / folder).glob("*.html")):
            if path.name == "index.html":
                continue
            paths.append(path)
    return paths


def main() -> None:
    for path in iter_targets():
        if apply(path):
            print("patched", path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()

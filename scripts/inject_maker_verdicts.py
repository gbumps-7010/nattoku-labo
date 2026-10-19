# -*- coding: utf-8 -*-
"""Inject conditioned verdict blocks into existing maker compare article-picks."""
from __future__ import annotations

import html as html_lib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAKERS = ROOT / "makers"

VERDICT_CSS = """
    .verdict {
      margin:1.4rem 0 0; padding:0;
      border:2px solid #1e3a8a; border-radius:16px;
      background:#fff; overflow:hidden;
      box-shadow:0 12px 32px rgba(30,58,138,.18);
    }
    .verdict-head {
      display:flex; flex-wrap:wrap; align-items:center; gap:.45rem .7rem;
      margin:0; padding:.75rem 1.1rem; background:#1e3a8a; color:#fff;
    }
    .verdict-badge {
      display:inline-flex; align-items:center;
      padding:.22rem .7rem; border-radius:999px;
      background:#fbbf24; color:#78350f;
      font-size:.8rem; font-weight:900; letter-spacing:.02em; line-height:1.3;
    }
    .verdict-cond {
      font-size:.88rem; font-weight:800; color:#dbeafe; letter-spacing:.02em;
    }
    .verdict-body {
      padding:1rem 1.15rem 1.15rem;
      background:linear-gradient(180deg,#f8fbff 0%,#ffffff 55%);
    }
    .verdict-source {
      margin:0 0 .5rem; font-size:.9rem; font-weight:800;
      line-height:1.55; color:#1e40af;
    }
    .verdict-kicker {
      margin:0 0 .35rem; font-size:.75rem; font-weight:900;
      letter-spacing:.06em; color:#1e40af;
    }
    .verdict-pick {
      margin:0 0 .45rem; font-size:1.22rem; font-weight:900; color:#0f172a; line-height:1.4;
    }
    .verdict-why, .verdict-alt {
      margin:0 0 .35rem; font-size:.9rem; line-height:1.65; color:#1e293b; font-weight:600;
    }
    .verdict-next { margin:.65rem 0 0; font-size:.95rem; font-weight:900; }
    .verdict a { color:#1e40af; text-decoration:none; font-weight:900; }
    .verdict a:hover { text-decoration:underline; }
"""

ARTICLE_RE = re.compile(
    r'(<article class="article-pick"[^>]*data-slug="([^"]+)"[^>]*>)(.*?)(</article>)',
    re.S,
)


def strip_marks(text: str) -> str:
    return re.sub(r"[\u2060\u200b\u200c\u200d\ufeff]", "", text or "")


def first(pattern: str, text: str, flags=0) -> str:
    m = re.search(pattern, text, flags)
    return strip_marks(m.group(1)).strip() if m else ""


def build_verdict(slug: str, body: str) -> str:
    label = first(r'class="pick-label">([^<]+)<', body) or "この条件"
    name = first(r'class="pick-name">([^<]+)<', body)
    if not name:
        # old single-line h3
        h3 = first(r"<h3[^>]*>([^<]+)</h3>", body)
        if "：" in h3:
            label, name = [p.strip() for p in h3.split("：", 1)]
        else:
            name = h3
    if not name:
        return ""

    goods = [
        strip_marks(x).strip()
        for x in re.findall(
            r'class="entry good"[\s\S]*?class="entry-label">([^<]+)<', body
        )
    ][:2]
    why = "・".join(goods) + "の評価が高い" if goods else "この条件で総合点が最も高い"

    lead = first(r'class="lead">([\s\S]*?)</p>', body)
    lead_plain = strip_marks(re.sub(r"<[^>]+>", "", lead))
    alt_m = re.search(r"2位は([^\s（(]+(?:\s+[^\s（(]+)*)", lead_plain)
    alt_name = alt_m.group(1).strip() if alt_m else ""

    # Try to resolve alt slug from a product link later in page? keep name-only if unknown
    if alt_name and alt_name != name:
        # look for product link with this visible name nearby in page body is hard;
        # use text-only candidate line
        alt_html = (
            f'<p class="verdict-alt">迷ったら比較：総合点2位の '
            f"<strong>{html_lib.escape(alt_name)}</strong> も候補</p>"
        )
    else:
        alt_html = (
            '<p class="verdict-alt">軸を変えるなら '
            '<a href="#feature">機能別</a> / <a href="#persona">暮らし方別</a> / '
            '<a href="#price">予算別</a> へ</p>'
        )

    return f"""
          <div class="verdict" aria-label="この条件の結論">
            <div class="verdict-head">
              <span class="verdict-badge">迷ったらこれ</span>
              <span class="verdict-cond">{html_lib.escape(label)}</span>
            </div>
            <div class="verdict-body">
              <p class="verdict-source">口コミ分析の結果では、次の機種が第一候補です</p>
              <p class="verdict-pick"><strong>{html_lib.escape(name)}</strong> が第一候補</p>
              <p class="verdict-why">理由：{html_lib.escape(why)}</p>
              {alt_html}
              <p class="verdict-next"><a href="/products/{html_lib.escape(slug)}">詳細の口コミ分析を見る →</a></p>
            </div>
          </div>
"""


def patch_article(match: re.Match[str]) -> str:
    open_tag, slug, body, close = match.group(1), match.group(2), match.group(3), match.group(4)
    if 'class="verdict"' in body:
        return match.group(0)
    verdict = build_verdict(slug, body)
    if not verdict:
        return match.group(0)
    if re.search(r'<p class="more">', body):
        body = re.sub(r'(<p class="more">)', verdict + r"\1", body, count=1)
    else:
        body = body.rstrip() + verdict
    return open_tag + body + close


def ensure_css(html: str) -> str:
    if ".verdict-kicker" in html:
        return html
    # insert before .aff-mount rule if present
    if ".aff-mount {" in html:
        return html.replace(".aff-mount {", VERDICT_CSS + "\n    .aff-mount {", 1)
    if "</style>" in html:
        return html.replace("</style>", VERDICT_CSS + "\n  </style>", 1)
    return html


def main() -> None:
    changed = 0
    for path in sorted(MAKERS.glob("*.html")):
        if path.name == "index.html":
            continue
        text = path.read_text(encoding="utf-8")
        next_text = ensure_css(text)
        next_text, n = ARTICLE_RE.subn(patch_article, next_text)
        if next_text != text:
            path.write_text(next_text, encoding="utf-8", newline="\n")
            changed += 1
            print(f"patched {path.name} articles~{n}")
    print(f"done changed={changed}")


if __name__ == "__main__":
    main()

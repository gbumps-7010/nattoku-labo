# -*- coding: utf-8 -*-
"""Split maker compare pick headings so product names stand out as section starts."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAKERS = ROOT / "makers"

OLD_CSS = """    .article-pick h3 {
      font-size:1.08rem; font-weight:900; margin:0 0 .85rem; color:#0f172a;
      padding:.7rem 1rem;
      border:1px solid var(--line);
      background:#f8fafc;
      border-radius:10px;
    }"""

NEW_CSS = """    .articles { display:flex; flex-direction:column; gap:2.75rem; }
    .article-pick {
      scroll-margin-top:5.5rem;
      padding-top:.15rem;
    }
    .article-pick h3,
    .article-pick h3.pick-heading {
      display:flex; flex-direction:column; gap:.35rem;
      margin:0 0 1.05rem; padding:.95rem 1.15rem 1rem;
      border:0; border-left:4px solid #1e40af;
      border-radius:0 14px 14px 0;
      background:linear-gradient(90deg,#eff6ff 0%,#ffffff 72%);
      box-shadow:0 8px 22px rgba(30,64,175,.07);
      color:#0f172a;
    }
    .article-pick .pick-label {
      display:block; font-size:.78rem; font-weight:800; letter-spacing:.04em;
      color:#1e40af; line-height:1.35;
    }
    .article-pick .pick-name {
      display:block; font-size:clamp(1.2rem,3.1vw,1.55rem); font-weight:900;
      line-height:1.35; color:#0f172a; text-wrap:balance;
    }"""

H3_RE = re.compile(r"<h3>([^<]+)</h3>")


def format_heading(text: str) -> str:
    text = text.strip()
    if "：" in text:
        label, name = text.split("：", 1)
        label, name = label.strip(), name.strip()
        if label and name:
            return (
                '<h3 class="pick-heading">'
                f'<span class="pick-label">{label}</span>'
                f'<span class="pick-name">{name}</span>'
                "</h3>"
            )
    return f'<h3 class="pick-heading"><span class="pick-name">{text}</span></h3>'


def patch_html(html: str) -> str:
    # Prefer replacing the dedicated articles+h3 block; also collapse duplicate .articles rules
    out = html
    if OLD_CSS in out:
        out = out.replace(OLD_CSS, NEW_CSS)
    elif ".pick-heading" not in out and ".article-pick h3" in out:
        out = re.sub(
            r"    \.article-pick h3 \{[^}]+\}",
            NEW_CSS,
            out,
            count=1,
            flags=re.S,
        )

    # Avoid stacking two `.articles` declarations awkwardly if both exist
    # (NEW_CSS includes .articles; original also has it nearby)
    out = re.sub(
        r"    \.articles \{ display:flex; flex-direction:column; gap:2rem; \}\n"
        r"    \.articles \{ display:flex; flex-direction:column; gap:2\.75rem; \}",
        "    .articles { display:flex; flex-direction:column; gap:2.75rem; }",
        out,
    )

    def repl(m: re.Match[str]) -> str:
        inner = m.group(1)
        # Skip if already transformed elsewhere
        if "pick-heading" in inner or "pick-name" in inner:
            return m.group(0)
        return format_heading(inner)

    # Only transform h3 inside article-pick blocks by doing global h3 that look like picks
    # Maker pages use article-pick h3 almost exclusively for these headings.
    out = H3_RE.sub(repl, out)
    return out


def main() -> None:
    changed = 0
    for path in sorted(MAKERS.glob("*.html")):
        if path.name == "index.html":
            continue
        text = path.read_text(encoding="utf-8")
        next_text = patch_html(text)
        if next_text != text:
            path.write_text(next_text, encoding="utf-8", newline="\n")
            changed += 1
            print("patched", path.name)
    print(f"done changed={changed}")


if __name__ == "__main__":
    main()

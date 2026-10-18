# -*- coding: utf-8 -*-
"""Inject default og:image / twitter:image into hub pages that lack them."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "drafts", "scripts", "products"}
OG_URL = "https://nattoku-labo.com/og-default.png"
TAGS = (
    f'  <meta property="og:image" content="{OG_URL}">\n'
    f'  <meta name="twitter:image" content="{OG_URL}">\n'
)


def should_skip(rel: Path) -> bool:
    return any(part in SKIP_DIRS for part in rel.parts)


def inject(html: str) -> str | None:
    if re.search(r'property=["\']og:image["\']', html, re.I):
        return None
    if not re.search(r'property=["\']og:title["\']', html, re.I):
        return None

    # Prefer after og:description, else after twitter:card, else after og:title
    patterns = [
        r'(<meta\s+property=["\']og:description["\'][^>]*>\s*)',
        r'(<meta\s+name=["\']twitter:card["\'][^>]*>\s*)',
        r'(<meta\s+property=["\']og:title["\'][^>]*>\s*)',
    ]
    for pat in patterns:
        m = re.search(pat, html, re.I)
        if m:
            return html[: m.end()] + TAGS + html[m.end() :]
    return None


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if should_skip(rel):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        out = inject(text)
        if out is None:
            continue
        path.write_text(out, encoding="utf-8", newline="\n")
        changed += 1
        print("patched", rel.as_posix())
    print(f"done changed={changed}")


if __name__ == "__main__":
    main()

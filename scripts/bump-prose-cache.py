#!/usr/bin/env python3
"""Bump prose asset cache-buster across all HTML files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROSE_V = "20260902b"
ASSETS = ("prose.css", "format-prose.js", "prose-init.js", "product-loader.js")
SKIP_DIRS = {"__pycache__", "mobile-preview", "node_modules"}


def bump(text: str) -> str:
    for asset in ASSETS:
        text = re.sub(
            rf"({re.escape(asset)}\?v=)[^\"'>\s]+",
            rf"\g<1>{PROSE_V}",
            text,
        )
    return text


def main() -> None:
    changed = 0
    for html in ROOT.rglob("*.html"):
        if any(part in SKIP_DIRS for part in html.parts):
            continue
        if "drafts" in html.parts and html.name.endswith("-preview.html"):
            # keep local previews in sync too
            pass
        orig = html.read_text(encoding="utf-8")
        new = bump(orig)
        if new != orig:
            html.write_text(new, encoding="utf-8")
            changed += 1
            print(html.relative_to(ROOT))
    print(f"bumped {changed} html files -> v={PROSE_V}")


if __name__ == "__main__":
    main()

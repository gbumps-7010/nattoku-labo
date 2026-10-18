# -*- coding: utf-8 -*-
"""Inject favicon <link> tags into HTML <head> (skip if already present)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "drafts", "scripts"}

LINKS = """    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">
    <link rel="manifest" href="/site.webmanifest">
"""


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def inject(html: str) -> str | None:
    if re.search(r'rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\']', html, re.I):
        return None
    # after charset or at start of head
    m = re.search(r"(<head[^>]*>\s*)", html, re.I)
    if not m:
        return None
    insert_at = m.end()
    return html[:insert_at] + "\n" + LINKS + html[insert_at:]


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if should_skip(path.relative_to(ROOT)):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        out = inject(text)
        if out is None:
            continue
        path.write_text(out, encoding="utf-8", newline="\n")
        changed += 1
        print("patched", path.relative_to(ROOT).as_posix())
    print(f"done changed={changed}")


if __name__ == "__main__":
    main()

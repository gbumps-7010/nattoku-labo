#!/usr/bin/env python3
"""Patch HTML files to include shared prose.css and format-prose.js."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROSE_CSS = '  <link rel="stylesheet" href="/products/css/prose.css?v=20260818k">'
PROSE_CSS_REL = '    <link rel="stylesheet" href="css/prose.css?v=20260818k">'
FORMAT_JS = '    <script src="js/format-prose.js?v=20260818k"></script>'
FORMAT_JS_ABS = '  <script src="/products/js/format-prose.js?v=20260818k"></script>'
INIT_JS = '  <script src="/products/js/prose-init.js?v=20260818k"></script>'


def patch_file(path: Path, *, site_root: bool, product: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text

    if "prose.css" not in text:
        if product:
            text = text.replace(
                'href="css/navigation.css',
                'href="css/navigation.css',
            )
            for nav in (
                '    <link rel="stylesheet" href="css/navigation.css?v=20260818i">',
                '    <link rel="stylesheet" href="css/navigation.css?v=20260818k">',
            ):
                if nav in text:
                    text = text.replace(nav, nav + "\n" + PROSE_CSS_REL, 1)
                    break
        elif site_root:
            for nav in (
                '    <link rel="stylesheet" href="/products/css/navigation.css?v=20260818i">',
                '  <link rel="stylesheet" href="/products/css/navigation.css?v=20260818h">',
                '  <link rel="stylesheet" href="/products/css/navigation.css?v=20260818k">',
                '    <link rel="stylesheet" href="/products/css/navigation.css?v=20260818k">',
            ):
                if nav in text:
                    prose_line = PROSE_CSS if nav.startswith("  ") else "    " + PROSE_CSS.strip()
                    text = text.replace(nav, nav + "\n" + prose_line, 1)
                    break

    if product and "format-prose.js" not in text:
        for loader in (
            '    <script src="js/product-loader.js?v=20260818i"></script>',
            '    <script src="js/product-loader.js?v=20260818k"></script>',
        ):
            if loader in text:
                text = text.replace(
                    loader,
                    FORMAT_JS + "\n" + loader.replace("20260818i", "20260818k"),
                    1,
                )
                break

    if site_root and not product and "prose-init.js" not in text:
        if "format-prose.js" not in text:
            insert = FORMAT_JS_ABS + "\n" + INIT_JS + "\n"
            if "</body>" in text:
                text = text.replace("</body>", insert + "</body>", 1)
        elif INIT_JS not in text:
            text = text.replace(FORMAT_JS_ABS, FORMAT_JS_ABS + "\n" + INIT_JS, 1)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = 0
    for html in (ROOT / "products").glob("*.html"):
        if html.name == "template-unified.html":
            continue
        if patch_file(html, site_root=False, product=True):
            changed += 1
            print("product:", html.name)

    for rel in ("index.html", "about.html", "privacy.html", "compare/index.html"):
        p = ROOT / rel
        if p.exists() and patch_file(p, site_root=True, product=False):
            changed += 1
            print("site:", rel)
        elif rel == "privacy.html" and p.exists() and "prose.css" not in p.read_text(encoding="utf-8"):
            text = p.read_text(encoding="utf-8")
            needle = 'href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">'
            if needle in text:
                text = text.replace(
                    needle,
                    needle + '\n    <link rel="stylesheet" href="/products/css/prose.css?v=20260818k">',
                    1,
                )
                p.write_text(text, encoding="utf-8")
                changed += 1
                print("site:", rel, "(prose.css only)")

    print(f"patched {changed} files")


if __name__ == "__main__":
    main()

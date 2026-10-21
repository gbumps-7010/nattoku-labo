# -*- coding: utf-8 -*-
"""Hero h1 / lede: break lines at 、。｜ instead of mid-phrase (post-process, safe to rerun).

Generated pages under makers/guides/compare are edited by several later scripts,
so this patches the existing HTML instead of regenerating it.
rankings/ already does the same in scripts/generate-floor-ranking-page.py.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = "/* CLAUSE_BREAKS */"
CSS = (
    "    /* CLAUSE_BREAKS */\n"
    "    h1 .clause, .lede .clause { display:inline-block; word-break:auto-phrase; text-wrap:pretty; }"
)
TOKEN_RE = re.compile(r"<[^>]+>|[^<]+")
H1_RE = re.compile(r"(<h1[^>]*>)([^<]*)(</h1>)")
LEDE_RE = re.compile(r'(<p class="lede">)(.*?)(</p>)', re.S)
MIN_CLAUSE = 10  # これより短い節（「各製品には、」など）は次の節とつなげる


def visible_len(fragment: str) -> int:
    return len(re.sub(r"<[^>]+>|⁠", "", fragment))


def split_clauses(inner: str) -> list[str]:
    """Split after 、/。 that sit outside any tag (keeps <strong> intact)."""
    clauses: list[str] = []
    current = ""
    depth = 0
    for token in TOKEN_RE.findall(inner):
        if token.startswith("<"):
            current += token
            if token.startswith("</"):
                depth -= 1
            elif not token.endswith("/>"):
                depth += 1
            continue
        for ch in token:
            current += ch
            if depth == 0 and ch in "、。":
                clauses.append(current)
                current = ""
    if current.strip():
        clauses.append(current)
    merged: list[str] = []
    for clause in clauses:
        prev = merged[-1] if merged else ""
        if prev and visible_len(prev) < MIN_CLAUSE and not prev.rstrip("⁠").endswith("。"):
            merged[-1] = prev + clause
        else:
            merged.append(clause)
    return merged


def wrap_lede(match: re.Match) -> str:
    open_tag, inner, close_tag = match.groups()
    if 'class="clause"' in inner:
        return match.group(0)
    clauses = split_clauses(inner.strip())
    return open_tag + "".join(f'<span class="clause">{c}</span>' for c in clauses) + close_tag


def wrap_h1(match: re.Match) -> str:
    open_tag, text, close_tag = match.groups()
    if "｜" not in text:
        return match.group(0)
    parts = text.split("｜")
    spans = "".join(
        f'<span class="clause">{p}{"｜" if i < len(parts) - 1 else ""}</span>'
        for i, p in enumerate(parts)
    )
    return open_tag + spans + close_tag


def apply_css(text: str) -> str:
    if MARKER in text:
        return text
    return text.replace("</style>", CSS + "\n  </style>", 1)


def apply(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    nxt = H1_RE.sub(wrap_h1, text, count=1)
    nxt = LEDE_RE.sub(wrap_lede, nxt, count=1)
    if nxt != text:
        nxt = apply_css(nxt)
    if nxt == text:
        return False
    path.write_text(nxt, encoding="utf-8", newline="\n")
    return True


def iter_targets() -> list[Path]:
    paths: list[Path] = []
    for folder in ("makers", "guides", "compare"):
        paths.extend(sorted((ROOT / folder).glob("*.html")))
    return paths


def main() -> None:
    for path in iter_targets():
        if apply(path):
            print("patched", path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()

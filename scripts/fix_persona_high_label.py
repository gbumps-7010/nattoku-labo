# -*- coding: utf-8 -*-
"""Rename vague 'ハイエンド' persona to explicit 15万円以上 condition."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "makers"


def fix_article(body: str) -> str:
    body = body.replace("ハイエンドを探している人なら", "15万円以上で選ぶ人なら")
    body = body.replace(
        "迷ったらこれ · ハイエンドを探している人なら",
        "迷ったらこれ · 15万円以上で選ぶ人なら",
    )
    body = re.sub(
        r"15万円以上[\u2060\u200b]*の[\u2060\u200b]*上位機[\u2060\u200b]*に絞り[\u2060\u200b]*、"
        r"フローリング評価[\u2060\u200b]*が",
        "価格15万円以上の機種に絞ったうえで、フローリング評価が",
        body,
    )
    body = re.sub(
        r"予算[\u2060\u200b]*に余裕[\u2060\u200b]*がある人向けです[\u2060\u200b]*。",
        "予算に余裕があり、上位モデルを見たい人向けです。",
        body,
    )
    body = re.sub(
        r'(<p class="verdict-kicker">迷ったらこれ · 15万円以上で選ぶ人なら</p>\s*'
        r'<p class="verdict-pick">[\s\S]*?</p>\s*'
        r'<p class="verdict-why">)理由：[^<]+',
        r"\1理由：15万円以上の機種のなかで、フローリング評価が最も高い",
        body,
        count=1,
    )
    return body


def main() -> None:
    for path in sorted(ROOT.glob("*.html")):
        if path.name == "index.html":
            continue
        text = path.read_text(encoding="utf-8")
        next_text = re.sub(
            r'<article class="article-pick" id="persona-high"[\s\S]*?</article>',
            lambda m: fix_article(m.group(0)),
            text,
        )
        next_text = next_text.replace("ハイエンドを探している人", "15万円以上で選ぶ人")
        if next_text != text:
            path.write_text(next_text, encoding="utf-8", newline="\n")
            print("patched", path.name)
        else:
            print("nochange", path.name)


if __name__ == "__main__":
    main()

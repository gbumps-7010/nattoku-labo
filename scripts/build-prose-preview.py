#!/usr/bin/env python3
"""Build desktop preview for prose emphasis design."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "lib"))
from format_prose import format_prose  # noqa: E402

css = (ROOT / "products/css/prose.css").read_text(encoding="utf-8")
js = (ROOT / "products/js/format-prose.js").read_text(encoding="utf-8")

samples = [
    (
        "口コミ引用（画像の例）",
        "「何度やっても接続できない」「設定が難しい」といった声が少数見られます。",
        "problem-description prose-warn",
    ),
    (
        "カーペット清掃（引用なし）",
        "リビングのラグなどに絡まった髪の毛やホコリをしっかり吸引します。モップが自動でリフトアップするため、カーペットを濡らす心配もなく安心です。",
        "performance-detail-card high-score",
    ),
    (
        "口コミの好評引用",
        "「驚くほど静か」「もっと早く買えばよかった」といった高評価の声が多数あります。",
        "performance-detail-card high-score",
    ),
]

cards = []
for title, text, cls in samples:
    cards.append(
        f"""<section class="preview-card">
      <h2>{title}</h2>
      <p class="{cls}">{format_prose(text)}</p>
      <p class="raw">原文: {text}</p>
    </section>"""
    )

html = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>プレビュー：強調デザイン（メリット・デメリット）</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: "Noto Sans JP", sans-serif; background: #e2e8f0; color: #1e293b; padding: 1.25rem; line-height: 1.7; }}
    h1 {{ font-size: 1.2rem; margin-bottom: 0.5rem; }}
    .note {{ font-size: 0.88rem; color: #475569; margin-bottom: 1rem; max-width: 720px; }}
    .preview-card {{ background: #fff; border-radius: 12px; padding: 1rem 1.1rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(15,23,42,.06); }}
    .preview-card h2 {{ font-size: 0.92rem; margin-bottom: 0.65rem; color: #0f172a; }}
    .performance-detail-card, .reliability-factor-desc, .problem-description {{ font-size: 0.9rem; margin: 0; }}
    .performance-detail-card {{ border-left: 4px solid #10b981; padding-left: 0.75rem; }}
    .reliability-factor-desc {{ border-left: 4px solid #8b5cf6; padding-left: 0.75rem; }}
    .problem-description {{ border-left: 4px solid #f43f5e; padding-left: 0.75rem; }}
    .raw {{ margin-top: 0.75rem; font-size: 0.78rem; color: #64748b; }}
    {css}
  </style>
</head>
<body>
  <h1>強調デザイン プレビュー（コミット前）</h1>
  <p class="note">厳格ルール：段落あたり最大2箇所・各15文字以内。ベネフィット核心と致命的デメリットのみマーカー。見出し・リンク内は対象外。</p>
  {"".join(cards)}
  <script>{js}</script>
</body>
</html>"""

out_desktop = Path(r"c:/Users/naoto/Desktop/ナットクLabo/prose-emphasis-preview.html")
out_drafts = ROOT / "drafts/prose-emphasis-preview.html"
out_desktop.write_text(html, encoding="utf-8")
out_drafts.write_text(html, encoding="utf-8")
print(f"wrote {out_desktop}")
print(f"wrote {out_drafts}")

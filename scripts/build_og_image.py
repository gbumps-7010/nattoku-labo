# -*- coding: utf-8 -*-
"""Build default Open Graph image (1200x630) from brand logo."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "brand" / "og-default.png"
LOGO = ROOT / "brand" / "logo-source.png"


def font(size: int, bold: bool = True) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\YuGothB.ttc" if bold else r"C:\Windows\Fonts\YuGothM.ttc",
        r"C:\Windows\Fonts\YuGothR.ttc",
        r"C:\Windows\Fonts\meiryob.ttc" if bold else r"C:\Windows\Fonts\meiryo.ttc",
        r"C:\Windows\Fonts\msgothic.ttc",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size, index=0)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (248, 250, 252))
    draw = ImageDraw.Draw(img)

    # Brand gradient band
    for y in range(h):
        t = y / (h - 1)
        r = int(30 + (15 - 30) * t)
        g = int(64 + (23 - 64) * t)
        b = int(175 + (42 - 175) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Soft light card
    card = (72, 70, w - 72, h - 70)
    draw.rounded_rectangle(card, radius=28, fill=(255, 255, 255))

    logo = Image.open(LOGO).convert("RGBA")
    logo_h = 280
    ratio = logo_h / logo.height
    logo = logo.resize((int(logo.width * ratio), logo_h), Image.Resampling.LANCZOS)
    lx = (w - logo.width) // 2
    ly = 95
    img.paste(logo, (lx, ly), logo)

    tag = "口コミを統計分析して、失敗しない一台を。"
    f = font(28, bold=False)
    bbox = draw.textbbox((0, 0), tag, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, 430), tag, font=f, fill=(30, 64, 175))

    OUT.parent.mkdir(exist_ok=True)
    img.save(OUT, format="PNG", optimize=True)
    # also publish at site root for stable absolute URL
    (ROOT / "og-default.png").write_bytes(OUT.read_bytes())
    print("Wrote", OUT, "and", ROOT / "og-default.png")


if __name__ == "__main__":
    main()

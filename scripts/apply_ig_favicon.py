# -*- coding: utf-8 -*-
"""Build favicons matching the @nattoku.labo Instagram profile mark."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]

# Colors sampled from the IG profile icon
BLUE = (58, 130, 196)  # primary bubble / brand text
BLUE_LIGHT = (150, 200, 230)  # secondary bubble
WHITE = (255, 255, 255)
TAG = (120, 170, 210)


def _font(size: int, bold: bool = True) -> ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\YuGothB.ttc",
        r"C:\Windows\Fonts\YuGothM.ttc",
        r"C:\Windows\Fonts\meiryob.ttc",
        r"C:\Windows\Fonts\msgothic.ttc",
        r"C:\Windows\Fonts\segoeui.ttf",
    ]
    if not bold:
        candidates = [
            r"C:\Windows\Fonts\YuGothM.ttc",
            r"C:\Windows\Fonts\YuGothR.ttc",
            r"C:\Windows\Fonts\meiryo.ttc",
            *candidates,
        ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size, index=0)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_bubbles(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float) -> None:
    """Two overlapping speech bubbles with bar + pie charts."""
    # Secondary (right, lighter) bubble
    r2 = 22 * scale
    x2, y2 = cx + 10 * scale, cy - 2 * scale
    draw.ellipse([x2 - r2, y2 - r2, x2 + r2, y2 + r2], fill=BLUE_LIGHT)
    # tail
    draw.polygon(
        [
            (x2 + r2 * 0.15, y2 + r2 * 0.55),
            (x2 + r2 * 0.85, y2 + r2 * 1.05),
            (x2 - r2 * 0.05, y2 + r2 * 0.85),
        ],
        fill=BLUE_LIGHT,
    )
    # pie chart
    pie_r = 9 * scale
    bbox = [x2 - pie_r, y2 - pie_r, x2 + pie_r, y2 + pie_r]
    draw.ellipse(bbox, fill=WHITE)
    draw.pieslice(bbox, start=-40, end=80, fill=BLUE)

    # Primary (left, solid) bubble
    r1 = 26 * scale
    x1, y1 = cx - 8 * scale, cy + 2 * scale
    draw.ellipse([x1 - r1, y1 - r1, x1 + r1, y1 + r1], fill=BLUE)
    draw.polygon(
        [
            (x1 - r1 * 0.2, y1 + r1 * 0.55),
            (x1 - r1 * 0.95, y1 + r1 * 1.1),
            (x1 + r1 * 0.15, y1 + r1 * 0.85),
        ],
        fill=BLUE,
    )
    # bar chart
    bar_w = 4.2 * scale
    gap = 2.8 * scale
    base_x = x1 - 10 * scale
    base_y = y1 + 10 * scale
    heights = [8 * scale, 12 * scale, 16 * scale, 20 * scale]
    for i, bh in enumerate(heights):
        bx = base_x + i * (bar_w + gap)
        draw.rounded_rectangle(
            [bx, base_y - bh, bx + bar_w, base_y],
            radius=max(1, int(scale)),
            fill=WHITE,
        )


def draw_mark(size: int) -> Image.Image:
    """Bubble mark only — for favicon 16–48."""
    img = Image.new("RGBA", (size, size), WHITE + (255,))
    draw = ImageDraw.Draw(img)
    scale = size / 64
    draw_bubbles(draw, size * 0.50, size * 0.50, scale)
    return img


def draw_full(size: int) -> Image.Image:
    """Full IG-style circular logo for apple-touch / PWA."""
    img = Image.new("RGBA", (size, size), WHITE + (255,))
    draw = ImageDraw.Draw(img)
    # soft circle plate
    pad = int(size * 0.02)
    draw.ellipse([pad, pad, size - pad - 1, size - pad - 1], fill=WHITE, outline=(230, 230, 230))

    scale = size / 180
    draw_bubbles(draw, size * 0.50, size * 0.38, scale * 1.15)

    brand = _font(max(10, int(size * 0.095)), bold=True)
    tag = _font(max(8, int(size * 0.045)), bold=False)
    brand_text = "ナットクLabo"
    tag_text = "口コミ分析で確かな答えを"

    def center_text(text: str, y: float, font: ImageFont.ImageFont, fill):
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((size - tw) / 2, y), text, font=font, fill=fill)

    center_text(brand_text, size * 0.58, brand, BLUE)
    center_text(tag_text, size * 0.72, tag, TAG)
    return img


def main() -> None:
    brand_dir = ROOT / "brand"
    brand_dir.mkdir(exist_ok=True)

    mark64 = draw_mark(64)
    mark64.save(brand_dir / "ig-mark-square.png")
    draw_full(512).save(brand_dir / "ig-profile-512.png")

    draw_mark(48).save(ROOT / "favicon-48.png")
    draw_full(180).save(ROOT / "apple-touch-icon.png")
    draw_full(192).save(ROOT / "icon-192.png")

    ico48 = draw_mark(48)
    ico32 = draw_mark(32)
    ico16 = draw_mark(16)
    ico48.save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=[ico32, ico16],
    )

    # Crisp SVG mark (vector)
    (ROOT / "favicon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="ナットクLabo">
  <rect width="64" height="64" fill="#ffffff"/>
  <!-- light bubble -->
  <g fill="#96c8e6">
    <circle cx="40" cy="28" r="16"/>
    <path d="M42 38 L52 48 L38 44 Z"/>
  </g>
  <circle cx="40" cy="28" r="7" fill="#ffffff"/>
  <path d="M40 21 A7 7 0 0 1 46.5 31 L40 28 Z" fill="#3a82c4"/>
  <!-- primary bubble -->
  <g fill="#3a82c4">
    <circle cx="26" cy="32" r="18"/>
    <path d="M22 42 L12 52 L30 46 Z"/>
  </g>
  <rect x="16" y="30" width="3.2" height="8" rx="1" fill="#ffffff"/>
  <rect x="20.5" y="26" width="3.2" height="12" rx="1" fill="#ffffff"/>
  <rect x="25" y="22" width="3.2" height="16" rx="1" fill="#ffffff"/>
  <rect x="29.5" y="18" width="3.2" height="20" rx="1" fill="#ffffff"/>
</svg>
""",
        encoding="utf-8",
    )
    print("Wrote IG-style favicon set")


if __name__ == "__main__":
    main()

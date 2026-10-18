# -*- coding: utf-8 -*-
"""Build ナットクLabo favicon set (SVG / PNG / ICO)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PRIMARY = (30, 64, 175)  # #1e40af
WHITE = (255, 255, 255)


def draw_mark(size: int) -> Image.Image:
    """Rounded square + checkmark (納得 = check)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = max(1, size // 16)
    radius = max(4, size // 5)
    d.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=radius,
        fill=PRIMARY,
    )
    # checkmark
    stroke = max(2, size // 8)
    # coordinates relative to size
    x1, y1 = size * 0.28, size * 0.52
    x2, y2 = size * 0.44, size * 0.70
    x3, y3 = size * 0.74, size * 0.32
    d.line([(x1, y1), (x2, y2), (x3, y3)], fill=WHITE, width=stroke, joint="curve")
    return img


def write_svg(path: Path) -> None:
    path.write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="ナットクLabo">
  <rect x="2" y="2" width="60" height="60" rx="14" fill="#1e40af"/>
  <path d="M18 34 L28 45 L46 20" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
""",
        encoding="utf-8",
    )


def main() -> None:
    write_svg(ROOT / "favicon.svg")

    png48 = draw_mark(48)
    png48.save(ROOT / "favicon-48.png", format="PNG")

    png180 = draw_mark(180)
    png180.save(ROOT / "apple-touch-icon.png", format="PNG")

    png192 = draw_mark(192)
    png192.save(ROOT / "icon-192.png", format="PNG")

    # multi-size ICO for /favicon.ico
    ico_sizes = [16, 32, 48]
    icos = [draw_mark(s) for s in ico_sizes]
    icos[-1].save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=icos[:-1],
    )
    print("Wrote favicon.svg, favicon.ico, favicon-48.png, apple-touch-icon.png, icon-192.png")


if __name__ == "__main__":
    main()

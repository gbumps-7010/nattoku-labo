# -*- coding: utf-8 -*-
"""Build favicons from the official ナットクLabo logo (IG profile mark)."""
from __future__ import annotations

import base64
import io
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(
    r"C:\Users\naoto\.cursor\projects\c-Users-naoto-Desktop-nattoku-labo\assets"
    r"\c__Users_naoto_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"8eb8b15ba86f27821d6e835e541cee94_images_____Labo______-0ed58dbf-6d69-4ad7-892d-2460d2dcb971.png"
)
# Fallback if Cursor assets path moves
FALLBACK = ROOT / "brand" / "logo-source.png"


def load_source() -> Image.Image:
    brand = ROOT / "brand"
    brand.mkdir(exist_ok=True)
    dest = brand / "logo-source.png"
    src = SRC if SRC.exists() else FALLBACK
    if not src.exists():
        raise SystemExit(f"logo source not found: {SRC}")
    if src.resolve() != dest.resolve():
        shutil.copy2(src, dest)
    return Image.open(dest).convert("RGBA")


def pad_square(im: Image.Image, fill=(255, 255, 255, 255)) -> Image.Image:
    w, h = im.size
    side = max(w, h)
    sq = Image.new("RGBA", (side, side), fill)
    sq.paste(im, ((side - w) // 2, (side - h) // 2), im)
    return sq


def bubble_mark(full: Image.Image) -> Image.Image:
    """Crop speech-bubble mark only (readable at 16–48px)."""
    w, h = full.size
    # Bubbles only — exclude top slogan and brand text
    mark = full.crop((int(w * 0.24), int(h * 0.28), int(w * 0.76), int(h * 0.54)))
    return pad_square(mark, (255, 255, 255, 255))


def main() -> None:
    brand = ROOT / "brand"
    brand.mkdir(exist_ok=True)

    full = pad_square(load_source(), (255, 255, 255, 255))
    full.resize((512, 512), Image.Resampling.LANCZOS).save(brand / "ig-profile-512.png")

    mark = bubble_mark(full)
    mark.save(brand / "ig-mark-square.png")

    for name, size, src in [
        ("favicon-48.png", 48, mark),
        ("apple-touch-icon.png", 180, full),
        ("icon-192.png", 192, full),
    ]:
        src.resize((size, size), Image.Resampling.LANCZOS).save(ROOT / name)

    ico48 = mark.resize((48, 48), Image.Resampling.LANCZOS)
    ico32 = mark.resize((32, 32), Image.Resampling.LANCZOS)
    ico16 = mark.resize((16, 16), Image.Resampling.LANCZOS)
    ico48.save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=[ico32, ico16],
    )

    # SVG wraps the crisp mark PNG for modern browsers
    buf = io.BytesIO()
    mark.resize((64, 64), Image.Resampling.LANCZOS).save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    (ROOT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="ナットクLabo">\n'
        f'  <image href="data:image/png;base64,{b64}" width="64" height="64"/>\n'
        "</svg>\n",
        encoding="utf-8",
    )
    print("OK from", full.size, "mark", mark.size)


if __name__ == "__main__":
    main()

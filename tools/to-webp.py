#!/usr/bin/env python3
"""
Pretvorba slike -> WebP za app.

    python3 tools/to-webp.py <vhod> <izhod.webp> [sirina] [kakovost]

Zakaj Pillow in ne `sips`: sips na tem macOS-u WebP-a NE zna zapisati,
Pillow 11 pa ga zna. EXIF se izgubi samodejno.

Proracun: slike likov <= 120 KB — skripta opozori.
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__.strip(), file=sys.stderr)
        return 2

    src = Path(sys.argv[1]).expanduser()
    dst_rel = sys.argv[2]
    width = int(sys.argv[3]) if len(sys.argv) > 3 else 500
    quality = int(sys.argv[4]) if len(sys.argv) > 4 else 82

    dst = Path(dst_rel) if dst_rel.startswith("/") else ROOT / dst_rel

    if not src.is_file():
        print(f"NAPAKA: vhodna datoteka ne obstaja: {src}", file=sys.stderr)
        return 1

    dst.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(src) as im:
        im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
        if im.width > width:
            height = round(im.height * width / im.width)
            im = im.resize((width, height), Image.LANCZOS)
        im.save(dst, "WEBP", quality=quality, method=6)
        dims = f"{im.width} {im.height}"

    kb = dst.stat().st_size // 1024
    rel = dst.relative_to(ROOT) if dst.is_relative_to(ROOT) else dst
    print(f"OK {rel}  {dims} {kb} KB (q={quality})")

    if kb > 120:
        print(
            f"OPOZORILO: {kb} KB presega proracun 120 KB — poskusi nizjo kakovost ali manjso sirino.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

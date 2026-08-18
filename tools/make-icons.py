#!/usr/bin/env python3
"""
Ikone za namizje (PWA) — python3 tools/make-icons.py

Ikona je 📖 na istem prelivu kot domači zaslon igre: kar otrok tapne na namizju,
je isto, kar vidi, ko se igra odpre.

Emoji jemljemo iz sistemske pisave. Apple Color Emoji ima eno samo bitno
različico, pri velikosti 160 — vse drugo Pillow zavrne z "invalid pixel size".
Zato ga narišemo enkrat pri 160 in ga za vsako ikono posebej pomanjšamo oziroma
povečamo z LANCZOS; pri 180 px, kjer iPhone ikono dejansko riše, je to
pomanjšava in torej ostro.

ffmpeg ni potreben, sips ne zna prelivov — vse naredi Pillow.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

EMOJI_FONT = '/System/Library/Fonts/Apple Color Emoji.ttc'
STRIKE = 160  # edina bitna različica v pisavi
OUT = Path(__file__).resolve().parent.parent / 'public' / 'icons'

# Isti preliv kot `bgFor()` za domači zaslon v src/lib/styles.js.
STOPS = [(0.0, (0x8F, 0xD3, 0xFF)), (0.70, (0xC9, 0xF2, 0xE5)), (1.0, (0xFF, 0xF6, 0xC9))]


def gradient(size):
    img = Image.new('RGB', (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        for i in range(len(STOPS) - 1):
            t0, c0 = STOPS[i]
            t1, c1 = STOPS[i + 1]
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0)
                d.line([(0, y), (size, y)], fill=tuple(round(a + (b - a) * k) for a, b in zip(c0, c1)))
                break
    return img


def emoji(char):
    """Emoji pri izvorni velikosti, obrezan na svoje robove."""
    font = ImageFont.truetype(EMOJI_FONT, STRIKE)
    canvas = Image.new('RGBA', (STRIKE * 2, STRIKE * 2), (0, 0, 0, 0))
    ImageDraw.Draw(canvas).text((STRIKE // 2, STRIKE // 2), char, font=font, embedded_color=True)
    return canvas.crop(canvas.getbbox())


def make(size, frac, name):
    """frac = delež širine ikone, ki ga zasede emoji."""
    bg = gradient(size)
    src = emoji('📖')
    w = round(size * frac)
    h = round(src.height * w / src.width)
    glyph = src.resize((w, h), Image.LANCZOS)
    # Rahlo nad sredino: knjiga je široka in nizka, optično središče je višje.
    bg.paste(glyph, ((size - w) // 2, (size - h) // 2 - round(size * 0.02)), glyph)
    OUT.mkdir(parents=True, exist_ok=True)
    bg.save(OUT / name, 'PNG', optimize=True)
    print(f'  {name:24s} {size}×{size}  emoji {w}px')


# 180 je velikost, ki jo iPhone res uporabi; 192 in 512 sta za manifest.
# Maskirana ima več zraka, ker Android čeznjo lahko postavi krog.
make(180, 0.62, 'icon-180.png')
make(192, 0.62, 'icon-192.png')
make(512, 0.58, 'icon-512.png')
make(512, 0.46, 'icon-512-maskable.png')

#!/usr/bin/env python3
"""
Rez tišine + izenačitev glasnosti za posnetke govornega paketa.

    python3 tools/trim-audio.py <vhod.wav> <izhod.wav>

Zakaj lastna skripta in ne ffmpeg: ta Mac nima ne Homebrewa ne ffmpega, za
namestitev pa bi bil potreben prenos. Vse, kar tu rabimo, zmore standardna
knjižnica: `wave` za branje/pisanje in celoštevilska matematika za analizo.
(`audioop` NE uporabljamo — iz Pythona 3.13 je odstranjen.)

Kaj naredi:
  1. odreže tišino na obeh koncih (prag glede na vrh posnetka, ne absoluten —
     tiho izgovorjena črka drugače izgine),
  2. pusti kratek zrak pred in za besedo, da zvok ne "poči",
  3. doda 8 ms prehoda na obeh koncih,
  4. normalizira vrh na -1.5 dBFS, da so vsi posnetki enako glasni.

Dela z 16-bitnim mono ali stereo PCM, kakršnega vrne `say --data-format=LEI16`.
"""

import array
import sys
import wave

# Prag tišine glede na vrh posnetka. Absolutni prag bi pri tiho izgovorjenih
# soglasnikih ("s", "f") odrezal celo besedo.
SILENCE_RATIO = 0.035
LEAD_MS = 25        # zrak pred besedo
TAIL_MS = 60        # zrak za besedo (izzvenevanje soglasnikov)
FADE_MS = 8
TARGET_PEAK = 0.84  # ≈ -1.5 dBFS


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__.strip(), file=sys.stderr)
        return 2

    src, dst = sys.argv[1], sys.argv[2]

    with wave.open(src, "rb") as w:
        channels = w.getnchannels()
        width = w.getsampwidth()
        rate = w.getframerate()
        raw = w.readframes(w.getnframes())

    if width != 2:
        print(f"NAPAKA: pričakujem 16-bitni PCM, dobil {width * 8}-bitnega: {src}", file=sys.stderr)
        return 1

    samples = array.array("h")
    samples.frombytes(raw)
    if sys.byteorder == "big":
        samples.byteswap()

    frames = len(samples) // channels
    if frames == 0:
        print(f"NAPAKA: prazen posnetek: {src}", file=sys.stderr)
        return 1

    # Vrh na okvir (pri stereu najglasnejši kanal).
    peaks = [0] * frames
    peak = 0
    for i in range(frames):
        base = i * channels
        loudest = 0
        for c in range(channels):
            v = samples[base + c]
            v = -v if v < 0 else v
            if v > loudest:
                loudest = v
        peaks[i] = loudest
        if loudest > peak:
            peak = loudest

    if peak == 0:
        print(f"NAPAKA: posnetek je tih: {src}", file=sys.stderr)
        return 1

    gate = max(1, int(peak * SILENCE_RATIO))
    first = next((i for i in range(frames) if peaks[i] >= gate), 0)
    last = next((i for i in range(frames - 1, -1, -1) if peaks[i] >= gate), frames - 1)

    lead = int(rate * LEAD_MS / 1000)
    tail = int(rate * TAIL_MS / 1000)
    start = max(0, first - lead)
    end = min(frames, last + tail + 1)

    cut = samples[start * channels:end * channels]
    out_frames = len(cut) // channels

    # Normalizacija vrha — vsi posnetki morajo biti enako glasni, sicer se glas
    # črke izgubi za navodilom.
    gain = (TARGET_PEAK * 32767.0) / peak
    fade = min(int(rate * FADE_MS / 1000), out_frames // 2)

    for i in range(out_frames):
        env = 1.0
        if fade:
            if i < fade:
                env = i / fade
            elif i >= out_frames - fade:
                env = (out_frames - 1 - i) / fade
        base = i * channels
        for c in range(channels):
            v = int(cut[base + c] * gain * env)
            cut[base + c] = 32767 if v > 32767 else (-32768 if v < -32768 else v)

    if sys.byteorder == "big":
        cut.byteswap()

    with wave.open(dst, "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(cut.tobytes())

    print(f"{frames / rate:.2f}s -> {out_frames / rate:.2f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

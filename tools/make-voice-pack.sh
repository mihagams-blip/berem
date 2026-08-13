#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Govorni paket za BEREM — macOS `say` (glas Tina) → public/audio/*.m4a
#
#   bash tools/make-voice-pack.sh            # zgeneriraj
#   bash tools/make-voice-pack.sh --dry-run  # samo izpiši, kaj bi naredil
#
# Kaj zgenerira (ključe prebere iz src/content/dinos.js, da se ne razideta):
#   dino.<id>   ime dinozavra
#   syl.<zlog>  posamezen zlog — otrok ga sliši, ko ga tapne
#
# Ime datoteke = ključ, kjer je vsak ne-alfanumerični znak zamenjan z '-'
# (ISTA pretvorba je v src/lib/audio.js → slug()).
#
# ffmpeg NI potreben: rez tišine in izenačitev glasnosti opravi
# tools/trim-audio.py (samo standardna knjižnica), zapis v m4a pa vgrajeni
# `afconvert`. Ta Mac nima ne Homebrewa ne ffmpega.
#
# Slovenski glas: Sistemske nastavitve → Dostopnost → Izgovorjena vsebina →
# Sistemski glas → Upravljanje glasov → Slovenščina → Tina.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${ROOT}/public/audio"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

command -v say >/dev/null 2>&1 || { echo "NAPAKA: 'say' ni — potreben je macOS." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "NAPAKA: node ni na voljo." >&2; exit 1; }

VOICE="$(say -v '?' 2>/dev/null | awk '$0 ~ /sl_SI/ {print $1; exit}')"
if [ -z "$VOICE" ]; then
  cat >&2 <<'MSG'
USTAVLJAM SE: slovenskega glasu (sl_SI) v sistemu ni.

Brez njega govorni paket nima smisla — igra je slovenska, sinteze v brskalniku
pa namenoma ne uporabljamo (na telefonu slovenskega glasu pogosto ni).

Namesti ga: Sistemske nastavitve → Dostopnost → Izgovorjena vsebina →
Sistemski glas → Upravljanje glasov → Slovenščina → Tina → prenesi
MSG
  exit 2
fi
echo "Glas: ${VOICE}"

command -v afconvert >/dev/null 2>&1 || { echo "NAPAKA: afconvert ni na voljo." >&2; exit 3; }
[ -f "${ROOT}/tools/trim-audio.py" ] || { echo "NAPAKA: manjka tools/trim-audio.py" >&2; exit 3; }

# ── Ključi iz vsebine ────────────────────────────────────────────────────────
# Zlog se izgovori sam zase, zato ga beremo malce počasneje kot celo ime.
LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT

node --input-type=module -e '
  const m = await import("'"${ROOT}"'/src/content/dinos.js");
  for (const d of m.DINOS) process.stdout.write(`dino.${d.id}\t165\t${d.name}\n`);
  for (const s of m.SYLLABLES) process.stdout.write(`syl.${s}\t140\t${s}\n`);

  // Števila za način RAČUNAM. Glas Tina slovenske številke prebere kot BESEDE
  // ("34" → štiriintrideset), zato jih podamo kot števke in se izognemo
  // sestavljanju iz delov — slovenska inverzija (štiri-in-trideset) bi pri
  // lepljenju "trideset"+"štiri" dala napačen vrstni red.
  const nums = new Set();
  for (let n = 0; n <= 100; n++) nums.add(n);        // do 20 in do 100
  for (let n = 110; n <= 1000; n += 10) nums.add(n); // do 1000: same desetice
  for (const n of [...nums].sort((a, b) => a - b)) process.stdout.write(`num.${n}\t165\t${n}\n`);
' > "$LIST"

COUNT="$(wc -l < "$LIST" | tr -d ' ')"
echo "Ključev: ${COUNT}"

if [ "$DRY_RUN" -eq 1 ]; then
  while IFS=$'\t' read -r key rate text; do
    [ -n "${key:-}" ] || continue
    name="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]' | sed -E 's/č/cc/g; s/š/ss/g; s/ž/zz/g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
    printf '   %-28s %s\n' "${name}.m4a" "$text"
  done < "$LIST"
  echo; echo "Suh tek — nič ni bilo zapisano."
  exit 0
fi

mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; rm -f "$LIST"' EXIT

OK=0; FAIL=0
KEYS="${TMP}/keys.txt"; : > "$KEYS"

while IFS=$'\t' read -r key rate text; do
  [ -n "${key:-}" ] || continue
  name="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]' | sed -E 's/č/cc/g; s/š/ss/g; s/ž/zz/g; s/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  raw="${TMP}/raw.wav"; trimmed="${TMP}/trim.wav"; dst="${OUT}/${name}.m4a"

  if ! say -v "$VOICE" -r "$rate" --file-format=WAVE --data-format=LEI16@44100 -o "$raw" "$text" 2>/dev/null; then
    echo "   ! say ni uspel: ${key}" >&2; FAIL=$((FAIL+1)); continue
  fi
  if ! python3 "${ROOT}/tools/trim-audio.py" "$raw" "$trimmed" >/dev/null 2>&1; then
    echo "   ! rez ni uspel: ${key}" >&2; FAIL=$((FAIL+1)); continue
  fi
  if ! afconvert -f m4af -d aac -b 64000 "$trimmed" "$dst" >/dev/null 2>&1; then
    echo "   ! afconvert ni uspel: ${key}" >&2; FAIL=$((FAIL+1)); continue
  fi
  printf '%s\n' "$key" >> "$KEYS"
  OK=$((OK+1))
done < "$LIST"

# ── Manifest ─────────────────────────────────────────────────────────────────
# Bere ga src/lib/audio.js: brez njega je hasVoice() vedno false in govor tiho
# odpade, aplikacija pa deluje naprej.
{
  printf '{\n  "voice": "%s",\n  "ext": "m4a",\n  "keys": [' "$VOICE"
  first=1
  while IFS= read -r k; do
    [ -n "$k" ] || continue
    [ "$first" -eq 1 ] || printf ','
    printf '\n    "%s"' "$k"
    first=0
  done < "$KEYS"
  [ "$first" -eq 1 ] || printf '\n  '
  printf ']\n}\n'
} > "${OUT}/manifest.json"

BYTES="$(find "$OUT" -name '*.m4a' -exec stat -f%z {} + 2>/dev/null | awk '{s+=$1} END {print s+0}')"
echo
echo "Zapisanih: ${OK}   napak: ${FAIL}   skupaj: $((BYTES / 1024)) KB"
echo "Manifest: public/audio/manifest.json"

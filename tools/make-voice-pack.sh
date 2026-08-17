#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Govorni paket za BEREM — macOS `say` (glas Tina) → public/audio/*.m4a
#
#   bash tools/make-voice-pack.sh            # zgeneriraj, kar manjka
#   bash tools/make-voice-pack.sh --force    # posnemi vse na novo
#   bash tools/make-voice-pack.sh --dry-run  # samo izpiši, kaj bi naredil
#
# Kaj zgenerira (ključe prebere iz src/content/*.js, da se ne razideta):
#   dino.<id> car.<id> hero.<id> myth.<id>   ime
#   syl.<zlog>                              posamezen zlog (deljen med paketi)
#   num.<n>                                 števila za način RAČUNAM
#
# Ime datoteke izračuna node z ISTO funkcijo kot src/lib/audio.js → slug().
# Prej jo je posnemal `tr` + `sed` v shellu in se je razšla: `tr [:upper:]` v
# C-jezikovnem okolju velikih Č/Š/Ž ne zmanjša, zato `s/č/cc/` nanje ni prijel
# in so padli v `[^a-z0-9]` → vezaj. `syl.ČEK` in `syl.ŽEK` sta oba pristala v
# `syl-ek.m4a`, JS pa je iskal `syl-ccek.m4a` — pet zlogov je bilo tiho.
# Pravilo mora biti zapisano na enem mestu, sicer se prej ali slej spet razide.
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
FORCE=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1
[ "${1:-}" = "--force" ] && FORCE=1

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
  const ROOT = "'"${ROOT}"'";
  const syllables = new Set();
  const rows = [];
  const emit = (key, rate, text) => rows.push([key, rate, text]);

  /** ISTA pretvorba kot src/lib/audio.js → slug(). Ne podvajaj je drugje. */
  const slug = (key) =>
    String(key)
      .toLowerCase()
      .replace(/č/g, "cc")
      .replace(/š/g, "ss")
      .replace(/ž/g, "zz")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  /** Vsak vsebinski paket da imena in zloge. Manjkajoča datoteka se preskoči. */
  async function pack(file, exportName, prefix) {
    let m;
    try { m = await import(`${ROOT}/src/content/${file}`); } catch { return; }
    for (const it of m[exportName] || []) {
      emit(`${prefix}.${it.id}`, 165, it.name);
      for (const s of it.syl) if (s.trim() !== "") syllables.add(s);
    }
  }
  await pack("dinos.js", "DINOS", "dino");
  await pack("cars.js", "CARS", "car");
  await pack("heroes.js", "HEROES", "hero");
  await pack("myth.js", "MYTH", "myth");

  // Zlogi so DELJENI med paketi (RA, TO, LO … se ponovijo), zato jih zberemo
  // skupaj in vsakega posnamemo enkrat.
  for (const s of [...syllables].sort()) emit(`syl.${s}`, 140, s);

  // Števila za način RAČUNAM. Glas Tina slovenske številke prebere kot BESEDE
  // ("34" → štiriintrideset), zato jih podamo kot števke in se izognemo
  // sestavljanju iz delov — slovenska inverzija (štiri-in-trideset) bi pri
  // lepljenju "trideset"+"štiri" dala napačen vrstni red.
  const nums = new Set();
  for (let n = 0; n <= 100; n++) nums.add(n);        // do 20 in do 100
  for (let n = 110; n <= 1000; n += 10) nums.add(n); // do 1000: same desetice
  for (const n of [...nums].sort((a, b) => a - b)) emit(`num.${n}`, 165, n);

  // Operatorja za način RAČUNAM. Brez njiju "osem ... tri" zveni enako za plus
  // in minus, otrok pa računa ravno po tem, kar sliši.
  emit("op.plus", 150, "plus");
  emit("op.minus", 150, "minus");

  // Ukazi za način UKAZI: gumb 🔊 prebere trak, ki ga je otrok sam sestavil.
  for (const w of ["gor", "dol", "levo", "desno"]) emit(`cmd.${w}`, 150, w);

  // Dva ključa v isti datoteki pomenita en tih zlog — in to se opazi šele v
  // igri. Zato se ustavimo tukaj in glasno.
  const byName = new Map();
  for (const [key] of rows) {
    const n = slug(key);
    if (byName.has(n)) {
      console.error(`TRK IMEN: "${key}" in "${byName.get(n)}" dasta oba ${n}.m4a`);
      process.exit(9);
    }
    byName.set(n, key);
  }

  for (const [key, rate, text] of rows) process.stdout.write(`${key}\t${rate}\t${text}\t${slug(key)}\n`);
' > "$LIST"

COUNT="$(wc -l < "$LIST" | tr -d ' ')"
echo "Ključev: ${COUNT}"

if [ "$DRY_RUN" -eq 1 ]; then
  while IFS=$'\t' read -r key rate text name; do
    [ -n "${key:-}" ] || continue
    printf '   %-28s %s\n' "${name}.m4a" "$text"
  done < "$LIST"
  echo; echo "Suh tek — nič ni bilo zapisano."
  exit 0
fi

mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; rm -f "$LIST"' EXIT

OK=0; FAIL=0; SKIP=0
KEYS="${TMP}/keys.txt"; : > "$KEYS"

while IFS=$'\t' read -r key rate text name; do
  [ -n "${key:-}" ] || continue
  raw="${TMP}/raw.wav"; trimmed="${TMP}/trim.wav"; dst="${OUT}/${name}.m4a"

  # Ključ, ki je že posnet in katerega datoteka je cela, preskočimo — ponovni
  # zagon zaradi šestih novih ključev je sicer četrt ure.
  if [ "$FORCE" -eq 0 ] && [ -s "$dst" ]; then
    printf '%s\n' "$key" >> "$KEYS"
    SKIP=$((SKIP+1))
    continue
  fi

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
echo "Zapisanih: ${OK}   preskočenih: ${SKIP}   napak: ${FAIL}   skupaj: $((BYTES / 1024)) KB"
echo "Manifest: public/audio/manifest.json"

/**
 * Zvok igre — dvoje, ki se ne meša:
 *
 *  1. UČINKI: proceduralni toni prek WebAudio (pravilno, narobe, rjovenje, zmaga).
 *     Brez datotek, zato so takoj na voljo.
 *  2. GOVOR: posneti zlogi in imena dinozavrov (glas Tina) iz `public/audio/`.
 *     Ne uporabljamo sinteze v brskalniku — na telefonu slovenskega glasu pogosto
 *     ni, jedro igre pa je branje in ne sme utihniti.
 *
 * iOS zvoka brez uporabnikove geste ne dovoli, zato `unlockAudio()` kličemo ob
 * PRVEM dotiku. Manjkajoč posnetek je tih — igra teče naprej.
 */

let ctx = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

/** Kliči ob prvem dotiku. Idempotentno; na iOS je nujno tudi ob vrnitvi iz ozadja. */
export function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function playTone(freqs, dur = 0.15, type = 'sine', gap = 0.09) {
  const c = ensureCtx();
  if (!c) return;
  try {
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.18, c.currentTime + i * gap);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * gap + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + i * gap);
      o.stop(c.currentTime + i * gap + dur);
    });
  } catch {
    /* zvok ni nujen za igro */
  }
}

/**
 * Zvočni znaki morajo biti nedvoumni: otrok se uči, kaj pomenita.
 *
 * Prej je bil `sndRoar` padajoča žaga (110→78 Hz) — po pravilnem odgovoru je
 * zvenel kot napaka in otroka zmedel. Zdaj vsi pritrdilni zvoki RASTEJO, edini
 * padajoč pa je »poskusi znova«, in ta je mehak, ne oster.
 */
export const sndCorrect = () => playTone([523, 659, 784, 1047], 0.22, 'triangle');
export const sndRoar = () => playTone([196, 262, 330, 392, 523], 0.26, 'triangle', 0.085);
export const sndWin = () => playTone([523, 659, 784, 1047, 1319, 1568], 0.3, 'triangle', 0.12);
export const sndWrong = () => playTone([330, 262], 0.18, 'sine', 0.13);
export const sndTap = () => playTone([660], 0.06, 'sine');

/**
 * Ton za simbol v načinu VZORCI — pentatonika, da vsaka kombinacija zveni
 * ubrano. Vzorec se tako ne le vidi, ampak tudi sliši: `ABAB` je do-mi-do-mi.
 * Otrok, ki pravila ne vidi, ga lahko ujame po sluhu.
 */
const PENTA = [523, 587, 659, 784, 880];
export const sndNote = (i) => playTone([PENTA[i % PENTA.length]], 0.2, 'triangle');

/* ── Govor ─────────────────────────────────────────────────────────────── */

/**
 * Ključ → ime datoteke. ISTA pretvorba mora biti v tools/make-voice-pack.sh.
 *
 * Šumnike prepišemo, NE odvržemo: gola zamenjava ne-alfanumeričnih znakov bi
 * dala `ŽOGA → -oga` in `ČEVELJ → -evelj`, torej bi se ključi tiho poklapljali
 * in posnetek se preprosto ne bi predvajal. `cc/ss/zz` so varni, ker se v
 * slovenščini ne pojavijo.
 */
const slug = (key) =>
  String(key)
    .toLowerCase()
    .replace(/č/g, 'cc')
    .replace(/š/g, 'ss')
    .replace(/ž/g, 'zz')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cache = new Map();
let manifest = null;
let manifestPromise = null;

/**
 * Manifest se bere z `no-cache`. Prej se je to že maščevalo: ko paketa še ni bilo,
 * se je predpomnil 404 in govor je ostal trajno tiho tudi po tem, ko so posnetki
 * obstajali.
 */
function loadManifest() {
  if (manifestPromise) return manifestPromise;
  manifestPromise = fetch(`${import.meta.env.BASE_URL}audio/manifest.json`, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      manifest = j && Array.isArray(j.keys) ? new Set(j.keys.map(slug)) : null;
      return manifest;
    })
    .catch(() => null);
  return manifestPromise;
}
loadManifest();

/** Ali za ta ključ obstaja posnetek? Pred nalaganjem manifesta vrne false. */
export function hasVoice(key) {
  return !!manifest && manifest.has(slug(key));
}

/**
 * Izgovori ključ (`syl.ver`, `dino.tyrannosaurus`). Če posnetka ni, je tiho.
 * Prejšnji govor prekine, da se dva zloga ne prekrivata.
 */
export function say(key) {
  const name = slug(key);
  let el = cache.get(name);
  if (!el) {
    el = new Audio(`${import.meta.env.BASE_URL}audio/${name}.m4a`);
    el.preload = 'auto';
    cache.set(name, el);
  }
  try {
    for (const other of cache.values()) {
      if (other !== el && !other.paused) {
        other.pause();
        other.currentTime = 0;
      }
    }
    el.currentTime = 0;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});
  } catch {
    /* posnetka ni ali ga brskalnik ne dovoli — tiho naprej */
  }
}

/** Izgovori zloge enega za drugim, nato celo ime — bralna opora, ne nagrada. */
export function saySyllables(syl, opts = {}) {
  const gap = opts.gap ?? 620;
  const timers = [];
  syl.forEach((s, i) => timers.push(setTimeout(() => say(`syl.${s}`), i * gap)));
  if (opts.thenKey) timers.push(setTimeout(() => say(opts.thenKey), syl.length * gap + 260));
  return () => timers.forEach(clearTimeout);
}

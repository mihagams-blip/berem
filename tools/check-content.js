/**
 * Preverjanje vsebine — varovalo pred tipkarsko napako v zlogih.
 *
 *   npm run check
 *
 * Napačno zlogovanje je v igri za učenje branja hujše od manjkajoče besede,
 * zato to teče pred vsako objavo.
 */
import { DINOS, SYLLABLES } from '../src/content/dinos.js';
import { WORDS } from '../src/content/words.js';
import { LEVELS, makeProblem, toUnits } from '../src/lib/arith.js';
import { GRIDS, distances, makeMaze, runProgram } from '../src/lib/maze.js';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let bad = 0;
const fail = (m) => { console.error('  ✗ ' + m); bad++; };

console.log(`Dinozavri: ${DINOS.length}, unikatnih zlogov: ${SYLLABLES.length}`);
for (const d of DINOS) {
  if (d.syl.join('') !== d.name) fail(`${d.id}: zlogi "${d.syl.join('-')}" ne dajo imena "${d.name}"`);
  if (!existsSync(join(root, 'public', d.img))) fail(`${d.id}: manjka slika ${d.img}`);
  for (const f of ['name', 'diet', 'lengthM', 'benchmark', 'shape']) {
    if (d[f] === undefined || d[f] === '') fail(`${d.id}: manjka polje ${f}`);
  }
}
const shapes = new Map();
for (const d of DINOS) shapes.set(d.shape, (shapes.get(d.shape) || 0) + 1);
console.log('Skupine:', Object.fromEntries(shapes));

console.log(`Besede: ${WORDS.length}`);
const seen = new Set();
for (const w of WORDS) {
  if (w.syl && w.syl.join('') !== w.w) fail(`${w.w}: zlogi "${w.syl.join('-')}" ne dajo besede`);
  if (/[QWXY]/.test(w.w)) fail(`${w.w}: vsebuje črko, ki je slovenska abeceda nima`);
  if (seen.has(w.w)) fail(`${w.w}: podvojena beseda`);
  seen.add(w.w);
}
const letters = new Map();
for (const w of WORDS) letters.set(w.w[0], (letters.get(w.w[0]) || 0) + 1);
const weak = [...'ABCČDEFGHIJKLMNOPRSŠTUVZŽ'].filter((c) => (letters.get(c) || 0) < 2);
if (weak.length) console.log('  ⚠ začetnice z manj kot 2 besedama:', weak.join(' '));

/* ── Odštevanje: slika ne sme lagati ─────────────────────────────────────────
 *
 * Odštevanec se sme na vsakem mestu držati kvečjemu tega, kar je tam na voljo.
 * Če to pravilo pade, mora igra pri `52 − 8` razbiti vedro — česar narisati ne
 * zna in otroka nauči napačno. Na oko tega ni mogoče preveriti, ker se pokaže
 * šele pri redkih žrebih, zato tu.
 */
const ROUNDS = 300;
for (const lv of Object.keys(LEVELS)) {
  const L = LEVELS[lv];
  for (let i = 0; i < ROUNDS; i++) {
    const p = makeProblem(lv, 2, 'sub');
    const [a, b] = p.nums;
    if (p.sum !== a - b) fail(`${lv}: ${a} − ${b} ni ${p.sum}`);
    if (p.sum < 0) fail(`${lv}: negativen rezultat ${p.sum}`);
    if (p.options.some((o) => o < 0)) fail(`${lv}: negativna možnost pri ${a} − ${b}`);
    if (new Set(p.options).size !== 3) fail(`${lv}: podvojena možnost pri ${a} − ${b}`);
    const ha = toUnits(a, L.units);
    const hb = toUnits(b, L.units);
    ha.forEach((u, ui) => {
      if (hb[ui].count > u.count) fail(`${lv}: ${a} − ${b} zahteva izposojanje pri ${u.emoji}`);
    });
  }
}
console.log(`Odštevanje: ${ROUNDS} računov na stopnjo, brez izposojanja.`);

/* ── Uganke za UKAZI: vsaka plošča mora biti rešljiva ────────────────────── */
for (const lv of Object.keys(GRIDS)) {
  const cfg = GRIDS[lv];
  for (let i = 0; i < ROUNDS; i++) {
    const m = makeMaze(lv);
    const d = distances(m.w, m.h, m.rocks, m.start).get(`${m.goal.x},${m.goal.y}`);
    if (d === undefined) fail(`${lv}: plošča ni rešljiva`);
    else if (d !== m.optimal) fail(`${lv}: optimal ${m.optimal} ni razdalja ${d}`);
    if (m.optimal < cfg.min || m.optimal > cfg.max) fail(`${lv}: pot ${m.optimal} zunaj meja`);
    // Ravna pot ni uganka, ampak tipkanje.
    if (m.start.x === m.goal.x || m.start.y === m.goal.y) fail(`${lv}: pot brez ovinka`);
    for (const r of m.rocks) {
      if (r.x === m.start.x && r.y === m.start.y) fail(`${lv}: skala na startu`);
      if (r.x === m.goal.x && r.y === m.goal.y) fail(`${lv}: skala na cilju`);
    }
    // Program dolžine `optimal` po gradientu razdalj MORA priti do cilja —
    // sicer zvezdice ni mogoče doseči in stopnja je neigrljiva.
    const back = distances(m.w, m.h, m.rocks, m.goal);
    const prog = [];
    let cur = m.start;
    const STEP = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    while (!(cur.x === m.goal.x && cur.y === m.goal.y) && prog.length <= m.optimal) {
      const here = back.get(`${cur.x},${cur.y}`);
      const k = Object.keys(STEP).find((s) => back.get(`${cur.x + STEP[s][0]},${cur.y + STEP[s][1]}`) === here - 1);
      if (!k) break;
      prog.push(k);
      cur = { x: cur.x + STEP[k][0], y: cur.y + STEP[k][1] };
    }
    const r = runProgram(m, prog);
    if (!r.reached || r.usedSteps !== m.optimal) fail(`${lv}: optimalni program ne pride do cilja`);
  }
}
console.log(`Uganke UKAZI: ${ROUNDS} plošč na stopnjo, vse rešljive in z znano optimalno potjo.`);

/* ── Govor: vsak ključ v manifestu mora imeti svojo datoteko ─────────────────
 *
 * Manjkajoč posnetek je TIH — igra teče naprej in nihče ne opazi, da je nekaj
 * ključev nemih. Tako je pet zlogov s šumniki (ČEK, ČI, ŠKO, ŠKRAT, ŽEK) molčalo
 * skozi celo objavo, ker sta se `slug()` v JS in njegov posnetek v shellu
 * razšla. Odkar ime računa samo node, to ne more več nastati — ta preveritev pa
 * je varovalo, če se kdaj spet podvoji.
 */
const audioDir = join(root, 'public', 'audio');
const manifestPath = join(audioDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.log('Govor: manifesta ni — govorni paket ni zgeneriran (igra bo tiha).');
} else {
  const slug = (key) =>
    String(key)
      .toLowerCase()
      .replace(/č/g, 'cc')
      .replace(/š/g, 'ss')
      .replace(/ž/g, 'zz')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const keys = JSON.parse(readFileSync(manifestPath, 'utf8')).keys || [];
  const files = new Set(readdirSync(audioDir).filter((f) => f.endsWith('.m4a')));

  const names = new Map();
  for (const k of keys) {
    const n = slug(k);
    if (names.has(n)) fail(`govor: "${k}" in "${names.get(n)}" dasta oba ${n}.m4a`);
    names.set(n, k);
    if (!files.has(`${n}.m4a`)) fail(`govor: manjka ${n}.m4a za ključ "${k}"`);
  }
  for (const f of files) if (!names.has(f.replace(/\.m4a$/, ''))) fail(`govor: ${f} nima ključa v manifestu`);
  console.log(`Govor: ${keys.length} ključev, ${files.size} posnetkov.`);
}

console.log(bad === 0 ? '\n✓ Vsebina je v redu.' : `\n✗ ${bad} napak.`);
process.exit(bad === 0 ? 0 : 1);

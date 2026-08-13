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
import { existsSync } from 'node:fs';
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

console.log(bad === 0 ? '\n✓ Vsebina je v redu.' : `\n✗ ${bad} napak.`);
process.exit(bad === 0 ? 0 : 1);

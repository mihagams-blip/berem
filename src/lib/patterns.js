/**
 * Vzorci za način VZORCI — brez Reacta, da jih lahko preveri `npm run check`.
 *
 * To je predalgebra: otrok ne išče odgovora, ampak PRAVILO, in ga potem uporabi.
 * Zato je vse tu generirano in nič izbrano s seznama — napisanih vzorcev se
 * otrok nauči na pamet, generirani pa vsakič zahtevajo isto razmišljanje.
 */

import { pick, shuffle } from './rng.js';

/**
 * Vsaka tema je nabor simbolov; barve so ena od njih in ne edina.
 *
 * Simboli znotraj teme se za vsako nalogo premešajo, zato je isti vzorec `ABAB`
 * vsakič drug par — otrok se uči pravila in ne para.
 */
export const THEMES = {
  // ⚫ in ne ⚪: bel krogec na beli ploščici je skoraj neviden, otrok pa mora
  // razločiti prav barvo. Vseh šest je zato nasičenih ali temnih.
  barve: { label: 'BARVE', items: ['🔴', '🔵', '🟡', '🟢', '🟣', '⚫'] },
  zmaji: { label: 'ZMAJI', items: ['🐉', '🥚', '🔥', '🏰', '⚔️', '🛡️'] },
  dinozavri: { label: 'DINOZAVRI', items: ['🦕', '🦖', '🥚', '🌋', '🌿', '🦴'] },
  morje: { label: 'MORJE', items: ['🦀', '🐠', '🐙', '🐚', '🌊', '⭐'] }
};

/**
 * Težje pomeni daljšo enoto in režo, ki ni na koncu.
 *
 * Reža v sredini je trša, ker mora otrok pogledati na obe strani; reža na koncu
 * pusti, da bere samo naprej.
 */
export const LEVELS = {
  easy: { units: [['A', 'B'], ['A', 'A', 'B'], ['A', 'B', 'B']], len: [5, 6], hole: 'end', opts: 3 },
  mid: { units: [['A', 'B', 'C'], ['A', 'A', 'B', 'B'], ['A', 'B', 'B', 'A']], len: [7, 8], hole: 'end', opts: 4 },
  hard: {
    units: [['A', 'B', 'C', 'B'], ['A', 'A', 'B', 'C'], ['A', 'B', 'C', 'C'], ['A', 'B', 'A', 'C']],
    len: [8, 8],
    hole: 'inside',
    opts: 4
  }
};

/**
 * Toni za simbole — pentatonika, da vsaka kombinacija zveni ubrano.
 *
 * Ton je hkrati dostopnost: pri temi BARVE sta 🔴 in 🟢 za barvno slepega otroka
 * neločljiva, njuna tona pa ne. Vzorec se da rešiti po sluhu.
 */
export const PENTA = [523, 587, 659, 784, 880];

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/**
 * Sestavi nalogo.
 *
 * Vzorec je neskončno zaporedje `p(i) = enota[i mod dolžina]`, iz katerega
 * izrežemo vidni del in eno mesto skrijemo. Če bi trak vedno odrezali na meji
 * enote, bi bil odgovor vedno prvi element enote — in tega bi se otrok naučil
 * prej kot vzorca. Zato je dolžina traku naključna.
 *
 * Vrne: { theme, unitLen, tiles[], holeIdx, answer, options[] }
 */
export function makePattern(levelKey) {
  const L = LEVELS[levelKey] || LEVELS.easy;
  const unit = pick(L.units);
  const distinct = [...new Set(unit)];

  const themeKey = pick(Object.keys(THEMES));
  const bag = shuffle(THEMES[themeKey].items);
  const map = Object.fromEntries(distinct.map((k, i) => [k, bag[i]]));

  const n = randInt(L.len[0], L.len[1]);
  const at = (i) => map[unit[i % unit.length]];
  const tiles = Array.from({ length: n }, (_, i) => at(i));

  // Pred režo mora ostati vsaj ena CELA enota. Iz tega sledi lastnost, ki jo
  // igra potrebuje: pravilni simbol se v traku pojavi tudi drugje. Sicer bi
  // otrok izbral »tistega, ki ga še ni«, in bi imel prav brez branja vzorca.
  const first = unit.length;
  const holeIdx = L.hole === 'end' ? n - 1 : randInt(first, n - 2);
  const answer = tiles[holeIdx];

  // Napačne možnosti so simboli, ki v vzorcu SO. Če jih je premalo, eno vzamemo
  // iz teme; ta je očitno napačna, a izločiti jo je veljaven korak.
  const inPattern = distinct.map((k) => map[k]).filter((s) => s !== answer);
  const foreign = bag.filter((s) => !Object.values(map).includes(s));
  const wrong = [...shuffle(inPattern), ...shuffle(foreign)].slice(0, L.opts - 1);

  // Ton se dodeli po mestu med simboli TEGA vzorca (A→0, B→1, C→2), ne po mestu
  // v temi. Po temi bi se pri šestih simbolih in petih tonih dva simbola lahko
  // zlila v isti ton in `ABAB` bi zvenel kot `AAAA` — torej ravno narobe.
  const note = {};
  distinct.forEach((k, i) => {
    note[map[k]] = i % PENTA.length;
  });

  return {
    theme: themeKey,
    unitLen: unit.length,
    tiles,
    holeIdx,
    answer,
    options: shuffle([answer, ...wrong]),
    note
  };
}

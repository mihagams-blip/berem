/**
 * Aritmetika za način RAČUNAM — brez Reacta, da jo lahko preveri `npm run check`.
 *
 * Tu je pravilo, ki ga na oko ni mogoče preveriti (odštevanje brez izposojanja),
 * zato je ločeno od risanja in ima svoj test.
 */

export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Tri stopnje, tri različne SLIKE istega števila.
 *
 * Do 20 otrok šteje posamezne rakce. Nad tem štetje po ena ni več izvedljivo in
 * tudi ni cilj — cilj je mestna vrednost. Zato rakci gredo v vedra po deset,
 * vedra pa na ladje po sto. Slika ostane, spremeni se, kaj en predmet POMENI:
 *
 *   🦀 = 1     🪣 = 10 rakcev     ⛵ = 10 veder (100 rakcev)
 *
 * Tako otrok pri 250 ne šteje dvesto petdeset stvari, ampak vidi dve ladji in
 * pet veder — in prav to je vsebina računanja do 1000.
 */
export const LEVELS = {
  easy: {
    label: 'DO 20',
    dot: '🟢',
    color: '#3FBF6B',
    maxSum: 20,
    /** Do 20 sme biti tudi tri številke — višje bi bilo preveč predmetov. */
    allowThree: true,
    units: [{ emoji: '🦀', value: 1 }],
    offsets: [1, 2, 3]
  },
  mid: {
    label: 'DO 100',
    dot: '🟡',
    color: '#F2B705',
    maxSum: 100,
    allowThree: false,
    units: [
      { emoji: '🪣', value: 10 },
      { emoji: '🦀', value: 1 }
    ],
    // Napake pri desetkah so tu prava napaka, ki jo hočemo loviti.
    offsets: [1, 2, 10]
  },
  hard: {
    label: 'DO 1000',
    dot: '🔴',
    color: '#E85454',
    maxSum: 1000,
    allowThree: false,
    /** Seštevanci so večkratniki deset, sicer bi bilo predmetov preveč. */
    step: 10,
    units: [
      { emoji: '⛵', value: 100 },
      { emoji: '🪣', value: 10 }
    ],
    offsets: [10, 20, 100]
  }
};

/**
 * Kaj se računa. `mixed` znak izžreba za vsako nalogo posebej — otrok ga mora
 * prebrati in ne more le prešteti vsega po navadi.
 */
export const OPS = {
  add: { label: '➕ SEŠTEVAM', sign: '+', color: '#0E7C86' },
  sub: { label: '➖ ODŠTEVAM', sign: '−', color: '#FF7A5C' },
  mixed: { label: '➕➖ OBOJE', sign: '±', color: '#7A5CC4' }
};

/** Zapis računa: `7 + 5` ali `20 − 3`. */
export const formula = (p) => p.nums.join(` ${OPS[p.op].sign} `);

/** Razstavi število na predmete stopnje: [{emoji, count}] od največjega navzdol. */
export function toUnits(n, units) {
  let rest = n;
  return units.map((u) => {
    const c = Math.floor(rest / u.value);
    rest -= c * u.value;
    return { emoji: u.emoji, count: c };
  });
}

/** Seštevanje: dva ali trije seštevanci, vsota v mejah stopnje. */
function makeAdd(L, count) {
  const step = L.step || 1;
  const maxAddend = Math.floor((L.maxSum / (count === 3 ? 3 : 2) / step) * 1.4) * step;

  let nums;
  do {
    nums = Array.from({ length: count }, () => rand(1, Math.max(1, maxAddend / step)) * step);
  } while (nums.reduce((a, b) => a + b, 0) > L.maxSum);
  return { nums, sum: nums.reduce((a, b) => a + b, 0) };
}

/**
 * Odštevanje BREZ izposojanja — in to ni priročna poenostavitev, ampak pogoj,
 * da slika ne laže.
 *
 * `52 − 30` se da narisati: pet veder, tri prečrtaš. `52 − 8` se ne da, ne da bi
 * vedro razbil — to je izposojanje, svoja lekcija in ne ta. Zato odštevanec
 * sestavimo PO MESTIH: v vsakem mestu vzamemo kvečjemu toliko, kolikor ga je
 * tam na voljo. Tako gre stran vedno cel predmet.
 */
function makeSub(L) {
  const step = L.step || 1;
  const lo = Math.max(2, Math.round((L.maxSum * 0.35) / step));
  const hi = Math.floor(L.maxSum / step);

  for (let guard = 0; guard < 40; guard++) {
    const a = rand(lo, hi) * step;

    let b = 0;
    let rest = a;
    for (const u of L.units) {
      const have = Math.floor(rest / u.value);
      rest -= have * u.value;
      b += rand(0, have) * u.value;
    }

    if (b < step) continue; // odvzeti nič ni naloga
    if (b === a && Math.random() < 0.8) continue; // rezultat 0 je koristen, a redek
    return { nums: [a, b], sum: a - b };
  }
  return { nums: [3 * step, step], sum: 2 * step }; // varovalo, nikoli prazno
}

/**
 * Sestavi račun. Napačna odgovora sta blizu pravilnega in na stopnji, ki šteje:
 * do 20 za ena do tri, do 100 tudi za deset, do 1000 za deset in sto. Če bi bila
 * daleč, bi otrok uganil brez štetja.
 */
export function makeProblem(levelKey, count, opChoice) {
  const L = LEVELS[levelKey];
  const op = opChoice === 'mixed' ? (Math.random() < 0.5 ? 'add' : 'sub') : opChoice;
  const { nums, sum } = op === 'sub' ? makeSub(L) : makeAdd(L, count);

  const wrong = new Set();
  let guard = 0;
  while (wrong.size < 2 && guard++ < 60) {
    const off = L.offsets[rand(0, L.offsets.length - 1)] * (Math.random() < 0.5 ? -1 : 1);
    const w = sum + off;
    // Meja je 0 in ne 1: pri odštevanju je nič pošten odgovor in pošten distraktor.
    if (w >= 0 && w <= L.maxSum && w !== sum) wrong.add(w);
  }
  while (wrong.size < 2) wrong.add(sum + wrong.size + 1); // varovalo, nikoli prazno

  return { op, nums, sum, options: [sum, ...wrong].sort(() => Math.random() - 0.5) };
}

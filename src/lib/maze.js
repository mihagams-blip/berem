/**
 * Uganke za način UKAZI — generator plošč in iskanje najkrajše poti.
 *
 * Brez Reacta, da jo lahko preveri `npm run check`. Plošče so GENERIRANE in ne
 * napisane: napisanih dvajset stopenj se otrok nauči na pamet, generirane pa
 * vsakič zahtevajo isto razmišljanje.
 *
 * BFS naredi dvoje hkrati: jamči, da je plošča rešljiva, IN pove, kako dolga je
 * najkrajša pot. Brez druge polovice ni zvezdice, ki bi kaj pomenila — »prišel
 * si« in »narejeno je dobro« morata ostati ločena.
 */

export const DIRS = {
  up: { dx: 0, dy: -1, arrow: '⬆️', word: 'gor' },
  down: { dx: 0, dy: 1, arrow: '⬇️', word: 'dol' },
  left: { dx: -1, dy: 0, arrow: '⬅️', word: 'levo' },
  right: { dx: 1, dy: 0, arrow: '➡️', word: 'desno' }
};

export const DIR_KEYS = ['up', 'down', 'left', 'right'];

/**
 * Težje pomeni večjo mrežo, več skal in daljšo pot — ne novih ukazov.
 *
 * Ukazi ostanejo štiri absolutne puščice: obračanje glede na robota (»obrni
 * levo«) zahteva miselno rotacijo, ki je pri šestih letih pogosto še pretrda in
 * bi merila to namesto zaporedja. Zanka je naravno nadaljevanje, ko to steče.
 */
export const GRIDS = {
  easy: { w: 4, h: 4, rocks: 0, min: 3, max: 5 },
  mid: { w: 5, h: 5, rocks: 3, min: 5, max: 8 },
  hard: { w: 6, h: 6, rocks: 6, min: 8, max: 12 }
};

const key = (x, y) => `${x},${y}`;
const rand = (n) => Math.floor(Math.random() * n);

/**
 * Najkrajše razdalje od izhodišča mimo skal. Vrne Map "x,y" → število korakov.
 */
export function distances(w, h, rocks, from) {
  const blocked = new Set(rocks.map((r) => key(r.x, r.y)));
  const dist = new Map([[key(from.x, from.y), 0]]);
  const queue = [from];

  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    const d = dist.get(key(cur.x, cur.y));
    for (const k of DIR_KEYS) {
      const { dx, dy } = DIRS[k];
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      const nk = key(nx, ny);
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      if (blocked.has(nk) || dist.has(nk)) continue;
      dist.set(nk, d + 1);
      queue.push({ x: nx, y: ny });
    }
  }
  return dist;
}

/**
 * Naključna plošča, ki ustreza stopnji.
 *
 * Zahteva `start.x !== goal.x && start.y !== goal.y` pomeni, da ima pot vsaj en
 * ovinek — ravna vrsta puščic ni uganka, ampak tipkanje.
 */
export function makeMaze(levelKey) {
  const cfg = GRIDS[levelKey] || GRIDS.easy;
  const { w, h } = cfg;
  const cells = w * h;

  for (let guard = 0; guard < 400; guard++) {
    const taken = new Set();
    const rocks = [];
    while (rocks.length < cfg.rocks) {
      const i = rand(cells);
      if (taken.has(i)) continue;
      taken.add(i);
      rocks.push({ x: i % w, y: Math.floor(i / w) });
    }

    const free = [];
    for (let i = 0; i < cells; i++) if (!taken.has(i)) free.push(i);
    if (free.length < 2) continue;

    const si = free[rand(free.length)];
    const gi = free[rand(free.length)];
    if (si === gi) continue;

    const start = { x: si % w, y: Math.floor(si / w) };
    const goal = { x: gi % w, y: Math.floor(gi / w) };
    if (start.x === goal.x || start.y === goal.y) continue; // pot mora imeti ovinek

    const optimal = distances(w, h, rocks, start).get(key(goal.x, goal.y));
    if (optimal === undefined || optimal < cfg.min || optimal > cfg.max) continue;

    return { w, h, rocks, start, goal, optimal };
  }

  // Varovalo: plošča brez skal je vedno rešljiva. Sem ne pridemo, a igra ne sme
  // ostati brez uganke.
  const start = { x: 0, y: 0 };
  const goal = { x: w - 1, y: h - 1 };
  return { w, h, rocks: [], start, goal, optimal: w - 1 + (h - 1) };
}

/**
 * Odigra program po ploščici. Vrne pot in — če se je robot zaletel — indeks
 * ukaza, ki ni šel.
 *
 * Robot se ustavi TAKOJ, ko pride na cilj: odvečni ukazi za njim se ne izvedejo.
 */
export function runProgram(maze, program) {
  const blocked = new Set(maze.rocks.map((r) => key(r.x, r.y)));
  const path = [maze.start];
  let cur = maze.start;

  for (let i = 0; i < program.length; i++) {
    const { dx, dy } = DIRS[program[i]];
    const next = { x: cur.x + dx, y: cur.y + dy };
    const outside = next.x < 0 || next.y < 0 || next.x >= maze.w || next.y >= maze.h;
    if (outside || blocked.has(key(next.x, next.y))) {
      return { path, failIdx: i, reached: false };
    }
    cur = next;
    path.push(cur);
    if (cur.x === maze.goal.x && cur.y === maze.goal.y) {
      return { path, failIdx: null, reached: true, usedSteps: i + 1 };
    }
  }
  return { path, failIdx: null, reached: false };
}

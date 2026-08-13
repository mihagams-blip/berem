/** Naključnost in izbira napačnih odgovorov. */

export const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

/**
 * Izbere N napačnih odgovorov za dino način.
 *
 * To je najpomembnejša odločitev te igre. Če so napačne slike naključne, otrok
 * pogosto ugane BREZ branja — dovolj je, da je pravilna žival edina z dolgim
 * vratom. Zato jih izbiramo po obliki:
 *
 *   lahko   → iz DRUGIH skupin (silhuete se očitno ločijo, otrok se uči povezave)
 *   srednje → mešano
 *   težko   → iz ISTE skupine, da o odgovoru odloči branje in ne oblika
 *
 * Skupini "leteci" in "morski" imata po enega člana, zato se na težki stopnji
 * tiho vrneta na mešano izbiro — bolje mešano kot premalo kartic.
 */
export function pickDistractors(target, all, count, level) {
  const rest = all.filter((d) => d.id !== target.id);
  const same = rest.filter((d) => d.shape === target.shape);
  const other = rest.filter((d) => d.shape !== target.shape);

  let pool;
  if (level === 'hard' && same.length >= count) pool = same;
  else if (level === 'easy') pool = other.length >= count ? other : rest;
  else pool = rest;

  return shuffle(pool).slice(0, count);
}

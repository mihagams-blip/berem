import { useCallback, useEffect, useState } from 'react';
import { WORDS } from '../content/words.js';
import { shuffle } from '../lib/rng.js';
import { sndCorrect, sndWrong } from '../lib/audio.js';
import { Pic, Word } from '../ui/Bits.jsx';
import { LEVELS, bigBtn, chip, homeBtn } from '../lib/styles.js';

/** Besede primerne dolžine za stopnjo; nabor razširimo, če je premajhen. */
function wordsFor(level) {
  const L = LEVELS[level];
  let min = L.min;
  let max = L.max;
  let p = WORDS.filter((x) => x.w.length >= min && x.w.length <= max);
  while (p.length < L.cards + 1 && (min > 3 || max < 14)) {
    min = Math.max(3, min - 1);
    max = Math.min(14, max + 1);
    p = WORDS.filter((x) => x.w.length >= min && x.w.length <= max);
  }
  return p;
}

/** NAJDI SLIKO — napisana beseda (ali dve), otrok pokaže ustrezno sliko. */
export default function FindPicture({ level, numWords, setNumWords, onStar, onHome, busy }) {
  const [round, setRound] = useState(null);
  const [shakeIdx, setShakeIdx] = useState(-1);

  const newRound = useCallback(() => {
    const L = LEVELS[level];
    const pool = shuffle(wordsFor(level));
    const targets = pool.slice(0, numWords);
    const distractors = pool.slice(numWords, L.cards);
    setRound({
      targets: targets.map((t) => ({ ...t, found: false })),
      cards: shuffle([...targets, ...distractors])
    });
  }, [level, numWords]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  if (!round) return null;

  const tap = (card, idx) => {
    if (busy) return;
    const ti = round.targets.findIndex((t) => t.w === card.w && !t.found);
    if (ti >= 0) {
      const targets = round.targets.map((t, i) => (i === ti ? { ...t, found: true } : t));
      setRound({ ...round, targets });
      if (targets.every((t) => t.found)) onStar(newRound);
      else sndCorrect();
    } else {
      sndWrong();
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(-1), 500);
    }
  };

  const cols = round.cards.length <= 4 ? 2 : round.cards.length >= 8 ? 4 : 3;

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: 'clamp(15px,4vw,20px)', color: '#4A4468', letterSpacing: '1px' }}>
        👆 POKAŽI, KJE JE:
      </div>

      {round.targets.map((t) => (
        <div key={t.w} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: t.found ? 0.45 : 1 }}>
          <Word word={t.w} />
          {t.found && <span style={{ fontSize: '30px' }}>✅</span>}
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: '12px', width: '100%', marginTop: '6px' }}>
        {round.cards.map((c, i) => {
          const found = round.targets.some((t) => t.w === c.w && t.found);
          return (
            <button
              key={c.w}
              onClick={() => tap(c, i)}
              aria-label={c.w}
              style={{
                background: found ? '#D9F7EF' : '#fff',
                border: found ? '4px solid #2EC4B6' : '4px solid #E8E4F5',
                borderRadius: '20px',
                padding: 'clamp(10px,3vw,18px)',
                cursor: 'pointer',
                boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'clamp(70px,20vw,110px)',
                animation: shakeIdx === i ? 'shake 0.4s ease' : 'none'
              }}
            >
              <Pic item={c} />
            </button>
          );
        })}
      </div>

      {/* Izbira ena/dve besedi sodi SEM, ne na domači zaslon: velja samo za ta
          način, drugod pa je bila le smeti. */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {[1, 2].map((n) => (
          <button key={n} onClick={() => setNumWords(n)} style={chip(numWords === n, '#6C63FF')}>
            {n === 1 ? '1 BESEDA' : '2 BESEDI'}
          </button>
        ))}
      </div>

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

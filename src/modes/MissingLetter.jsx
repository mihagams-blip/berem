import { useCallback, useEffect, useState } from 'react';
import { WORDS } from '../content/words.js';
import { shuffle } from '../lib/rng.js';
import { sndWrong } from '../lib/audio.js';
import { Pic, Word } from '../ui/Bits.jsx';
import { INK, LEVELS, bigBtn, homeBtn } from '../lib/styles.js';

/** Slovenska abeceda — brez Q, W, X, Y. */
const ABC = 'ABCČDEFGHIJKLMNOPRSŠTUVZŽ'.split('');

function wordsFor(level) {
  const L = LEVELS[level];
  const p = WORDS.filter((x) => x.w.length >= L.min && x.w.length <= L.max);
  return p.length ? p : WORDS;
}

/** MANJKA ČRKA — slika in beseda z eno izpuščeno črko; otrok izbere pravo. */
export default function MissingLetter({ level, onStar, onHome, busy }) {
  const [round, setRound] = useState(null);
  const [shakeCh, setShakeCh] = useState(null);

  const newRound = useCallback(() => {
    const L = LEVELS[level];
    const pool = wordsFor(level);
    const word = pool[Math.floor(Math.random() * pool.length)];
    const idx = Math.floor(Math.random() * word.w.length);
    const correct = word.w[idx];
    const others = shuffle(ABC.filter((c) => c !== correct)).slice(0, L.opts - 1);
    setRound({ word, blankIndex: idx, correct, options: shuffle([correct, ...others]), filled: null });
  }, [level]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  if (!round) return null;

  const tap = (ch) => {
    if (busy || round.filled) return;
    if (ch === round.correct) {
      setRound({ ...round, filled: ch });
      onStar(newRound);
    } else {
      sndWrong();
      setShakeCh(ch);
      setTimeout(() => setShakeCh(null), 500);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ fontWeight: 700, fontSize: 'clamp(15px,4vw,20px)', color: '#4A4468', letterSpacing: '1px' }}>
        👆 KATERA ČRKA MANJKA?
      </div>

      <div style={{ animation: 'bounce 2.5s ease infinite' }}>
        <Pic item={round.word} size="clamp(60px,16vw,90px)" />
      </div>

      <Word word={round.word.w} blankIndex={round.blankIndex} filled={round.filled} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${round.options.length <= 3 ? 3 : 4},1fr)`,
          gap: '12px',
          width: '100%',
          maxWidth: '380px',
          marginTop: '8px'
        }}
      >
        {round.options.map((ch) => (
          <button
            key={ch}
            onClick={() => tap(ch)}
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              background: '#fff',
              color: INK,
              border: '4px solid #E8E4F5',
              borderRadius: '18px',
              fontSize: 'clamp(28px,8vw,42px)',
              padding: '12px 0',
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              animation: shakeCh === ch ? 'shake 0.4s ease' : 'none'
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { DINOS } from '../content/dinos.js';
import { pick, pickDistractors, shuffle } from '../lib/rng.js';
import { say, saySyllables, sndRoar, sndTap, sndWrong } from '../lib/audio.js';
import { SyllableWord, FactCard } from '../ui/DinoBits.jsx';
import { INK, bigBtn, homeBtn } from '../lib/styles.js';

/** Koliko zlogov sme imeti ime na posamezni stopnji. */
const SYL_RANGE = { easy: [3, 4], mid: [3, 5], hard: [4, 9] };

function poolFor(level) {
  const [lo, hi] = SYL_RANGE[level];
  const p = DINOS.filter((d) => d.syl.length >= lo && d.syl.length <= hi);
  return p.length >= 4 ? p : DINOS;
}

/**
 * DINOZAVER — ime po zlogih, otrok izbere pravo sliko med štirimi.
 *
 * Zloge je mogoče tapniti (vsak se izgovori) in celo ime prav tako. To je
 * bralna opora: otrok, ki zlogov še ne zna povezati, jih lahko sliši, a mora
 * sliko izbrati sam.
 */
export default function DinoSyllables({ level, onStar, onHome, busy }) {
  const [round, setRound] = useState(null);
  const [shakeId, setShakeId] = useState(null);
  const [won, setWon] = useState(null);
  const cancelRef = useRef(null);

  const newRound = useCallback(() => {
    const target = pick(poolFor(level));
    const wrong = pickDistractors(target, DINOS, 3, level);
    setRound({ target, cards: shuffle([target, ...wrong]) });
    setWon(null);
  }, [level]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  // Ob odhodu ustavi morebitno branje zlogov, da glas ne teče čez nov zaslon.
  useEffect(() => () => cancelRef.current?.(), []);

  if (!round) return null;

  const readWholeName = () => {
    cancelRef.current?.();
    sndTap();
    cancelRef.current = saySyllables(round.target.syl, { thenKey: `dino.${round.target.id}` });
  };

  const tap = (dino) => {
    if (busy || won) return;
    if (dino.id === round.target.id) {
      cancelRef.current?.();
      sndRoar();
      setWon(dino);
    } else {
      sndWrong();
      setShakeId(dino.id);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: 'clamp(15px,4vw,20px)', color: '#4A4468', letterSpacing: '1px' }}>
        👆 KATERA ŽIVAL JE TO?
      </div>

      <SyllableWord
        syl={round.target.syl}
        onSyllable={(s) => {
          cancelRef.current?.();
          say(`syl.${s}`);
        }}
      />

      <button
        onClick={readWholeName}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(14px,3.8vw,17px)',
          color: INK,
          background: '#FFE9A8',
          border: 'none',
          borderRadius: '999px',
          padding: '8px 18px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
          cursor: 'pointer'
        }}
      >
        🔊 POSLUŠAJ
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', width: '100%', marginTop: '2px' }}>
        {round.cards.map((d) => (
          <button
            key={d.id}
            onClick={() => tap(d)}
            aria-label={d.name}
            style={{
              background: '#fff',
              border: '4px solid #E8E4F5',
              borderRadius: '20px',
              padding: '8px',
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'clamp(96px,26vw,140px)',
              animation: shakeId === d.id ? 'shake 0.4s ease' : 'none'
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}${d.img}`}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', maxHeight: '20vh', objectFit: 'contain', borderRadius: '12px' }}
            />
          </button>
        ))}
      </div>

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
        🏠 DOMOV
      </button>

      {won && (
        <FactCard
          dino={won}
          onNext={() => {
            setWon(null);
            onStar(newRound);
          }}
        />
      )}
    </div>
  );
}

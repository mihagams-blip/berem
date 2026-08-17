import { useCallback, useEffect, useRef, useState } from 'react';
import { pick, pickDistractors, shuffle } from '../lib/rng.js';
import { say, saySyllables, sndRoar, sndTap, sndWrong } from '../lib/audio.js';
import { SyllableWord, FactCard } from '../ui/NameBits.jsx';
import { INK, bigBtn, homeBtn } from '../lib/styles.js';

/** Koliko zlogov sme imeti ime na posamezni stopnji. */
const SYL_RANGE = { easy: [1, 3], mid: [2, 5], hard: [3, 9] };

function poolFor(items, level) {
  const [lo, hi] = SYL_RANGE[level] || SYL_RANGE.mid;
  const chunks = (it) => it.syl.filter((s) => s.trim() !== '').length;
  const p = items.filter((it) => chunks(it) >= lo && chunks(it) <= hi);
  return p.length >= 4 ? p : items;
}

/**
 * Beri ime po zlogih in izberi pravo sliko med štirimi.
 *
 * Ista mehanika poganja dinozavre, znamke avtomobilov, junake in mitologijo —
 * zamenja se samo vsebina. Zloge je mogoče tapniti (vsak se izgovori) in celo
 * ime prav tako: otrok, ki zlogov še ne zna povezati, jih lahko sliši, a mora
 * sliko izbrati sam.
 */
export default function PickByName({
  items,
  question,
  audioPrefix,
  chipsFor,
  noteFor,
  accent = '#3FA05A',
  level,
  onStar,
  onHome,
  busy
}) {
  const [round, setRound] = useState(null);
  const [shakeId, setShakeId] = useState(null);
  const [won, setWon] = useState(null);
  const cancelRef = useRef(null);

  const newRound = useCallback(() => {
    const target = pick(poolFor(items, level));
    const wrong = pickDistractors(target, items, 3, level);
    setRound({ target, cards: shuffle([target, ...wrong]) });
    setWon(null);
  }, [items, level]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  // Ob odhodu ustavi morebitno branje zlogov, da glas ne teče čez nov zaslon.
  useEffect(() => () => cancelRef.current?.(), []);

  if (!round) return null;

  const keyFor = (it) => `${audioPrefix}.${it.id}`;

  const readWholeName = () => {
    cancelRef.current?.();
    sndTap();
    cancelRef.current = saySyllables(
      round.target.syl.filter((s) => s.trim() !== ''),
      { thenKey: keyFor(round.target) }
    );
  };

  const tap = (it) => {
    if (busy || won) return;
    if (it.id === round.target.id) {
      cancelRef.current?.();
      sndRoar();
      setWon(it);
    } else {
      sndWrong();
      setShakeId(it.id);
      setTimeout(() => setShakeId(null), 500);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      <div style={{ fontWeight: 700, fontSize: 'clamp(15px,4vw,20px)', color: '#4A4468', letterSpacing: '1px' }}>{question}</div>

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
        {round.cards.map((it) => (
          <button
            key={it.id}
            onClick={() => tap(it)}
            aria-label={it.name}
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
              animation: shakeId === it.id ? 'shake 0.4s ease' : 'none'
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}${it.img}`}
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
          item={won}
          audioKey={keyFor(won)}
          chips={chipsFor ? chipsFor(won) : []}
          note={noteFor ? noteFor(won) : null}
          accent={accent}
          onNext={() => {
            setWon(null);
            onStar(newRound);
          }}
        />
      )}
    </div>
  );
}

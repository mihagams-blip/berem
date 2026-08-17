import { useCallback, useEffect, useRef, useState } from 'react';
import { makePattern } from '../lib/patterns.js';
import { sndNote, sndTap, sndWrong } from '../lib/audio.js';
import { INK, bigBtn, homeBtn } from '../lib/styles.js';

const C = {
  accent: '#7CB518',
  tile: '#FFFFFF',
  hole: '#E6E2D6',
  white: '#FFFFFF'
};

/** Po tem številu zgrešenih poskusov pokažemo enoto ponavljanja. */
const HINT_AFTER = 2;
const MELODY_MS = 380;

/**
 * VZORCI — kaj sodi v prazno mesto?
 *
 * To je predalgebra: otrok ne išče odgovora, ampak PRAVILO, in ga potem uporabi.
 *
 * Vsak simbol ima svoj ton, zato se vzorec ne le vidi, ampak tudi sliši. Kdor
 * pravila ne vidi, ga lahko ujame po sluhu — in obratno.
 *
 * Namig se pokaže šele po drugem zgrešenem poskusu in ne pove odgovora: med
 * ploščicami se odprejo reže, ki trak razdelijo na ENOTE ponavljanja. To je
 * ravno tisto, česar se otrok uči, zato je namig lekcija in ne bližnjica.
 */
export default function Patterns({ level, onStar, onHome, busy }) {
  const [round, setRound] = useState(() => makePattern(level));
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState(null);
  const [playIdx, setPlayIdx] = useState(null); // katera ploščica se trenutno oglaša
  const timers = useRef([]);

  const stopMelody = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlayIdx(null);
  }, []);

  const newRound = useCallback(() => {
    stopMelody();
    setRound(makePattern(level));
    setMisses(0);
  }, [level, stopMelody]);

  useEffect(() => {
    newRound();
  }, [newRound]);

  useEffect(() => () => stopMelody(), [stopMelody]);

  /** Odigra trak od leve proti desni; reža je tišina, a traja enako dolgo. */
  const playMelody = () => {
    if (busy) return;
    stopMelody();
    sndTap();
    round.tiles.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => {
          setPlayIdx(i);
          if (i !== round.holeIdx) sndNote(round.note[s]);
        }, 200 + i * MELODY_MS)
      );
    });
    timers.current.push(setTimeout(() => setPlayIdx(null), 200 + round.tiles.length * MELODY_MS));
  };

  const tapTile = (i) => {
    if (busy || i === round.holeIdx) return;
    stopMelody();
    sndNote(round.note[round.tiles[i]]);
  };

  const answer = (s) => {
    if (busy) return;
    if (s === round.answer) {
      // Zvok igra App ob zvezdici; ton bi se z njim samo pomešal.
      stopMelody();
      onStar(newRound);
    } else {
      sndWrong();
      setShake(s);
      setMisses((m) => m + 1);
      setTimeout(() => setShake(null), 500);
    }
  };

  const showUnits = misses >= HINT_AFTER;
  const tileSize = `clamp(30px, ${Math.floor(760 / round.tiles.length) / 10}vw, 46px)`;

  return (
    <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 'clamp(15px,4vw,20px)', color: '#4A4468', letterSpacing: 1 }}>
        👆 KAJ SODI V PRAZNO?
      </div>

      {/* Trak. Reže med enotami se odprejo šele po namigu. */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {round.tiles.map((s, i) => (
          <button
            key={i}
            onClick={() => tapTile(i)}
            aria-label={i === round.holeIdx ? 'Prazno mesto' : `Ploščica ${i + 1}`}
            style={{
              width: tileSize,
              height: tileSize,
              fontSize: `calc(${tileSize} * 0.62)`,
              lineHeight: 1,
              padding: 0,
              border: i === round.holeIdx ? '3px dashed #B5AE99' : 'none',
              borderRadius: 12,
              background: i === round.holeIdx ? C.hole : C.tile,
              boxShadow: i === round.holeIdx ? 'none' : '0 3px 0 rgba(0,0,0,0.10)',
              cursor: i === round.holeIdx ? 'default' : 'pointer',
              marginLeft: i === 0 ? 0 : showUnits && i % round.unitLen === 0 ? 14 : 3,
              transform: playIdx === i ? 'translateY(-6px) scale(1.08)' : 'none',
              transition: 'transform 0.14s, margin-left 0.25s'
            }}
          >
            {i === round.holeIdx ? '' : s}
          </button>
        ))}
      </div>

      <button
        onClick={playMelody}
        aria-label="Poslušaj vzorec"
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(14px,3.8vw,17px)',
          color: INK,
          background: '#FFE9A8',
          border: 'none',
          borderRadius: 999,
          padding: '8px 18px',
          boxShadow: '0 4px 0 rgba(0,0,0,0.12)',
          cursor: 'pointer'
        }}
      >
        🔊 POSLUŠAJ VZOREC
      </button>

      {showUnits && (
        <div style={{ fontSize: 'clamp(13px,3.6vw,16px)', fontWeight: 700, color: '#7A7460' }}>
          Poglej: vzorec se ponavlja v skupinah.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {round.options.map((s) => (
          <button
            key={s}
            onClick={() => answer(s)}
            aria-label={`Izberi ${s}`}
            style={{
              width: 'clamp(62px, 18vw, 82px)',
              height: 'clamp(62px, 18vw, 82px)',
              fontSize: 'clamp(32px, 9vw, 44px)',
              lineHeight: 1,
              padding: 0,
              border: `4px solid ${C.accent}`,
              borderRadius: 20,
              background: C.white,
              cursor: 'pointer',
              boxShadow: '0 5px 0 rgba(0,0,0,0.14)',
              animation: shake === s ? 'shake 0.4s ease' : 'none'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

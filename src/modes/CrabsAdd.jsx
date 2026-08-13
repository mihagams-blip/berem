import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { say, sndCorrect, sndTap, sndWrong, sndWin } from '../lib/audio.js';
import { Confetti } from '../ui/Bits.jsx';
import { INK, bigBtn, homeBtn } from '../lib/styles.js';

/** Obalna paleta — ta način ima svoj svet, zato tudi svoje barve. */
const C = {
  sea: '#0E7C86',
  coral: '#FF7A5C',
  shell: '#FFD9C7',
  foam: '#CDEBE7',
  good: '#3BAE6A',
  warn: '#E8A13F',
  white: '#FFFFFF'
};

const TOTAL = 5;
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const PRAISE = ['Bravo! 🎉', 'Odlično! ⭐', 'Super si! 🦀', 'Juhu, pravilno! 🐚'];
const RETRY = ['Skoraj! Preštej rakce še enkrat. 🦀', 'Poskusi znova — štej počasi! 🐚', 'Skoraj si! Še enkrat preštej. ⭐'];

/**
 * Sestavi račun. Vsota nikoli čez 20, ker je to obseg, ki ga otrok še prešteje.
 * Napačna odgovora sta blizu pravilnega (±1 do ±3) — če bi bila daleč, bi otrok
 * uganil brez štetja.
 */
function makeProblem(count) {
  const max = count === 2 ? 10 : 7;
  let nums;
  do {
    nums = Array.from({ length: count }, () => rand(1, max));
  } while (nums.reduce((a, b) => a + b, 0) > 20);
  const sum = nums.reduce((a, b) => a + b, 0);

  const wrong = new Set();
  while (wrong.size < 2) {
    const off = rand(1, 3) * (Math.random() < 0.5 ? -1 : 1);
    const w = sum + off;
    if (w >= 1 && w <= 20 && w !== sum) wrong.add(w);
  }
  return { nums, sum, options: [sum, ...wrong].sort(() => Math.random() - 0.5) };
}

/** Rakci v vrstah po pet — petica je opora, ki otroku prihrani štetje po ena. */
function CrabGroup({ n, color }) {
  const rows = [];
  for (let i = 0; i < n; i += 5) rows.push(Math.min(5, n - i));
  return (
    <div
      style={{
        background: color,
        borderRadius: 20,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 62,
        boxShadow: '0 3px 0 rgba(36,59,74,0.12)'
      }}
    >
      {rows.map((count, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} style={{ fontSize: 'clamp(18px, 5.6vw, 26px)', lineHeight: 1.1 }}>
              🦀
            </span>
          ))}
        </div>
      ))}
      <div style={{ fontSize: 'clamp(22px, 6.4vw, 30px)', fontWeight: 700, color: INK, marginTop: 2 }}>{n}</div>
    </div>
  );
}

/**
 * RAČUNAM — seštevanje do 20 s štetjem rakcev.
 *
 * Runda ima 5 nalog in svoj zaključni pregled, zato ta način NE uporablja
 * skupnega traku zvezdic; napredek kaže sam.
 */
export default function CrabsAdd({ onHome }) {
  const [count, setCount] = useState(0); // 0 = izbira, 2 ali 3 = igra
  const [problem, setProblem] = useState(null);
  const [history, setHistory] = useState([]);
  const [firstTry, setFirstTry] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [locked, setLocked] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(null);
  const [done, setDone] = useState(false);
  const timers = useRef([]);

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const start = (n) => {
    setCount(n);
    setProblem(makeProblem(n));
    setHistory([]);
    setFirstTry(true);
    setFeedback(null);
    setLocked(false);
    setDone(false);
  };

  /** Prebere račun: »pet plus tri«. Opora za otroka, ki števil še ne bere zanesljivo. */
  const readProblem = () => {
    if (!problem) return;
    sndTap();
    problem.nums.forEach((n, i) => later(() => say(`num.${n}`), i * 780));
  };

  const pick = (answer, idx) => {
    if (locked || !problem) return;

    if (answer === problem.sum) {
      setLocked(true);
      sndCorrect();
      later(() => say(`num.${problem.sum}`), 420);
      const entry = { nums: problem.nums, sum: problem.sum, correct: firstTry };
      const next = [...history, entry];
      setHistory(next);
      setFeedback({ type: 'good', msg: PRAISE[rand(0, PRAISE.length - 1)] });
      later(() => {
        if (next.length >= TOTAL) {
          sndWin();
          setDone(true);
        } else {
          setProblem(makeProblem(count));
          setFirstTry(true);
          setFeedback(null);
          setLocked(false);
        }
      }, 2100);
    } else {
      // Prvi zgrešen poskus si zapomnimo, da rezultat pošteno pokaže, kaj je šlo
      // gladko. Prej je bila to lastnost, prilepljena na polje `history` — kar
      // React sploh ni opazil.
      if (firstTry) setFirstTry(false);
      sndWrong();
      setShakeIdx(idx);
      setFeedback({ type: 'bad', msg: RETRY[rand(0, RETRY.length - 1)] });
      later(() => setShakeIdx(null), 600);
    }
  };

  const answerBtn = {
    fontFamily: "'Fredoka', sans-serif",
    fontSize: 34,
    fontWeight: 700,
    border: `4px solid ${C.sea}`,
    borderRadius: 22,
    width: 88,
    height: 88,
    cursor: 'pointer',
    boxShadow: '0 4px 0 rgba(36,59,74,0.18)'
  };

  /* ── Izbira: dve ali tri številke ─────────────────────────────────────── */
  if (!count) {
    return (
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 64, animation: 'bounce 2s ease-in-out infinite' }}>🦀</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px', color: INK }}>Rakci računajo!</h1>
        <p style={{ fontSize: 18, margin: '0 0 24px', fontWeight: 500, color: INK }}>
          Preštej rakce in poišči pravi odgovor. 🐚
        </p>
        <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: INK }}>Koliko številk boš seštel?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => start(2)} style={{ ...bigBtn(C.sea), width: '100%' }}>
            🦀 + 🦀 &nbsp; DVE ŠTEVILKI
          </button>
          <button onClick={() => start(3)} style={{ ...bigBtn(C.coral), width: '100%' }}>
            🦀 + 🦀 + 🦀 &nbsp; TRI ŠTEVILKE
          </button>
        </div>
        <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn, marginTop: 22 }} onClick={onHome}>
          🏠 DOMOV
        </button>
      </div>
    );
  }

  /* ── Zaključni pregled ────────────────────────────────────────────────── */
  if (done) {
    const good = history.filter((h) => h.correct).length;
    const all = good === TOTAL;
    return (
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {all && <Confetti />}
        <div style={{ fontSize: 56, animation: all ? 'bounce 1.2s ease-in-out infinite' : undefined }}>
          {all ? '🏆' : '🦀'}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: '6px 0 4px', color: INK }}>
          {all ? 'Vse pravilno! Juhu!' : 'Konec igre!'}
        </h2>
        <p style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, color: INK }}>
          Pravilno takoj: {good} od {TOTAL} ⭐
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 16,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 21,
                fontWeight: 700,
                color: INK,
                boxShadow: '0 3px 0 rgba(36,59,74,0.1)'
              }}
            >
              <span>
                {h.nums.join(' + ')} = {h.sum}
              </span>
              <span style={{ fontSize: 25 }}>{h.correct ? '✅' : '🐚'}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => start(count)} style={{ ...bigBtn(C.sea), width: '100%' }}>
            🔄 ŠE ENA RUNDA
          </button>
          <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
            🏠 DOMOV
          </button>
        </div>
      </div>
    );
  }

  /* ── Igra ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <span key={i} style={{ fontSize: 24, opacity: i < history.length ? 1 : 0.3 }}>
            {i < history.length ? (history[i].correct ? '⭐' : '🐚') : '⚪'}
          </span>
        ))}
      </div>

      <button
        onClick={readProblem}
        aria-label={`Poslušaj račun ${problem.nums.join(' plus ')}`}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontSize: 'clamp(30px, 9vw, 42px)',
          fontWeight: 700,
          letterSpacing: 2,
          color: INK,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 10,
          padding: '2px 10px'
        }}
      >
        {problem.nums.join(' + ')} = ? 🔊
      </button>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 22
        }}
      >
        {problem.nums.map((n, i) => (
          <Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 30, fontWeight: 700, alignSelf: 'center', color: INK }}>+</span>}
            <CrabGroup n={n} color={i % 2 === 0 ? C.shell : C.foam} />
          </Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {problem.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => pick(opt, idx)}
            disabled={locked}
            style={{
              ...answerBtn,
              animation: shakeIdx === idx ? 'shake 0.5s' : undefined,
              opacity: locked && opt !== problem.sum ? 0.4 : 1,
              background: locked && opt === problem.sum ? C.good : C.white,
              color: locked && opt === problem.sum ? C.white : INK
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 60, marginTop: 16 }}>
        {feedback && (
          <div
            style={{
              display: 'inline-block',
              padding: '10px 22px',
              borderRadius: 18,
              fontSize: 21,
              fontWeight: 700,
              color: C.white,
              background: feedback.type === 'good' ? C.good : C.warn,
              animation: 'pop 0.35s ease-out'
            }}
          >
            {feedback.msg}
          </div>
        )}
      </div>

      {feedback?.type === 'good' && <Confetti />}

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn, marginTop: 10 }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

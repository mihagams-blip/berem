import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { say, sndCorrect, sndTap, sndWrong, sndWin } from '../lib/audio.js';
import { Confetti } from '../ui/Bits.jsx';
import { INK, bigBtn, chip, homeBtn } from '../lib/styles.js';

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
const RETRY = ['Skoraj! Preštej še enkrat. 🦀', 'Poskusi znova — štej počasi! 🐚', 'Skoraj si! Še enkrat preštej. ⭐'];

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
const LEVELS = {
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
 * Sestavi račun. Napačna odgovora sta blizu pravilnega in na stopnji, ki šteje:
 * do 20 za ena do tri, do 100 tudi za deset, do 1000 za deset in sto. Če bi bila
 * daleč, bi otrok uganil brez štetja.
 */
function makeProblem(levelKey, count) {
  const L = LEVELS[levelKey];
  const step = L.step || 1;
  const maxAddend = Math.floor((L.maxSum / (count === 3 ? 3 : 2) / step) * 1.4) * step;

  let nums;
  do {
    nums = Array.from({ length: count }, () => rand(1, Math.max(1, maxAddend / step)) * step);
  } while (nums.reduce((a, b) => a + b, 0) > L.maxSum);
  const sum = nums.reduce((a, b) => a + b, 0);

  const wrong = new Set();
  let guard = 0;
  while (wrong.size < 2 && guard++ < 60) {
    const off = L.offsets[rand(0, L.offsets.length - 1)] * (Math.random() < 0.5 ? -1 : 1);
    const w = sum + off;
    if (w >= 1 && w <= L.maxSum && w !== sum) wrong.add(w);
  }
  while (wrong.size < 2) wrong.add(sum + wrong.size + 1); // varovalo, nikoli prazno

  return { nums, sum, options: [sum, ...wrong].sort(() => Math.random() - 0.5) };
}

/** Razstavi število na predmete stopnje: [{emoji, count}] od največjega navzdol. */
function toUnits(n, units) {
  let rest = n;
  return units.map((u) => {
    const c = Math.floor(rest / u.value);
    rest -= c * u.value;
    return { emoji: u.emoji, count: c };
  });
}

/** Ena skupina seštevanca. Predmeti so v vrstah po pet — petica prihrani štetje po ena. */
function NumberGroup({ n, level, color }) {
  const parts = toUnits(n, LEVELS[level].units).filter((p) => p.count > 0);
  return (
    <div
      style={{
        background: color,
        borderRadius: 20,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        minWidth: 62,
        boxShadow: '0 3px 0 rgba(36,59,74,0.12)'
      }}
    >
      {parts.map((p) => {
        const rows = [];
        for (let i = 0; i < p.count; i += 5) rows.push(Math.min(5, p.count - i));
        return rows.map((c, ri) => (
          <div key={`${p.emoji}-${ri}`} style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: c }).map((_, i) => (
              <span key={i} style={{ fontSize: 'clamp(18px, 5.6vw, 26px)', lineHeight: 1.1 }}>
                {p.emoji}
              </span>
            ))}
          </div>
        ));
      })}
      <div style={{ fontSize: 'clamp(22px, 6.4vw, 30px)', fontWeight: 700, color: INK, marginTop: 2 }}>{n}</div>
    </div>
  );
}

/** Ključ: kaj en predmet pomeni. Brez tega je vedro poljuben simbol. */
function Legend({ level }) {
  const units = LEVELS[level].units;
  if (units.length < 2) return null;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 14,
        marginBottom: 10,
        fontSize: 'clamp(13px,3.7vw,16px)',
        fontWeight: 700,
        color: INK,
        opacity: 0.75
      }}
    >
      {units.map((u) => (
        <span key={u.emoji}>
          {u.emoji} = {u.value}
        </span>
      ))}
    </div>
  );
}

/**
 * RAČUNAM — seštevanje s štetjem.
 *
 * Runda ima pet nalog in svoj zaključni pregled, zato ta način NE uporablja
 * skupnega traku zvezdic; napredek kaže sam.
 */
export default function CrabsAdd({ level, setLevel, onHome }) {
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

  const L = LEVELS[level] || LEVELS.easy;

  const start = (n) => {
    setCount(n);
    setProblem(makeProblem(level, n));
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
    problem.nums.forEach((n, i) => later(() => say(`num.${n}`), i * 900));
  };

  const pick = (answer, idx) => {
    if (locked || !problem) return;

    if (answer === problem.sum) {
      setLocked(true);
      sndCorrect();
      later(() => say(`num.${problem.sum}`), 420);
      const next = [...history, { nums: problem.nums, sum: problem.sum, correct: firstTry }];
      setHistory(next);
      setFeedback({ type: 'good', msg: PRAISE[rand(0, PRAISE.length - 1)] });
      later(() => {
        if (next.length >= TOTAL) {
          sndWin();
          setDone(true);
        } else {
          setProblem(makeProblem(level, count));
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
    fontSize: 'clamp(26px, 7.6vw, 34px)',
    fontWeight: 700,
    border: `4px solid ${C.sea}`,
    borderRadius: 22,
    minWidth: 88,
    padding: '0 10px',
    height: 88,
    cursor: 'pointer',
    boxShadow: '0 4px 0 rgba(36,59,74,0.18)'
  };

  /* ── Začetek: izbira in stopnja ───────────────────────────────────────── */
  if (!count) {
    return (
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 64, animation: 'bounce 2s ease-in-out infinite' }}>🦀</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px', color: INK }}>Rakci računajo!</h1>
        <p style={{ fontSize: 18, margin: '0 0 22px', fontWeight: 500, color: INK }}>
          Preštej in poišči pravi odgovor. 🐚
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => start(2)} style={{ ...bigBtn(C.sea), width: '100%' }}>
            🦀 + 🦀 &nbsp; DVE ŠTEVILKI
          </button>
          {L.allowThree && (
            <button onClick={() => start(3)} style={{ ...bigBtn(C.coral), width: '100%' }}>
              🦀 + 🦀 + 🦀 &nbsp; TRI ŠTEVILKE
            </button>
          )}
        </div>

        {/* Stopnja je spodaj, kjer je palec — in pove, do kod se računa. */}
        <div style={{ marginTop: 26 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: INK, opacity: 0.7 }}>DO KOD RAČUNAŠ?</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(LEVELS).map(([key, cfg]) => (
              <button key={key} onClick={() => setLevel(key)} style={chip(level === key, cfg.color)}>
                {cfg.dot} {cfg.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Legend level={level} />
          </div>
        </div>

        <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn, marginTop: 12 }} onClick={onHome}>
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
          <button onClick={() => setCount(0)} style={{ ...bigBtn('#BDB8E8'), ...homeBtn }}>
            ⚙️ ZAMENJAJ STOPNJO
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
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
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
          fontSize: 'clamp(26px, 8vw, 42px)',
          fontWeight: 700,
          letterSpacing: 1,
          color: INK,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 8,
          padding: '2px 10px'
        }}
      >
        {problem.nums.join(' + ')} = ? 🔊
      </button>

      <Legend level={level} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 20
        }}
      >
        {problem.nums.map((n, i) => (
          <Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 30, fontWeight: 700, alignSelf: 'center', color: INK }}>+</span>}
            <NumberGroup n={n} level={level} color={i % 2 === 0 ? C.shell : C.foam} />
          </Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
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

      <div style={{ minHeight: 60, marginTop: 14 }}>
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

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn, marginTop: 8 }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

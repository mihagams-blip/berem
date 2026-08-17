import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { say, sndCorrect, sndTap, sndWrong, sndWin } from '../lib/audio.js';
import { Confetti } from '../ui/Bits.jsx';
import { LEVELS, OPS, formula, makeProblem, rand, toUnits } from '../lib/arith.js';
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

const PRAISE = ['Bravo! 🎉', 'Odlično! ⭐', 'Super si! 🦀', 'Juhu, pravilno! 🐚'];
const RETRY = ['Skoraj! Preštej še enkrat. 🦀', 'Poskusi znova — štej počasi! 🐚', 'Skoraj si! Še enkrat preštej. ⭐'];

/**
 * Predmet, ki gre stran: obledi in ga prečrta rdeča črta.
 *
 * Črta se drži SVOJEGA predmeta in ne sega čezenj. Ko je segala, so se prečrtaji
 * sosedov v vrsti zlili v eno dolgo črto in vrsta je izpadla prečrtana kot
 * celota — namesto štirih predmetov, od katerih gre vsak zase stran.
 */
function Item({ emoji, gone }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', fontSize: 'clamp(18px, 5.6vw, 26px)', lineHeight: 1.1 }}>
      <span style={{ opacity: gone ? 0.28 : 1 }}>{emoji}</span>
      {gone && (
        <span
          style={{
            position: 'absolute',
            left: '4%',
            right: '4%',
            top: '50%',
            height: 3,
            borderRadius: 2,
            background: '#E23B3B',
            transform: 'translateY(-50%) rotate(-20deg)'
          }}
        />
      )}
    </span>
  );
}

/**
 * Ena skupina. Predmeti so v vrstah po pet — petica prihrani štetje po ena.
 *
 * Pri odštevanju NI druge skupine: `gone` prečrta zadnjih toliko predmetov v
 * isti skupini, ker je odštevanje odvzemanje in mora tako tudi izgledati. Dve
 * ločeni skupini bi risali primerjavo, ne odvzemanja.
 */
function NumberGroup({ n, gone = 0, level, color }) {
  const units = LEVELS[level].units;
  const have = toUnits(n, units);
  const away = toUnits(gone, units);

  // Vrste po pet se lomijo ZNOTRAJ mesta: vedra ostanejo pri vedrih, rakci pri
  // rakcih. Sicer bi se pri 63 v isti vrstici znašla vedro in rakec, kar mestno
  // vrednost prav zabriše.
  //
  // Zadnji predmeti na vsakem mestu odidejo. Generator jamči `away <= have`,
  // `min` je le varovalo.
  const rows = [];
  have.forEach((p, ui) => {
    const off = Math.min(away[ui].count, p.count);
    const items = Array.from({ length: p.count }, (_, i) => ({
      emoji: p.emoji,
      gone: i >= p.count - off
    }));
    for (let i = 0; i < items.length; i += 5) rows.push(items.slice(i, i + 5));
  });

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
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4 }}>
          {row.map((it, i) => (
            <Item key={i} emoji={it.emoji} gone={it.gone} />
          ))}
        </div>
      ))}
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
 * RAČUNAM — seštevanje in odštevanje s štetjem.
 *
 * Runda ima pet nalog in svoj zaključni pregled, zato ta način NE uporablja
 * skupnega traku zvezdic; napredek kaže sam.
 */
export default function CrabsAdd({ level, setLevel, onHome }) {
  const [count, setCount] = useState(0); // 0 = izbira, 2 ali 3 = igra
  // Operacija je LOKALNA, za razliko od stopnje, ki je skupna vsem načinom.
  const [op, setOp] = useState('add');
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
    setProblem(makeProblem(level, n, op));
    setHistory([]);
    setFirstTry(true);
    setFeedback(null);
    setLocked(false);
    setDone(false);
  };

  /**
   * Prebere račun: »osem minus tri«. Opora za otroka, ki števil še ne bere
   * zanesljivo — in operator MORA biti izgovorjen, sicer »osem … tri« zveni
   * enako za plus in minus.
   */
  const readProblem = () => {
    if (!problem) return;
    sndTap();
    const seq = [];
    problem.nums.forEach((n, i) => {
      if (i > 0) seq.push(problem.op === 'sub' ? 'op.minus' : 'op.plus');
      seq.push(`num.${n}`);
    });
    seq.forEach((key, i) => later(() => say(key), i * 780));
  };

  const pick = (answer, idx) => {
    if (locked || !problem) return;

    if (answer === problem.sum) {
      setLocked(true);
      sndCorrect();
      later(() => say(`num.${problem.sum}`), 420);
      const next = [...history, { op: problem.op, nums: problem.nums, sum: problem.sum, correct: firstTry }];
      setHistory(next);
      setFeedback({ type: 'good', msg: PRAISE[rand(0, PRAISE.length - 1)] });
      later(() => {
        if (next.length >= TOTAL) {
          sndWin();
          setDone(true);
        } else {
          setProblem(makeProblem(level, count, op));
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
          <button onClick={() => start(2)} style={{ ...bigBtn(OPS[op].color), width: '100%' }}>
            🦀 {OPS[op].sign} 🦀 &nbsp; DVE ŠTEVILKI
          </button>
          {/* Tri številke le pri seštevanju: trojno odštevanje je pri šestih letih
              zmeda, ne izziv. */}
          {op === 'add' && L.allowThree && (
            <button onClick={() => start(3)} style={{ ...bigBtn(C.coral), width: '100%' }}>
              🦀 + 🦀 + 🦀 &nbsp; TRI ŠTEVILKE
            </button>
          )}
        </div>

        {/* Nastavitve so spodaj, kjer je palec. */}
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: INK, opacity: 0.7 }}>KAJ RAČUNAŠ?</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(OPS).map(([key, cfg]) => (
              <button key={key} onClick={() => setOp(key)} style={chip(op === key, cfg.color)}>
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
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
                {formula(h)} = {h.sum}
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
            ⚙️ NASTAVITVE
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
        aria-label={`Poslušaj račun ${problem.nums.join(problem.op === 'sub' ? ' minus ' : ' plus ')}`}
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
        {formula(problem)} = ? 🔊
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
        {problem.op === 'sub' ? (
          // Ena skupina, v njej prečrtani odhajajoči predmeti. Otrok prešteje,
          // kar ostane — to JE odštevanje.
          <NumberGroup n={problem.nums[0]} gone={problem.nums[1]} level={level} color={C.shell} />
        ) : (
          problem.nums.map((n, i) => (
            <Fragment key={i}>
              {i > 0 && <span style={{ fontSize: 30, fontWeight: 700, alignSelf: 'center', color: INK }}>+</span>}
              <NumberGroup n={n} level={level} color={i % 2 === 0 ? C.shell : C.foam} />
            </Fragment>
          ))
        )}
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

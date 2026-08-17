import { useCallback, useEffect, useRef, useState } from 'react';
import { DIRS, DIR_KEYS, makeMaze, runProgram } from '../lib/maze.js';
import { say, sndTap, sndWrong } from '../lib/audio.js';
import { INK, bigBtn, homeBtn } from '../lib/styles.js';

/** Ta način ima svoj svet: hladna vijolična, da se loči od toplih načinov. */
const C = {
  accent: '#5A57C4',
  floor: '#F1EEFB',
  rock: '#7C748F',
  goal: '#FFE9A8',
  good: '#3BAE6A',
  warn: '#E8A13F',
  white: '#FFFFFF'
};

/** Dolžina programa je omejena — sicer trak zraste čez zaslon. */
const MAX_PROGRAM = 18;
const STEP_MS = 520;

/**
 * UKAZI — robot naredi točno to, kar piše v seznamu.
 *
 * Otrok zloži puščice v trak pod mrežo, trak se bere OD LEVE PROTI DESNI kot
 * poved, pritisne ZAŽENI in robot koraka, medtem ko se izvajana ploščica sveti.
 *
 * Ko se robot zaleti v skalo, se ustavi in tista ploščica dobi rdeč obroč.
 * Sporočilo ni »narobe si naredil«, ampak »robot je naredil, kar je pisalo« —
 * in prav zato robot in ne dinozavrek: krivda gre na seznam, ne na otroka.
 * Iskanje napačnega koraka JE tisto, kar se uči.
 *
 * Zvezdica pade samo pri najkrajšem programu. »Deluje« in »narejeno je dobro«
 * morata ostati ločena, sicer je zvezdica brez pomena.
 */
export default function Commands({ level, onStar, onHome, busy }) {
  const [maze, setMaze] = useState(() => makeMaze(level));
  const [program, setProgram] = useState([]);
  const [robot, setRobot] = useState(maze.start);
  const [result, setResult] = useState(null); // izid runProgram med izvajanjem
  const [stepIdx, setStepIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState(null); // 'bump' | 'short' | 'long'
  const voice = useRef([]);

  const stopVoice = useCallback(() => {
    voice.current.forEach(clearTimeout);
    voice.current = [];
  }, []);

  const newPuzzle = useCallback(() => {
    stopVoice();
    const m = makeMaze(level);
    setMaze(m);
    setRobot(m.start);
    setProgram([]);
    setResult(null);
    setStepIdx(0);
    setRunning(false);
    setOutcome(null);
  }, [level, stopVoice]);

  // Sprememba stopnje pomeni novo ploščo; brez tega bi otrok ostal na stari.
  useEffect(() => {
    newPuzzle();
  }, [newPuzzle]);

  useEffect(() => () => stopVoice(), [stopVoice]);

  /* ── Urejanje programa ──────────────────────────────────────────────────── */
  // Vsak poseg v program postavi robota nazaj na začetek: kar je na zaslonu, se
  // mora vedno ujemati s tem, kar piše v traku.
  const resetRun = () => {
    setRobot(maze.start);
    setResult(null);
    setStepIdx(0);
    setOutcome(null);
  };

  const addCmd = (dir) => {
    if (running || busy || program.length >= MAX_PROGRAM) return;
    sndTap();
    resetRun();
    setProgram((p) => [...p, dir]);
  };

  const removeAt = (i) => {
    if (running || busy) return;
    sndTap();
    resetRun();
    setProgram((p) => p.filter((_, j) => j !== i));
  };

  const clearAll = () => {
    if (running || busy) return;
    sndTap();
    resetRun();
    setProgram([]);
  };

  /** Prebere trak: »gor, gor, desno« — otrok sliši poved, ki jo je sam napisal. */
  const readProgram = () => {
    if (running || busy || !program.length) return;
    stopVoice();
    sndTap();
    program.forEach((d, i) => {
      voice.current.push(setTimeout(() => say(`cmd.${DIRS[d].word}`), 260 + i * 720));
    });
  };

  /* ── Izvajanje ──────────────────────────────────────────────────────────── */
  // Celoten tek izračunamo VNAPREJ in ga potem samo odigramo. Korak za korakom
  // sproti bi bral zastarelo stanje in se je to v tej igri že maščevalo.
  const runIt = () => {
    if (running || busy || !program.length) return;
    stopVoice();
    setResult(runProgram(maze, program));
    setRobot(maze.start);
    setStepIdx(0);
    setRunning(true);
    setOutcome(null);
  };

  useEffect(() => {
    if (!running || !result) return;

    // Robot še koraka.
    if (stepIdx < result.path.length - 1) {
      const t = setTimeout(() => {
        setRobot(result.path[stepIdx + 1]);
        setStepIdx((i) => i + 1);
      }, STEP_MS);
      return () => clearTimeout(t);
    }

    // Konec poti — povemo, kaj se je zgodilo.
    const t = setTimeout(() => {
      setRunning(false);
      if (result.reached) {
        if (result.usedSteps <= maze.optimal) {
          // Zvok igra App ob zvezdici; tu bi se le podvojil.
          onStar(newPuzzle); // zvezdica SAMO pri najkrajšem programu
        } else {
          setOutcome('long');
        }
      } else {
        sndWrong();
        setOutcome(result.failIdx === null ? 'short' : 'bump');
      }
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [running, result, stepIdx, maze.optimal, onStar, newPuzzle]);

  /* ── Risanje ────────────────────────────────────────────────────────────── */
  const { w, h } = maze;
  const boardW = `min(92vw, ${w * 56}px)`;
  const rockSet = new Set(maze.rocks.map((r) => `${r.x},${r.y}`));

  // Med korakanjem sveti ukaz, ki premik POVZROČA. Na koncu poti pa tisti, ki
  // se ni izšel — sicer bi se poudarek ustavil na ukazu, ki se sploh ni izvedel.
  const atEnd = running && result ? stepIdx >= result.path.length - 1 : false;
  const activeIdx = !running ? null : atEnd ? (result.failIdx !== null ? result.failIdx : stepIdx - 1) : stepIdx;
  const failIdx = result && (atEnd || outcome === 'bump') ? result.failIdx : null;

  const MSG = {
    bump: { text: '🪨 Robot je šel, kot je pisalo — in se ustavil tukaj.', bg: C.warn },
    short: { text: '🤖 Ukazov je zmanjkalo, cilja še ni.', bg: C.warn },
    long: { text: 'Prišel si! Gre tudi krajše?', bg: C.good }
  };

  return (
    <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 'clamp(14px,3.8vw,18px)', color: '#4A4468', letterSpacing: 1 }}>
          🤖 PRIPELJI ROBOTA DO 🏁
        </span>
        {/* Cilj je viden vnaprej. Vedeti, da gre v petih korakih, ne izda KATERIH
            pet — pove pa, kdaj je program dober, in to je merilo za zvezdico. */}
        <span
          style={{
            fontWeight: 700,
            fontSize: 'clamp(13px,3.6vw,16px)',
            color: C.white,
            background: C.accent,
            borderRadius: 999,
            padding: '4px 12px'
          }}
        >
          🎯 {maze.optimal} &nbsp;·&nbsp; tvojih {program.length}
        </span>
      </div>

      {/* Mreža. Brez rež med polji, ker robot lebdi nad njo v odstotkih — z
          režami bi se odstotki razšli s polji. */}
      <div style={{ position: 'relative', width: boardW, background: C.white, borderRadius: 18, padding: 6, boxSizing: 'border-box', boxShadow: '0 4px 0 rgba(0,0,0,0.12)' }}>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${w},1fr)` }}>
          {Array.from({ length: w * h }).map((_, i) => {
            const x = i % w;
            const y = Math.floor(i / w);
            const isRock = rockSet.has(`${x},${y}`);
            const isGoal = x === maze.goal.x && y === maze.goal.y;
            return (
              <div key={i} style={{ aspectRatio: '1', padding: 2, boxSizing: 'border-box' }}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 10,
                    background: isRock ? C.rock : isGoal ? C.goal : C.floor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(18px,5.4vw,26px)'
                  }}
                >
                  {isRock ? '🪨' : isGoal ? '🏁' : ''}
                </div>
              </div>
            );
          })}

          <div
            aria-label="Robot"
            style={{
              position: 'absolute',
              width: `${100 / w}%`,
              height: `${100 / h}%`,
              left: `${(robot.x * 100) / w}%`,
              top: `${(robot.y * 100) / h}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(20px,6vw,30px)',
              transition: `left ${STEP_MS - 180}ms ease, top ${STEP_MS - 180}ms ease`,
              animation: outcome === 'bump' ? 'shake 0.4s ease' : undefined,
              pointerEvents: 'none'
            }}
          >
            🤖
          </div>
        </div>
      </div>

      {/* Trak programa — poved od leve proti desni. Tap na ploščico jo odstrani. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' }}>
        <div
          style={{
            flex: 1,
            minHeight: 48,
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 14,
            padding: '6px 8px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 4,
            boxSizing: 'border-box'
          }}
        >
          {program.length === 0 && (
            <span style={{ fontSize: 14, fontWeight: 500, color: '#8B86A8', padding: '0 4px' }}>
              Zloži ukaze s puščicami ↓
            </span>
          )}
          {program.map((d, i) => (
            <button
              key={i}
              onClick={() => removeAt(i)}
              aria-label={`Ukaz ${DIRS[d].word}, tapni za brisanje`}
              style={{
                fontSize: 20,
                lineHeight: 1,
                width: 34,
                height: 34,
                borderRadius: 10,
                cursor: 'pointer',
                background: activeIdx === i ? C.accent : C.white,
                border: failIdx === i ? '3px solid #E23B3B' : '3px solid transparent',
                transform: activeIdx === i ? 'scale(1.12)' : 'none',
                transition: 'transform 0.15s, background 0.15s',
                padding: 0
              }}
            >
              {DIRS[d].arrow}
            </button>
          ))}
        </div>

        <button
          onClick={readProgram}
          aria-label="Poslušaj ukaze"
          style={{ fontSize: 20, width: 46, height: 46, borderRadius: 14, border: 'none', background: '#FFE9A8', cursor: 'pointer', boxShadow: '0 3px 0 rgba(0,0,0,0.12)' }}
        >
          🔊
        </button>
      </div>

      {/* Paleta ukazov */}
      <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
        {DIR_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => addCmd(k)}
            disabled={running || busy}
            aria-label={DIRS[k].word}
            style={{
              flex: 1,
              maxWidth: 82,
              height: 64,
              fontSize: 'clamp(24px,7vw,30px)',
              borderRadius: 16,
              border: 'none',
              background: C.white,
              cursor: 'pointer',
              opacity: running ? 0.45 : 1,
              boxShadow: '0 4px 0 rgba(0,0,0,0.14)'
            }}
          >
            {DIRS[k].arrow}
          </button>
        ))}
      </div>

      {/* Sporočilo o izidu. Nikoli modalno okno — otrok mora videti trak, ki ga popravlja. */}
      <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {outcome && (
          <span
            style={{
              display: 'inline-block',
              padding: '9px 16px',
              borderRadius: 16,
              fontSize: 'clamp(14px,3.9vw,17px)',
              fontWeight: 700,
              color: C.white,
              background: MSG[outcome].bg,
              animation: 'pop 0.3s ease-out'
            }}
          >
            {MSG[outcome].text}
          </span>
        )}
        {outcome === 'long' && (
          <button onClick={newPuzzle} style={{ ...bigBtn(C.accent), ...homeBtn }}>
            NAPREJ →
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
        <button
          onClick={runIt}
          disabled={running || busy || !program.length}
          style={{
            ...bigBtn(program.length && !running ? C.good : '#B9B4CE'),
            padding: '14px 20px',
            fontSize: 'clamp(17px,4.6vw,21px)',
            flex: 1
          }}
        >
          ▶️ ZAŽENI
        </button>
        <button onClick={() => removeAt(program.length - 1)} disabled={running || busy || !program.length} aria-label="Zbriši zadnji ukaz" style={{ ...bigBtn('#BDB8E8'), padding: '14px 16px', fontSize: 20, opacity: running || busy || !program.length ? 0.5 : 1 }}>
          ↩️
        </button>
        <button onClick={clearAll} disabled={running || busy || !program.length} aria-label="Počisti vse ukaze" style={{ ...bigBtn('#BDB8E8'), padding: '14px 16px', fontSize: 20, opacity: running || busy || !program.length ? 0.5 : 1 }}>
          🗑️
        </button>
      </div>

      <button style={{ ...bigBtn('#BDB8E8'), ...homeBtn }} onClick={onHome}>
        🏠 DOMOV
      </button>
    </div>
  );
}

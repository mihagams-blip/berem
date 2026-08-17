import { useEffect, useRef, useState } from 'react';
import FindPicture from './modes/FindPicture.jsx';
import MissingLetter from './modes/MissingLetter.jsx';
import PickByName from './modes/PickByName.jsx';
import { DINOS } from './content/dinos.js';
import { CARS } from './content/cars.js';
import { HEROES } from './content/heroes.js';
import { MYTH } from './content/myth.js';
import { DIET_ICON, DIET_SL, NOT_DINO } from './ui/DinoBits.jsx';
import CrabsAdd from './modes/CrabsAdd.jsx';
import { Confetti, Stars } from './ui/Bits.jsx';
import { sndCorrect, sndRoar, sndWin, unlockAudio } from './lib/audio.js';
import { GLOBAL_CSS, INK, LEVELS, MODES, STAR_GOAL, bgFor, bigBtn, chip, modeTile } from './lib/styles.js';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | pics | letter | dino | trophy
  const [numWords, setNumWords] = useState(1);
  const [level, setLevel] = useState('mid');
  const [stars, setStars] = useState(0);
  const [bravo, setBravo] = useState(false);
  const timerRef = useRef(null);

  // iOS zvoka brez geste ne dovoli. Poslušamo VSAK dotik, ker se kontekst ob
  // vrnitvi iz ozadja spet uspava.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const isDino = screen === 'dino';

  /**
   * Zvezdica + kratka pohvala, nato naslednji krog (ali pokal ob desetih).
   *
   * Časovnik je NAMENOMA zunaj `setStars` updaterja: React ga v StrictMode
   * pokliče dvakrat, kar bi ustvarilo dva časovnika in preskočilo en krog.
   * Napaka se pokaže samo v razvoju, zato jo je lahko spregledati do objave.
   */
  const earnStar = (next) => {
    isDino ? sndRoar() : sndCorrect();
    const ns = stars + 1;
    setStars(ns);
    setBravo(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBravo(false);
      if (ns >= STAR_GOAL) {
        sndWin();
        setScreen('trophy');
      } else {
        next();
      }
    }, 1600);
  };

  const start = (mode) => {
    setBravo(false);
    setStars(0);
    setScreen(mode);
  };

  const goHome = () => {
    clearTimeout(timerRef.current);
    setBravo(false);
    setStars(0);
    setScreen('home');
  };

  const shared = { level, onStar: earnStar, onHome: goHome, busy: bravo };

  return (
    <div
      style={{
        minHeight: '100dvh',
        fontFamily: "'Fredoka', sans-serif",
        background: bgFor(screen),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        userSelect: 'none'
      }}
    >
      <style>{GLOBAL_CSS}</style>

      {screen !== 'home' && screen !== 'trophy' && screen !== 'crabs' && <Stars count={stars} />}

      {screen === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4vh', width: '100%', maxWidth: '400px' }}>
          <div style={{ fontSize: '52px', marginBottom: '6px' }}>📖</div>
          <div style={{ fontWeight: 700, fontSize: 'clamp(40px,11vw,58px)', color: INK, letterSpacing: '3px', marginBottom: '4vh' }}>
            BEREM
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', width: '100%' }}>
            {Object.entries(MODES).map(([key, m]) => (
              <button key={key} style={modeTile(m.color)} onClick={() => start(key)}>
                <span style={{ fontSize: 'clamp(28px,8vw,36px)' }}>{m.icon}</span>
                <span style={{ fontSize: 'clamp(13px,3.7vw,16px)', letterSpacing: '0.5px' }}>{m.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '3vh' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(LEVELS).map(([key, L]) => (
                <button key={key} onClick={() => setLevel(key)} style={chip(level === key, L.color)}>
                  {L.dot} {L.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {screen === 'pics' && <FindPicture {...shared} numWords={numWords} setNumWords={setNumWords} />}
      {screen === 'letter' && <MissingLetter {...shared} />}
      {screen === 'dino' && (
        <PickByName
          {...shared}
          items={DINOS}
          question="👆 KATERA ŽIVAL JE TO?"
          audioPrefix="dino"
          chipsFor={(d) => [
            { icon: DIET_ICON[d.diet], text: DIET_SL[d.diet] },
            { icon: '📏', text: `${String(d.lengthM).replace('.', ',')} m` }
          ]}
          noteFor={(d) => NOT_DINO[d.shape] || null}
        />
      )}
      {/* Rakci imajo svojo rundo petih nalog in svoj pregled, zato ne uporabljajo
          skupnega traku zvezdic ne skupne pohvale. */}
      {screen === 'crabs' && <CrabsAdd level={level} setLevel={setLevel} onHome={goHome} />}

      {screen === 'cars' && (
        <PickByName
          {...shared}
          items={CARS}
          question="👆 KATERA ZNAMKA JE TO?"
          audioPrefix="car"
          accent="#3B6FD4"
        />
      )}

      {screen === 'heroes' && (
        <PickByName
          {...shared}
          items={HEROES}
          question="👆 KATERI JUNAK JE TO?"
          audioPrefix="hero"
          accent="#B0559E"
        />
      )}

      {screen === 'myth' && (
        <PickByName {...shared} items={MYTH} question="👆 KDO JE TO?" audioPrefix="myth" accent="#C6892B" />
      )}

      {screen === 'trophy' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '10vh' }}>
          <Confetti />
          <div style={{ fontSize: '100px', animation: 'bounce 1s ease infinite' }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 'clamp(44px,12vw,68px)', color: INK, letterSpacing: '2px' }}>SUPER!</div>
          <div style={{ fontSize: 'clamp(18px,5vw,24px)', fontWeight: 700, color: '#4A4468' }}>{STAR_GOAL} ⭐ ZBRANIH!</div>
          <button style={bigBtn('#FF9F1C')} onClick={goHome}>
            🔄 ŠE ENKRAT
          </button>
        </div>
      )}

      {bravo && (
        <>
          <Confetti dino={isDino} />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.8)',
              zIndex: 50,
              gap: '12px',
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontSize: '90px', animation: 'pop 0.5s ease' }}>{isDino ? '🦖' : '🎉'}</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 'clamp(52px,15vw,84px)',
                color: '#FF9F1C',
                letterSpacing: '3px',
                animation: 'pop 0.6s ease',
                textShadow: '0 4px 0 rgba(0,0,0,0.1)'
              }}
            >
              {isDino ? 'RAAAWR!' : 'BRAVO!'}
            </div>
            <div style={{ fontSize: '44px', animation: 'bounce 0.8s ease infinite' }}>⭐</div>
          </div>
        </>
      )}
    </div>
  );
}

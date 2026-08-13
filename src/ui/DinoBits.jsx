import { INK } from '../lib/styles.js';
import { say, sndTap } from '../lib/audio.js';

/**
 * Pteranodon in Mozazaver NISTA dinozavra. Otroku tega ne zamolčimo — igra ga
 * uči prav to razliko, zato kartica pove, kaj žival v resnici je.
 */
export const NOT_DINO = {
  leteci: 'Ni dinozaver — je leteči plazilec.',
  morski: 'Ni dinozaver — je morski plazilec.'
};

export const DIET_SL = { carnivore: 'MESOJED', herbivore: 'RASTLINOJED', omnivore: 'VSEJED' };
export const DIET_ICON = { carnivore: '🥩', herbivore: '🌿', omnivore: '🍽️' };

/** Slovenska števila z vejico, ne s piko. */
const num = (n) => String(n).replace('.', ',');

/**
 * Ime po zlogih. Vsak zlog je svoja ploščica z vidno režo — otrok vidi, kje se
 * beseda lomi, in lahko vsak kos tapne, da ga sliši.
 *
 * Zlog je enota PRIKAZA, ne nadomestek glaskovanja (glej raziskavo §0), zato
 * ploščice ne skrivajo črk in ne barvajo glasov.
 */
export function SyllableWord({ syl, onSyllable, size = 'clamp(24px,6.4vw,42px)' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px',
        maxWidth: '100%'
      }}
    >
      {syl.map((s, i) => (
        <button
          key={`${s}-${i}`}
          onClick={() => onSyllable?.(s, i)}
          aria-label={`Zlog ${s}`}
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: size,
            letterSpacing: '1px',
            color: INK,
            background: '#fff',
            border: 'none',
            borderRadius: '14px',
            padding: '6px clamp(8px,2.6vw,14px)',
            boxShadow: '0 4px 0 rgba(0,0,0,0.10)',
            cursor: 'pointer',
            animation: `sylIn 0.32s ease ${i * 0.06}s both`
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

/** Kartica po pravilnem odgovoru: velika slika, ime in tri dejstva. */
export function FactCard({ dino, onNext }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        background: 'rgba(255,255,255,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '18px',
        boxSizing: 'border-box'
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}${dino.img}`}
        alt=""
        draggable={false}
        style={{
          width: 'min(72vw, 300px)',
          maxHeight: '38vh',
          objectFit: 'contain',
          borderRadius: '20px',
          boxShadow: '0 8px 0 rgba(0,0,0,0.12)',
          animation: 'pop 0.5s ease'
        }}
      />

      <button
        onClick={() => {
          sndTap();
          say(`dino.${dino.id}`);
        }}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(26px,7.2vw,40px)',
          letterSpacing: '2px',
          color: INK,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 8px'
        }}
      >
        {dino.name} 🔊
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
        <Fact icon={DIET_ICON[dino.diet]} text={DIET_SL[dino.diet]} />
        <Fact icon="📏" text={`${num(dino.lengthM)} m`} />
      </div>

      {NOT_DINO[dino.shape] && (
        <div
          style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(13px,3.6vw,16px)',
            color: '#8A6A1F',
            background: '#FFF3D0',
            borderRadius: '999px',
            padding: '6px 14px'
          }}
        >
          ⚠️ {NOT_DINO[dino.shape]}
        </div>
      )}

      <div
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 500,
          fontSize: 'clamp(15px,4.2vw,19px)',
          color: '#5B5580',
          textAlign: 'center',
          maxWidth: '28ch',
          lineHeight: 1.35
        }}
      >
        {dino.benchmark}
      </div>

      <button
        onClick={onNext}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          background: '#3FA05A',
          color: '#fff',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 6px 0 rgba(0,0,0,0.2)',
          padding: '14px 30px',
          fontSize: 'clamp(18px,5vw,24px)',
          letterSpacing: '1px',
          cursor: 'pointer',
          marginTop: '6px'
        }}
      >
        NAPREJ →
      </button>
    </div>
  );
}

function Fact({ icon, text }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: '#F3F0FB',
        borderRadius: '999px',
        padding: '7px 15px',
        fontFamily: "'Fredoka', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(14px,3.9vw,18px)',
        color: INK
      }}
    >
      <span style={{ fontSize: '1.15em' }}>{icon}</span>
      {text}
    </span>
  );
}

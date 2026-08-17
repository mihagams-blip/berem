import { INK } from '../lib/styles.js';
import { say, sndTap } from '../lib/audio.js';

/**
 * Ime po zlogih. Vsak zlog je svoja ploščica z vidno režo — otrok vidi, kje se
 * beseda lomi, in lahko vsak kos tapne, da ga sliši.
 *
 * Zlog je enota PRIKAZA, ne nadomestek glaskovanja, zato ploščice ne skrivajo
 * črk in ne barvajo glasov.
 *
 * Presledek v večbesednem imenu je svoj element (' ') — narišemo ga kot režo,
 * ne kot ploščico, da otrok vidi mejo med besedama.
 */
export function SyllableWord({ syl, onSyllable, size = 'clamp(22px,6vw,40px)' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', maxWidth: '100%' }}>
      {syl.map((s, i) =>
        s.trim() === '' ? (
          <span key={`gap-${i}`} style={{ width: 'clamp(10px,3vw,18px)' }} />
        ) : (
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
              padding: '6px clamp(7px,2.4vw,14px)',
              boxShadow: '0 4px 0 rgba(0,0,0,0.10)',
              cursor: 'pointer',
              animation: `sylIn 0.32s ease ${i * 0.06}s both`
            }}
          >
            {s}
          </button>
        )
      )}
    </div>
  );
}

/**
 * Kartica po pravilnem odgovoru: velika slika, ime (tapneš ga in se izgovori),
 * neobvezni oznaki z dejstvi in en stavek.
 *
 * Ista kartica služi dinozavrom, znamkam, junakom in mitologiji — spremeni se
 * samo vsebina, ne oblika.
 */
export function FactCard({ item, audioKey, chips = [], note, onNext, accent = '#3FA05A' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 55,
        background: 'rgba(255,255,255,0.94)',
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
        src={`${import.meta.env.BASE_URL}${item.img}`}
        alt=""
        draggable={false}
        style={{
          width: 'min(70vw, 290px)',
          maxHeight: '36vh',
          objectFit: 'contain',
          borderRadius: '20px',
          animation: 'pop 0.5s ease'
        }}
      />

      <button
        onClick={() => {
          sndTap();
          say(audioKey);
        }}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(24px,6.8vw,38px)',
          letterSpacing: '2px',
          color: INK,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 8px'
        }}
      >
        {item.name} 🔊
      </button>

      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {chips.map((c) => (
            <Chip key={c.text} icon={c.icon} text={c.text} />
          ))}
        </div>
      )}

      {note && (
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
          ⚠️ {note}
        </div>
      )}

      {item.fact && (
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
          {item.fact}
        </div>
      )}

      <button
        onClick={onNext}
        style={{
          fontFamily: "'Fredoka', sans-serif",
          fontWeight: 700,
          background: accent,
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

function Chip({ icon, text }) {
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
      {icon && <span style={{ fontSize: '1.15em' }}>{icon}</span>}
      {text}
    </span>
  );
}

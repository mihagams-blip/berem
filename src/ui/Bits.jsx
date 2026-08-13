import { INK, STAR_GOAL } from '../lib/styles.js';

/** Emoji slika (besede) ali naslikana žival (dinozavri). */
export function Pic({ item, size = 'clamp(40px,11vw,64px)' }) {
  if (item.img) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}${item.img}`}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: '12px' }}
      />
    );
  }
  return <span style={{ fontSize: size, lineHeight: 1 }}>{item.e}</span>;
}

/** Beseda na beli kartici; z `blankIndex` skrije eno črko (način MANJKA ČRKA). */
export function Word({ word, blankIndex = -1, filled = null, size = 'clamp(30px,7.5vw,56px)' }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        justifyContent: 'center',
        background: '#fff',
        borderRadius: '18px',
        padding: '10px 18px 6px',
        boxShadow: '0 4px 0 rgba(0,0,0,0.08)'
      }}
    >
      {word.split('').map((ch, i) => {
        const isBlank = i === blankIndex;
        return (
          <span
            key={i}
            style={{
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.15,
              color: isBlank ? (filled ? '#2EA98C' : 'transparent') : INK,
              padding: '0 2px',
              margin: '0 2px',
              minWidth: isBlank ? `calc(${size} * 0.6)` : undefined,
              textAlign: 'center',
              borderBottom: isBlank && !filled ? '6px solid #F2B705' : '5px solid #E9E5F6',
              borderRadius: '3px',
              animation: isBlank ? (filled ? 'pop 0.4s ease' : 'blink 1.4s ease infinite') : 'none',
              display: 'inline-block'
            }}
          >
            {isBlank ? filled || 'A' : ch}
          </span>
        );
      })}
    </div>
  );
}

export function Stars({ count }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '10px', fontSize: 'clamp(18px,4.5vw,26px)' }}>
      {Array.from({ length: STAR_GOAL }, (_, i) => (
        <span key={i} style={{ opacity: i < count ? 1 : 0.25, animation: i === count - 1 ? 'pop 0.5s ease' : 'none' }}>
          ⭐
        </span>
      ))}
    </div>
  );
}

export function Confetti({ dino = false }) {
  const emojis = dino ? ['🦖', '🦕', '⭐', '🌋', '✨'] : ['🎉', '⭐', '🎈', '✨', '🌟'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 60 }}>
      {Array.from({ length: 36 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '-8%',
            left: `${(i * 37) % 100}%`,
            fontSize: `${18 + (i % 4) * 8}px`,
            animation: `fall ${1.6 + (i % 5) * 0.35}s linear ${(i % 7) * 0.12}s forwards`
          }}
        >
          {emojis[i % emojis.length]}
        </div>
      ))}
    </div>
  );
}

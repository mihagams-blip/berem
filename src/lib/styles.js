/** Skupne barve, slogi gumbov in animacije. Vse na enem mestu, da so zasloni skladni. */

export const INK = '#33305A';
export const STAR_GOAL = 10;

export const LEVELS = {
  easy: { dot: '🟢', label: 'LAHKO', min: 3, max: 4, cards: 4, opts: 3, color: '#3FBF6B' },
  mid: { dot: '🟡', label: 'SREDNJE', min: 4, max: 6, cards: 6, opts: 6, color: '#F2B705' },
  hard: { dot: '🔴', label: 'TEŽKO', min: 6, max: 12, cards: 8, opts: 8, color: '#E85454' }
};

export const MODES = {
  pics: { label: '🖼️ NAJDI SLIKO', color: '#FF5D5D' },
  letter: { label: '🔤 MANJKA ČRKA', color: '#2EC4B6' },
  dino: { label: '🦖 DINOZAVER', color: '#3FA05A' }
};

export const bigBtn = (bg) => ({
  fontFamily: "'Fredoka', sans-serif",
  fontWeight: 700,
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '22px',
  boxShadow: '0 6px 0 rgba(0,0,0,0.2)',
  cursor: 'pointer',
  padding: '22px 26px',
  fontSize: 'clamp(20px,5.5vw,28px)',
  letterSpacing: '1px',
  transition: 'transform 0.1s'
});

export const chip = (active, color) => ({
  fontFamily: "'Fredoka', sans-serif",
  fontWeight: 700,
  background: active ? color : 'transparent',
  color: active ? '#fff' : '#8B86A8',
  border: active ? '3px solid transparent' : '3px solid #D8D3EA',
  borderRadius: '999px',
  padding: '8px 16px',
  fontSize: 'clamp(13px,3.6vw,16px)',
  cursor: 'pointer',
  boxShadow: active ? '0 3px 0 rgba(0,0,0,0.15)' : 'none'
});

export const homeBtn = { padding: '10px 20px', fontSize: '16px' };

/** Ozadje se spremeni po načinu, da otrok takoj ve, kje je. */
export const bgFor = (mode) =>
  mode === 'dino'
    ? 'linear-gradient(180deg,#B8E6C8 0%,#DCF2D0 60%,#F5EBC8 100%)'
    : 'linear-gradient(180deg,#8FD3FF 0%,#C9F2E5 70%,#FFF6C9 100%)';

export const GLOBAL_CSS = `
  @keyframes pop { 0%{transform:scale(0.3)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
  @keyframes fall { to { transform: translateY(115vh) rotate(360deg); } }
  @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
  @keyframes blink { 0%,100%{border-bottom-color:#F2B705} 50%{border-bottom-color:#FFE08A} }
  @keyframes sylIn { from{transform:translateY(10px);opacity:0} to{transform:none;opacity:1} }
  button:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,0.2) !important; }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
`;

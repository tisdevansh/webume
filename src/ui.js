// Small pieces shared by every scene

export const pad = (n) => String(n).padStart(2, '0');
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Line({ children, serif = false }) {
  return (
    <span className="mask">
      <span className={serif ? 'serif' : undefined}>{children}</span>
    </span>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function Eyebrow({ index, children }) {
  return (
    <p className="eyebrow">
      <span>Scene {pad(index)}</span>
      <span>{children}</span>
    </p>
  );
}

// A giant outlined word drifting behind a scene; the outer layer follows the pointer
export function BgWord({ children, depth = 24 }) {
  return (
    <div className="bg-layer layer" data-depth={depth} aria-hidden="true">
      <span className="bg-word">{children}</span>
    </div>
  );
}

// Cards light up where the pointer is
export const spotlight = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

export const pick = (list, not) => {
  const options = list.length > 1 ? list.filter((x) => x !== not) : list;
  return options[Math.floor(Math.random() * options.length)];
};

// Short sound effects, kept quiet and only ever played in answer to a click
const cache = {};
export function playSfx(src, volume = 0.35) {
  try {
    const a = cache[src] || (cache[src] = new Audio(src));
    a.volume = volume;
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch (e) {
    // audio is optional
  }
}

import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

gsap.registerPlugin(Physics2DPlugin);

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

export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

// Haptic tick on phones; silent everywhere else
export const buzz = (pattern = 10) => {
  try {
    if (coarsePointer()) navigator.vibrate?.(pattern);
  } catch (e) {
    // not supported
  }
};

// Confetti from a point on screen; the layer only exists while pieces are flying
const CONFETTI = ['#c8f169', '#ff8fab', '#f2a541', '#4f8dff', '#ffffff', '#ff9a3c'];
export function confetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 60) {
  if (prefersReducedMotion()) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  document.body.appendChild(layer);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.style.background = CONFETTI[i % CONFETTI.length];
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    layer.appendChild(p);
    gsap.to(p, {
      duration: 1.6 + Math.random(),
      physics2D: { velocity: 300 + Math.random() * 500, angle: -90 + (Math.random() - 0.5) * 140, gravity: 900 },
      rotation: Math.random() * 720,
      opacity: 0,
      ease: 'power1.in',
    });
  }
  setTimeout(() => layer.remove(), 2800);
}

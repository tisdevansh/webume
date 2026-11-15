import gsap from 'gsap';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

gsap.registerPlugin(Physics2DPlugin);

// Small pieces shared by every section

export const pad = (n) => String(n).padStart(2, '0');
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

// A headline whose lines rise out of masks when its scene arrives
export function Title({ lines, as: Tag = 'h3', className = '' }) {
  return (
    <Tag className={`title ${className}`}>
      {lines.map((l, i) => (
        <span className="mask" key={i}>
          <span className="mask-in">{l}</span>
        </span>
      ))}
    </Tag>
  );
}

// Haptic tick on phones; silent everywhere else
export const buzz = (pattern = 10) => {
  try {
    if (coarsePointer()) navigator.vibrate?.(pattern);
  } catch (e) {
    // not supported
  }
};

// Run work when the main thread is free, so setup never blocks a frame
export function idle(fn, timeout = 1500) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 60);
  return () => clearTimeout(id);
}
export const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

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

// Confetti from a point on screen; the layer only exists while pieces are flying
const CONFETTI = ['#c8ff3d', '#ff5fa2', '#f2a541', '#4f8dff', '#ffffff', '#ff8a3d'];
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

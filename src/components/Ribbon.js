import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../ui';

// A scroll-driven ribbon of cards after MotionSites' "Video Ribbon": one smoothed progress value drives
// everything. Two headline lines pass like trains while the strip of cards slides along a fixed 3D rail
// (small along the bottom, a shallow arc close by, round the left edge, away along the top), then each card
// lands in a 3×2 grid. The rail maths and timings follow the prompt; cards are flat CSS planes, not WebGL.

const span = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const easeOut3 = (t) => 1 - Math.pow(1 - t, 3);
const CARD_W = 2.1;
const CARD_H = 1.32;
const GAP = 0.03;
const H = 0.561; // tan of the horizontal half-view

// The rail: 161 samples, re-read by arc length into a table
function buildRail() {
  const pts = [];
  for (let i = 0; i <= 160; i++) {
    const t = i / 160;
    const ph = -1.5 + t * (2 * Math.PI + 1.35 + 1.5);
    const cs = Math.cos(ph);
    const depth = cs > 0 ? 7.6 + 16.4 * Math.pow(cs, 0.9) : 7.6 + 2.2 * cs;
    const edge = 0.84 + 0.5 * span(0.14 - t, 0, 0.14) + 0.8 * span(t, 0.84, 1);
    const u = 2 * t - 1;
    pts.push([edge * Math.sin(ph) * depth * H, 0.5 * Math.sign(u) * Math.pow(Math.abs(u), 1.4) * depth * 0.63, -depth]);
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]];
    len.push(len[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  }
  const total = len[len.length - 1];
  const table = [];
  let j = 1;
  for (let k = 0; k <= 1200; k++) {
    const target = (k / 1200) * total;
    while (j < len.length - 1 && len[j] < target) j++;
    const f = (target - len[j - 1]) / (len[j] - len[j - 1] || 1);
    const [a, b] = [pts[j - 1], pts[j]];
    table.push({ p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f], tan: [b[0] - a[0], b[1] - a[1], b[2] - a[2]] });
  }
  return { table, total };
}

export default function Ribbon({ items, lines, caption }) {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const cardsRef = useRef([]);
  const linesRef = useRef([]);
  const capRef = useRef(null);
  const ruleRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const still = prefersReducedMotion();
    const { table, total } = buildRail();
    const step = (CARD_W + GAP) / total;
    const N = items.length;
    let p = 0;
    let raf = 0;
    let running = false;
    const videos = cardsRef.current.map((c) => c && c.querySelector('video'));

    const at = (t) => table[Math.max(0, Math.min(1200, Math.round(t * 1200)))];
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const vw = stage.clientWidth;
      const vh = stage.clientHeight;
      const r = track.getBoundingClientRect();
      const target = span(-r.top, 0, r.height - vh);
      p += still ? target - p : (target - p) * 0.09;
      const proj = (x, y, z) => {
        const s = vw / 2 / (-z * H); // px per world unit at this depth
        return [vw / 2 + x * s, vh / 2 - y * s, s];
      };

      // headline: rise, then two lines pass in opposite directions
      const rise = (1 - easeOut3(span(p, 0, 0.12))) * 34;
      const run = span(p, 0, 0.58);
      if (linesRef.current[0]) linesRef.current[0].style.transform = `translate3d(${-50 + 126 * run}vw, ${rise}vh, 0)`;
      if (linesRef.current[1]) linesRef.current[1].style.transform = `translate3d(${50 - 126 * run}vw, ${rise}vh, 0)`;
      if (capRef.current) capRef.current.style.opacity = String(1 - span(p, 0.52, 0.57));
      const fade = String(1 - span(p, 0.6, 0.72));
      linesRef.current.forEach((l) => l && (l.style.opacity = fade));
      if (ruleRef.current) ruleRef.current.style.transform = `scaleX(${span(p, 0.72, 0.86)})`;

      // the strip slides along the rail between p .14 and .63
      const slide = span(p, 0.14, 0.63) * (1 + N * step);
      const narrow = vw / vh < 0.9;
      const cols = narrow ? 2 : 3;
      const gw = 2 * 8 * H * (narrow ? 0.88 : 0.74);
      const gap = gw * 0.017;
      const cw = (gw - gap * (cols - 1)) / cols;
      const ch = (cw * CARD_H) / CARD_W;
      const rows = narrow ? 3 : 2;

      items.forEach((it, i) => {
        const el = cardsRef.current[i];
        if (!el) return;
        const t = slide - i * step;
        let x;
        let y;
        let z;
        let yaw = 0;
        let w = CARD_W;
        let tilt = 0;
        let show = true;
        const inGrid = i < cols * rows;
        if (t < 0) show = false;
        else if (t <= 1) {
          const a = at(t);
          [x, y, z] = a.p;
          yaw = Math.atan2(-a.tan[2], a.tan[0]);
          // always read the right way round: never show a card's back
          if (Math.cos(yaw) < 0) yaw += Math.PI;
        } else if (inGrid) {
          // fly from the rail's end to this card's grid slot over .13 of scroll
          const leftAt = (i * step + 1) / (1 + N * step);
          const k = easeOut3(span(p, 0.14 + leftAt * 0.49, 0.14 + leftAt * 0.49 + 0.13));
          const col = i % cols;
          const row = Math.floor(i / cols);
          const gx = -gw / 2 + cw / 2 + col * (cw + gap);
          const gy = ((rows - 1) / 2 - row) * (ch + gap);
          const from = at(1).p;
          const side = col === 0 ? -1 : col === cols - 1 ? 1 : 0;
          const fx = from[0] + side * 3;
          const fy = from[1] + (row === 0 ? 3 : -3);
          x = fx + (gx - fx) * k;
          y = fy + (gy - fy) * k;
          z = from[2] + (-8 - from[2]) * k;
          w = CARD_W + (cw - CARD_W) * k;
          tilt = (1 - k) * (side || (row === 0 ? 1 : -1)) * 14;
        } else show = false;
        if (!show) {
          el.style.opacity = '0';
          if (videos[i] && !videos[i].paused) videos[i].pause();
          return;
        }
        const [sx, sy, s] = proj(x, y, z);
        const pxW = w * s;
        el.style.opacity = '1';
        el.style.width = `${pxW.toFixed(1)}px`;
        el.style.height = `${((pxW * CARD_H) / CARD_W).toFixed(1)}px`;
        el.style.transform = `translate3d(${(sx - pxW / 2).toFixed(1)}px, ${(sy - (pxW * CARD_H) / CARD_W / 2).toFixed(1)}px, 0) rotateY(${((yaw * 180) / Math.PI).toFixed(1)}deg) rotate(${tilt.toFixed(1)}deg)`;
        el.style.zIndex = String(Math.round(1000 - (-z) * 10));
        if (videos[i] && videos[i].paused) videos[i].play().catch(() => {});
      });
    };

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
        videos.forEach((v) => v && v.pause());
      }
    });
    io.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [items]);

  return (
    <div className="ribbon" ref={trackRef}>
      <div className="ribbon-stage" ref={stageRef}>
        <div className="ribbon-glow" aria-hidden="true" />
        <div className="ribbon-lines" aria-hidden="true">
          <span ref={(el) => (linesRef.current[0] = el)}>{lines[0]}</span>
          <span ref={(el) => (linesRef.current[1] = el)}>{lines[1]}</span>
        </div>
        <p className="ribbon-cap" ref={capRef}>
          {caption}
        </p>
        <i className="ribbon-rule" ref={ruleRef} aria-hidden="true" />
        <div className="ribbon-cards">
          {items.map((it, i) => (
            <figure key={it.title} className="ribbon-card" ref={(el) => (cardsRef.current[i] = el)} data-cursor={it.short}>
              {it.video ? <video src={it.video} poster={it.src} muted loop playsInline preload="none" /> : <img src={it.src} alt={`Vigil: ${it.title}`} loading="lazy" draggable="false" />}
            </figure>
          ))}
        </div>
        <span className="sr-only">{lines.join(' ')}</span>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import Peacock from './Peacock';
import { coarsePointer, prefersReducedMotion } from '../ui';

// Mayu drawn from a few thousand glowing dots, after MotionSites' "Dot Portrait": the dots leave a ring and
// arc into place, one shine sweeps down once, the pointer is a small light she turns to look at, and a glint
// runs across her fan's eyespots every few seconds. Written straight into a pixel buffer, no WebGL.

const SIZE = 420; // CSS px
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const fract = (x) => x - Math.floor(x);

export default function DotMayu() {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const still = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(SIZE * dpr);
    canvas.width = W;
    canvas.height = W;
    const ctx = canvas.getContext('2d');
    let dots = [];
    let dust = [];
    let raf = 0;
    let running = false;
    let start = 0;
    let last = 0;
    const light = { x: 0.7, y: 0.3, on: 0 };
    const head = { x: 0, y: 0 };
    let pointer = null;
    let lastTouch = 0;
    let glintFrom = 0;
    let glintTo = 1;

    // Sample the vector Mayu into dots, keeping her colours; eyespot gold and teal become "glint" dots
    const svg = svgRef.current.querySelector('svg');
    const img = new Image();
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const S = 220;
      const off = document.createElement('canvas');
      off.width = S;
      off.height = S;
      const o = off.getContext('2d');
      o.drawImage(img, 0, 0, S, S);
      const data = o.getImageData(0, 0, S, S).data;
      const step = coarsePointer() ? 2.6 : 2;
      for (let y = 0; y < S; y += step) {
        for (let x = 0; x < S; x += step) {
          const jx = x + (Math.random() - 0.5) * step;
          const jy = y + (Math.random() - 0.5) * step;
          const i = (Math.floor(jy) * S + Math.floor(jx)) * 4;
          if (data[i + 3] < 140) continue;
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          const gold = r > 200 && g > 150 && b < 90;
          const teal = g > 130 && b > 130 && r < 60;
          dots.push({ hx: jx / S, hy: jy / S, r, g, b, glint: gold || teal, rand: Math.random() });
        }
      }
      URL.revokeObjectURL(url);
      const xs = dots.filter((d) => d.glint).map((d) => d.hx);
      glintFrom = Math.min(...xs) - 0.08;
      glintTo = Math.max(...xs) + 0.08;
      dust = Array.from({ length: 36 }, () => ({ x: Math.random(), y: Math.random(), v: 0.01 + Math.random() * 0.03, s: Math.random() }));
    };
    img.src = url;

    const buf = ctx.createImageData(W, W);
    const px = buf.data;
    const put = (x, y, r, g, b, a, size) => {
      const s = size | 0;
      for (let dy = 0; dy < s; dy++) {
        const yy = (y | 0) + dy;
        if (yy < 0 || yy >= W) continue;
        for (let dx = 0; dx < s; dx++) {
          const xx = (x | 0) + dx;
          if (xx < 0 || xx >= W) continue;
          const k = (yy * W + xx) * 4;
          px[k] = Math.min(255, px[k] + r * a);
          px[k + 1] = Math.min(255, px[k + 1] + g * a);
          px[k + 2] = Math.min(255, px[k + 2] + b * a);
          px[k + 3] = 255;
        }
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!dots.length) return;
      if (!start) start = now;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const t = still ? 10 : (now - start) / 1000;
      const assemble = still ? 1 : Math.min(1, t / 2.6);
      const ease = (k) => 1 - Math.exp(-dt * k);

      // The light follows the pointer, or orbits on its own when there is none
      const idle = !pointer || now - lastTouch > 1500;
      const tx = idle ? 0.5 + 0.42 * Math.sin(0.45 * t) : pointer.x;
      const ty = idle ? 0.45 + 0.3 * Math.cos(0.33 * t) : pointer.y;
      light.x += (tx - light.x) * (still ? 1 : ease(5));
      light.y += (ty - light.y) * (still ? 1 : ease(5));
      light.on += (Math.min(1, 1.6 * assemble) - light.on) * ease(4);
      const hx = still ? 0 : idle ? 0.35 * Math.sin(0.45 * t) : (pointer.x - 0.5) * 1;
      const hy = still ? 0 : idle ? 0.12 * Math.cos(0.33 * t) : (pointer.y - 0.5) * 0.36;
      head.x += (hx - head.x) * ease(idle ? 1.5 : 3);
      head.y += (hy - head.y) * ease(idle ? 1.5 : 3);

      // One diagonal shine after the dots land, then a glint across the eyespots every 4.2 s
      const s = (t - 2.34) / 2.2;
      const shine = !still && s > 0 && s < 1 ? 1.3 - (1 - (1 - s) * (1 - s)) * 2.4 : -9;
      const gt = t - 4.6;
      const gp = gt > 0 ? (gt % 4.2) / 0.9 : 9;
      const glint = !still && gp < 1 ? glintFrom + (glintTo - glintFrom) * gp : -9;

      px.fill(0);
      for (const d of dots) {
        const r2 = fract(Math.sin(d.rand * 91.7) * 43758.5453);
        // head turns fully, the body follows at a quarter
        const headness = Math.min(1, Math.max(0, (0.62 - d.hy) / 0.22));
        const turn = 0.25 + 0.75 * headness;
        let x = d.hx + head.x * 0.05 * turn;
        let y = d.hy + head.y * 0.05 * headness;
        // breathing
        x += Math.sin(t * 1.4 + d.rand * 60) * 0.0015;
        // entrance: from a ring, arcing outward on the way in
        const k = Math.min(1, Math.max(0, (assemble - d.rand * 0.45) / 0.55));
        const e = easeInOut(k);
        if (e < 1) {
          const a = d.rand * Math.PI * 2;
          const rr = 0.36 * (1 + (r2 - 0.5) * 0.06);
          const sx = 0.5 + Math.cos(a - Math.PI / 2) * rr;
          const sy = 0.5 + Math.sin(a - Math.PI / 2) * rr;
          const arc = Math.sin(e * Math.PI) * 0.06;
          x = sx + (x - sx) * e + Math.sin(d.rand * 40 + t * 0.3) * arc;
          y = sy + (y - sy) * e + Math.cos(d.rand * 31) * arc;
        }
        const lx = light.x - x;
        const ly = light.y - y;
        const lit = (light.on * 1) / (1 + (lx * lx + ly * ly) * 40);
        let b = 0.62 + lit * 1.2;
        const band = d.hy - d.hx * 0.5 - shine;
        const sh = Math.exp(-band * band * 40);
        b += sh * 1.1;
        if (d.glint) b += Math.max(0, 1 - Math.abs(d.hx - glint) / 0.05) * 1.1;
        b *= 0.7 + r2 * 0.5;
        const alpha = (0.75 + 0.25 * e) * Math.min(1, b);
        const size = dpr * (1.4 + r2 * r2 * 1.8) * (1 + sh * 0.5);
        put(x * W, y * W, d.r, d.g, d.b, alpha, Math.max(1, size));
      }
      // dust drifting upward
      for (const p of dust) {
        if (!still) p.y -= p.v * dt;
        if (p.y < 0) p.y = 1;
        put(p.x * W, p.y * W, 200, 210, 230, 0.25 * light.on, dpr);
      }
      ctx.putImageData(buf, 0, 0);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          last = 0;
          raf = requestAnimationFrame(frame);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(canvas);
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      lastTouch = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
    };
  }, []);

  return (
    <div className="dot-mayu">
      <div ref={svgRef} className="dot-mayu-src" aria-hidden="true">
        <Peacock mood="happy" size={220} />
      </div>
      <canvas ref={canvasRef} role="img" aria-label="Mayu the peacock, drawn from glowing dots" />
    </div>
  );
}

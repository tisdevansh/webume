import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { buzz, coarsePointer, prefersReducedMotion } from '../ui';

// A sphere of everything shipped, after MotionSites' "Sphere Gallery": tiles sit on a Fibonacci sphere and
// always face the viewer; drag spins it with inertia; click zooms a tile, click again opens its overview.
// Drawn with CSS 3D transforms instead of WebGL, and the frame loop only runs while it is on screen.

// 3×3 rotation helpers (row-major)
const rot = (axis, a) => {
  const [x, y, z] = axis;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
};
const mul = (a, b) => [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]));
const apply = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
const TILT = [Math.sin((23 * Math.PI) / 180), Math.cos((23 * Math.PI) / 180), 0];

function layout(width) {
  const phone = width <= 640;
  const k = width > 1024 && width <= 1440 ? 0.8 : 1;
  const plane = phone ? 78 : 118 * k;
  const radius = phone ? width / 2 - 24 - plane / 2 : 250 * k;
  return { plane, radius, phone };
}

export default function WorkSphere({ items }) {
  const stageRef = useRef(null);
  const tilesRef = useRef([]);
  const st = useRef(null);
  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [overview, setOverview] = useState(false);
  const zoomRef = useRef(null);
  zoomRef.current = zoom;

  useEffect(() => {
    const stage = stageRef.current;
    const N = items.length;
    const still = prefersReducedMotion();
    const s = {
      m: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      vel: [0, 0],
      acc: [0, 0],
      smooth: [0, 0],
      idle: !still,
      intro: still ? 'done' : 'waiting',
      circleSpin: 0,
      spinRate: 0.5,
      expand: { k: 0 },
      band: { k: 0 },
      dims: layout(stage.clientWidth),
      tiles: items.map((it, i) => {
        const y = i * (2 / N) - 1 + 1 / N;
        const r = Math.sqrt(1 - y * y);
        const ang = Math.PI * (3 - Math.sqrt(5)) * i;
        return { home: [Math.cos(ang) * r, y, Math.sin(ang) * r], ring: { o: 0, s: 0.01 }, gather: { k: 0 }, burst: { k: still ? 1 : 0 } };
      }),
      running: false,
      raf: 0,
    };
    st.current = s;

    const frame = () => {
      s.raf = requestAnimationFrame(frame);
      const { plane, radius, phone } = s.dims;
      // spin: velocity with friction, then a smoothed angle applied as world-space yaw/pitch
      s.vel = s.vel.map((v) => v * 0.94);
      s.acc = [s.acc[0] + s.vel[0], s.acc[1] + s.vel[1]];
      const next = [s.smooth[0] + (s.acc[0] - s.smooth[0]) * 0.11, s.smooth[1] + (s.acc[1] - s.smooth[1]) * 0.11];
      const d = [next[0] - s.smooth[0], next[1] - s.smooth[1]];
      s.smooth = next;
      if (d[0]) s.m = mul(rot([0, 1, 0], d[0]), s.m);
      if (d[1]) s.m = mul(rot([1, 0, 0], d[1]), s.m);
      if (s.idle) s.m = mul(rot(TILT, 0.001), s.m);
      s.circleSpin += (s.spinRate * Math.PI) / 180;

      const zi = zoomRef.current;
      const ex = s.expand.k;
      const ringR = (phone ? 0.75 : 1) * 240;
      const visH = stage.clientHeight - s.band.k * 270;
      s.tiles.forEach((t, i) => {
        const el = tilesRef.current[i];
        if (!el) return;
        let [x, y, z] = apply(s.m, t.home).map((v) => v * radius);
        const b = t.burst.k;
        const over = 1 + 0.1 * Math.sin(Math.PI * b);
        // intro: ring -> gathered stack -> burst out to the sphere
        if (b < 1) {
          const a = (-90 + i * 36) * (Math.PI / 180) + s.circleSpin;
          const rx = Math.cos(a) * ringR;
          const ry = Math.sin(a) * ringR;
          const g = t.gather.k;
          const sx = rx * (1 - g);
          const sy = ry * (1 - g);
          const sz = -i * 1.5 * g;
          x = sx + (x * over - sx) * b;
          y = sy + (y * over - sy) * b;
          z = sz + (z * over - sz) * b;
        }
        let scale = b < 1 ? t.ring.s * (1 - b) + b : 1;
        let opacity = b < 1 ? Math.max(t.ring.o, b) : 1;
        // depth cue: tiles at the back are dimmer
        opacity *= 0.45 + 0.55 * ((z / radius + 1) / 2);
        if (zi !== null && ex > 0) {
          if (i === zi) {
            const target = Math.min((visH * 0.7) / (plane * t.aspectH), phone ? (stage.clientWidth - 16) / (plane * t.aspectW) : Infinity);
            x *= 1 - ex;
            y = y * (1 - ex) + (s.band.k * 270) / 2;
            z = z * (1 - ex) + 140 * ex;
            scale += (target - 1) * ex;
            opacity += (1 - opacity) * ex;
          } else {
            x *= 1 + 0.8 * ex;
            y *= 1 + 0.8 * ex;
            opacity *= 1 - 0.9 * ex;
          }
        }
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(-y).toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round(z + 1000));
      });
    };

    // tile sizes follow each image's aspect; the longer side equals the plane size
    const size = () => {
      s.dims = layout(stage.clientWidth);
      items.forEach((it, i) => {
        const t = s.tiles[i];
        const el = tilesRef.current[i];
        const w = it.w >= it.h ? 1 : it.w / it.h;
        const h = it.w >= it.h ? it.h / it.w : 1;
        t.aspectW = w;
        t.aspectH = h;
        if (el) {
          el.style.width = `${s.dims.plane * w}px`;
          el.style.height = `${s.dims.plane * h}px`;
          el.style.marginLeft = `${(-s.dims.plane * w) / 2}px`;
          el.style.marginTop = `${(-s.dims.plane * h) / 2}px`;
        }
      });
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(stage);

    const playIntro = () => {
      if (s.intro !== 'waiting') return;
      s.intro = 'playing';
      const ring = s.tiles.slice(0, 10);
      const tl = gsap.timeline({ onComplete: () => (s.intro = 'done') });
      tl.to(ring.map((t) => t.ring), { o: 1, duration: 1, ease: 'power3.out', stagger: 0.1 }, 0)
        .to(ring.map((t) => t.ring), { s: 0.7, duration: 1, ease: 'back.out(1.7)', stagger: 0.1 }, 0)
        .to(s, { spinRate: 0.5 * 7.3, duration: 1, ease: 'power2.in' }, 1.3)
        .to(ring.map((t) => t.gather), { k: 1, duration: 1.25, ease: 'power2.inOut', stagger: 0.05 }, 3.1)
        .to(s.tiles.map((t) => t.burst), { k: 1, duration: 1, ease: 'power3.out' }, 3.1 + 1.25 + 0.45 + 0.2);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !s.running) {
          s.running = true;
          s.raf = requestAnimationFrame(frame);
          playIntro();
        } else if (!e.isIntersecting && s.running) {
          s.running = false;
          cancelAnimationFrame(s.raf);
        }
      },
      { threshold: 0.25 }
    );
    io.observe(stage);

    // drag to spin; small moves count as clicks
    let last = null;
    let path = 0;
    const down = (e) => {
      if (zoomRef.current !== null) return;
      last = [e.clientX, e.clientY];
      path = 0;
      stage.classList.add('is-grabbing');
    };
    const move = (e) => {
      if (!last) return;
      const dx = e.clientX - last[0];
      const dy = e.clientY - last[1];
      path += Math.abs(dx) + Math.abs(dy);
      last = [e.clientX, e.clientY];
      s.vel[0] += dx * 0.001;
      s.vel[1] += dy * 0.001;
      s.idle = false;
    };
    const up = () => {
      last = null;
      stage.classList.remove('is-grabbing');
    };
    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    s.wasDrag = () => path > 10;

    return () => {
      cancelAnimationFrame(s.raf);
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [items]);

  const open = (i) => {
    const s = st.current;
    if (!s || s.wasDrag() || s.intro === 'playing') return;
    buzz(10);
    if (zoom === null) {
      setZoom(i);
      setOverview(false);
      gsap.to(s.expand, { k: 1, duration: 0.8, ease: 'power4.out' });
    } else if (zoom === i) {
      const showing = !overview;
      setOverview(showing);
      gsap.to(s.band, { k: showing ? 1 : 0, duration: 0.8, ease: 'power4.out' });
    }
  };
  const close = () => {
    const s = st.current;
    setOverview(false);
    gsap.to(s.band, { k: 0, duration: 0.6, ease: 'power4.out' });
    gsap.to(s.expand, { k: 0, duration: 0.8, ease: 'power4.out', onComplete: () => setZoom(null) });
  };
  useEffect(() => {
    if (zoom === null) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const shown = zoom !== null ? items[zoom] : hover !== null ? items[hover] : null;
  return (
    <div className="sphere">
      <div
        className={`sphere-stage${zoom !== null ? ' is-zoomed' : ''}`}
        ref={stageRef}
        data-cursor={zoom === null && !coarsePointer() ? 'drag' : undefined}
        onClick={(e) => zoom !== null && e.target === e.currentTarget && close()}
      >
        <div className="sphere-world">
          {items.map((it, i) => (
            <button
              type="button"
              key={it.title}
              className={`sphere-tile${zoom === i ? ' is-on' : ''}`}
              ref={(el) => (tilesRef.current[i] = el)}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onClick={() => open(i)}
              data-cursor={zoom === i ? (overview ? 'close' : 'overview') : 'open'}
              aria-label={`${it.title}, ${it.category}`}
            >
              <img src={it.src} alt="" loading="lazy" draggable="false" />
            </button>
          ))}
        </div>
      </div>
      <div className="sphere-caption" aria-live="polite">
        {shown && (
          <p key={shown.title}>
            <b>{shown.title}</b> <span>{shown.category}</span>
          </p>
        )}
        {!shown && <p className="sphere-hint">{coarsePointer() ? 'Drag to spin, tap a screen' : 'Drag to spin, click a screen'}</p>}
      </div>
      {zoom !== null && overview && (
        <div className="sphere-overview">
          <div>
            <b>{items[zoom].title}</b> <span>{items[zoom].category}</span>
            <button type="button" className="pill" onClick={close}>
              Close
            </button>
          </div>
          <p>{items[zoom].body}</p>
        </div>
      )}
    </div>
  );
}

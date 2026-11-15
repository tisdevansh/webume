import { memo, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import { AmbientScore } from './engine/ambient';
import { billlion, credits, hero, next, profile, record, sarathi, scenes, skillTree, terminal, vigil } from './content';
import ThrowDeck from './components/ThrowDeck';
import VigilScene from './scenes/Vigil';
import SarathiScene from './scenes/Sarathi';
import { Arrow, buzz, coarsePointer, confetti, idle, prefersReducedMotion, Title, yieldToMain } from './ui';
import './site.css';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, CustomEase, Flip, MotionPathPlugin, DrawSVGPlugin);
// House easings: a fast, soft landing and a weighted in-out for pinned moves
CustomEase.create('dev', 'M0,0 C0.16,0.84 0.3,1 1,1');
CustomEase.create('devInOut', 'M0,0 C0.72,0 0.18,1 1,1');

// The light each scene is lit by
const LIGHT = { intro: '#9db4ff', record: '#ffb454', billlion: '#3ddc97', vigil: '#f2a541', craft: '#8ab4ff', sarathi: '#ff9a3c', next: '#8c7cff', credits: '#ede8df' };

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const goto = (id) => window.dispatchEvent(new CustomEvent('webume:goto', { detail: id }));

// --- Chrome ---

function Loader({ progress, onEnter }) {
  const ready = progress >= 1;
  return (
    <div className="ld" role="dialog" aria-modal="true" aria-labelledby="ld-title">
      <div className="ld-mark">DA</div>
      <p className="ld-title" id="ld-title">
        Devansh Agarwal
      </p>
      <div className="ld-meter" aria-live="polite">
        <span className="ld-count">{Math.round(progress * 100)}</span>
        <span className="ld-bar">
          <i style={{ transform: `scaleX(${progress})` }} />
        </span>
      </div>
      <div className={`ld-actions${ready ? ' is-ready' : ''}`}>
        <button type="button" className="pill pill-solid ld-enter" disabled={!ready} onClick={() => onEnter(true)} data-magnetic>
          Enter with sound
        </button>
        <button type="button" className="pill ld-quiet" disabled={!ready} onClick={() => onEnter(false)}>
          Enter quietly
        </button>
      </div>
      <p className="ld-note">The sound is a quiet ambient score, made live in your browser.</p>
    </div>
  );
}

// Dot + ring cursor that says what a thing does (drag, throw, scratch), and magnetic buttons
function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (coarsePointer() || prefersReducedMotion()) return undefined;
    const root = document.documentElement;
    root.classList.add('has-cursor');
    const rx = gsap.quickTo(ringRef.current, 'x', { duration: 0.4, ease: 'power3' });
    const ry = gsap.quickTo(ringRef.current, 'y', { duration: 0.4, ease: 'power3' });
    const dx = gsap.quickTo(dotRef.current, 'x', { duration: 0.06 });
    const dy = gsap.quickTo(dotRef.current, 'y', { duration: 0.06 });
    let magnet = null;
    let last = '';
    const release = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      magnet = null;
    };
    const onMove = (e) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const t = e.target && e.target.closest ? e.target : null;
      const hint = t && t.closest('[data-cursor]');
      const nextLabel = hint ? hint.dataset.cursor : '';
      if (nextLabel !== last) {
        last = nextLabel;
        setLabel(nextLabel);
      }
      ringRef.current.classList.toggle('is-link', !!(t && t.closest('a, button')) && !hint);
      const m = t && t.closest('[data-magnetic]');
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.38, duration: 0.4, ease: 'power3.out' });
      }
    };
    const down = () => ringRef.current.classList.add('is-down');
    const up = () => ringRef.current.classList.remove('is-down');
    // Scrolling moves the page under a still pointer, so re-read what it is over
    let at = null;
    let queued = false;
    const track = (e) => (at = [e.clientX, e.clientY]);
    const onScroll = () => {
      if (!at || queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const el = document.elementFromPoint(at[0], at[1]);
        const hint = el && el.closest('[data-cursor]');
        const nextLabel = hint ? hint.dataset.cursor : '';
        if (nextLabel !== last) {
          last = nextLabel;
          setLabel(nextLabel);
        }
      });
    };
    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', track);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      root.classList.remove('has-cursor');
    };
  }, []);
  return (
    <>
      <div className={`cur-ring${label ? ' has-label' : ''}`} ref={ringRef} aria-hidden="true">
        <span>{label}</span>
      </div>
      <div className="cur-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}

function Nav({ scene, soundOn, onSound, progressRef }) {
  const label = scenes.find((s) => s.id === scene)?.label || '';
  return (
    <header className="nav">
      <button type="button" className="nav-mark" onClick={() => goto('intro')} aria-label="Back to the top">
        DA
      </button>
      <span className="nav-scene" key={scene} aria-hidden="true">
        {label}
      </span>
      <nav className="nav-links" aria-label="Sections">
        {['billlion', 'vigil', 'sarathi', 'next'].map((id) => (
          <button type="button" key={id} className={scene === id ? 'is-on' : ''} onClick={() => goto(id)}>
            {scenes.find((s) => s.id === id).label}
          </button>
        ))}
      </nav>
      <button type="button" className={`nav-sound${soundOn ? ' is-on' : ''}`} onClick={onSound} aria-pressed={soundOn} aria-label={soundOn ? 'Mute the score' : 'Play the score'}>
        <i />
        <i />
        <i />
        <i />
      </button>
      <button type="button" className="pill pill-solid nav-hi" onClick={() => goto('credits')} data-magnetic>
        Say hi
      </button>
      <span className="nav-progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}

// --- Intro: a name you can grab ---

function Hero() {
  const ref = useRef(null);
  useEffect(() => idle(() => setup(ref.current)), []);
  const setupRef = useRef(null);
  function setup(root) {
    if (!root || setupRef.current) return;
    const draggers = [];
    // Letters stretch away on a rubber band and spring home
    if (!coarsePointer()) {
      draggers.push(
        ...Draggable.create(root.querySelectorAll('.hl'), {
          type: 'x,y',
          onPress() {
            gsap.killTweensOf(this.target);
            gsap.to(this.target, { scale: 1.08, duration: 0.2 });
          },
          onDrag() {
            gsap.set(this.target, { rotation: this.x / 10 });
          },
          onRelease() {
            gsap.to(this.target, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.32)' });
          },
        })
      );
    }
    // Stickers stay wherever they are dropped
    draggers.push(
      ...Draggable.create(root.querySelectorAll('.sticker'), {
        type: 'x,y',
        bounds: root,
        inertia: true,
        onPress() {
          gsap.to(this.target, { scale: 1.12, duration: 0.25, ease: 'back.out(3)' });
          this.target.style.zIndex = 30;
          buzz(10);
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        },
      })
    );
    // Depth: three layers follow the pointer at different distances
    let off = () => {};
    if (!prefersReducedMotion() && !coarsePointer()) {
      const layers = [...root.querySelectorAll('[data-depth]')].map((el) => [
        gsap.quickTo(el, 'xPercent', { duration: 1.2, ease: 'power3' }),
        gsap.quickTo(el, 'yPercent', { duration: 1.2, ease: 'power3' }),
        Number(el.dataset.depth),
      ]);
      const onMove = (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        layers.forEach(([qx, qy, d]) => {
          qx(x * d);
          qy(y * d);
        });
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      off = () => window.removeEventListener('pointermove', onMove);
    }
    setupRef.current = () => {
      off();
      draggers.forEach((d) => d.kill());
    };
  }
  useEffect(() => () => setupRef.current && setupRef.current(), []);

  return (
    <section className="scene sc-intro" id="intro" data-scene="intro" ref={ref}>
      <div className="hero-back" data-depth="-3" aria-hidden="true">
        <span>{profile.last}</span>
      </div>
      <div className="hero-mid" data-depth="1.5">
        <p className="hero-hi voice">{hero.hi}</p>
        <h1 className="hero-name" aria-label={`${profile.first} ${profile.last}`} data-cursor={coarsePointer() ? undefined : 'grab'}>
          {profile.first
            .toUpperCase()
            .split('')
            .map((l, i) => (
              <span className="hl-mask" key={i} aria-hidden="true">
                <span className="hl">{l}</span>
              </span>
            ))}
        </h1>
        <div className="hero-foot">
          <p className="hero-sub">{hero.sub}</p>
          <button type="button" className="pill pill-solid" onClick={() => goto('billlion')} data-magnetic>
            See what I've built
          </button>
        </div>
      </div>
      <div className="hero-front" data-depth="4">
        {hero.stickers.map((s) => (
          <span key={s.text} className={`sticker tone-${s.tone}`} style={{ left: `${s.x}%`, top: `${s.y}%`, '--r': `${s.r}deg` }} data-cursor="drag">
            {s.text}
          </span>
        ))}
      </div>
      <p className="hero-hint">{coarsePointer() ? 'The stickers move. Try one.' : 'Grab a letter. The stickers move too.'}</p>
    </section>
  );
}

function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      {hero.marquee.map((row, i) => (
        <div className={`mq mq-${i}`} key={i}>
          <div className="mq-track">
            {row.concat(row).map((w, j) => (
              <span key={j}>{w}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Record: scratch cards ---

function ScratchCard({ r }) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const valueRef = useRef(null);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);

  const reveal = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    buzz([20, 40, 60]);
    gsap.to(canvasRef.current, { autoAlpha: 0, duration: 0.5 });
    const n = { v: 0 };
    gsap.to(n, { v: r.value, duration: 1.4, ease: 'dev', onUpdate: () => valueRef.current && (valueRef.current.textContent = n.v.toFixed(1)) });
    const b = cardRef.current.getBoundingClientRect();
    confetti(b.left + b.width / 2, b.top + b.height / 2, 40);
  }, [r.value]);

  useEffect(() => {
    let cleanup = () => {};
    const cancel = idle(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, '#2b2a30');
    g.addColorStop(0.5, '#4a4852');
    g.addColorStop(1, '#2b2a30');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let x = -height; x < width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x + height, 0);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(237,232,223,0.8)';
    ctx.font = '600 15px Geist, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(coarsePointer() ? 'Scratch with your finger' : 'Scratch here', width / 2, height / 2 + 5);

    let moves = 0;
    let lastPt = null;
    const scratch = (e) => {
      const b = canvas.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 46;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPt ? lastPt[0] : x, lastPt ? lastPt[1] : y);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPt = [x, y];
      moves += 1;
      if (moves % 8) return;
      // Sample a sparse grid of pixels to see how much is cleared
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 4 * 97) {
        total += 1;
        if (data[i] === 0) clear += 1;
      }
      if (clear / total > 0.35) reveal();
    };
    const down = (e) => {
      lastPt = null;
      scratch(e);
      canvas.addEventListener('pointermove', scratch);
    };
    const up = () => canvas.removeEventListener('pointermove', scratch);
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    cleanup = () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', scratch);
      window.removeEventListener('pointerup', up);
    };
    });
    return () => {
      cancel();
      cleanup();
    };
  }, [reveal]);

  return (
    <article className={`scratch${done ? ' is-done' : ''}`} ref={cardRef}>
      <div className="scratch-under">
        <span className="scratch-grade">{r.grade}</span>
        <span className="scratch-value">
          <b ref={valueRef}>{r.value.toFixed(1)}</b>%
        </span>
        <span className="scratch-meta">
          {r.track}, {r.school}
        </span>
      </div>
      <canvas ref={canvasRef} className="scratch-cover" data-cursor="scratch" aria-hidden="true" />
      {!done && (
        <button type="button" className="sr-only" onClick={reveal}>
          Reveal the {r.grade} result
        </button>
      )}
    </article>
  );
}

function Record() {
  return (
    <section className="scene sc-record" id="record" data-scene="record">
      <div className="wrap rec-grid">
        <div>
          <p className="kicker">School, so far</p>
          <Title as="h2" className="h2" lines={['Two report cards.', 'Scratch them.']} />
          <p className="lede">Board results from Class X and Class XII. They held up.</p>
        </div>
        <div className="scratch-row">
          {record.map((r) => (
            <ScratchCard r={r} key={r.grade} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Billlion: bars that grow, a counter that bills, and the real screens ---

const STOCK = [
  { name: 'Cotton kurta', price: 899, gst: 5 },
  { name: 'Denim jeans', price: 1499, gst: 5 },
  { name: 'Linen shirt', price: 1199, gst: 5 },
  { name: 'Wedding sherwani', price: 8999, gst: 18 },
];

function Counter() {
  const [qty, setQty] = useState({});
  const [billNo, setBillNo] = useState(41);
  const totalRef = useRef(null);
  const shown = useRef(0);
  const lines = STOCK.map((s, i) => ({ ...s, q: qty[i] || 0 })).filter((l) => l.q);
  const sub = lines.reduce((a, l) => a + l.price * l.q, 0);
  const tax = lines.reduce((a, l) => a + (l.price * l.q * l.gst) / 100, 0);
  const total = sub + tax;

  useEffect(() => {
    const n = { v: shown.current };
    const t = gsap.to(n, { v: total, duration: 0.6, ease: 'dev', onUpdate: () => totalRef.current && (totalRef.current.textContent = inr(n.v)) });
    shown.current = total;
    return () => t.kill();
  }, [total]);

  const add = (i, e) => {
    setQty((q) => ({ ...q, [i]: (q[i] || 0) + 1 }));
    buzz(8);
    gsap.fromTo(e.currentTarget, { scale: 0.93 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };
  const fresh = () => {
    setQty({});
    setBillNo((b) => b + 1);
  };

  return (
    <div className="toy toy-counter">
      <div className="toy-copy">
        <h4>Ring up a bill.</h4>
        <p>The counter screen, simplified. Tap products and the GST is worked out for every line.</p>
      </div>
      <div className="ct">
        <div className="ct-items">
          {STOCK.map((s, i) => (
            <button type="button" key={s.name} className="ct-item" onClick={(e) => add(i, e)} data-cursor="add">
              <b>{s.name}</b>
              <span>
                {inr(s.price)}, GST {s.gst}%
              </span>
              {qty[i] ? <i className="ct-q">{qty[i]}</i> : null}
            </button>
          ))}
        </div>
        <div className="ct-bill" aria-live="polite">
          <div className="ct-head">
            <b>Bill {String(billNo).padStart(4, '0')}</b>
            <button type="button" onClick={fresh}>
              New bill
            </button>
          </div>
          {lines.length ? (
            <ul>
              {lines.map((l) => (
                <li key={l.name}>
                  <span>
                    {l.q} × {l.name}
                  </span>
                  <span>{inr(l.price * l.q)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ct-empty">Tap a product to add it.</p>
          )}
          <div className="ct-sum">
            <span>Subtotal</span>
            <span>{inr(sub)}</span>
            <span>GST</span>
            <span>{inr(tax)}</span>
          </div>
          <div className="ct-total">
            <span>Total</span>
            <b ref={totalRef}>₹0</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function Billlion({ onZoom }) {
  const [top, setTop] = useState(billlion.shots[0]);
  return (
    <section className="scene sc-billlion" id="billlion" data-scene="billlion">
      <div className="bl-pin">
        <div className="wrap bl-intro">
          <p className="kicker">My first product</p>
          <h2 className="bl-word" aria-label="Billlion">
            <span className="bl-bi">Bi</span>
            <span className="bl-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="bl-ion">ion</span>
          </h2>
          <p className="bl-pitch">{billlion.pitch}</p>
        </div>
      </div>
      <div className="wrap bl-body">
        <Counter />
        <div className="toy toy-shots">
          <div className="toy-copy">
            <h4 key={top.title} className="swap">
              {top.title}
            </h4>
            <p key={top.body} className="swap">
              {top.body}
            </p>
          </div>
          <ThrowDeck
            className="shot-deck"
            items={billlion.shots}
            onTop={(s) => setTop(s)}
            onOpen={(s) => onZoom(s)}
            hint="throw it, or tap to zoom"
            render={(s) => <img src={s.src} alt={`Billlion: ${s.title}`} width="2000" height="1250" loading="lazy" draggable="false" data-cursor="throw" />}
          />
          <p className="fine">
            {billlion.role}. {billlion.demoNote}
          </p>
        </div>
      </div>
    </section>
  );
}

function Lightbox({ shot, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={shot.title} onClick={onClose}>
      <img src={shot.src} alt={`Billlion: ${shot.title}`} />
      <p>{shot.title}. Tap anywhere to close.</p>
    </div>
  );
}

// --- Craft: a working terminal and a skill board ---

const COMMANDS = {
  help: () => ['try: whoami, ls, cat stack.txt, open vigil, open billlion, open sarathi, open iim, updesh, sudo hire devansh, clear'],
  whoami: () => ['devansh agarwal: builds software, writes stories'],
  ls: () => ['billlion/   vigil/   sarathi/   webume/'],
  'cat stack.txt': () => ['Python, Java, C/C++, JavaScript, Firebase, MongoDB'],
  updesh: () => ['कर्मण्येवाधिकारस्ते मा फलेषु कदाचन', 'do the work. let go of the worry about results. (Gita 2.47)'],
  'sudo hire devansh': () => ['[sudo] permission granted', `write to ${profile.email}`],
  'sudo rm -rf /': () => ['blocked. Mayu is watching.'],
  exit: () => ['there is no exit, only the next scene.'],
};
const TARGETS = { billlion: 'billlion', vigil: 'vigil', sarathi: 'sarathi', iim: 'next', ipmat: 'next', contact: 'credits' };

function Terminal() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState('');
  const [log, setLog] = useState([]);
  const [value, setValue] = useState('');
  const history = useRef([]);
  const cursor = useRef(0);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const rootRef = useRef(null);

  // The scripted session types itself out the first time it scrolls into view
  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(terminal.length);
      return undefined;
    }
    const timers = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let line = 0;
        const typeLine = () => {
          if (line >= terminal.length) return;
          const { text, kind } = terminal[line];
          let n = 0;
          const step = () => {
            n += 1;
            setTyping(text.slice(0, n));
            if (n < text.length) timers.push(setTimeout(step, kind === 'cmd' ? 45 : 8));
            else {
              line += 1;
              setShown(line);
              setTyping('');
              timers.push(setTimeout(typeLine, 260));
            }
          };
          step();
        };
        typeLine();
      },
      { threshold: 0.5 }
    );
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [log, shown]);

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;
    history.current.push(cmd);
    cursor.current = history.current.length;
    if (cmd === 'clear') {
      setLog([]);
      return;
    }
    let out;
    if (cmd.startsWith('open ')) {
      const id = TARGETS[cmd.slice(5)];
      out = id ? [`opening ${cmd.slice(5)}…`] : ['open what? try billlion, vigil, sarathi or iim'];
      if (id) setTimeout(() => goto(id), 450);
    } else out = COMMANDS[cmd] ? COMMANDS[cmd]() : [`command not found: ${cmd}. type help`];
    setLog((l) => l.concat({ kind: 'cmd', text: cmd }, out.map((text) => ({ kind: 'out', text }))).slice(-40));
  };
  const onKey = (e) => {
    if (e.key === 'Enter') {
      run(value);
      setValue('');
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      cursor.current = Math.max(0, Math.min(h.length, cursor.current + (e.key === 'ArrowUp' ? -1 : 1)));
      setValue(h[cursor.current] || '');
    }
  };
  const live = terminal[shown];
  return (
    <div className="term" ref={rootRef} onClick={() => inputRef.current?.focus({ preventScroll: true })} data-cursor="type">
      <div className="term-bar">
        <i />
        <i />
        <i />
        <span>devansh@webume</span>
      </div>
      <div className="term-body" ref={bodyRef} data-lenis-prevent>
        {terminal.slice(0, shown).map((l, i) => (
          <p key={i} className={`term-l ${l.kind}`}>
            {l.text}
          </p>
        ))}
        {live && typing && <p className={`term-l ${live.kind}`}>{typing}</p>}
        {log.map((l, i) => (
          <p key={`l${i}`} className={`term-l ${l.kind}`}>
            {l.text}
          </p>
        ))}
        {shown >= terminal.length && (
          <label className="term-in">
            <span className="sr-only">Type a command</span>
            <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} placeholder="type help" spellCheck="false" autoComplete="off" autoCapitalize="off" />
          </label>
        )}
      </div>
    </div>
  );
}

function SkillBoard() {
  const ref = useRef(null);
  useEffect(() => {
    if (coarsePointer()) return undefined;
    let ds = [];
    const cancel = idle(() => {
      ds = Draggable.create(ref.current.querySelectorAll('.chip'), {
      type: 'x,y',
      bounds: ref.current,
      inertia: true,
      onPress() {
        gsap.to(this.target, { scale: 1.1, duration: 0.2 });
      },
      onRelease() {
        gsap.to(this.target, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      },
      });
    });
    return () => {
      cancel();
      ds.forEach((d) => d.kill());
    };
  }, []);
  return (
    <div className="board" ref={ref}>
      {skillTree.branches.map((b) => (
        <div className="board-group" key={b.title}>
          <h4>
            {b.title} <span>{b.note}</span>
          </h4>
          <ul>
            {b.items.map((s) => (
              <li className="chip" key={s} data-cursor={coarsePointer() ? undefined : 'drag'}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="board-lang">Speaks {skillTree.languages.replace(' · ', ' and ')}.</p>
    </div>
  );
}

function Craft() {
  return (
    <section className="scene sc-craft" id="craft" data-scene="craft">
      <div className="wrap">
        <div className="craft-head">
          <div>
            <p className="kicker">How I work</p>
            <Title as="h2" className="h2" lines={['Code is just', 'another script.']} />
          </div>
          <p className="lede">Billlion taught me that good software is a story told in logic. Every screen is a scene, and every function has to earn its place. The terminal below is real.</p>
        </div>
        <div className="craft-grid">
          <Terminal />
          <SkillBoard />
        </div>
      </div>
    </section>
  );
}

// --- IIM: a flight path you scroll along, and a boarding pass ---

const FLIGHT = 'M40,300 C200,300 230,120 400,150 C560,178 610,250 720,190 C820,135 860,70 960,70';

function BoardingPass() {
  const [printed, setPrinted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!printed) return;
    buzz([10, 30, 10, 30, 10]);
    gsap
      .timeline()
      .fromTo(ref.current, { yPercent: -101 }, { yPercent: 0, duration: 1.6, ease: 'steps(14)' })
      .to(ref.current, { rotation: -1.5, duration: 0.25, ease: 'power2.out' })
      .to(ref.current, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
  }, [printed]);
  return (
    <div className="bp-wrap">
      <button type="button" className="pill" onClick={() => setPrinted(true)} disabled={printed} data-magnetic>
        {printed ? 'Printed. See you at Indore.' : 'Print my boarding pass'}
      </button>
      <div className="bp-slot">
        {printed && (
          <div className="bp" ref={ref}>
            <div className="bp-main">
              <small>Passenger</small>
              <b>
                {profile.first} {profile.last}
              </b>
              <div className="bp-route">
                <div>
                  <small>From</small>
                  <strong>XII</strong>
                </div>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
                </svg>
                <div>
                  <small>To</small>
                  <strong>IIM</strong>
                </div>
              </div>
              <div className="bp-grid">
                <div>
                  <small>Flight</small>
                  <b>IPMAT 27</b>
                </div>
                <div>
                  <small>Gate</small>
                  <b>QA VA LR</b>
                </div>
                <div>
                  <small>Seat</small>
                  <b>IPM, 5 yr</b>
                </div>
              </div>
            </div>
            <div className="bp-stub" aria-hidden="true">
              <small>Boarding</small>
              <b>2027</b>
              <div className="bp-code">
                {Array.from({ length: 24 }, (_, i) => (
                  <i key={i} style={{ width: `${1 + ((i * 7) % 4)}px` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const STOPS = [
  [40, 300, 'Class XII', 'Science, PCM', 'start', -50],
  [400, 150, 'IPMAT 2027', 'QA, VA, LR', 'middle', -50],
  [960, 70, 'IIM Indore', '5-year IPM', 'end', 44],
];

function Next() {
  return (
    <section className="scene sc-next" id="next" data-scene="next">
      <div className="fl-pin">
        <div className="wrap fl-wrap">
          <div className="fl-copy">
            <p className="kicker">What's next</p>
            <Title as="h2" className="h2" lines={['Next stop:', 'IIM Indore.']} />
            <p className="lede">{next.line}</p>
          </div>
          <svg className="fl-map" viewBox="0 0 1000 360" aria-hidden="true">
            <path className="fl-guide" d={FLIGHT} />
            <path className="fl-path" d={FLIGHT} />
            {STOPS.map(([x, y, a, b, anchor, dy], i) => (
              <g className={`fl-stop fl-stop-${i}`} key={a} transform={`translate(${x} ${y})`}>
                <circle r="9" />
                <text y={dy} textAnchor={anchor}>
                  {a}
                </text>
                <text className="fl-sub" y={dy + 22} textAnchor={anchor}>
                  {b}
                </text>
              </g>
            ))}
            <g className="fl-plane">
              <path d="M-14,-4 L10,0 L-14,4 L-9,0 Z M-6,-1 L-12,-11 L-8,-11 L2,-1 Z M-6,1 L-12,11 L-8,11 L2,1 Z" />
            </g>
          </svg>
        </div>
      </div>
      <div className="wrap fl-after">
        <ol className="targets">
          {next.targets.map((t) => (
            <li key={t.name} className={t.tag ? 'is-primary' : ''}>
              <b>{t.name}</b>
              {t.tag && <span>{t.tag}</span>}
            </li>
          ))}
        </ol>
        <BoardingPass />
      </div>
    </section>
  );
}

// --- Credits: one question, a dodging no, and a replay ---

const NO = ['No', 'Are you sure?', 'Really?', 'Okay, yes'];

function Credits({ onReplay }) {
  const [said, setSaid] = useState(false);
  const [tries, setTries] = useState(0);
  const zoneRef = useRef(null);
  const noRef = useRef(null);
  const dodge = () => {
    if (tries >= NO.length - 1) return;
    const z = zoneRef.current.getBoundingClientRect();
    const b = noRef.current;
    gsap.to(b, {
      x: (Math.random() - 0.5) * Math.max(0, z.width - b.offsetWidth * 2),
      y: (Math.random() - 0.5) * 80,
      rotation: (Math.random() - 0.5) * 14,
      duration: 0.4,
      ease: 'back.out(2.4)',
    });
    buzz(12);
    setTries((t) => t + 1);
  };
  const yes = (e) => {
    setSaid(true);
    buzz([20, 40, 80]);
    const b = e.currentTarget.getBoundingClientRect();
    confetti(b.left + b.width / 2, b.top, 90);
  };
  return (
    <section className="scene sc-credits" id="credits" data-scene="credits">
      <div className="wrap">
        {!said ? (
          <div className="ask">
            <Title as="h2" className="h2 ask-q" lines={['So, should we build', 'something together?']} />
            <div className="ask-zone" ref={zoneRef}>
              <button type="button" className="pill pill-solid ask-yes" onClick={yes} data-magnetic>
                Yes, let's talk
              </button>
              <button
                type="button"
                ref={noRef}
                className="pill ask-no"
                onPointerEnter={(e) => e.pointerType === 'mouse' && dodge()}
                onClick={(e) => (tries >= NO.length - 1 ? yes(e) : dodge())}
              >
                {NO[tries]}
              </button>
            </div>
          </div>
        ) : (
          <div className="ask">
            <h2 className="h2">Good answer. Write to me.</h2>
          </div>
        )}
        <div className={`contact${said ? ' is-lit' : ''}`}>
          <a className="contact-mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="contact-links">
            <a className="pill" href={profile.linkedin} target="_blank" rel="noopener noreferrer" data-magnetic>
              LinkedIn <Arrow />
            </a>
            <a className="pill" href={profile.linktree} target="_blank" rel="noopener noreferrer" data-magnetic>
              All my links <Arrow />
            </a>
          </div>
        </div>
        <dl className="roll">
          {credits.map(([role, name]) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{name}</dd>
            </div>
          ))}
        </dl>
        <div className="end">
          <button type="button" className="pill" onClick={onReplay} data-magnetic>
            Replay from the top
          </button>
          <p>
            © {new Date().getFullYear()} {profile.first} {profile.last}
          </p>
        </div>
      </div>
    </section>
  );
}

const Page = memo(function Page({ onZoom, onReplay }) {
  return (
    <main>
      <Hero />
      <Marquee />
      <Record />
      <Billlion onZoom={onZoom} />
      <VigilScene />
      <Craft />
      <SarathiScene />
      <Next />
      <Credits onReplay={onReplay} />
    </main>
  );
});

// --- Motion ---

// Pinned scenes change the page height, so they are built up front; every other scene builds its
// choreography only as it nears the screen, which spreads the setup cost across the scroll.
const titles = (scope) =>
  scope.querySelectorAll('.title, .vg-word, .sr-name').forEach((t) => {
    gsap.from(t.querySelectorAll('.mask-in'), { yPercent: 108, rotation: 3, duration: 1.1, stagger: 0.09, ease: 'dev', scrollTrigger: { trigger: t, start: 'top 85%' } });
  });

const pinnedMotion = (desktop) => [
  () => {
    // The hero leaves by scattering its letters upward at different speeds
    gsap.to('.hl-mask', {
      yPercent: (i) => -50 - ((i * 37) % 70),
      rotation: (i) => (i % 2 ? 1 : -1) * (6 + ((i * 13) % 12)),
      ease: 'none',
      scrollTrigger: { trigger: '.sc-intro', start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('.hero-back span', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.sc-intro', start: 'top top', end: 'bottom top', scrub: true } });
  },
  () => {
    // Billlion: the three L's are stock bars that fill as the scene pins
    const bars = gsap.utils.toArray('.bl-bars i');
    if (desktop) {
      gsap
        .timeline({ scrollTrigger: { trigger: '.bl-pin', start: 'top top', end: '+=110%', pin: true, scrub: 0.6 } })
        .fromTo(bars, { scaleY: 0.32 }, { scaleY: (i) => [0.78, 1, 0.9][i], stagger: 0.12, duration: 1, ease: 'devInOut' })
        .fromTo('.bl-bi', { xPercent: 18 }, { xPercent: 0, duration: 1, ease: 'devInOut' }, 0)
        .fromTo('.bl-ion', { xPercent: -18 }, { xPercent: 0, duration: 1, ease: 'devInOut' }, 0)
        .from('.bl-pitch', { y: 30, opacity: 0, duration: 0.6, ease: 'dev' }, 0.5)
        .to('.bl-intro', { scale: 0.94, opacity: 0, duration: 0.6, ease: 'devInOut' }, 1.6);
    } else {
      gsap.fromTo(bars, { scaleY: 0.32 }, { scaleY: (i) => [0.78, 1, 0.9][i], stagger: 0.12, duration: 1.2, ease: 'elastic.out(1, 0.6)', scrollTrigger: { trigger: '.bl-word', start: 'top 80%' } });
    }
  },
  () => {
    // IIM: the route draws itself and the plane flies it as you scroll
    gsap
      .timeline({
        scrollTrigger: desktop ? { trigger: '.fl-pin', start: 'top top', end: '+=140%', pin: true, scrub: 0.8 } : { trigger: '.fl-map', start: 'top 85%', end: 'bottom 40%', scrub: 0.8 },
      })
      .fromTo('.fl-path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 3, ease: 'none' }, 0)
      .to('.fl-plane', { motionPath: { path: '.fl-path', align: '.fl-path', alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 3, ease: 'none' }, 0)
      .from('.fl-stop-0', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, 0)
      .from('.fl-stop-1', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, 1.15)
      .from('.fl-stop-2', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, 2.75);
  },
];

const sceneMotion = (desktop) => ({
  record: (el) => {
    titles(el);
    gsap.from('.scratch', { y: 80, rotation: (i) => (i ? 6 : -6), duration: 1, stagger: 0.12, ease: 'dev', scrollTrigger: { trigger: '.scratch-row', start: 'top 85%' } });
  },
  billlion: () => {
    gsap.from('.sc-billlion .toy', { y: 70, duration: 1, stagger: 0.1, ease: 'dev', scrollTrigger: { trigger: '.bl-body', start: 'top 85%' } });
  },
  vigil: (el) => {
    titles(el);
    // Mayu lands and fans out; the promo tilts up off the floor
    gsap
      .timeline({ scrollTrigger: { trigger: '.vg-hero', start: 'top 70%' } })
      .from('.vg-mayu', { y: 140, scale: 0.4, duration: 1, ease: 'elastic.out(1, 0.55)' })
      .fromTo('.vg-mayu .pk-feather', { rotation: 0, svgOrigin: '60 76' }, { rotation: (i, f) => Number(f.dataset.a), svgOrigin: '60 76', duration: 0.9, stagger: 0.035, ease: 'back.out(2)' }, 0.25);
    gsap.fromTo('.vg-promo', { rotationX: desktop ? 24 : 10, scale: 0.88 }, { rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.vg-promo', start: 'top bottom', end: 'top 35%', scrub: true } });
    gsap.from('.vg-toys .toy', { y: 80, rotation: (i) => (i ? 3 : -3), duration: 1, stagger: 0.12, ease: 'dev', scrollTrigger: { trigger: '.vg-toys', start: 'top 85%' } });
    gsap.from('.vg-shot', { x: 120, duration: 1, stagger: 0.06, ease: 'dev', scrollTrigger: { trigger: '.vg-screens', start: 'top 90%' } });
  },
  craft: (el) => {
    titles(el);
    gsap.from('.term', { rotationY: desktop ? -16 : 0, y: 60, duration: 1.1, ease: 'dev', scrollTrigger: { trigger: '.craft-grid', start: 'top 85%' } });
    gsap.from('.board .chip', { y: -40, opacity: 0, duration: 0.7, stagger: 0.025, ease: 'back.out(2.4)', scrollTrigger: { trigger: '.board', start: 'top 80%' } });
  },
  sarathi: (el) => {
    titles(el);
    gsap.fromTo('.sr-player', { y: 80, rotation: 2 }, { y: -30, rotation: 0, ease: 'none', scrollTrigger: { trigger: '.sr-top', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.from('.sr-deva', { yPercent: 60, opacity: 0, duration: 1.2, ease: 'dev', scrollTrigger: { trigger: '.sr-name', start: 'top 85%' } });
    gsap.from('.sr-toys .toy', { y: 80, duration: 1, stagger: 0.12, ease: 'dev', scrollTrigger: { trigger: '.sr-toys', start: 'top 85%' } });
  },
  next: (el) => {
    titles(el);
    gsap.from('.targets li', { x: -40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'dev', scrollTrigger: { trigger: '.targets', start: 'top 85%' } });
  },
  credits: (el) => {
    titles(el);
    gsap.from('.roll > div', { y: 30, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'dev', scrollTrigger: { trigger: '.roll', start: 'top 85%' } });
  },
});

// --- App ---

export default function App() {
  const rootRef = useRef(null);
  const scoreRef = useRef(null);
  const lenisRef = useRef(null);
  const progressRef = useRef(null);
  const enteredRef = useRef(false);
  const [entered, setEntered] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [scene, setScene] = useState('intro');
  const [zoom, setZoom] = useState(null);

  if (!scoreRef.current) scoreRef.current = new AmbientScore();

  // Preload the first images and the fonts behind the loader
  useEffect(() => {
    const urls = [billlion.shots[0].src, vigil.poster, sarathi.image];
    const total = urls.length + 1;
    let done = 0;
    let alive = true;
    const tick = () => {
      done += 1;
      if (alive) setLoaded(done / total);
    };
    urls.forEach((u) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = u;
    });
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]).then(tick);
    const cap = setTimeout(() => alive && setLoaded(1), 5000);
    return () => {
      alive = false;
      clearTimeout(cap);
    };
  }, []);

  // Smooth scroll, jumps between scenes, the score
  useEffect(() => {
    const root = document.documentElement;
    const score = scoreRef.current;
    root.classList.add('is-locked');
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    let lenis = null;
    const raf = (t) => lenis.raf(t * 1000);
    if (!prefersReducedMotion()) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.stop();
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }
    const onGoto = (e) => {
      const el = document.getElementById(e.detail);
      if (!el) return;
      if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else el.scrollIntoView({ behavior: 'smooth' });
    };
    const onVis = () => score.setHidden(document.hidden);
    window.addEventListener('webume:goto', onGoto);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('webume:goto', onGoto);
      document.removeEventListener('visibilitychange', onVis);
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
      }
      lenisRef.current = null;
      score.stop();
      root.classList.remove('is-locked');
    };
  }, []);

  // Scroll choreography is built in short slices once fonts are in, so no single task blocks the page
  useEffect(() => {
    const ctx = gsap.context(() => {}, rootRef);
    const desktop = window.matchMedia('(min-width: 900px)').matches;
    let alive = true;
    let lazyIO = null;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)));
    document.querySelectorAll('.marquee').forEach((m) => io.observe(m));
    (async () => {
      await Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
      if (!prefersReducedMotion()) {
        for (const step of pinnedMotion(desktop)) {
          await yieldToMain();
          if (!alive) return;
          ctx.add(step);
        }
        const lazy = sceneMotion(desktop);
        lazyIO = new IntersectionObserver(
          (es) =>
            es.forEach((e) => {
              const run = e.isIntersecting && lazy[e.target.dataset.scene];
              if (!run) return;
              lazyIO.unobserve(e.target);
              delete lazy[e.target.dataset.scene];
              ctx.add(() => run(e.target));
            }),
          { rootMargin: '120% 0px' }
        );
        document.querySelectorAll('[data-scene]').forEach((el) => lazyIO.observe(el));
      }
      await yieldToMain();
      if (!alive) return;
      ctx.add(() => {
        // Which scene is on screen sets the light, the nav label and the score's chord
        gsap.utils.toArray('[data-scene]').forEach((el, i) =>
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (!self.isActive) return;
              const id = el.dataset.scene;
              setScene(id);
              document.documentElement.style.setProperty('--light', LIGHT[id]);
              scoreRef.current.setScene(i);
            },
          })
        );
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
          },
        });
      });
      ScrollTrigger.refresh();
    })();
    // Crossing the desktop breakpoint rebuilds the choreography for the new layout
    const mq = window.matchMedia('(min-width: 900px)');
    const onBreak = () => window.location.reload();
    mq.addEventListener?.('change', onBreak);
    return () => {
      alive = false;
      lazyIO?.disconnect();
      mq.removeEventListener?.('change', onBreak);
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const playIntro = useCallback(() => {
    if (prefersReducedMotion()) return;
    gsap
      .timeline()
      .fromTo('.hl', { yPercent: 115 }, { yPercent: 0, duration: 1.3, stagger: 0.06, ease: 'dev' }, 0)
      .fromTo('.hero-hi, .hero-foot', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'dev' }, 0.35)
      .fromTo('.hero-back span', { opacity: 0 }, { opacity: 1, duration: 1.6 }, 0.2)
      .fromTo('.sticker', { scale: 0, rotation: 0 }, { scale: 1, rotation: (i, el) => parseFloat(el.style.getPropertyValue('--r')), duration: 0.9, stagger: 0.08, ease: 'elastic.out(1, 0.5)' }, 0.7)
      .fromTo('.hero-hint, .marquee', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2);
  }, []);

  const enter = (withSound) => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    if (withSound) {
      scoreRef.current.start();
      setSoundOn(true);
    }
    buzz(15);
    document.documentElement.classList.add('is-entering');
    const finish = () => {
      setEntered(true);
      document.documentElement.classList.remove('is-locked');
      lenisRef.current?.start();
      ScrollTrigger.refresh();
    };
    // The loader's mark flies into the nav, then the curtain lifts
    const from = document.querySelector('.ld-mark');
    const to = document.querySelector('.nav-mark');
    if (prefersReducedMotion() || !from || !to) {
      gsap.timeline({ onComplete: finish }).to('.ld', { opacity: 0, duration: 0.3 }).set('.nav', { opacity: 1 });
      return;
    }
    gsap
      .timeline({ onComplete: finish })
      .add(Flip.fit(from, to, { duration: 0.9, ease: 'devInOut' }), 0)
      .to('.ld > :not(.ld-mark)', { opacity: 0, y: -20, duration: 0.4, stagger: 0.04 }, 0)
      .to('.ld', { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'devInOut' }, 0.6)
      .to('.nav', { opacity: 1, duration: 0.5 }, 0.8)
      .call(playIntro, [], 0.75);
  };

  const toggleSound = () => {
    const score = scoreRef.current;
    if (soundOn) {
      score.setMuted(true);
      setSoundOn(false);
    } else {
      score.start();
      score.setMuted(false);
      setSoundOn(true);
    }
  };

  const replay = useCallback(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 2, onComplete: playIntro });
    else {
      window.scrollTo({ top: 0 });
      playIntro();
    }
  }, [playIntro]);

  return (
    <div ref={rootRef} className={`site${entered ? ' is-in' : ''}`}>
      <div className="light" aria-hidden="true" />
      <Nav scene={scene} soundOn={soundOn} onSound={toggleSound} progressRef={progressRef} />
      <Page onZoom={setZoom} onReplay={replay} />
      {zoom && <Lightbox shot={zoom} onClose={() => setZoom(null)} />}
      {!entered && <Loader progress={loaded} onEnter={enter} />}
      <Cursor />
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { AmbientScore } from './engine/ambient';
import { GATE_SHAPE, ParticleStage } from './engine/particles';
import { billlion, credits, next, profile, record, scenes, skillTree, stories, terminal } from './content';
import './site.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Length shown on the timeline. Purely for the "watching a film" feel.
const RUNTIME = 210;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');
const formatTime = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

// --- Small pieces ---

function Line({ children, serif = false }) {
  return (
    <span className="mask">
      <span className={serif ? 'serif' : undefined}>{children}</span>
    </span>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function Eyebrow({ index, children }) {
  return (
    <p className="eyebrow">
      <span>Scene {pad(index)}</span>
      <span>{children}</span>
    </p>
  );
}

// A giant outlined word drifting behind a scene; the outer layer follows the pointer
function BgWord({ children, depth = 24 }) {
  return (
    <div className="bg-layer layer" style={{ '--depth': depth }} aria-hidden="true">
      <span className="bg-word">{children}</span>
    </div>
  );
}

// Cards light up where the pointer is
const spotlight = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

// Position of el's box inside ancestor, ignoring transforms (so mid-animation offsets don't skew it)
function offsetWithin(el, ancestor) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// --- Chrome: gate, cursor, atmosphere, toast and the player-style HUD ---

function Gate({ progress, onEnter }) {
  const ready = progress >= 1;
  return (
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-name">
      <div className="gate-inner">
        <p className="gate-kicker">A webume in seven scenes</p>
        <p className="gate-name" id="gate-name">
          {profile.first} <span className="serif">{profile.last}</span>
        </p>
        <div className="gate-load" aria-live="polite">
          <span className="gate-bar">
            <i style={{ transform: `scaleX(${progress})` }} />
          </span>
          <span>{ready ? 'Ready' : `Loading ${Math.round(progress * 100)}%`}</span>
        </div>
        <div className={`gate-actions${ready ? ' is-ready' : ''}`}>
          <button type="button" className="btn btn-primary btn-play" onClick={onEnter} disabled={!ready} data-magnetic>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
            Play
          </button>
        </div>
        <p className="gate-hint">Sound on: a calm ambient score, generated live in your browser</p>
      </div>
    </div>
  );
}

// Custom cursor, magnetic buttons and the pointer position (--px / --py) that every depth layer reads
function PointerFX() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const p = { x: 0, y: 0 };
    const write = () => {
      root.style.setProperty('--px', p.x.toFixed(3));
      root.style.setProperty('--py', p.y.toFixed(3));
    };
    const toPx = gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3', onUpdate: write });
    const toPy = gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3', onUpdate: write });

    const fine = window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion();
    const ring = ringRef.current;
    const dot = dotRef.current;
    const ringX = fine && gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = fine && gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    const dotX = fine && gsap.quickTo(dot, 'x', { duration: 0.08 });
    const dotY = fine && gsap.quickTo(dot, 'y', { duration: 0.08 });
    if (fine) root.classList.add('has-cursor');

    let magnet = null;
    const release = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      magnet = null;
    };

    const onMove = (e) => {
      toPx((e.clientX / window.innerWidth) * 2 - 1);
      toPy((e.clientY / window.innerHeight) * 2 - 1);
      if (!fine) return;
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
      const hit = e.target.closest && e.target.closest('a, button');
      ring.classList.toggle('is-hover', !!hit);
      const m = e.target.closest && e.target.closest('[data-magnetic]');
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power3.out' });
      }
    };
    const onDown = () => fine && ring.classList.add('is-down');
    const onUp = () => fine && ring.classList.remove('is-down');
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      root.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  );
}

// Light behind everything and soft bokeh in front of it: the two outer depth planes
function Atmosphere() {
  const bokeh = [
    [8, 22, 18, 0.9],
    [86, 14, 34, 1.6],
    [72, 68, 12, 0.7],
    [18, 80, 46, 2.2],
    [46, 40, 8, 0.5],
    [92, 52, 22, 1.2],
    [34, 8, 14, 1.0],
  ];
  return (
    <>
      <div className="aura" aria-hidden="true">
        <span className="layer" style={{ '--depth': -40 }}>
          <i className="aura-a" />
        </span>
        <span className="layer" style={{ '--depth': 30 }}>
          <i className="aura-b" />
        </span>
      </div>
      <div className="bokeh" aria-hidden="true">
        {bokeh.map(([x, y, size, speed], i) => (
          <span key={i} className="layer" style={{ '--depth': size * 1.5 }}>
            <i style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, '--speed': speed, filter: `blur(${size / 6}px)` }} />
          </span>
        ))}
      </div>
    </>
  );
}

// "New area" style toast whenever a scene starts
function SceneToast({ scene, live }) {
  const ref = useRef(null);
  const first = useRef(true);
  useEffect(() => {
    if (!live) return undefined;
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const tl = gsap
      .timeline()
      .set(el, { autoAlpha: 1 })
      .fromTo(el.querySelector('.toast-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' })
      .fromTo(el.querySelectorAll('.toast-text > *'), { yPercent: 110 }, { yPercent: 0, stagger: 0.07, duration: 0.6, ease: 'expo.out' }, 0.1)
      .to(el, { autoAlpha: 0, duration: 0.5 }, 1.8);
    return () => tl.kill();
  }, [scene, live]);
  return (
    <div className="toast" ref={ref} aria-hidden="true">
      <span className="toast-line" />
      <div className="toast-text">
        <span>Scene {pad(scene + 1)}</span>
        <strong>{scenes[scene].label}</strong>
      </div>
    </div>
  );
}

function Hud({ soundOn, onToggleSound, scene, ticks, onJump, fillRef, timeRef }) {
  return (
    <>
      <header className="hud hud-top">
        <a
          className="mark"
          href="#intro"
          onClick={(e) => {
            e.preventDefault();
            onJump(0);
          }}
        >
          <b>DA</b>
          <span>
            {profile.first} {profile.last}
          </span>
        </a>
        <button type="button" className={`sound${soundOn ? ' is-on' : ''}`} onClick={onToggleSound} aria-pressed={soundOn} data-magnetic>
          <span className="sound-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
        </button>
      </header>

      <nav className="hud hud-bottom" aria-label="Scenes">
        <span className="timecode">
          <span ref={timeRef}>00:00</span> / {formatTime(RUNTIME)}
        </span>
        <div className="timeline">
          <span className="timeline-track" />
          <span className="timeline-fill" ref={fillRef} />
          {ticks.map((t, i) => (
            <button
              key={scenes[i].id}
              type="button"
              className={`timeline-tick${i <= scene ? ' is-past' : ''}`}
              style={{ left: `${t.pos * 100}%` }}
              onClick={() => onJump(i)}
              aria-label={`Scene ${i + 1}: ${scenes[i].label}`}
            >
              <span aria-hidden="true">{scenes[i].label}</span>
            </button>
          ))}
        </div>
        <span className="scene-label">
          {pad(scene + 1)} · {scenes[scene].label}
        </span>
      </nav>
    </>
  );
}

// --- Scenes ---

function Hero() {
  return (
    <section className="scene s-hero" id="intro">
      <div className="shape-anchor hero-anchor">
        <span className="hero-fallback">{profile.first}</span>
      </div>
      <div className="hero-copy">
        <h1 className="hero-title">
          <span className="sr-only">{profile.first} </span>
          <span className="serif">{profile.last}</span>
        </h1>
        <p className="hero-tag">{profile.tagline}</p>
      </div>
      <div className="hero-cue">
        <span>
          Scroll to play <i />
        </span>
      </div>
    </section>
  );
}

function Record() {
  return (
    <section className="scene s-record" id="record">
      <BgWord>RECORD</BgWord>
      <div className="split">
        <div className="split-copy">
          <Eyebrow index={2}>The record</Eyebrow>
          <h2 className="display">
            <Line>Numbers that</Line>
            <Line serif>held up.</Line>
          </h2>
          <div className="stats">
            {record.map((r) => (
              <div className="stat" key={r.grade}>
                <div className="stat-value">
                  <span data-count={r.value} data-decimals="1">
                    {r.value.toFixed(1)}
                  </span>
                  <small>%</small>
                </div>
                <div className="stat-meter">
                  <i style={{ '--v': r.value / 100 }} />
                </div>
                <p className="stat-meta">
                  <b>{r.grade}</b> · {r.track}
                  <br />
                  {r.school}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="shape-anchor split-visual" />
      </div>
    </section>
  );
}

function Billlion() {
  return (
    <section className="scene s-billlion" id="billlion">
      <BgWord depth={18}>BILLLION</BgWord>
      <div className="shape-anchor bl-anchor" />
      <div className="bl-head">
        <Eyebrow index={3}>The product</Eyebrow>
        <h2 className="bl-word">
          Bi<span>lll</span>ion
        </h2>
        <p className="bl-pitch">{billlion.pitch}</p>
        <p className="bl-layers serif">{billlion.layersLine}</p>
      </div>

      <div className="bl-caps" aria-hidden="true">
        {billlion.shots.map((s, i) => (
          <div className="bl-cap" key={s.title}>
            <span>
              {pad(i + 1)} / {pad(billlion.shots.length)}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      <div className="bl-stage">
        <div className="bl-tilt">
          <div className="bl-stack">
            {billlion.shots.map((s) => (
              <figure className="bl-shot" key={s.title} onPointerMove={spotlight}>
                <img src={s.src} alt={`Billlion: ${s.title}`} loading="lazy" width="2000" height="1250" />
                <figcaption>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <p className="bl-role">
        {billlion.role}
        <span>{billlion.demoNote}</span>
      </p>
    </section>
  );
}

function SkillTree() {
  const boardRef = useRef(null);

  // Curves from the core to each branch's node, recomputed whenever the board changes size
  useEffect(() => {
    const board = boardRef.current;
    const draw = () => {
      const svg = board.querySelector('.tree-lines');
      const core = offsetWithin(board.querySelector('.tree-core'), board);
      svg.setAttribute('viewBox', `0 0 ${board.offsetWidth} ${board.offsetHeight}`);
      const paths = svg.querySelectorAll('path');
      board.querySelectorAll('.tree-dot').forEach((dot, i) => {
        const d = offsetWithin(dot, board);
        const hx = d.x + d.w / 2;
        const hy = d.y + d.h / 2;
        const left = hx < core.x + core.w / 2;
        const cx = left ? core.x : core.x + core.w;
        const cy = core.y + core.h / 2;
        const mx = (cx + hx) / 2;
        paths[i].setAttribute('d', `M${cx},${cy} C${mx},${cy} ${mx},${hy} ${hx},${hy}`);
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(board);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="tree" data-dim>
      <h3 className="h3">
        The skill tree. <span className="serif">Built branch by branch.</span>
      </h3>
      <div className="tree-board" ref={boardRef}>
        <svg className="tree-lines" aria-hidden="true">
          {skillTree.branches.map((b) => (
            <path key={b.title} pathLength="1" />
          ))}
        </svg>
        <div className="tree-core">
          <span className="tree-ring" aria-hidden="true" />
          <b className="serif">DA</b>
          <span className="tree-core-label">Languages</span>
          <span className="tree-core-value">{skillTree.languages}</span>
        </div>
        {skillTree.branches.map((b, i) => (
          <article className={`tree-branch tree-branch-${i}`} key={b.title} onPointerMove={spotlight}>
            <header className="tree-head">
              <i className="tree-dot" aria-hidden="true" />
              <span>{pad(i + 1)}</span>
              <h4>{b.title}</h4>
              <em>{b.note}</em>
            </header>
            <ul className="chips">
              {b.items.map((s) => (
                <li className="chip" key={s}>
                  {s}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function Craft() {
  const [build, lead, speak, create] = skillTree.branches;
  const marquee = [build.items.concat(lead.items), speak.items.concat(create.items)];
  return (
    <section className="scene s-craft" id="craft">
      <div className="craft-pin">
        <BgWord>CRAFT</BgWord>
        <div className="split">
          <div className="split-copy">
            <Eyebrow index={4}>The craft</Eyebrow>
            <h2 className="display">
              <Line>Code is just</Line>
              <Line serif>another script.</Line>
            </h2>
            <p className="lede">
              Billlion taught me that good software is a story told in logic. Every screen is a scene, and every function has to earn its place.
            </p>
          </div>
          <div className="craft-visual">
            <div className="shape-anchor craft-anchor" />
            <div className="terminal">
              <div className="term-bar">
                <i />
                <i />
                <i />
                <span>~/devansh</span>
              </div>
              <div className="term-body">
                {terminal.map((l, i) => (
                  <p key={i} className={`term-line ${l.kind}`} data-text={l.text}>
                    {l.text}
                  </p>
                ))}
                <span className="term-cursor" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        {marquee.map((items, row) => (
          <div className="marquee-row" key={row}>
            <div className="marquee-track">
              {items.concat(items).map((s, i) => (
                <span className="marquee-item" key={i}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SkillTree />
    </section>
  );
}

function Stories() {
  return (
    <section className="scene s-stories" id="stories">
      <div className="st-pin">
        <div className="shape-anchor st-anchor" />
        <div className="st-intro">
          <Eyebrow index={5}>The stories</Eyebrow>
          <h2 className="display">
            <Line>Some ideas</Line>
            <Line serif>deserve a screen.</Line>
          </h2>
        </div>
        <figure className="st-frame">
          <img src={stories.image} alt={stories.imageAlt} />
          <div className="st-bars" aria-hidden="true">
            <i />
            <i />
          </div>
          <div className="st-tag">
            <span>Now developing</span>
            <strong>{stories.title}</strong>
          </div>
          <figcaption className="st-captions">
            {stories.captions.map((c) => (
              <span className="st-cap" key={c}>
                {c}
              </span>
            ))}
          </figcaption>
        </figure>
      </div>

      <div className="room" data-dim>
        <div className="room-head">
          <h3 className="h3">
            Short films, <span className="serif">in the making.</span>
          </h3>
          <p className="lede">It started with poetry and creative writing. Script writing is the next chapter, and it already has a pipeline.</p>
        </div>
        <ol className="room-steps">
          {stories.pipeline.map((s, i) => (
            <li className="step" key={s.title} onPointerMove={spotlight}>
              <div className="step-top">
                <span>{pad(i + 1)}</span>
                <span className={`status status-${s.status}`}>{s.status === 'done' ? 'Done' : s.status === 'now' ? 'In progress' : 'Up next'}</span>
              </div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="st-disclaimer">{stories.disclaimer}</p>
      </div>
    </section>
  );
}

function Next() {
  return (
    <section className="scene s-next" id="next">
      <BgWord>IIM 2027</BgWord>
      <div className="split">
        <div className="split-copy">
          <Eyebrow index={6}>What's next</Eyebrow>
          <h2 className="display">
            <Line>Next stop:</Line>
            <Line serif>IIM.</Line>
          </h2>
          <p className="lede">{next.line}</p>
          <ol className="targets">
            {next.targets.map((t, i) => (
              <li className={`target${t.tag ? ' is-primary' : ''}`} key={t.name}>
                <span className="t-idx">{pad(i + 1)}</span>
                <span className="t-name">{t.name}</span>
                {t.tag && <em>{t.tag}</em>}
              </li>
            ))}
          </ol>
          <div className="tracks">
            <span>Preparing</span>
            {next.tracks.map((t) => (
              <b key={t}>{t}</b>
            ))}
          </div>
        </div>
        <div className="shape-anchor split-visual" />
      </div>
    </section>
  );
}

function Credits({ onReplay }) {
  return (
    <section className="scene s-credits" id="credits">
      <BgWord depth={14}>FIN</BgWord>
      <div className="shape-anchor credits-anchor" />
      <div className="contact">
        <Eyebrow index={7}>Credits</Eyebrow>
        <h2 className="display">
          <Line>Let's write</Line>
          <Line serif>the next scene.</Line>
        </h2>
        <a className="contact-mail" href={`mailto:${profile.email}`}>
          {profile.email} <Arrow />
        </a>
        <div className="contact-links">
          <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer" data-magnetic>
            LinkedIn <Arrow />
          </a>
          <a className="btn" href={profile.linktree} target="_blank" rel="noopener noreferrer" data-magnetic>
            All my links <Arrow />
          </a>
        </div>
      </div>

      <div className="credits-roll">
        <dl>
          {credits.map(([role, name]) => (
            <div className="credit" key={role}>
              <dt>{role}</dt>
              <dd>{name}</dd>
            </div>
          ))}
        </dl>
        <p className="fin serif">Fin.</p>
        <button type="button" className="btn" onClick={onReplay} data-magnetic>
          ↺ Replay from the start
        </button>
        <p className="site-foot">
          © {new Date().getFullYear()} {profile.first} {profile.last} · Webume
        </p>
      </div>
    </section>
  );
}

// --- Scroll choreography ---

function buildTimelines(desktop) {
  const root = document.documentElement;
  const restore = [];
  if (desktop) root.classList.add('cine');
  restore.push(() => root.classList.remove('cine'));

  const countUp = (tl, el, at, duration = 1) => {
    const target = parseFloat(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const original = el.textContent;
    const format = (v) => v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const state = { v: 0 };
    el.textContent = format(0);
    restore.push(() => {
      el.textContent = original;
    });
    tl.to(state, { v: target, duration, ease: 'power2.out', onUpdate: () => (el.textContent = format(state.v)) }, at);
  };

  const typeOut = (tl, el, perChar) => {
    const full = el.dataset.text;
    const state = { n: 0 };
    el.textContent = '';
    restore.push(() => {
      el.textContent = full;
    });
    tl.to(state, { n: full.length, duration: full.length * perChar, ease: 'none', onUpdate: () => (el.textContent = full.slice(0, Math.round(state.n))) });
  };

  const revealOnEnter = (targets, trigger, vars = {}) =>
    gsap.from(targets, { autoAlpha: 0, y: 40, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger, start: 'top 82%' }, ...vars });

  // Headlines flip in letter by letter as their scene arrives, so a pinned scene never opens empty
  const headline = (scene) => {
    const split = SplitText.create(`${scene} .mask > span`, { type: 'words,chars', wordsClass: 'split-w' });
    gsap.from(split.chars, {
      yPercent: 115,
      rotateX: -85,
      autoAlpha: 0,
      transformOrigin: '50% 100%',
      stagger: 0.022,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: scene, start: 'top 70%' },
    });
    revealOnEnter(`${scene} .eyebrow`, scene, { scrollTrigger: { trigger: scene, start: 'top 70%' } });
  };

  // Hero flies past the camera as the film starts
  gsap.to('.hero-copy', {
    scale: desktop ? 1.5 : 1.2,
    yPercent: -20,
    autoAlpha: 0,
    filter: 'blur(10px)',
    ease: 'none',
    scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-cue', { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '.s-hero', start: 'top top', end: '25% top', scrub: true } });

  // Giant background words slide across their scene
  gsap.utils.toArray('.bg-word').forEach((word, i) => {
    gsap.fromTo(
      word,
      { xPercent: i % 2 ? -30 : 10 },
      { xPercent: i % 2 ? 10 : -30, ease: 'none', scrollTrigger: { trigger: word.closest('.scene-wrap'), start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });

  // Record: headline, then the numbers count up
  {
    headline('.s-record');
    const tl = desktop
      ? gsap.timeline({ scrollTrigger: { trigger: '.s-record', start: 'top top', end: '+=140%', pin: true, scrub: 1 } })
      : gsap.timeline({ scrollTrigger: { trigger: '.stats', start: 'top 80%' }, defaults: { duration: 1.4 } });
    tl.from('.s-record .stat', { autoAlpha: 0, y: 40, rotateX: -25, stagger: 0.25, duration: 0.5 }, 0.35);
    gsap.utils.toArray('.s-record [data-count]').forEach((el, i) => {
      countUp(tl, el, 0.45 + i * 0.25);
      tl.from(el.closest('.stat').querySelector('.stat-meter i'), { scaleX: 0, duration: 1, ease: 'power2.out' }, 0.45 + i * 0.25);
    });
    if (desktop) tl.to({}, { duration: 0.5 });
  }

  // Billlion: the name lands, the product's screens rise as an exploded stack of layers, then deal out one by one
  if (desktop) {
    const section = document.querySelector('.s-billlion');
    const word = document.querySelector('.bl-word');
    const s = section.getBoundingClientRect();
    const w = word.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (w.left + w.width / 2);
    const dy = window.innerHeight / 2 - (w.top - s.top + w.height / 2);
    const shots = gsap.utils.toArray('.bl-shot');
    const caps = gsap.utils.toArray('.bl-cap');

    gsap.set('.bl-stack', { rotateX: 58, rotateZ: -36, scale: 0.78 });
    gsap.set(shots, { z: (i) => -i * 6 });
    gsap.set(caps, { autoAlpha: 0 });

    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: `+=${140 + shots.length * 60}%`, pin: true, scrub: 1 } });
    tl.from(word, { x: dx, y: dy, scale: 2.2, duration: 1, ease: 'power2.inOut' })
      .from('.s-billlion .eyebrow, .bl-pitch', { autoAlpha: 0, y: 20, stagger: 0.1, duration: 0.4 }, 0.6)
      .from('.bl-stage', { yPercent: 70, autoAlpha: 0, duration: 1, ease: 'power2.out' }, 0.6)
      .from('.bl-layers', { autoAlpha: 0, y: 20, duration: 0.4 }, 1.3)
      .to(shots, { z: (i) => -i * 120, duration: 1.1, ease: 'power2.inOut' }, 1.4)
      .to({}, { duration: 0.3 })
      .to('.bl-stack', { rotateX: 0, rotateZ: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' }, 2.8)
      .to(shots, { z: (i) => -i * 26, duration: 1.1, ease: 'power3.inOut' }, 2.8)
      .to('.bl-layers', { autoAlpha: 0, y: -20, duration: 0.3 }, 2.8)
      .to(caps[0], { autoAlpha: 1, duration: 0.4 }, 3.5)
      .from(caps[0], { y: 30, duration: 0.4 }, 3.5);
    shots.slice(0, -1).forEach((shot, i) => {
      const at = 4.2 + i;
      tl.to(shot, { yPercent: -125, rotateX: 35, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, at)
        .to(shots.slice(i + 1), { z: (j) => -j * 26, duration: 0.7, ease: 'power2.out' }, at + 0.15)
        .to(caps[i], { autoAlpha: 0, y: -30, duration: 0.3 }, at)
        .fromTo(caps[i + 1], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.4);
    });
    tl.from('.bl-role', { autoAlpha: 0, duration: 0.4 }).to({}, { duration: 0.6 });
  } else {
    revealOnEnter('.s-billlion .eyebrow, .bl-word, .bl-pitch, .bl-layers', '.bl-head');
    gsap.utils.toArray('.bl-shot').forEach((shot) =>
      gsap.from(shot, { autoAlpha: 0, y: 60, rotateX: 28, transformOrigin: '50% 0%', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: shot, start: 'top 85%' } })
    );
    revealOnEnter('.bl-role', '.bl-role');
  }

  // Craft: the terminal types itself out
  {
    const lines = gsap.utils.toArray('.term-line');
    headline('.s-craft');
    if (desktop) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.craft-pin', start: 'top top', end: '+=150%', pin: true, scrub: 1 } });
      tl.from('.s-craft .lede', { autoAlpha: 0, y: 20, duration: 0.4 }, 0.1).from('.terminal', { autoAlpha: 0, y: 60, rotateY: -18, rotateX: 8, duration: 0.6 }, 0.2);
      lines.forEach((l) => typeOut(tl, l, 0.025));
      tl.to({}, { duration: 0.4 });
    } else {
      revealOnEnter('.s-craft .lede, .terminal', '.s-craft');
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.terminal', start: 'top 75%' } });
      lines.forEach((l) => typeOut(tl, l, 0.03));
    }

    // Two skill rows that run faster, and flip direction, with your scroll
    const loops = gsap.utils.toArray('.marquee-track').map((track, i) => {
      const loop = gsap.fromTo(track, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 40, ease: 'none', repeat: -1 });
      loop.totalTime(loop.duration() * 50);
      return loop;
    });
    ScrollTrigger.create({
      trigger: '.marquee',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        loops.forEach((loop) => {
          gsap.killTweensOf(loop);
          loop.timeScale(boost * self.direction);
          gsap.to(loop, { timeScale: self.direction, duration: 1, ease: 'power2.out' });
        });
      },
    });

    // Skill tree: the core powers up, branches grow out of it, then each node unlocks
    const tl = desktop
      ? gsap.timeline({ scrollTrigger: { trigger: '.tree-board', start: 'top 75%', end: 'center 45%', scrub: 1 } })
      : gsap.timeline({ scrollTrigger: { trigger: '.tree-board', start: 'top 80%' }, defaults: { duration: 0.5 } });
    revealOnEnter('.tree .h3', '.tree');
    tl.from('.tree-core', { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)' })
      .fromTo('.tree-lines path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, stagger: 0.1, ease: 'none' }, 0.3)
      .from('.tree-dot', { scale: 0, duration: 0.3, stagger: 0.1, ease: 'back.out(3)' }, 1)
      .from('.tree-head > :not(.tree-dot)', { autoAlpha: 0, x: (i, el) => (el.closest('.tree-branch-0, .tree-branch-2') && desktop ? 20 : -20), stagger: 0.03, duration: 0.4 }, 1.1)
      .from('.tree .chip', { autoAlpha: 0, scale: 0.6, stagger: 0.02, duration: 0.3, ease: 'back.out(2)' }, 1.3);
  }

  // Stories: the concept art opens up into a full-screen frame with subtitles
  {
    headline('.s-stories');
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.st-pin', start: 'top top', end: '+=240%', pin: true, scrub: 1 } });
    tl.fromTo(
      '.st-frame',
      { clipPath: desktop ? 'inset(46% 24% 10% 24% round 22px)' : 'inset(48% 4% 14% 4% round 16px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.4, ease: 'power2.inOut' },
      0.4
    )
      .fromTo('.st-frame img', { scale: 1.35 }, { scale: 1.04, duration: 2.8, ease: 'none' }, 0.4)
      .to('.st-intro', { autoAlpha: 0, y: -80, scale: 0.95, duration: 0.8 }, 0.8)
      .fromTo('.st-bars i', { scaleY: 0 }, { scaleY: 1, duration: 0.6 }, 1.4)
      .from('.st-tag', { autoAlpha: 0, y: 20, duration: 0.4 }, 1.8);
    gsap.utils.toArray('.st-cap').forEach((cap, i, all) => {
      tl.fromTo(cap, { autoAlpha: 0, y: 12, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.3 }, 1.9 + i * 0.7);
      if (i < all.length - 1) tl.to(cap, { autoAlpha: 0, filter: 'blur(6px)', duration: 0.25 }, 2.4 + i * 0.7);
    });
    tl.to({}, { duration: 0.4 });

    revealOnEnter('.room-head > *', '.room');
    revealOnEnter('.step', '.room-steps', { y: 60, rotateX: -20, transformOrigin: '50% 0%' });
  }

  // What's next: the shortlist rolls in like credits
  headline('.s-next');
  if (desktop) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.s-next', start: 'top top', end: '+=130%', pin: true, scrub: 1 } });
    tl.from('.s-next .lede', { autoAlpha: 0, y: 20, duration: 0.4 }, 0.1)
      .from('.target', { autoAlpha: 0, x: -40, stagger: 0.25, duration: 0.5 }, 0.35)
      .from('.tracks > *', { autoAlpha: 0, y: 12, stagger: 0.1, duration: 0.3 })
      .to({}, { duration: 0.5 });
  } else {
    revealOnEnter('.s-next .lede, .target, .tracks', '.s-next .split-copy');
  }

  // Credits
  headline('.s-credits');
  revealOnEnter('.contact-mail, .contact-links', '.contact');
  revealOnEnter('.credit, .fin, .credits-roll .btn', '.credits-roll', { stagger: 0.12 });

  // Depth: each scene rises out of the distance and flies past the camera on its way out.
  // Created last so every pin above is already in place when these measure their scenes.
  if (desktop) {
    const wraps = gsap.utils.toArray('.scene-wrap');
    wraps.slice(1).forEach((wrap) => {
      const section = wrap.querySelector('.scene');
      // A pinned inner element is moved by its pin, so its children become the planes instead
      const planes = [...section.children]
        .map((c) => (c.classList.contains('pin-spacer') ? c.firstElementChild : c))
        .flatMap((c) => (c.matches('.craft-pin, .st-pin') ? [...c.children] : [c]))
        .filter((c) => !c.matches('.shape-anchor, .bg-layer'));
      gsap.fromTo(planes, { scale: 0.9, y: 80 }, { scale: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'top 25%', scrub: true } });
      // Only full-screen pinned scenes fly away; long scenes would fade while still being read
      if (section.matches('.s-record, .s-billlion, .s-next')) {
        gsap.fromTo(
          planes,
          { scale: 1, autoAlpha: 1, filter: 'blur(0px)' },
          {
            scale: 1.12,
            autoAlpha: 0,
            filter: 'blur(10px)',
            ease: 'power1.in',
            immediateRender: false,
            scrollTrigger: { trigger: wrap, start: 'bottom bottom', end: 'bottom 15%', scrub: true },
          }
        );
      }
    });
  }

  return () => restore.forEach((fn) => fn());
}

// --- App ---

export default function App() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const scoreRef = useRef(null);
  const lenisRef = useRef(null);
  const enteredRef = useRef(false);
  const sceneRef = useRef(0);
  const fillRef = useRef(null);
  const timeRef = useRef(null);

  const [gateGone, setGateGone] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [scene, setScene] = useState(0);
  const [ticks, setTicks] = useState([]);

  if (!scoreRef.current) scoreRef.current = new AmbientScore();

  const goScene = useCallback((i) => {
    sceneRef.current = i;
    setScene(i);
    document.documentElement.style.setProperty('--accent', scenes[i].accent);
    scoreRef.current.setScene(i);
    if (enteredRef.current) stageRef.current?.setShape(i);
  }, []);

  // Tell the particle stage where each scene's shape should sit
  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !rootRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rects = Array.from(rootRef.current.querySelectorAll('.scene')).map((section) => {
      const anchor = section.querySelector('.shape-anchor');
      const s = section.getBoundingClientRect();
      const a = anchor.getBoundingClientRect();
      const opacity = parseFloat(getComputedStyle(anchor).getPropertyValue('--shape-opacity'));
      return { x: a.left + a.width / 2, y: a.top - s.top + a.height / 2, w: a.width, h: a.height, opacity: Number.isNaN(opacity) ? 1 : opacity };
    });
    const g = Math.min(vw, vh) * 0.95;
    rects[GATE_SHAPE] = { x: vw / 2, y: vh / 2, w: g, h: g, opacity: 0.9 };
    stage.setLayouts(rects);
  }, []);

  // Preload the heavy images and fonts behind the gate's loading bar
  useEffect(() => {
    const urls = [stories.image, ...billlion.shots.map((s) => s.src)];
    const total = urls.length + 1;
    let done = 0;
    let alive = true;
    const tick = () => {
      done += 1;
      if (alive) setLoaded(done / total);
    };
    const images = urls.map((url) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = url;
      return img;
    });
    // Fonts get a short cap: some browsers keep document.fonts.ready pending while text is still being laid out
    const fontCap = new Promise((resolve) => setTimeout(resolve, 2500));
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), fontCap]).then(tick);
    const fallback = setTimeout(() => {
      if (alive) setLoaded(1);
    }, 6000);
    return () => {
      alive = false;
      clearTimeout(fallback);
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // Particle stage, smooth scrolling and audio lifecycle
  useEffect(() => {
    const root = document.documentElement;
    const score = scoreRef.current;
    root.classList.add('is-locked');
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const reduced = prefersReducedMotion();

    try {
      stageRef.current = new ParticleStage(canvasRef.current, {
        colors: [...scenes.map((s) => s.accent), '#d8d0ff'],
        reducedMotion: reduced,
      });
      measure();
    } catch (err) {
      root.classList.add('no-webgl');
    }

    let lenis = null;
    const raf = (time) => lenis.raf(time * 1000);
    if (!reduced) {
      lenis = new Lenis({ duration: 1.2, smoothWheel: true });
      lenis.stop();
      lenis.on('scroll', (l) => {
        ScrollTrigger.update();
        stageRef.current?.setVelocity(l.velocity);
      });
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }

    const onVisibility = () => score.setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (lenis) {
        gsap.ticker.remove(raf);
        lenis.destroy();
      }
      lenisRef.current = null;
      stageRef.current?.dispose();
      stageRef.current = null;
      score.stop();
      root.classList.remove('is-locked', 'no-webgl');
    };
  }, [measure]);

  // All scroll-driven animation
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add({ desktop: '(min-width: 900px)', motion: '(prefers-reduced-motion: no-preference)' }, (c) => {
        if (!c.conditions.motion) return undefined;
        return buildTimelines(c.conditions.desktop);
      });

      // Created after the pins, and refreshed last, so positions include pin spacing
      const wraps = gsap.utils.toArray('.scene-wrap');
      wraps.forEach((wrap, i) =>
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top 55%',
          end: 'bottom 55%',
          refreshPriority: -1,
          onToggle: (self) => self.isActive && goScene(i),
        })
      );
      gsap.utils.toArray('[data-dim]').forEach((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 35%',
          refreshPriority: -1,
          onToggle: (self) => stageRef.current?.setDim(self.isActive ? 0.2 : 1),
        })
      );
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -2,
        onUpdate: (self) => {
          document.documentElement.style.setProperty('--scroll', self.progress.toFixed(4));
          if (fillRef.current) fillRef.current.style.transform = `scaleX(${self.progress})`;
          if (timeRef.current) timeRef.current.textContent = formatTime(self.progress * RUNTIME);
        },
      });

      const onRefresh = () => {
        measure();
        const max = ScrollTrigger.maxScroll(window) || 1;
        const vh = window.innerHeight;
        setTicks(
          wraps.map((wrap) => {
            const top = wrap.getBoundingClientRect().top + window.scrollY;
            const into = Math.min(0.45 * Math.max(0, wrap.offsetHeight - vh), vh * 0.9);
            return { pos: Math.min(1, Math.max(0, top / max)), top: Math.min(max, top + into) };
          })
        );
      };
      ScrollTrigger.addEventListener('refresh', onRefresh);
      onRefresh();
      return () => ScrollTrigger.removeEventListener('refresh', onRefresh);
    }, rootRef);

    // Web fonts change line lengths, so re-measure once they land
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [goScene, measure]);

  // Always enters with the score playing; the HUD button can mute it
  const enter = () => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    scoreRef.current.start();
    setSoundOn(true);
    document.documentElement.classList.remove('is-locked');
    lenisRef.current?.start();
    stageRef.current?.setShape(sceneRef.current);

    const reduced = prefersReducedMotion();
    const name = SplitText.create('.hero-title .serif', { type: 'chars' });
    gsap
      .timeline()
      .to('.gate', { autoAlpha: 0, scale: reduced ? 1 : 1.08, filter: reduced ? 'none' : 'blur(12px)', duration: 1.1, ease: 'power2.inOut', onComplete: () => setGateGone(true) })
      .to('.letterbox', { scaleY: 0, duration: 1.6, ease: 'expo.inOut' }, 0.1)
      .fromTo('.hero-copy > *, .hero-cue > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.7)
      .from(name.chars, { yPercent: 80, rotateX: -90, autoAlpha: 0, stagger: 0.05, duration: 1.4, ease: 'expo.out' }, 0.75)
      .fromTo('.hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 1);
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

  const jump = (i) => {
    const target = ticks[i];
    if (!target) return;
    if (lenisRef.current) lenisRef.current.scrollTo(i === 0 ? 0 : target.top, { duration: 1.8 });
    else window.scrollTo({ top: i === 0 ? 0 : target.top });
  };

  return (
    <div ref={rootRef} className="site">
      <Atmosphere />
      <canvas ref={canvasRef} className="stage" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="letterbox letterbox-top" aria-hidden="true" />
      <div className="letterbox letterbox-bottom" aria-hidden="true" />

      <Hud soundOn={soundOn} onToggleSound={toggleSound} scene={scene} ticks={ticks} onJump={jump} fillRef={fillRef} timeRef={timeRef} />
      <SceneToast scene={scene} live={gateGone} />

      <main>
        <div className="scene-wrap">
          <Hero />
        </div>
        <div className="scene-wrap">
          <Record />
        </div>
        <div className="scene-wrap">
          <Billlion />
        </div>
        <div className="scene-wrap">
          <Craft />
        </div>
        <div className="scene-wrap">
          <Stories />
        </div>
        <div className="scene-wrap">
          <Next />
        </div>
        <div className="scene-wrap">
          <Credits onReplay={() => jump(0)} />
        </div>
      </main>

      {!gateGone && <Gate progress={loaded} onEnter={enter} />}
      <PointerFX />
    </div>
  );
}

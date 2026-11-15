import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Peacock from '../components/Peacock';
import { profile, vigil } from '../content';
import { Arrow, BgWord, Eyebrow, Line, pad, pick, playSfx, spotlight } from '../ui';

gsap.registerPlugin(Draggable, InertiaPlugin);

const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

// Plays muted while on screen; a click restarts it with sound
function Promo() {
  const ref = useRef(null);
  const [withSound, setWithSound] = useState(false);
  useEffect(() => {
    const v = ref.current;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.35 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const playLoud = () => {
    const v = ref.current;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setWithSound(true);
  };
  return (
    <figure className="vg-promo" onPointerMove={spotlight}>
      <video ref={ref} src={vigil.video} poster={vigil.poster} muted={!withSound} loop playsInline preload="metadata" controls={withSound} />
      {!withSound && (
        <button type="button" className="vg-play" onClick={playLoud} data-magnetic>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
          Watch the promo with sound
        </button>
      )}
      <figcaption>16 seconds of Mayu doing her job.</figcaption>
    </figure>
  );
}

// A fake feed: try to open a reel and Mayu shuts it down
function ReelTrap() {
  const [blocked, setBlocked] = useState(null);
  const [count, setCount] = useState(0);
  const birdRef = useRef(null);
  const lastWheel = useRef(0);

  const trigger = () => {
    if (blocked) return;
    const line = pick(vigil.blockLines, blocked);
    setBlocked(line);
    setCount((c) => c + 1);
    playSfx(vigil.sounds.reels, 0.3);
  };
  useEffect(() => {
    if (!blocked || !birdRef.current) return undefined;
    const tl = gsap
      .timeline()
      .fromTo('.rt-block', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
      .fromTo(birdRef.current, { y: 80, scale: 0.4 }, { y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0)
      .fromTo('.rt-block .pk-feather', { rotation: 0, svgOrigin: '60 76' }, { rotation: (i, el) => Number(el.dataset.a), svgOrigin: '60 76', duration: 0.6, stagger: 0.02, ease: 'back.out(2)' }, 0.15)
      .to(birdRef.current, { rotate: -7, duration: 0.1, yoyo: true, repeat: 3, transformOrigin: '50% 100%' }, 0.6);
    return () => tl.kill();
  }, [blocked]);

  const onWheel = (e) => {
    // Scrolling inside the phone counts as an attempt, but the page keeps scrolling normally
    if (Math.abs(e.deltaY) < 20 || Date.now() - lastWheel.current < 1200) return;
    lastWheel.current = Date.now();
    trigger();
  };

  return (
    <div className="lab-card" onPointerMove={spotlight}>
      <div className="lab-head">
        <span className="lab-tag">Try it</span>
        <h4>Open a reel. I dare you.</h4>
        <p>Tap a reel or the Reels tab. Mayu is watching.</p>
      </div>
      <div className="rt-phone" onWheel={onWheel}>
        <div className="rt-screen">
          <div className="rt-top">
            <b>feed</b>
            <span>{count ? `${count} blocked` : '9:41'}</span>
          </div>
          <div className="rt-feed">
            {['#ff7eb6,#a68cff', '#f2a541,#ef6a5b', '#6ea8ff,#4fc28a', '#a68cff,#ef6a5b'].map((g, i) => (
              <button type="button" key={g} className="rt-reel" style={{ background: `linear-gradient(160deg, ${g})` }} onClick={trigger} aria-label={`Reel ${i + 1}`}>
                <span className="rt-playicon" aria-hidden="true">▶</span>
                <i />
                <i />
              </button>
            ))}
          </div>
          <div className="rt-tabs">
            <span>Home</span>
            <button type="button" onClick={trigger}>
              Reels
            </button>
            <span>Study</span>
          </div>
          {blocked && (
            <div className="rt-block" role="alert">
              <div ref={birdRef} className="rt-bird">
                <Peacock mood="shocked" size={120} />
              </div>
              <h5>Reels &amp; shorts are blocked</h5>
              <p>{blocked}</p>
              <button type="button" className="rt-back" onClick={() => setBlocked(null)}>
                Back to studying
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The presence check, played with the cursor (or a finger): leave the desk and the clock stops
function DeskCheck() {
  const [present, setPresent] = useState(false);
  const [focus, setFocus] = useState(0);
  const [away, setAway] = useState(0);
  const [line, setLine] = useState('Sit at the desk to start the session.');
  const started = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!started.current) return;
      if (present) setFocus((f) => f + 1);
      else setAway((a) => a + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [present]);

  const sit = () => {
    if (present) return;
    setLine(started.current ? pick(vigil.backLines) : 'Locked in. I check on you every few seconds.');
    started.current = true;
    setPresent(true);
  };
  const leave = () => {
    if (!present) return;
    setPresent(false);
    setLine(pick(vigil.awayLines));
    playSfx(vigil.sounds.block, 0.25);
  };

  return (
    <div className="lab-card" onPointerMove={spotlight}>
      <div className="lab-head">
        <span className="lab-tag">Try it</span>
        <h4>Leave the desk. See what happens.</h4>
        <p>Your cursor is you. Keep it on the desk to study, move it away to wander off.</p>
      </div>
      <div
        className={`dc-desk${present ? ' is-present' : ''}`}
        onPointerEnter={(e) => e.pointerType === 'mouse' && sit()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && leave()}
        onClick={() => (present ? leave() : sit())}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (present ? leave() : sit())}
        aria-label={present ? 'Studying at the desk. Activate to leave.' : 'Empty desk. Activate to sit down.'}
      >
        <div className="dc-cam">
          <span className="dc-rec">{present ? 'PRESENT ✓' : started.current ? 'AWAY' : 'CAMERA'}</span>
          <svg className="dc-person" viewBox="0 0 200 150" aria-hidden="true">
            <circle cx="100" cy="62" r="28" />
            <path d="M42 150 C46 106 72 96 100 96 C128 96 154 106 158 150 Z" />
          </svg>
          <i className="dc-scan" />
        </div>
        <div className="dc-readout">
          <div>
            <span>Focus</span>
            <b>{fmt(focus)}</b>
          </div>
          <div>
            <span>Away (not counted)</span>
            <b className="dc-away">{fmt(away)}</b>
          </div>
        </div>
        <div className="dc-says">
          <Peacock mood={present ? 'watching' : started.current ? 'alert' : 'happy'} size={56} />
          <p>{line}</p>
        </div>
        <span className="dc-hint">{present ? 'Tap to get up' : 'Tap or hover to sit'}</span>
      </div>
    </div>
  );
}

// Real screens in phone frames; drag or flick the strip
function Screens() {
  const trackRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    const [d] = Draggable.create(trackRef.current, {
      type: 'x',
      inertia: true,
      bounds: wrapRef.current,
      edgeResistance: 0.85,
      dragClickables: true,
      cursor: 'grab',
      activeCursor: 'grabbing',
    });
    return () => d.kill();
  }, []);
  return (
    <div className="vg-screens" ref={wrapRef}>
      <div className="vg-track" ref={trackRef}>
        {vigil.screens.map((s) => (
          <figure className="vg-shot" key={s.label}>
            <img src={s.src} alt={`Vigil: ${s.label}`} loading="lazy" draggable="false" width="780" height="1688" />
            <figcaption>{s.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function VigilScene({ index }) {
  return (
    <section className="scene s-vigil" id="vigil">
      <BgWord depth={18}>VIGIL</BgWord>
      <div className="vg-hero">
        <div className="vg-intro">
          <Eyebrow index={index}>The new product</Eyebrow>
          <div className="vg-brand">
            <div className="vg-mayu">
              <Peacock mood="happy" size={150} />
            </div>
            <h2 className="vg-word">Vigil</h2>
          </div>
          <h3 className="display vg-tagline">
            <Line>The study partner</Line>
            <Line serif>that actually watches.</Line>
          </h3>
          <p className="lede">{vigil.pitch}</p>
          <ul className="vg-pills">
            {vigil.platforms.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="shape-anchor vg-anchor" />
      </div>

      <Promo />

      <div className="vg-lab" data-dim>
        <ReelTrap />
        <DeskCheck />
      </div>

      <div className="vg-features" data-dim>
        {vigil.features.map((f, i) => (
          <article className="vg-feature" key={f.title} onPointerMove={spotlight}>
            <span>{pad(i + 1)}</span>
            <h4>{f.title}</h4>
            <p>{f.body}</p>
          </article>
        ))}
      </div>

      <div className="vg-gallery" data-dim>
        <div className="vg-gallery-head">
          <h3 className="h3">
            The real thing. <span className="serif">Drag through it.</span>
          </h3>
          <p className="vg-note">{vigil.demoNote}</p>
        </div>
        <Screens />
        <div className="vg-cta">
          <p>
            Built for my own IPMAT prep, made for anyone who keeps saying <span className="serif">"bas ek reel"</span>.
          </p>
          <a className="btn btn-primary" href={`mailto:${profile.email}?subject=${encodeURIComponent('I want Vigil')}`} data-magnetic>
            Get Vigil <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

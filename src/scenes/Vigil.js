import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Peacock from '../components/Peacock';
import { profile, vigil } from '../content';
import { Arrow, buzz, coarsePointer, idle, pad, pick, prefersReducedMotion, Title } from '../ui';

gsap.registerPlugin(Draggable, InertiaPlugin);

const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

// Mayu's pupils follow the pointer (or the last touch) around the page
function WatchingMayu() {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const looks = [...el.querySelectorAll('.pk-look')];
    const setters = looks.map((l) => [gsap.quickTo(l, 'x', { duration: 0.35, ease: 'power3' }), gsap.quickTo(l, 'y', { duration: 0.35, ease: 'power3' })]);
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const a = Math.atan2(e.clientY - (r.top + r.height * 0.42), e.clientX - (r.left + r.width / 2));
      const d = Math.min(1, Math.hypot(e.clientX - r.left, e.clientY - r.top) / 300);
      setters.forEach(([sx, sy]) => {
        sx(Math.cos(a) * 2.4 * d);
        sy(Math.sin(a) * 2.4 * d);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <div className="vg-mayu" ref={ref}>
      <Peacock mood="happy" size={260} />
    </div>
  );
}

// Plays muted only while on screen; a click restarts it with sound
function Promo() {
  const ref = useRef(null);
  const [loud, setLoud] = useState(false);
  useEffect(() => {
    const v = ref.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          if (!prefersReducedMotion() || loud) v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [loud]);
  const playLoud = () => {
    const v = ref.current;
    v.muted = false;
    v.currentTime = 0;
    v.play().catch(() => {});
    setLoud(true);
  };
  return (
    <figure className="vg-promo">
      <video ref={ref} src={vigil.video} poster={vigil.poster} muted={!loud} loop playsInline preload="none" controls={loud} width="1920" height="1080" />
      {!loud && (
        <button type="button" className="pill pill-solid vg-play" onClick={playLoud} data-magnetic>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
          Play the 16-second promo
        </button>
      )}
    </figure>
  );
}

// A fake feed: open a reel and Mayu shuts it down
function ReelTrap() {
  const [blocked, setBlocked] = useState(null);
  const [count, setCount] = useState(0);
  const birdRef = useRef(null);

  const trigger = () => {
    if (blocked) return;
    setBlocked(pick(vigil.blockLines, blocked));
    setCount((c) => c + 1);
    buzz([30, 40, 30]);
  };
  useEffect(() => {
    if (!blocked || !birdRef.current) return undefined;
    const tl = gsap
      .timeline()
      .fromTo('.rt-block', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
      .fromTo(birdRef.current, { y: 90, scale: 0.4 }, { y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.55)' }, 0)
      .fromTo('.rt-block .pk-feather', { rotation: 0, svgOrigin: '60 76' }, { rotation: (i, el) => Number(el.dataset.a), svgOrigin: '60 76', duration: 0.6, stagger: 0.02, ease: 'back.out(2.2)' }, 0.12)
      .fromTo('.rt-block h5, .rt-block p, .rt-back', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.45, ease: 'dev' }, 0.3);
    return () => tl.kill();
  }, [blocked]);

  return (
    <div className="toy toy-reels" data-cursor="tap">
      <div className="toy-copy">
        <h4>Open a reel. Go on.</h4>
        <p>Tap any reel or the Reels tab. This is the screen students see when they try.</p>
        <p className="toy-stat">{count ? `${count} ${count === 1 ? 'attempt' : 'attempts'} blocked` : 'Nothing blocked yet'}</p>
      </div>
      <div className="rt-phone">
        <div className="rt-screen">
          <div className="rt-top">
            <b>For you</b>
            <span>9:41</span>
          </div>
          <div className="rt-feed">
            {['#ff7eb6,#a68cff', '#f2a541,#ef6a5b', '#6ea8ff,#4fc28a', '#a68cff,#ef6a5b'].map((g, i) => (
              <button type="button" key={g} className="rt-reel" style={{ background: `linear-gradient(160deg, ${g})` }} onClick={trigger} aria-label={`Open reel ${i + 1}`}>
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
                <Peacock mood="shocked" size={116} />
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

// The presence check, played with the pointer: leave the desk and the clock stops counting
function DeskCheck() {
  const [present, setPresent] = useState(false);
  const [focus, setFocus] = useState(0);
  const [away, setAway] = useState(0);
  const [line, setLine] = useState('Sit down to start a session.');
  const started = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!started.current || document.hidden) return;
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
    buzz(12);
  };
  const leave = () => {
    if (!present) return;
    setPresent(false);
    setLine(pick(vigil.awayLines));
    buzz([20, 30, 20]);
  };
  const toggle = () => (present ? leave() : sit());

  return (
    <div className="toy toy-desk">
      <div className="toy-copy">
        <h4>Now leave the desk.</h4>
        <p>{coarsePointer() ? 'Tap the desk to sit down, tap again to wander off.' : 'Your cursor is you. Rest it on the desk to study, move it off to wander.'}</p>
      </div>
      <div
        className={`dc-desk${present ? ' is-present' : ''}`}
        data-cursor={present ? 'leave' : 'sit'}
        onPointerEnter={(e) => e.pointerType === 'mouse' && sit()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && leave()}
        onClick={(e) => e.pointerType !== 'mouse' && toggle()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())}
        role="button"
        tabIndex={0}
        aria-pressed={present}
        aria-label={present ? 'At the desk. Press to leave.' : 'Empty desk. Press to sit down.'}
      >
        <div className="dc-cam">
          <span className="dc-rec">{present ? 'Present' : started.current ? 'Away' : 'Camera'}</span>
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
            <span>Away, not counted</span>
            <b className="dc-away">{fmt(away)}</b>
          </div>
        </div>
        <div className="dc-says">
          <Peacock mood={present ? 'watching' : started.current ? 'alert' : 'happy'} size={52} />
          <p>{line}</p>
        </div>
      </div>
    </div>
  );
}

// Real screens in phone frames; drag or flick the strip
function Screens() {
  const trackRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    let d = null;
    const cancel = idle(() => {
      [d] = Draggable.create(trackRef.current, {
      type: 'x',
      inertia: true,
      bounds: wrapRef.current,
      edgeResistance: 0.85,
      allowNativeTouchScrolling: true,
      onPress: () => buzz(8),
      });
    });
    return () => {
      cancel();
      d?.kill();
    };
  }, []);
  return (
    <div className="vg-screens" ref={wrapRef} data-cursor="drag">
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

export default function VigilScene() {
  return (
    <section className="scene sc-vigil" id="vigil" data-scene="vigil">
      <div className="wrap">
        <div className="vg-hero">
          <div className="vg-intro">
            <p className="kicker">My second product</p>
            <h2 className="vg-word" aria-label="Vigil">
              <span className="mask">
                <span className="mask-in">Vigil</span>
              </span>
            </h2>
            <Title className="vg-tagline" lines={['The study partner', 'that actually watches.']} />
            <p className="lede">{vigil.pitch}</p>
            <ul className="vg-platforms" aria-label="Platforms">
              {vigil.platforms.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <WatchingMayu />
        </div>

        <Promo />

        <div className="vg-toys">
          <ReelTrap />
          <DeskCheck />
        </div>

        <ul className="vg-features">
          {vigil.features.map((f) => (
            <li key={f.title}>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
            </li>
          ))}
        </ul>

        <div className="vg-gallery">
          <Title className="h3" lines={['The real app, with a demo student.']} />
          <Screens />
        </div>

        <div className="vg-cta">
          <p>
            I built Vigil for my own IPMAT prep. It's for anyone who keeps saying <em>bas ek reel</em>.
          </p>
          <a className="pill pill-solid" href={`mailto:${profile.email}?subject=${encodeURIComponent('I want Vigil')}`} data-magnetic>
            Ask me for Vigil <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}

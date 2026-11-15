import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { sarathi } from '../content';
import { Eyebrow, Line, pad, prefersReducedMotion, spotlight } from '../ui';

gsap.registerPlugin(Draggable, InertiaPlugin);

const avatar = (who) => `${process.env.PUBLIC_URL}/images/sarathi/${who}.webp`;

// Pick a problem; Arjun asks it, Krishna ji types the updesh and the verse it comes from
function AskKrishna() {
  const [active, setActive] = useState(null);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('idle'); // idle → thinking → typing → done
  const logRef = useRef(null);

  useEffect(() => {
    if (active === null) return undefined;
    const answer = sarathi.problems[active].krishna;
    const timers = [];
    setTyped('');
    setPhase('thinking');
    if (prefersReducedMotion()) {
      setTyped(answer);
      setPhase('done');
      return undefined;
    }
    timers.push(
      setTimeout(() => {
        setPhase('typing');
        let n = 0;
        const step = () => {
          n += 2;
          setTyped(answer.slice(0, n));
          if (n < answer.length) timers.push(setTimeout(step, 22));
          else setPhase('done');
        };
        step();
      }, 900)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    if (phase === 'done' && logRef.current) {
      gsap.fromTo(logRef.current.querySelector('.ak-verse'), { autoAlpha: 0, y: 16, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' });
    }
  }, [phase]);

  const p = active === null ? null : sarathi.problems[active];
  return (
    <div className="ak" onPointerMove={spotlight}>
      <div className="ak-head">
        <span className="lab-tag">Try it</span>
        <h4>Ask Krishna ji.</h4>
        <p>Pick your problem. Get updesh, Gen Z edition, with the verse it comes from.</p>
      </div>
      <div className="ak-chips" role="group" aria-label="Problems">
        {sarathi.problems.map((x, i) => (
          <button key={x.chip} type="button" className={`ak-chip${i === active ? ' is-on' : ''}`} onClick={() => setActive(i)} aria-pressed={i === active}>
            {x.chip}
          </button>
        ))}
      </div>
      <div className="ak-log" ref={logRef} aria-live="polite">
        {!p && (
          <div className="ak-empty">
            <img src={avatar('krishna')} alt="" width="64" height="64" />
            <p>“Bolo Arjun, kya scene hai?”</p>
          </div>
        )}
        {p && (
          <>
            <div className="ak-msg ak-arjun" key={`a${active}`}>
              <img src={avatar('arjun')} alt="" width="40" height="40" />
              <div>
                <b>Arjun</b>
                <p>{p.arjun}</p>
              </div>
            </div>
            <div className="ak-msg ak-krishna">
              <img src={avatar('krishna')} alt="" width="40" height="40" />
              <div>
                <b>Krishna ji</b>
                {phase === 'thinking' ? (
                  <p className="ak-dots" aria-label="Krishna ji is typing">
                    <i />
                    <i />
                    <i />
                  </p>
                ) : (
                  <p>{typed}</p>
                )}
              </div>
            </div>
            {phase === 'done' && (
              <div className="ak-verse">
                <span lang="sa">{p.verse}</span>
                <em>{p.ref}</em>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// A deck of episode cards: drag and throw the top one, it goes to the back
function EpisodeDeck() {
  const deckRef = useRef(null);
  const [order, setOrder] = useState(() => sarathi.episodes.map((_, i) => i));
  const orderRef = useRef(order);
  orderRef.current = order;

  const sendBack = (dir = 1) => {
    const top = deckRef.current.querySelector('.ep-card.is-top');
    if (!top) return;
    gsap.to(top, {
      x: dir * window.innerWidth * 0.6,
      rotate: dir * 30,
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(top, { x: 0, y: 0, rotate: 0, autoAlpha: 1 });
        setOrder((o) => o.slice(1).concat(o[0]));
      },
    });
  };
  const sendBackRef = useRef(sendBack);
  sendBackRef.current = sendBack;

  useEffect(() => {
    const top = deckRef.current.querySelector('.ep-card.is-top');
    if (!top) return undefined;
    const [d] = Draggable.create(top, {
      type: 'x,y',
      inertia: true,
      onDrag() {
        gsap.set(this.target, { rotate: this.x / 12 });
      },
      onDragEnd() {
        const fling = Math.abs(this.x) > 110 || Math.abs(InertiaPlugin.getVelocity(this.target, 'x')) > 700;
        if (fling) {
          this.tween && this.tween.kill();
          sendBackRef.current(this.x >= 0 ? 1 : -1);
        } else {
          gsap.to(this.target, { x: 0, y: 0, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        }
      },
    });
    return () => d.kill();
  }, [order]);

  return (
    <div className="ep">
      <div className="ep-deck" ref={deckRef}>
        {order
          .slice()
          .reverse()
          .map((idx) => {
            const e = sarathi.episodes[idx];
            const depth = orderRef.current.indexOf(idx);
            return (
              <article
                key={e.no}
                className={`ep-card${depth === 0 ? ' is-top' : ''}`}
                style={{ '--d': depth, zIndex: 10 - depth }}
                aria-hidden={depth !== 0}
              >
                <div className="ep-top">
                  <span>EP {e.no}</span>
                  <span className="ep-status">Scripting</span>
                </div>
                <h4>{e.title}</h4>
                <p>{e.problem}</p>
                <div className="ep-foot">
                  <em>Gita {e.ref}</em>
                  <span>
                    {pad(idx + 1)} / {pad(sarathi.episodes.length)}
                  </span>
                </div>
              </article>
            );
          })}
      </div>
      <div className="ep-controls">
        <button type="button" className="btn" onClick={() => sendBack(-1)} aria-label="Previous episode">
          ←
        </button>
        <span>Throw the card · {sarathi.episodes.length} episodes planned</span>
        <button type="button" className="btn" onClick={() => sendBack(1)} aria-label="Next episode">
          →
        </button>
      </div>
    </div>
  );
}

export default function SarathiScene({ index }) {
  return (
    <section className="scene s-sarathi" id="sarathi">
      <div className="st-pin">
        <div className="shape-anchor st-anchor" />
        <div className="st-intro">
          <Eyebrow index={index}>The series</Eyebrow>
          <h2 className="display">
            <Line>Some updesh</Line>
            <Line serif>deserves a screen.</Line>
          </h2>
        </div>
        <figure className="st-frame">
          <img src={sarathi.image} alt={sarathi.imageAlt} />
          <div className="st-bars" aria-hidden="true">
            <i />
            <i />
          </div>
          <div className="st-tag">
            <span>Now scripting</span>
            <strong>
              {sarathi.title} <em lang="hi">{sarathi.devanagari}</em>
            </strong>
          </div>
          <figcaption className="st-captions">
            {sarathi.captions.map(([who, text]) => (
              <span className="st-cap" key={text}>
                <b>{who}:</b> {text}
              </span>
            ))}
          </figcaption>
        </figure>
      </div>

      <div className="sr-body" data-dim>
        <div className="sr-title">
          <p className="sr-kicker">A Minecraft-animated series</p>
          <h3 className="sr-name">
            {sarathi.title}
            <span lang="hi">{sarathi.devanagari}</span>
          </h3>
          <p className="sr-tagline serif">{sarathi.tagline}</p>
          <p className="lede">{sarathi.pitch}</p>
        </div>
        <div className="sr-play">
          <AskKrishna />
          <EpisodeDeck />
        </div>

        <ol className="room-steps">
          {sarathi.pipeline.map((s, i) => (
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
        <p className="st-disclaimer">{sarathi.disclaimer}</p>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ThrowDeck from '../components/ThrowDeck';
import { sarathi } from '../content';
import { buzz, pad, prefersReducedMotion } from '../ui';

const avatar = (who) => `${process.env.PUBLIC_URL}/images/sarathi/${who}.webp`;

// The key art in a player frame at its native size, with subtitles that change on a beat
function Player() {
  const [line, setLine] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let id = null;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id);
      if (e.isIntersecting && !prefersReducedMotion()) id = setInterval(() => setLine((l) => (l + 1) % sarathi.captions.length), 3400);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, []);
  const [who, text] = sarathi.captions[line];
  return (
    <figure className="sr-player" ref={ref}>
      <img src={sarathi.image} alt={sarathi.imageAlt} width="1024" height="572" loading="lazy" />
      <span className="sr-status">Episode 1 · in scripting</span>
      <figcaption className="sr-sub" key={line} aria-live="off">
        <b>{who}</b> {text}
      </figcaption>
    </figure>
  );
}

// Pick a problem; Arjun asks it, Krishna ji types the updesh and the verse it comes from
function AskKrishna() {
  const [active, setActive] = useState(null);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('idle');
  const verseRef = useRef(null);

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
          if (n < answer.length) timers.push(setTimeout(step, 20));
          else setPhase('done');
        };
        step();
      }, 850)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  useEffect(() => {
    if (phase === 'done' && verseRef.current) {
      gsap.fromTo(verseRef.current, { autoAlpha: 0, y: 14, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.6)' });
      buzz(14);
    }
  }, [phase]);

  const p = active === null ? null : sarathi.problems[active];
  return (
    <div className="toy toy-ask">
      <div className="toy-copy">
        <h4>Ask Krishna ji.</h4>
        <p>Pick a problem. The answer comes with the verse it is drawn from.</p>
      </div>
      <div className="ak-chips" role="group" aria-label="Problems">
        {sarathi.problems.map((x, i) => (
          <button
            key={x.chip}
            type="button"
            className={`ak-chip${i === active ? ' is-on' : ''}`}
            onClick={() => {
              setActive(i);
              buzz(8);
            }}
            aria-pressed={i === active}
          >
            {x.chip}
          </button>
        ))}
      </div>
      <div className="ak-log" aria-live="polite">
        {!p && (
          <div className="ak-empty">
            <img src={avatar('krishna')} alt="" width="56" height="56" />
            <p>Bolo Arjun, kya scene hai?</p>
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
              <div className="ak-verse" ref={verseRef}>
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

export default function SarathiScene() {
  return (
    <section className="scene sc-sarathi" id="sarathi" data-scene="sarathi">
      <div className="wrap">
        <div className="sr-top">
          <div className="sr-title">
            <p className="kicker">A Minecraft-animated series</p>
            <h2 className="sr-name" aria-label={`${sarathi.title}, ${sarathi.devanagari}`}>
              <span className="mask">
                <span className="mask-in">{sarathi.title}</span>
              </span>
              <span className="sr-deva" lang="hi" aria-hidden="true">
                {sarathi.devanagari}
              </span>
            </h2>
            <p className="voice">{sarathi.tagline}</p>
            <p className="lede">{sarathi.pitch}</p>
          </div>
          <Player />
        </div>

        <div className="sr-toys">
          <AskKrishna />
          <div className="toy toy-eps">
            <div className="toy-copy">
              <h4>Six episodes, planned.</h4>
              <p>Throw a card to see the next one.</p>
            </div>
            <ThrowDeck
              className="ep-deck"
              items={sarathi.episodes}
              hint="throw it"
              render={(e) => (
                <article className="ep-card" data-cursor="throw">
                  <span className="ep-no">Ep {e.no}</span>
                  <h5>{e.title}</h5>
                  <p>{e.problem}</p>
                  <em>Gita {e.ref}</em>
                </article>
              )}
            />
          </div>
        </div>

        <ol className="steps">
          {sarathi.pipeline.map((s, i) => (
            <li key={s.title} className={`step step-${s.status}`}>
              <span className="step-no">{pad(i + 1)}</span>
              <h5>{s.title}</h5>
              <p>{s.body}</p>
              <span className="step-status">{s.status === 'done' ? 'Done' : s.status === 'now' ? 'Working on it' : 'Up next'}</span>
            </li>
          ))}
        </ol>
        <p className="fine">{sarathi.disclaimer}</p>
      </div>
    </section>
  );
}

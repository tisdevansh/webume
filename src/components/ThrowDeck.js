import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { coarsePointer } from '../ui';

gsap.registerPlugin(Draggable, InertiaPlugin);

// A stack of cards: drag and throw the top one and it goes to the back. Tap it to open.
export default function ThrowDeck({ items, render, onTop, onOpen, className = '', hint = 'Throw the card' }) {
  const deckRef = useRef(null);
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const busy = useRef(false);

  const sendBack = (dir = 1) => {
    const top = deckRef.current?.querySelector('.td-card.is-top');
    if (!top || busy.current) return;
    busy.current = true;
    gsap.to(top, {
      x: dir * Math.min(window.innerWidth * 0.7, 700),
      y: '-=40',
      rotation: dir * 28,
      autoAlpha: 0,
      duration: 0.42,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(top, { x: 0, y: 0, rotation: 0, autoAlpha: 1 });
        busy.current = false;
        setOrder((o) => o.slice(1).concat(o[0]));
      },
    });
  };
  const sendBackRef = useRef(sendBack);
  sendBackRef.current = sendBack;
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => {
    onTop?.(items[order[0]], order[0]);
    const top = deckRef.current.querySelector('.td-card.is-top');
    if (!top) return undefined;
    const touch = coarsePointer();
    const [d] = Draggable.create(top, {
      type: touch ? 'x' : 'x,y',
      inertia: true,
      allowNativeTouchScrolling: touch,
      onDrag() {
        gsap.set(this.target, { rotation: this.x / 14 });
      },
      onClick() {
        openRef.current?.(items[order[0]], order[0]);
      },
      onDragEnd() {
        const fling = Math.abs(this.x) > 100 || Math.abs(InertiaPlugin.getVelocity(this.target, 'x')) > 650;
        if (fling) {
          this.tween?.kill();
          sendBackRef.current(this.x >= 0 ? 1 : -1);
        } else {
          gsap.to(this.target, { x: 0, y: 0, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
        }
      },
    });
    return () => d.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  return (
    <div className={`td ${className}`}>
      <div className="td-deck" ref={deckRef}>
        {order
          .slice()
          .reverse()
          .map((idx) => {
            const depth = order.indexOf(idx);
            return (
              <div key={idx} className={`td-card${depth === 0 ? ' is-top' : ''}`} style={{ '--d': Math.min(depth, 4), zIndex: 20 - depth }} aria-hidden={depth !== 0}>
                {render(items[idx], idx)}
              </div>
            );
          })}
      </div>
      <div className="td-controls">
        <button type="button" className="td-btn" onClick={() => sendBack(-1)} aria-label="Previous">
          ←
        </button>
        <span>
          {order[0] + 1} / {items.length} · {hint}
        </span>
        <button type="button" className="td-btn" onClick={() => sendBack(1)} aria-label="Next">
          →
        </button>
      </div>
    </div>
  );
}

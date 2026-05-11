import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Premium Inline SVGs ---
const IconHexagon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>;
const IconCpu = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
const IconNetwork = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>;
const IconTarget = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconShield = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconEye = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconVolume2 = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const IconVolumeX = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
const IconArrowRight = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconLinkedin = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;

// --- Master CSS: Engineered for Cinematic Performance ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Outfit:wght@200;300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

  :root {
    --bg: #010308;
    --surface: rgba(4, 8, 16, 0.6);
    --surface-border: rgba(0, 240, 255, 0.1);
    --cyan: #00f0ff;
    --purple: #8b5cf6;
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-game: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  body {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'Outfit', sans-serif;
    overflow-x: hidden;
    cursor: none !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * { 
    cursor: none !important; 
    box-sizing: border-box; 
  }

  /* Typography Profiles */
  .font-display { font-family: 'Syncopate', sans-serif; text-transform: uppercase; }
  .font-mono { font-family: 'Space Mono', monospace; }
  .font-body { font-family: 'Outfit', sans-serif; }

  /* Premium Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 10px; }

  /* GAME-LIKE 3D Section Reveals */
  .reveal {
    opacity: 0;
    transform: perspective(1000px) rotateX(15deg) translate3d(0, 100px, -50px) scale(0.9);
    filter: blur(20px);
    transition: opacity 1.2s var(--ease-game), transform 1.2s var(--ease-game), filter 1.2s var(--ease-game);
    will-change: opacity, transform, filter;
  }
  .reveal.active {
    opacity: 1;
    transform: perspective(1000px) rotateX(0deg) translate3d(0, 0, 0) scale(1);
    filter: blur(0px);
  }
  
  .delay-100 { transition-delay: 100ms; }
  .delay-200 { transition-delay: 200ms; }
  .delay-300 { transition-delay: 300ms; }
  .delay-400 { transition-delay: 400ms; }

  /* Advanced UI Panels */
  .hud-panel {
    background: var(--surface);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--surface-border);
    position: relative;
    overflow: hidden;
    transition: border-color 0.4s var(--ease-cinematic), box-shadow 0.4s var(--ease-cinematic);
  }
  
  .hud-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
    opacity: 0;
    transition: opacity 0.4s var(--ease-cinematic);
  }

  .hud-panel:hover {
    border-color: rgba(0, 240, 255, 0.4);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 240, 255, 0.08);
  }
  .hud-panel:hover::before { opacity: 1; }

  /* Interactive Hover Physics for Typography */
  .hover-expand {
    transition: letter-spacing 0.6s var(--ease-game), color 0.6s var(--ease-game), text-shadow 0.6s var(--ease-game), transform 0.6s var(--ease-game);
  }
  .hover-expand:hover {
    letter-spacing: 0.05em;
    color: #ffffff;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.6);
    transform: scale(1.02);
  }

  /* Pure Hover Physics (No Blue Glow) for Hero Text */
  .hover-expand-pure {
    transition: letter-spacing 0.6s var(--ease-game), transform 0.6s var(--ease-game);
  }
  .hover-expand-pure:hover {
    letter-spacing: 0.05em;
    transform: scale(1.02);
  }

  /* Subtle Continuous Metallic Shimmer */
  .text-shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.4) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  @keyframes shimmer {
    to { background-position: 200% center; }
  }

  /* Slow Breathing Tracking for Quotes */
  .text-breathe {
    animation: tracking-breathe 6s ease-in-out infinite alternate;
  }
  @keyframes tracking-breathe {
    0% { letter-spacing: normal; }
    100% { letter-spacing: 0.03em; }
  }

  .blinking-cursor {
    display: inline-block;
    width: 10px;
    height: 1.2em;
    background-color: var(--cyan);
    vertical-align: middle;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  /* Restored Premium Slide Polishing Effect (Sweep Mask) */
  .sweep-mask {
    background: linear-gradient(90deg, #333 0%, #fff 50%, #333 100%);
    background-size: 200% auto;
    color: #000;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: sweep 3s linear infinite;
  }
  @keyframes sweep {
    to { background-position: 200% center; }
  }

  /* Interactive Scanning Lines */
  .scanner-line {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 2px;
    background: var(--cyan);
    box-shadow: 0 0 20px var(--cyan), 0 0 40px var(--cyan);
    opacity: 0;
    z-index: 10;
  }
  
  .hud-panel:hover .scanner-line {
    animation: scan 2.5s ease-in-out infinite alternate;
    opacity: 0.9;
  }

  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { top: 100%; opacity: 0; }
  }

  /* Smooth Line Drawing */
  .draw-line {
    width: 0;
    height: 1px;
    background: var(--cyan);
    transition: width 1.5s var(--ease-game);
  }
  .reveal.active .draw-line { width: 100%; }

  /* HUD UI Borders */
  .game-hud-border {
    position: fixed;
    top: 20px; bottom: 20px; left: 20px; right: 20px;
    border: 1px solid rgba(0, 240, 255, 0.1);
    pointer-events: none;
    z-index: 9000;
  }
  .game-hud-border::before, .game-hud-border::after {
    content: ''; position: absolute;
    width: 20px; height: 20px;
  }
  .game-hud-border::before { top: -1px; left: -1px; border-top: 2px solid var(--cyan); border-left: 2px solid var(--cyan); }
  .game-hud-border::after { bottom: -1px; right: -1px; border-bottom: 2px solid var(--cyan); border-right: 2px solid var(--cyan); }
  
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

// --- UI Sound Effects Engine (Tactile Game Feel) ---
const playHoverSFX = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    // Silently fail if audio context isn't allowed yet
  }
};


// --- Dynamic Web Audio API: OP E36 Hi-Tech Cinematic Ambience ---
let audioCtx;
let masterGain;
let filterNode;

const initCinematicAudio = () => {
  if (audioCtx) return; // Prevent multiple contexts
  
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  // Create the deep, emotional, grounding architecture of the prompt
  const subOsc = audioCtx.createOscillator();
  const padOsc1 = audioCtx.createOscillator();
  const padOsc2 = audioCtx.createOscillator();
  const lfo = audioCtx.createOscillator();
  
  filterNode = audioCtx.createBiquadFilter();
  masterGain = audioCtx.createGain();

  // 98Hz Sub Bass - Masculine, calming, psychologically grounding resonance (G2)
  subOsc.type = 'sine';
  subOsc.frequency.value = 98.00;

  // Warm mid/analog pad layers (D3 & G3 for a peaceful, resolved interval)
  padOsc1.type = 'triangle';
  padOsc1.frequency.value = 146.83; 
  padOsc2.type = 'sine';
  padOsc2.frequency.value = 196.00; 

  // Very slow breathing LFO to simulate the "quiet 2AM lab" atmosphere
  lfo.type = 'sine';
  lfo.frequency.value = 0.03; // Extremely slow 33-second cycle
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 150; // Modulate filter cutoff

  // Lowpass filter to remove ALL harsh treble and keep it "premium & muffled"
  filterNode.type = 'lowpass';
  filterNode.frequency.value = 350; 
  filterNode.Q.value = 0.5; // Very smooth, non-resonant curve

  // Routing
  lfo.connect(lfoGain);
  lfoGain.connect(filterNode.frequency);

  subOsc.connect(filterNode);
  padOsc1.connect(filterNode);
  padOsc2.connect(filterNode);
  
  filterNode.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  // Smooth, cinematic 8-second fade in
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 8); 
  
  subOsc.start();
  padOsc1.start();
  padOsc2.start();
  lfo.start();
};

const setAudioMuted = (muted) => {
  if (!masterGain || !audioCtx) return;
  const target = muted ? 0 : 0.08;
  masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 1);
};

// --- Advanced 3D Engine / Scroll Velocity Warp ---
const DimensionalEnvironment = ({ isWarping }) => {
  const canvasRef = useRef(null);
  const scrollVelocityRef = useRef(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    // Track Scroll Velocity for Game-like Momentum
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      scrollVelocityRef.current = delta;
      lastScrollYRef.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Decay the velocity over time
    const decayInterval = setInterval(() => {
      scrollVelocityRef.current *= 0.9; 
    }, 16);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    
    let targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let currentMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const handleMouseMove = (e) => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Node3D {
      constructor() {
        this.reset();
        this.z = Math.random() * 2000; 
      }
      reset() {
        this.x = (Math.random() - 0.5) * 4000;
        this.y = (Math.random() - 0.5) * 4000;
        this.z = 2000; 
      }
      update(speed) {
        this.z -= speed;
        if (this.z < 1) this.reset();
        if (this.z > 2000) this.z = 2000; // prevent backward overflow
      }
      draw(fov, cx, cy) {
        const scale = fov / this.z;
        const px = this.x * scale + cx;
        const py = this.y * scale + cy;

        if (px < 0 || px > canvas.width || py < 0 || py > canvas.height) return;

        const size = Math.max(0.1, (1 - this.z / 2000) * 3);
        const opacity = Math.max(0, 1 - this.z / 2000);

        ctx.fillStyle = `rgba(0, 240, 255, ${opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        
        return { px, py, opacity };
      }
    }

    const numNodes = window.innerWidth > 768 ? 500 : 200;
    for (let i = 0; i < numNodes; i++) nodes.push(new Node3D());

    let speed = 0.5; 
    
    const animate = () => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;
      
      const cx = canvas.width / 2 + (canvas.width / 2 - currentMouse.x) * 0.1;
      const cy = canvas.height / 2 + (canvas.height / 2 - currentMouse.y) * 0.1;
      const fov = canvas.width;

      ctx.fillStyle = 'rgba(1, 3, 8, 0.5)'; // Darker trail for crisper game feel
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scroll Velocity drastically increases speed (Warp Drive effect on scroll)
      const scrollSpeedBoost = Math.abs(scrollVelocityRef.current) * 0.8;
      const targetSpeed = isWarping ? 150 : (1.5 + scrollSpeedBoost);
      speed += (targetSpeed - speed) * 0.1;

      const projectedNodes = [];

      nodes.forEach(node => {
        // If scrolling up, reverse the starfield direction slightly
        const directionalSpeed = scrollVelocityRef.current < 0 ? -speed * 0.5 : speed;
        node.update(directionalSpeed);
        const proj = node.draw(fov, cx, cy);
        if (proj) projectedNodes.push({ ...node, ...proj });
      });

      if (!isWarping && speed < 10) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projectedNodes.length; i++) {
          for (let j = i + 1; j < projectedNodes.length; j++) {
            const p1 = projectedNodes[i];
            const p2 = projectedNodes[j];
            const dx = p1.px - p2.px;
            const dy = p1.py - p2.py;
            const dist = dx * dx + dy * dy;

            if (dist < 18000) { 
              const opacity = (1 - dist / 18000) * Math.min(p1.opacity, p2.opacity) * 0.4;
              ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(decayInterval);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [isWarping]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />;
};


// --- Precision Engineered Magnetic Cursor ---
const MagneticCursor = () => {
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [trailing, setTrailing] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const onMouseMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    let animationFrame;
    const updateTrail = () => {
      setTrailing(prev => ({
        x: prev.x + (mouse.x - prev.x) * 0.15,
        y: prev.y + (mouse.y - prev.y) * 0.15
      }));
      animationFrame = requestAnimationFrame(updateTrail);
    };
    updateTrail();
    return () => cancelAnimationFrame(animationFrame);
  }, [mouse]);

  return (
    <>
      <div 
        className="fixed w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[99999] transform -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ left: mouse.x, top: mouse.y }}
      />
      <div 
        className="fixed w-12 h-12 border border-[#00f0ff]/40 border-dashed rounded-full pointer-events-none z-[99998] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out mix-blend-difference animate-[spin_5s_linear_infinite]"
        style={{ left: trailing.x, top: trailing.y }}
      />
    </>
  );
};


// --- 3D Interactive Tilt Card Component ---
const TiltPanel = ({ children, className = "", delayClass = "" }) => {
  const panelRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -15; 
    const rotateY = ((x - cx) / cx) * 15;
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'none',
      zIndex: 10
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 1
    });
  };

  return (
    <div className={`reveal ${delayClass}`}>
      <div 
        ref={panelRef} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave} 
        onMouseEnter={playHoverSFX}
        className={`hud-panel ${className}`} 
        style={style}
      >
        {children}
      </div>
    </div>
  );
};


// --- Cinematic Boot Loader Sequence ---
const CinematicBootLoader = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); 
  const [termLines, setTermLines] = useState([]);
  const [qualityIndex, setQualityIndex] = useState(0);
  
  const terminalLog = [
    "INITIALIZING CORE SYSTEMS...",
    "VERIFYING IDENTITY PROTOCOLS...",
    "LOADING COGNITIVE MODULES...",
    "AUTHENTICATING PRESENCE...",
    "SYNCHRONIZING INTERFACE..."
  ];

  const qualities = ["DISCIPLINED", "RESILIENT", "ANALYTICAL", "VISIONARY", "ADAPTABLE", "LEADER"];

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      if (isMounted) setPhase(1);
      for (let i = 0; i < terminalLog.length; i++) {
        await new Promise(r => setTimeout(r, 120));
        if (isMounted) setTermLines(prev => [...prev, terminalLog[i]]);
      }

      await new Promise(r => setTimeout(r, 300));
      
      if (isMounted) setPhase(2);
      await new Promise(r => setTimeout(r, 1200));

      if (isMounted) setPhase(3);
      for (let i = 0; i < qualities.length; i++) {
        if (isMounted) setQualityIndex(i);
        await new Promise(r => setTimeout(r, 500));
      }

      if (isMounted) setPhase(4);
    };

    runSequence();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] bg-[#010308] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute w-[800px] h-[800px] bg-cyan-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className={`absolute top-1/2 left-1/4 transform -translate-y-1/2 font-mono text-xs md:text-sm text-[#00f0ff] tracking-widest leading-loose transition-opacity duration-500 ${phase === 1 ? 'opacity-60' : 'opacity-0'}`}>
        {termLines.map((line, i) => <div key={i}>{line}</div>)}
        <div className="blinking-cursor" />
      </div>

      <div className={`absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-6 transition-all duration-1000 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h1 className="font-display font-bold text-5xl md:text-8xl lg:text-9xl tracking-tighter sweep-mask">
          DEVANSH AGARWAL
        </h1>
      </div>

      <div className={`absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${phase === 3 ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="font-display text-xl md:text-3xl text-[#00f0ff] tracking-[0.5em] blur-[0.5px]">
          {qualities[qualityIndex]}
        </h2>
      </div>

      <div className={`absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-1000 ${phase === 4 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={onComplete}
          onMouseEnter={playHoverSFX}
          className="relative px-8 md:px-12 py-4 bg-transparent text-[#00f0ff] font-display text-sm md:text-lg tracking-[0.3em] uppercase group cursor-none overflow-hidden border border-[#00f0ff]/30 transition-all duration-300 hover:border-[#00f0ff] hover:shadow-[0_0_40px_rgba(0,240,255,0.4)] hover:text-white"
        >
          <div className="absolute inset-0 bg-[#00f0ff]/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
          <span className="relative z-10">INITIALIZE EXPERIENCE</span>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff] group-hover:w-full group-hover:h-full group-hover:border-opacity-30 transition-all duration-500 ease-out" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff] group-hover:w-full group-hover:h-full group-hover:border-opacity-30 transition-all duration-500 ease-out" />
        </button>
      </div>
    </div>
  );
};

// --- Custom Hooks ---
const useScrollReveal = (isActive) => {
  useEffect(() => {
    if (!isActive) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }); 

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isActive]);
};


// --- MAIN DIGITAL IDENTITY SYSTEM ---
export default function App() {
  const [bootStatus, setBootStatus] = useState('booting'); 
  const [isMuted, setIsMuted] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const roles = ["Student", "Learner", "Builder", "Strategist", "Developer", "Leader", "Problem Solver"];

  useScrollReveal(bootStatus !== 'booting');

  // Track global scroll progress for HUD
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (bootStatus !== 'active') return;
    const interval = setInterval(() => {
      setRoleIndex(prev => (prev + 1) % roles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [bootStatus]);

  const startSystem = () => {
    initCinematicAudio(); // Trigger the OP E36 Procedural Audio

    setBootStatus('warping');
    setTimeout(() => {
      setBootStatus('active');
    }, 1800); 
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setAudioMuted(!isMuted);
  };

  if (bootStatus === 'booting') {
    return (
      <>
        <style>{globalStyles}</style>
        <MagneticCursor />
        <CinematicBootLoader onComplete={startSystem} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen selection:bg-[#00f0ff] selection:text-black">
      <style>{globalStyles}</style>
      
      {/* Underlying Architecture */}
      <DimensionalEnvironment isWarping={bootStatus === 'warping'} />
      <MagneticCursor />

      {/* GAME HUD OVERLAY */}
      <div className="game-hud-border transition-opacity duration-1000" style={{ opacity: bootStatus === 'active' ? 1 : 0 }}>
        {/* Scroll Progress Indicator */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-32 bg-white/10 rounded-full overflow-hidden mr-[-2px]">
          <div className="w-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" style={{ height: `${scrollProgress}%` }} />
        </div>
        <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#00f0ff]/50 tracking-[0.2em]">
          SYS.POS // {Math.round(scrollProgress)}%
        </div>
      </div>

      {/* Audio Toggle */}
      <button 
        onClick={toggleMute}
        onMouseEnter={playHoverSFX}
        className="fixed top-8 right-8 z-[100] p-4 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all duration-300 cursor-none"
      >
        {isMuted ? <IconVolumeX size={18} /> : <IconVolume2 size={18} />}
      </button>

      {/* Content Layer */}
      <div className={`relative z-10 transition-opacity duration-1000 ${bootStatus === 'active' ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* --- SECTION 1: HERO SYSTEM (Strictly Centralized) --- */}
        <section id="hero" className="min-h-screen flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto pt-24 pb-12 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_30s_linear_infinite] pointer-events-none z-[-1]" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] border border-dashed border-[#00f0ff]/10 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none z-[-1]" />

          <div className="reveal flex flex-col items-center text-center max-w-4xl mx-auto w-full">
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-[8rem] font-bold tracking-tighter leading-[0.9] text-white mb-8 hover-expand-pure cursor-none transition-all duration-300 sweep-mask w-full">
              DEVANSH<br/>AGARWAL
            </h1>
            
            {/* WRAPPING TEXT BLOCK (Centralized & Contained) */}
            <div className="flex flex-col items-center gap-4 mb-12 w-full max-w-full">
              <span className="font-body text-lg md:text-2xl text-slate-300 font-light whitespace-normal hover-expand-pure cursor-none text-shimmer text-center">
                A system in continuous construction.
              </span>
              <div className="w-[2px] h-6 bg-white opacity-20 shrink-0" />
              <div className="flex items-center justify-center h-[2.5rem] overflow-hidden hover-expand-pure cursor-none w-full">
                <span key={roleIndex} className="font-display text-base md:text-xl text-[#00f0ff] animate-[slideUpFade_0.8s_ease-out] block truncate text-center">
                  {roles[roleIndex]}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              <a href="#contact" onMouseEnter={playHoverSFX} className="px-8 py-4 bg-white/5 border border-white/10 text-white font-display text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 cursor-none">
                INITIALIZE CONTACT
              </a>
              <a href="https://www.linkedin.com/in/devansh-agarwal-3640643b0/" target="_blank" rel="noopener noreferrer" onMouseEnter={playHoverSFX} className="px-8 py-4 bg-transparent border border-[#00f0ff]/30 text-[#00f0ff] font-display text-xs tracking-[0.2em] hover:bg-[#00f0ff]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-500 flex items-center gap-2 cursor-none">
                <IconLinkedin className="w-4 h-4" /> NETWORK
              </a>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: ORIGIN --- */}
        <section id="origin" className="min-h-screen flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto py-32">
          <div className="reveal mb-16">
            <h2 className="font-display text-xs tracking-[0.5em] text-[#00f0ff] mb-4 hover-expand cursor-none inline-block">01. Origin</h2>
            <div className="draw-line" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal delay-100 max-w-full">
              {/* Scaled down text to strictly prevent out-of-bounds rendering */}
              <h3 className="font-body text-3xl md:text-4xl lg:text-5xl font-light text-white leading-snug mb-8 hover-expand cursor-none transition-all duration-300">
                The foundation.<br/>
                The disciplined beginning.<br/>
                <span className="font-semibold text-[#00f0ff]">The cognitive architecture.</span>
              </h3>
              <p className="font-body text-base md:text-lg text-slate-400 leading-relaxed font-light pr-4">
                Initial parameters set to excellence. Consistent top performance throughout early iterations. Curiosity was the primary driver, executing logic and maintaining discipline to establish a strong foundational architecture.
              </p>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#00f0ff] to-transparent opacity-20" />
              
              <TiltPanel delayClass="delay-200" className="p-8 md:p-10 ml-12">
                <div className="scanner-line" />
                <div className="absolute -left-12 top-1/2 w-12 h-[1px] bg-[#00f0ff]/30" />
                <div className="absolute -left-[51px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#00f0ff] rounded-full shadow-[0_0_10px_#00f0ff]" />
                <div className="flex items-center gap-4 mb-4">
                  <IconTarget className="text-[#00f0ff] w-6 h-6" />
                  <h4 className="font-display text-sm tracking-widest text-white">Class 11-12</h4>
                </div>
                <p className="text-slate-400 font-light text-base">Early adaptation to analytical thinking, mathematics, and structured logic at Ess Ess Convent. Awaiting final compilation.</p>
              </TiltPanel>

              <TiltPanel delayClass="delay-300" className="p-8 md:p-10 ml-12">
                <div className="scanner-line" style={{ animationDelay: '1.5s' }} />
                <div className="absolute -left-12 top-1/2 w-12 h-[1px] bg-[#00f0ff]/30" />
                <div className="absolute -left-[51px] top-1/2 transform -translate-y-1/2 w-2 h-2 bg-slate-600 rounded-full" />
                <div className="flex items-center gap-4 mb-4">
                  <IconCpu className="text-slate-500 w-6 h-6" />
                  <h4 className="font-display text-sm tracking-widest text-white">Class 10 (ICSE)</h4>
                </div>
                <p className="text-slate-400 font-light text-base">Consistently ranking at the top percentile. Executed ICSE Board examinations with a verified output of <strong className="text-white">95.4%</strong> at St Georges School.</p>
              </TiltPanel>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: THE CATALYST --- */}
        <section id="catalyst" className="min-h-screen flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/5 to-transparent pointer-events-none" />
          
          <div className="reveal mb-16 relative z-10">
            <h2 className="font-display text-xs tracking-[0.5em] text-[#00f0ff] mb-4 hover-expand cursor-none inline-block">02. The Catalyst</h2>
            <div className="draw-line" />
          </div>

          <div className="reveal delay-100 relative z-10">
            <h3 className="font-display font-bold text-4xl md:text-6xl lg:text-[5.5rem] text-white leading-[1.1] tracking-tighter mb-14 hover-expand cursor-none transition-all duration-300">
              PRESSURE DIDN'T BREAK<br/>THE ARCHITECTURE.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6]">IT REFINED IT.</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="font-body text-xl md:text-2xl text-slate-300 font-light leading-relaxed border-l-2 border-[#00f0ff]/30 pl-8">
                The recent preparation phase was a calculated immersion into high-pressure resilience. A period of intense, focused grinding mastering quantitative and logical frameworks.
              </div>
              
              <TiltPanel delayClass="delay-200" className="p-10 border-l-2 border-l-[#00f0ff]">
                <div className="scanner-line" />
                <h4 className="font-display text-xs tracking-widest text-[#00f0ff] mb-4">CURRENT DIRECTIVE</h4>
                <p className="font-body text-lg text-slate-300 font-light">
                  Having successfully completed the <strong className="text-white">IPMAT examination</strong>, the system is awaiting results. This challenge serves as the catalyst for an aggressive drive to secure <strong className="text-[#00f0ff]">IIM Indore</strong>.
                </p>
              </TiltPanel>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: QUALITIES SYSTEM --- */}
        <section id="modules" className="min-h-screen flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto py-32">
          <div className="reveal mb-16">
            <h2 className="font-display text-xs tracking-[0.5em] text-[#00f0ff] mb-4 hover-expand cursor-none inline-block">03. Cognitive Modules</h2>
            <div className="draw-line" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TiltPanel delayClass="delay-100" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconHexagon className="text-[#00f0ff] w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Curious</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  A relentless desire to decode how systems, ideas, and human behaviors function at their core. Never accepting the surface level.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_01 // ACTIVE</div>
            </TiltPanel>

            <TiltPanel delayClass="delay-200" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconEye className="text-[#8b5cf6] w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Listener</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  Prioritizing high-signal absorption over noise. Actively processing incoming data to truly understand the root of any concept or problem.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_02 // ACTIVE</div>
            </TiltPanel>

            <TiltPanel delayClass="delay-300" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" style={{ animationDelay: '1.0s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconNetwork className="text-[#00f0ff] w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Efficiency</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  Wired to decode, internalize, and map out complex concepts with minimal mental friction. Grasping new paradigms with extreme velocity.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_03 // ACTIVE</div>
            </TiltPanel>
            
            <TiltPanel delayClass="delay-100" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" style={{ animationDelay: '0.2s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconShield className="text-white w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Resilient</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  Engineered to withstand academic and strategic pressure. Transforming rigorous challenges into fuel for relentless progression.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_04 // ACTIVE</div>
            </TiltPanel>

            <TiltPanel delayClass="delay-200" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" style={{ animationDelay: '0.7s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconTarget className="text-[#00f0ff] w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Visionary Leader</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  Combining empathy, strategic communication, and decisive action. Guiding the people operating within systems towards a unified objective.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_05 // CORE</div>
            </TiltPanel>

            <TiltPanel delayClass="delay-300" className="p-10 md:p-12 flex flex-col justify-between min-h-[350px] group relative">
              <div className="scanner-line" style={{ animationDelay: '1.2s' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <IconCpu className="text-[#8b5cf6] w-12 h-12 mb-8 opacity-80" />
                <h3 className="font-display text-xl text-white mb-4 tracking-wider">Analytical</h3>
                <p className="font-body text-lg text-slate-400 font-light leading-relaxed">
                  Deconstructing monolithic problems into actionable data structures. Operating purely on high-signal truth over assumptions.
                </p>
              </div>
              <div className="font-mono text-[10px] text-slate-600 tracking-widest mt-8 relative z-10">MOD_06 // ACTIVE</div>
            </TiltPanel>
          </div>
        </section>

        {/* --- SECTION 5: PHILOSOPHY --- */}
        <section id="philosophy" className="min-h-screen flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#00f0ff]/10 rounded-full pointer-events-none animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-dashed border-[#8b5cf6]/10 rounded-full pointer-events-none animate-[spin_80s_linear_infinite_reverse]" />
          
          <div className="reveal mb-16 relative z-10 text-center">
            <h2 className="font-display text-xs tracking-[0.5em] text-[#00f0ff] mb-4 hover-expand cursor-none inline-block">04. Core Philosophy</h2>
            <div className="draw-line mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full max-w-6xl mx-auto">
            
            <TiltPanel delayClass="delay-100" className="p-12 md:p-16 border-l-4 border-l-[#00f0ff] group">
              <div className="scanner-line" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="font-mono text-[10px] text-[#00f0ff] tracking-[0.3em] uppercase mb-8 opacity-50 group-hover:opacity-100 transition-opacity">SYS_THOUGHT // 01</div>
              <h2 className="font-body text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-slate-200 leading-tight group-hover:text-white transition-colors duration-500 relative z-10 text-breathe">
                "Discipline builds architecture."
              </h2>
            </TiltPanel>

            <TiltPanel delayClass="delay-200" className="p-12 md:p-16 border-l-4 border-l-[#8b5cf6] group">
              <div className="scanner-line" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="font-mono text-[10px] text-[#8b5cf6] tracking-[0.3em] uppercase mb-8 opacity-50 group-hover:opacity-100 transition-opacity">SYS_THOUGHT // 02</div>
              <h2 className="font-body text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-slate-200 leading-tight group-hover:text-white transition-colors duration-500 relative z-10 text-breathe" style={{ animationDelay: '1s' }}>
                "Complexity is the enemy of execution."
              </h2>
            </TiltPanel>

            <TiltPanel delayClass="delay-300" className="p-12 md:p-16 border-l-4 border-l-[#ff0055] group">
              <div className="scanner-line" style={{ animationDelay: '1.0s' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff0055]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="font-mono text-[10px] text-[#ff0055] tracking-[0.3em] uppercase mb-8 opacity-50 group-hover:opacity-100 transition-opacity">SYS_THOUGHT // 03</div>
              <h2 className="font-body text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-slate-200 leading-tight group-hover:text-white transition-colors duration-500 relative z-10 text-breathe" style={{ animationDelay: '2s' }}>
                "Curiosity expands systems."
              </h2>
            </TiltPanel>

            <TiltPanel delayClass="delay-400" className="p-12 md:p-16 border-l-4 border-l-white group">
              <div className="scanner-line" style={{ animationDelay: '1.5s' }} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="font-mono text-[10px] text-white tracking-[0.3em] uppercase mb-8 opacity-50 group-hover:opacity-100 transition-opacity">SYS_THOUGHT // 04</div>
              <h2 className="font-body text-3xl md:text-4xl font-bold uppercase tracking-[0.1em] text-slate-200 leading-tight group-hover:text-white transition-colors duration-500 relative z-10 text-breathe" style={{ animationDelay: '3s' }}>
                "Learning never reaches completion."
              </h2>
            </TiltPanel>

          </div>
        </section>

        {/* --- SECTION 6: FINAL CONTACT EXPERIENCE --- */}
        <section id="contact" className="min-h-[90vh] flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#00f0ff]/5 rounded-full pointer-events-none animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#8b5cf6]/5 rounded-full pointer-events-none animate-[spin_40s_linear_infinite_reverse]" />
          
          <div className="reveal text-center relative z-10 w-full mb-20">
            <div className="font-mono text-xs text-[#00f0ff] tracking-[0.5em] uppercase mb-6 flex justify-center items-center gap-4 hover-expand cursor-none w-max mx-auto">
              <div className="w-8 h-[1px] bg-[#00f0ff]" />
              End of Line
              <div className="w-8 h-[1px] bg-[#00f0ff]" />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter hover-expand cursor-none transition-all duration-300 leading-none">
              CONNECTION<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6]">ESTABLISHED.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full reveal delay-200">
            
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=tisdevansh@gmail.com" target="_blank" rel="noopener noreferrer" onMouseEnter={playHoverSFX} className="hud-panel p-10 group cursor-none flex flex-col items-center justify-center text-center">
              <div className="w-full flex justify-between items-start mb-12 opacity-50 font-mono text-[10px] tracking-widest text-slate-400">
                <span>TX_NODE_01</span>
                <span>SECURE</span>
              </div>
              <h3 className="font-display text-2xl text-white group-hover:text-glow transition-all duration-500 mb-2">Digital Comms</h3>
              <p className="font-body text-slate-400 font-light mb-8 group-hover:text-white transition-colors duration-500 break-all">tisdevansh@gmail.com</p>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff]/10 transition-all duration-500">
                <IconArrowRight className="text-white group-hover:text-[#00f0ff] w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a href="tel:+919105025690" onMouseEnter={playHoverSFX} className="hud-panel p-10 group cursor-none flex flex-col items-center justify-center text-center">
              <div className="w-full flex justify-between items-start mb-12 opacity-50 font-mono text-[10px] tracking-widest text-slate-400">
                <span>TX_NODE_02</span>
                <span>DIRECT</span>
              </div>
              <h3 className="font-display text-2xl text-white group-hover:text-glow transition-all duration-500 mb-2">Voice Protocol</h3>
              <p className="font-body text-slate-400 font-light mb-8 group-hover:text-white transition-colors duration-500">+91 9105025690</p>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff]/10 transition-all duration-500">
                <IconArrowRight className="text-white group-hover:text-[#00f0ff] w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            <a href="https://www.linkedin.com/in/devansh-agarwal-3640643b0/" target="_blank" rel="noopener noreferrer" onMouseEnter={playHoverSFX} className="hud-panel p-10 group cursor-none flex flex-col items-center justify-center text-center">
              <div className="w-full flex justify-between items-start mb-12 opacity-50 font-mono text-[10px] tracking-widest text-slate-400">
                <span>TX_NODE_03</span>
                <span>NETWORK</span>
              </div>
              <h3 className="font-display text-2xl text-white group-hover:text-glow transition-all duration-500 mb-2">LinkedIn</h3>
              <p className="font-body text-slate-400 font-light mb-8 group-hover:text-white transition-colors duration-500">Devansh Agarwal</p>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#00f0ff] group-hover:bg-[#00f0ff]/10 transition-all duration-500">
                <IconLinkedin className="text-white group-hover:text-[#00f0ff] w-5 h-5 transform group-hover:scale-110 transition-transform" />
              </div>
            </a>

          </div>
        </section>

        {/* --- CINEMATIC FOOTER --- */}
        <footer className="py-12 border-t border-white/5 relative z-10 flex flex-col items-center justify-center bg-[#000103]">
          <div className="font-display text-2xl font-bold tracking-tighter text-white/20 mb-4 hover-expand cursor-none">D.A.</div>
          <div className="font-mono text-[10px] text-slate-600 tracking-[0.3em] uppercase">
            System Architecture Designed for the Future
          </div>
        </footer>

      </div>
    </div>
  );
}
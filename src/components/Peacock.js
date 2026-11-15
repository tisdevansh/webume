import { useId } from 'react';

// Mayu, Vigil's peacock, redrawn from the app's Mascot.tsx.
// [body light, body dark, fan light, fan dark, cheek]
const PALETTE = {
  happy: ['#4F8DFF', '#1D3FB8', '#34D399', '#059669', '#FDA4AF'],
  proud: ['#5B9BFF', '#1D3FB8', '#4ADE80', '#059669', '#FDBA74'],
  angry: ['#6366F1', '#3730A3', '#2DD4BF', '#0F766E', '#F87171'],
  alert: ['#4F8DFF', '#1E40AF', '#2DD4BF', '#0F766E', '#FDBA74'],
  watching: ['#4F8DFF', '#1D3FB8', '#34D399', '#059669', '#FDA4AF'],
  shocked: ['#60A5FA', '#1E40AF', '#5EEAD4', '#0F766E', '#FCA5A5'],
};
const FAN = [-78, -52, -26, 0, 26, 52, 78];
const SPREAD = { proud: 1.1, alert: 1.06, angry: 1.12, shocked: 1.15 };
const EYES = [52, 68];
const BROWS = {
  angry: 'M45 42 L57 47 M75 42 L63 47',
  watching: 'M46 42.5 L57 43.5 M74 41 L63 43',
  alert: 'M46 40.5 L56 39.5 M74 40.5 L64 39.5',
};

export default function Peacock({ mood = 'happy', size = 120, className = '' }) {
  const id = useId().replace(/:/g, '');
  const [b1, b2, f1, f2, cheek] = PALETTE[mood] || PALETTE.happy;
  const big = mood === 'shocked' || mood === 'alert';
  const eyeR = big ? 7.6 : 6.6;
  const pupilR = mood === 'shocked' ? 2.2 : big ? 3.2 : 3.8;
  const spread = SPREAD[mood] ?? 1;
  return (
    <svg className={`peacock pk-${mood} ${className}`} viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Mayu the peacock, ${mood}`}>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f1} />
          <stop offset="1" stopColor={f2} />
        </linearGradient>
        <radialGradient id={`${id}b`} cx="40%" cy="28%" r="80%">
          <stop offset="0" stopColor={b1} />
          <stop offset="1" stopColor={b2} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="111" rx="26" ry="3.2" fill="rgba(0,0,0,.3)" />
      <g className="pk-bird">
        <g className="pk-fan">
          {FAN.map((a) => (
            <g key={a} className="pk-feather" data-a={a * spread} transform={`rotate(${a * spread} 60 76)`}>
              <path d="M60 76 C51 60 49 40 60 24 C71 40 69 60 60 76 Z" fill={`url(#${id}f)`} stroke={f2} strokeWidth="1" />
              <ellipse cx="60" cy="38" rx="6.2" ry="7.4" fill="#FBBF24" />
              <ellipse cx="60" cy="39" rx="4.3" ry="5.3" fill="#0EA5A4" />
              <ellipse cx="60" cy="40" rx="2.5" ry="3.2" fill="#172554" />
            </g>
          ))}
        </g>
        <ellipse cx="52.5" cy="107" rx="5.4" ry="2.6" fill="#F59E0B" />
        <ellipse cx="67.5" cy="107" rx="5.4" ry="2.6" fill="#F59E0B" />
        <ellipse cx="60" cy="86" rx="20" ry="21" fill={`url(#${id}b)`} />
        <ellipse cx="60" cy="92" rx="11.5" ry="12" fill="#fff" opacity=".2" />
        <ellipse cx="41.5" cy="87" rx="5.2" ry="10.5" fill={b2} transform="rotate(14 41.5 87)" />
        <ellipse cx="78.5" cy="87" rx="5.2" ry="10.5" fill={b2} transform="rotate(-14 78.5 87)" />
        <g className="pk-head">
          {[
            [51, 19],
            [60, 15.5],
            [69, 19],
          ].map(([x, y]) => (
            <g key={x}>
              <path d={`M60 35 L${x} ${y}`} stroke={b2} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx={x} cy={y} r="3.1" fill={f1} />
              <circle cx={x} cy={y} r="1.3" fill="#FBBF24" />
            </g>
          ))}
          <circle cx="60" cy="52" r="19.5" fill={`url(#${id}b)`} />
          <ellipse cx="45" cy="59" rx="3.8" ry="2.4" fill={cheek} opacity=".85" />
          <ellipse cx="75" cy="59" rx="3.8" ry="2.4" fill={cheek} opacity=".85" />
          {mood === 'proud' ? (
            <path d="M46 52.5 Q52 45 58 52.5 M62 52.5 Q68 45 74 52.5" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          ) : (
            <g className="pk-eyes">
              {EYES.map((x) => (
                <g key={x}>
                  <circle cx={x} cy="51" r={eyeR} fill="#fff" />
                  <circle className="pk-pupil" cx={x + (x < 60 ? 0.8 : -0.8)} cy="51.4" r={pupilR} fill="#0F172A" />
                  <circle cx={x + (x < 60 ? 2 : 0.4)} cy="49.8" r="1.3" fill="#fff" />
                </g>
              ))}
            </g>
          )}
          {BROWS[mood] && <path d={BROWS[mood]} stroke="#0B1440" strokeWidth="2.6" strokeLinecap="round" fill="none" />}
          <path d="M55 57.5 Q60 55 65 57.5 L60 64.5 Z" fill="#FBBF24" stroke="#B45309" strokeWidth=".9" strokeLinejoin="round" />
        </g>
      </g>
      {(mood === 'shocked' || mood === 'alert') && (
        <text x="94" y="32" fontSize="22" fill={mood === 'shocked' ? '#F87171' : '#FBBF24'} fontWeight="800">
          !
        </text>
      )}
    </svg>
  );
}

// Stills de demonstração: composições P&B com um único detalhe laranja,
// como pede o design system. Substituídos pela capa real quando o dono envia uma.
import { useId } from 'react';

const ORANGE = '#FF4F1A';

function Defs({ uid, dark }) {
  return (
    <defs>
      <filter id={`g${uid}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues={dark ? '0 0.22' : '0 0.16'} />
        </feComponentTransfer>
        <feBlend in2="SourceGraphic" mode="overlay" />
      </filter>
      <radialGradient id={`v${uid}`} cx="50%" cy="45%" r="75%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity={dark ? 0.75 : 0.4} />
      </radialGradient>
      <filter id={`b${uid}`}>
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id={`bs${uid}`}>
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
    </defs>
  );
}

const scenes = {
  product: (u) => (
    <>
      <linearGradient id={`p1${u}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2b2a" />
        <stop offset="1" stopColor="#0b0b0b" />
      </linearGradient>
      <rect width="100" height="100" fill={`url(#p1${u})`} />
      <ellipse cx="62" cy="34" rx="40" ry="30" fill="#5a5a57" opacity=".35" filter={`url(#b${u})`} />
      <rect x="0" y="70" width="100" height="30" fill="#1a1a1a" />
      <rect x="0" y="70" width="100" height=".4" fill="#6e6e6b" />
      <path d="M38 70 L40 40 Q50 36 60 40 L62 70 Z" fill="#d9d8d4" />
      <path d="M38 70 L40 40 Q44 38.4 47 38.2 L46 70 Z" fill="#f2f1ee" />
      <path d="M60 40 L62 70 L60.6 70 L58.8 41 Z" fill={ORANGE} />
      <rect x="40.5" y="48" width="19" height="9" fill="#151515" />
      <rect x="43" y="51" width="10" height="1" fill="#a3a3a0" />
      <rect x="43" y="53.4" width="6" height=".8" fill="#6e6e6b" />
      <path d="M47 36 C44 28 52 26 49 18 C47 12 53 10 51 4" stroke="#f2f1ee" strokeWidth="2.4" fill="none" opacity=".35" filter={`url(#b${u})`} />
      <path d="M53 36 C56 30 50 25 54 18" stroke="#f2f1ee" strokeWidth="1.6" fill="none" opacity=".25" filter={`url(#b${u})`} />
      <ellipse cx="50" cy="71" rx="16" ry="1.6" fill="#000" opacity=".7" filter={`url(#bs${u})`} />
    </>
  ),
  figure: (u) => (
    <>
      <linearGradient id={`f1${u}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b8b7b2" />
        <stop offset="1" stopColor="#6f6e6a" />
      </linearGradient>
      <rect width="100" height="100" fill={`url(#f1${u})`} />
      <rect x="0" y="0" width="22" height="100" fill="#8c8b87" opacity=".5" />
      <rect x="22" y="0" width=".35" height="100" fill="#5c5c5a" />
      <rect x="71" y="0" width=".35" height="100" fill="#5c5c5a" />
      <rect x="0" y="82" width="100" height="18" fill="#4a4a48" />
      <path d="M50 18 C43 18 40 24 40.5 30 L38 34 C33 36 30 42 29 52 L27 82 L36 82 L37 64 L40 82 L60 82 L63 64 L64 82 L73 82 L71 52 C70 42 67 36 62 34 L59.5 30 C60 24 57 18 50 18 Z" fill="#111" />
      <path d="M43 27 Q50 24 57 27 L56.5 31 Q50 29.6 43.5 31 Z" fill="#2a2a2a" />
      <path d="M42 36 L56 62" stroke={ORANGE} strokeWidth="1.3" />
      <rect x="54.5" y="58" width="4" height="6" fill={ORANGE} transform="rotate(-28 56 61)" />
      <ellipse cx="50" cy="83" rx="26" ry="2" fill="#000" opacity=".5" filter={`url(#bs${u})`} />
    </>
  ),
  arch: (u) => (
    <>
      <linearGradient id={`a1${u}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e8e7e3" />
        <stop offset="1" stopColor="#a9a8a4" />
      </linearGradient>
      <rect width="100" height="100" fill={`url(#a1${u})`} />
      <path d="M8 100 L8 30 L46 12 L46 100 Z" fill="#3a3a38" />
      <path d="M46 12 L78 26 L78 100 L46 100 Z" fill="#6e6e6b" />
      <path d="M46 12 L78 26 L78 30 L46 17 Z" fill="#8c8b87" />
      {[36, 48, 60, 72, 84].map((y) => (
        <path key={y} d={`M8 ${y} L46 ${y - 8}`} stroke="#2a2a2a" strokeWidth=".5" />
      ))}
      {[34, 46, 58, 70, 82].map((y) => (
        <path key={y} d={`M46 ${y - 6} L78 ${y}`} stroke="#5c5c5a" strokeWidth=".4" />
      ))}
      <rect x="58" y="38" width="3" height="40" fill={ORANGE} />
      <path d="M78 26 L96 34 L96 100 L78 100 Z" fill="#4a4a48" />
      <rect x="0" y="94" width="100" height="6" fill="#2a2a2a" />
    </>
  ),
  fabric: (u) => (
    <>
      <rect width="100" height="100" fill="#141414" />
      <linearGradient id={`c1${u}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f2f1ee" />
        <stop offset=".5" stopColor="#8c8b87" />
        <stop offset="1" stopColor="#e2e1dd" />
      </linearGradient>
      <path d="M-10 30 C20 10 40 60 70 38 C85 27 100 34 112 26 L112 58 C96 66 84 56 70 66 C42 88 20 44 -10 64 Z" fill={`url(#c1${u})`} />
      <path d="M-10 52 C18 36 40 78 72 58 C88 48 100 56 112 50 L112 62 C98 66 86 60 72 68 C42 86 18 52 -10 70 Z" fill="#3a3a38" opacity=".8" />
      <path d="M-10 44 C24 26 44 70 74 50 C88 41 100 48 112 40" stroke={ORANGE} strokeWidth=".9" fill="none" />
      <rect x="0" y="0" width="100" height="100" fill="#000" opacity=".12" />
    </>
  ),
  crowd: (u) => (
    <>
      <rect width="100" height="100" fill="#070707" />
      <path d="M50 0 L20 80 L80 80 Z" fill="#f2f1ee" opacity=".12" filter={`url(#b${u})`} />
      <path d="M22 0 L4 80 L40 80 Z" fill="#f2f1ee" opacity=".08" filter={`url(#b${u})`} />
      <path d="M78 0 L60 80 L96 80 Z" fill="#f2f1ee" opacity=".08" filter={`url(#b${u})`} />
      <circle cx="50" cy="6" r="3" fill={ORANGE} />
      <circle cx="50" cy="6" r="9" fill={ORANGE} opacity=".25" filter={`url(#b${u})`} />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = (i * 4.9) % 104 - 2;
        const y = 78 + ((i * 7) % 5);
        return <circle key={i} cx={x} cy={y} r={3.2 + ((i * 3) % 3) * 0.5} fill="#000" />;
      })}
      <rect x="0" y="80" width="100" height="20" fill="#000" />
      <path d="M30 78 L33 66 L35 78 Z" fill="#000" />
      <path d="M64 77 L66 63 L69 77 Z" fill="#000" />
    </>
  ),
  hands: (u) => (
    <>
      <linearGradient id={`h1${u}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dcdbd7" />
        <stop offset="1" stopColor="#9a9995" />
      </linearGradient>
      <rect width="100" height="100" fill={`url(#h1${u})`} />
      <ellipse cx="50" cy="14" rx="22" ry="5" fill="#111" />
      <path d="M50 14 L18 70 L82 70 Z" fill="#fff" opacity=".35" filter={`url(#b${u})`} />
      <rect x="0" y="70" width="100" height="30" fill="#2a2a2a" />
      <rect x="0" y="70" width="100" height=".5" fill="#8c8b87" />
      <rect x="26" y="62" width="48" height="8" fill="#e2e1dd" />
      <rect x="30" y="64" width="16" height="1" fill="#5c5c5a" />
      <circle cx="68" cy="66" r="1.4" fill={ORANGE} />
      <path d="M36 62 C34 52 40 46 44 50 C46 44 52 44 52 50 C55 46 60 48 58 56 L56 62 Z" fill="#1a1a1a" />
    </>
  ),
};

export default function Poster({ kind = 'product', className = '', label }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const dark = kind === 'product' || kind === 'crowd' || kind === 'fabric';
  const scene = scenes[kind] || scenes.product;
  return (
    <svg
      className={`poster ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Defs uid={raw} dark={dark} />
      <g filter={`url(#g${raw})`}>
        {scene(raw)}
        <rect width="100" height="100" fill={`url(#v${raw})`} />
      </g>
    </svg>
  );
}

// Primitivos do sistema Concreto em React.
import { useEffect, useState } from 'react';
import Poster from './Poster.jsx';
import { STILLS } from '../assets/stills/index.js';

export function Icon({ name, size = 20 }) {
  const p = {
    arrow: 'M4 12h15M13 6l6 6-6 6',
    'arrow-left': 'M20 12H5M11 6l-6 6 6 6',
    'arrow-up-right': 'M7 17L17 7M9 7h8v8',
    plus: 'M12 4v16M4 12h16',
    minus: 'M4 12h16',
    close: 'M6 6l12 12M18 6L6 18',
    menu: 'M4 7h16M4 12h16M4 17h16',
    play: 'M8 5l11 7-11 7z',
    calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
    check: 'M5 12l5 5 9-10',
  }[name];
  return (
    <svg className="cc-icon" width={size} height={size} viewBox="0 0 24 24" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
      <path d={p} />
    </svg>
  );
}

export function Button({ variant = 'primary', arrow = true, href, children, className = '', ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag className={`cc-btn cc-btn--${variant} ${className}`} href={href} {...rest}>
      <span>{children}</span>
      {arrow && (
        <span className="cc-btn__arrow">
          <Icon name="arrow" size={16} />
        </span>
      )}
    </Tag>
  );
}

export function IconButton({ icon, label, variant = 'outline', size = '', ...rest }) {
  return (
    <button type="button" className={`cc-ibtn cc-ibtn--${variant} ${size ? 'cc-ibtn--' + size : ''}`} data-icon={icon} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

export function SectionIndex({ n, label, line = false }) {
  return (
    <div className={`sx ${line ? 'sx--line' : ''}`}>
      <span className="sx__n">/ {String(n).padStart(2, '0')}</span>
      <span className="sx__label">{label}</span>
      {line && <span className="sx__rule" data-line />}
    </div>
  );
}

export function Bracket({ children, tone }) {
  return <span className={`brk ${tone === 'accent' ? 'brk--accent' : ''}`}>[ {children} ]</span>;
}

export function Readout({ children, tone, scramble = true, className = '' }) {
  return (
    <span className={`ro ${tone === 'accent' ? 'ro--accent' : ''} ${className}`} data-scramble={scramble ? '' : undefined}>
      {children}
    </span>
  );
}

// Título display em caixa-alta, uma linha por item, a última em outro tom.
export function DisplayTitle({ as: Tag = 'h2', lines, size = 'h1', tone = 'muted', id }) {
  return (
    <Tag className={`dt dt--${size}`} id={id} data-title>
      {lines.map((l, i) => (
        <span key={i} className={`dt__line ${i === lines.length - 1 && tone !== 'none' ? 'dt__line--' + tone : ''}`}>
          <span className="dt__inner">{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Crosshairs() {
  return (
    <>
      <span className="xh xh--tl" aria-hidden="true" />
      <span className="xh xh--tr" aria-hidden="true" />
      <span className="xh xh--bl" aria-hidden="true" />
      <span className="xh xh--br" aria-hidden="true" />
    </>
  );
}

export const RATIO = { '9:16': 9 / 16, '16:9': 16 / 9, '1:1': 1, '4:5': 4 / 5 };
export const FORMAT_LABEL = { '9:16': 'Reels', '16:9': 'Horizontal', '1:1': 'Quadrado', '4:5': 'Feed' };

export function fmtDur(s) {
  s = Math.round(Number(s) || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
export function timecode(s) {
  s = Math.round(Number(s) || 0);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return [h, m, x, 12].map((v) => String(v).padStart(2, '0')).join(':');
}

// Quadro de vídeo com HUD: rótulo, formato, timecode e trilho de progresso.
export function MediaFrame({ media, src, posterSrc, label, index, autoPlay = false, controls = false, className = '', children, chamfer }) {
  const isEmbed = src && /youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|instagram\.com|drive\.google\.com|mediadelivery\.net/.test(src);
  return (
    <div className={`mf ${chamfer ? 'cc-chamfer--' + chamfer : ''} ${className}`} style={{ aspectRatio: String(RATIO[media.format] || 9 / 16) }}>
      <div className="mf__media" data-media>
        {src && !isEmbed ? (
          <video src={src} poster={posterSrc || undefined} muted playsInline loop autoPlay={autoPlay} controls={controls} preload="metadata" />
        ) : src && isEmbed && controls ? (
          <iframe src={toEmbed(src)} title={label || 'Vídeo'} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : posterSrc || STILLS[media.poster] ? (
          <img src={posterSrc || STILLS[media.poster]} alt="" decoding="async" />
        ) : (
          <Poster kind={media.poster} />
        )}
      </div>
      <span className="mf__corner mf__corner--tl" aria-hidden="true" />
      <span className="mf__corner mf__corner--tr" aria-hidden="true" />
      <span className="mf__corner mf__corner--bl" aria-hidden="true" />
      <span className="mf__corner mf__corner--br" aria-hidden="true" />
      <div className="mf__hud mf__hud--top">
        {index != null && <span>[ {String(index).padStart(2, '0')} ]</span>}
        <span>{media.format}</span>
      </div>
      <div className="mf__hud mf__hud--bottom">
        <span>TC {timecode(media.duration)}</span>
        <span>{fmtDur(media.duration)}</span>
      </div>
      <div className="mf__rail" aria-hidden="true">
        <span />
      </div>
      {children}
    </div>
  );
}

export function toEmbed(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('mediadelivery.net')) return url; // Bunny Stream: link já assinado
    // YouTube (inclui Shorts): domínio sem cookies e sem vídeos relacionados de outros canais no fim
    const yt = (id) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;
    if (u.hostname.includes('youtu.be')) return yt(u.pathname.slice(1));
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/embed/')) return url;
      return yt(u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop());
    }
    if (u.hostname.includes('vimeo.com')) return 'https://player.vimeo.com/video/' + u.pathname.split('/').filter(Boolean).pop();
    if (u.hostname.includes('instagram.com')) return url.replace(/\/?(\?.*)?$/, '/embed');
    if (u.hostname.includes('drive.google.com')) return url.replace(/\/view.*$/, '/preview');
  } catch {}
  return url;
}

// Resolve a URL tocável de um formato de vídeo:
// Bunny (bunnyId) → pede o link assinado ao servidor; senão link colado ou arquivo enviado.
export function useMediaSrc(store, media) {
  const direct = media?.bunnyId ? '' : store.mediaSrc(media?.videoUrl || media?.videoAsset);
  const [signed, setSigned] = useState('');
  useEffect(() => {
    setSigned('');
    if (!media?.bunnyId || !store.embedUrl) return;
    let alive = true;
    store.embedUrl(media.bunnyId).then((u) => alive && setSigned(u)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [store, media?.bunnyId]);
  return media?.bunnyId ? signed : direct;
}

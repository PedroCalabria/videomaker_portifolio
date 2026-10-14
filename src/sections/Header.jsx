import { useEffect, useState } from 'react';
import { BRAND, STATS } from '../data/content.js';
import { Button, Icon, DisplayTitle, Readout, Crosshairs } from '../components/ui.jsx';
import { STILLS } from '../assets/stills/index.js';

const LINKS = [
  { href: '#depoimentos', label: 'Depoimentos', n: 2, desktop: false },
  { href: '#trabalhos', label: 'Trabalhos', n: 3 },
  { href: '#planos', label: 'Planos', n: 4 },
  { href: '#pacotes', label: 'Pacotes', n: 5 },
  { href: '#faq', label: 'FAQ', n: 6 },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="nav" data-nav>
      <div className="gridlines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="nav__left">
        <a className="nav__brand" href="#topo" aria-label={`${BRAND}, início`}>
          <span className="nav__name">{BRAND}</span>
          <span className="nav__role">Captação · Edição</span>
        </a>
        <nav className="nav__links" aria-label="Seções">
          {LINKS.filter((l) => l.desktop !== false).map((l) => (
            <a key={l.href} href={l.href}>
              <span aria-hidden="true">+</span> {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="nav__right">
        <span className="nav__status">Agenda aberta · Nov 2026</span>
        <a className="nav__cta" href="#agendar">
          Agendar conversa <Icon name="arrow" size={14} />
        </a>
      </div>
      <button type="button" className="nav__menu" aria-expanded={open} aria-controls="menu-mobile" onClick={() => setOpen(!open)}>
        <Icon name={open ? 'close' : 'menu'} />
        <span className="cc-sr">{open ? 'Fechar menu' : 'Abrir menu'}</span>
      </button>
      <div id="menu-mobile" className={`nav__sheet ${open ? 'is-open' : ''}`} hidden={!open}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="nav__sheet-cta" href="#agendar" onClick={() => setOpen(false)}>
          Agendar conversa <Icon name="arrow" size={16} />
        </a>
      </div>
    </header>
  );
}

// Barra fixa de conversão no celular: aparece quando o CTA do hero sai da tela
// e some quando a seção de agendamento entra.
export function MobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('.hero__ctas');
    const final = document.getElementById('agendar');
    const plans = document.querySelector('.plan--featured');
    if (!hero || !final || !('IntersectionObserver' in window)) return;
    let heroOut = false, finalIn = false, plansIn = false;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.target === hero) heroOut = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === final) finalIn = e.isIntersecting;
        if (e.target === plans) plansIn = e.isIntersecting;
      });
      setShow(heroOut && !finalIn && !plansIn);
    });
    io.observe(hero);
    io.observe(final);
    if (plans) io.observe(plans);
    return () => io.disconnect();
  }, []);
  return (
    <a className={`mcta ${show ? 'is-on' : ''}`} href="#agendar" aria-hidden={!show} tabIndex={show ? 0 : -1}>
      <span>Agendar conversa</span>
      <span className="mcta__meta">30 min · sem custo</span>
      <Icon name="arrow" size={16} />
    </a>
  );
}

const REEL = [
  { key: 'figure', client: 'Studio Forma', title: 'Série de treinos curtos', dur: 45, metric: '3,4×', label: 'mais salvamentos' },
  { key: 'product', client: 'Café Moinho', title: 'Lançamento do blend Serra', dur: 32, metric: '+212%', label: 'de alcance no 1º mês' },
  { key: 'hands', client: 'Clínica Vértice', title: 'Bastidores do atendimento', dur: 28, metric: '+64', label: 'agendamentos pelo Instagram' },
  { key: 'hero', client: 'Festival Maré', title: 'Cobertura em tempo real', dur: 26, metric: '10', label: 'reels no mesmo dia' },
];
const THUMBS = [
  { key: 'product', client: 'Café Moinho', metric: '+212%' },
  { key: 'figure', client: 'Studio Forma', metric: '3,4×' },
  { key: 'hands', client: 'Vértice', metric: '+64' },
];
const SLIDE_MS = 3200;

function useReel(n) {
  const [i, setI] = useState(0);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (new URLSearchParams(window.location.search).has('nomotion')) return;
    const id = setInterval(() => setI((x) => (x + 1) % n), SLIDE_MS);
    return () => clearInterval(id);
  }, [n, tick]);
  const go = (d) => {
    setI((x) => (x + d + n) % n);
    setTick((t) => t + 1);
  };
  return [i, go];
}

export function Hero() {
  const [i, go] = useReel(REEL.length);
  const cur = REEL[i];
  return (
    <section className="hero" id="topo" aria-labelledby="hero-title">
      <div className="gridlines" aria-hidden="true">
        <span data-line-v />
        <span data-line-v />
        <span data-line-v />
      </div>
      <span className="xh hero__xh" aria-hidden="true" />
      <div className="hero__text">
        <p className="hero__eyebrow">
          <span className="brk">[ Captação e edição para negócios e marcas ]</span>
          <span className="hero__rule" data-line />
        </p>
        <DisplayTitle as="h1" id="hero-title" size="display-xl" tone="muted" lines={['Reels', 'que param', 'o scroll.']} />
        <p className="cc-lead hero__lead" data-reveal>
          Gravo e edito reels para negócios, marcas e profissionais que precisam postar toda semana.
        </p>
        <div className="hero__ctas" data-reveal>
          <Button variant="accent" href="#agendar">
            Agendar conversa
          </Button>
          <a className="hero__link" href="#trabalhos">
            Ver trabalhos <Icon name="arrow" size={16} />
          </a>
        </div>
        <div className="hero__proof" data-reveal>
          <div className="hero__work">
            <div className="hero__work-head">
              <span className="brk">[ Resultados recentes ]</span>
              <a href="#trabalhos" className="hero__work-link">
                Ver trabalhos <Icon name="arrow" size={14} />
              </a>
            </div>
            <ul className="hero__thumbs">
              {THUMBS.map((t) => (
                <li key={t.key}>
                  <a href="#trabalhos" aria-label={`${t.client}: ${t.metric}. Ver trabalhos`}>
                    <img src={STILLS[t.key]} alt="" />
                    <span className="hero__tile-play" aria-hidden="true">
                      <Icon name="play" size={10} />
                    </span>
                    <span className="hero__cap" aria-hidden="true">
                      <b>{t.metric}</b>
                      <small>{t.client}</small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="hero__visual">
        <span className="hero__side-label" aria-hidden="true">
          Reel {String(i + 1).padStart(2, '0')} — {String(REEL.length).padStart(2, '0')} · 9:16
        </span>
        <div className="reel-wrap" data-image>
        <div className="reel reel--front">
          <div className="reel__still">
            <div data-media>
              {REEL.map((r, k) => (
                <img key={r.key} src={STILLS[r.key]} alt={k === i ? `${r.client}: ${r.title}` : ''} className={k === i ? 'is-on' : ''} decoding="async" />
              ))}
            </div>
          </div>
          <div className="reel__scrim" aria-hidden="true" />
          <div className="reel__hud reel__hud--top">
            <span>[ {String(i + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')} ]</span>
            <span>9:16 · 4K</span>
          </div>
          <span className="reel__mark reel__mark--tl" aria-hidden="true" />
          <span className="reel__mark reel__mark--br" aria-hidden="true" />
          <div className="reel__hud reel__hud--bottom">
            <p className="reel__metric">
              <strong>{cur.metric}</strong> {cur.label}
            </p>
            <p className="reel__title">
              {cur.client} — {cur.title}
            </p>
            <div className="reel__row">
              <span>TC 00:00:{String(cur.dur).padStart(2, '0')}:12</span>
              <div className="reel__ctrl">
                <button type="button" className="reel__btn" aria-label="Reel anterior" onClick={() => go(-1)}>
                  <Icon name="arrow-left" size={16} />
                </button>
                <button type="button" className="reel__btn" aria-label="Próximo reel" onClick={() => go(1)}>
                  <Icon name="arrow" size={16} />
                </button>
              </div>
            </div>
            <span className="hero__rail" aria-hidden="true">
              <span key={i} className="is-running" />
            </span>
          </div>
        </div>
        </div>
        <span className="xh hero__xh3" aria-hidden="true" />
        <span className="xh hero__xh4" aria-hidden="true" />
      </div>
    </section>
  );
}

export function Stats() {
  return (
    <section className="stats cc-inverse" aria-label="Em números">
      <div className="stats__head">
        <span className="brk">[ Em números ]</span>
        <p>Desde 2019, edição com prazo curto e captação pensada para o formato vertical.</p>
      </div>
      <dl className="stats__grid" data-group>
        {STATS.map((s) => (
          <div className="stats__item" key={s.label}>
            <Crosshairs />
            <dt className="cc-t-micro">{s.label}</dt>
            <dd>
              <span data-count={s.value}>{s.value}</span>
              {s.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

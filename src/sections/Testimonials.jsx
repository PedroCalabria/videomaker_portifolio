import { DisplayTitle } from '../components/ui.jsx';
import { EXTRA_TESTIMONIALS } from '../data/content.js';

// Depoimentos em duas fileiras que correm sozinhas, em sentidos opostos.
// Fonte: depoimentos cadastrados nos projetos (área do dono). Se houver poucos,
// completa com EXTRA_TESTIMONIALS até ter o bastante para as duas fileiras.
const MIN_ITEMS = 6;
const PER_ROW_LOOP = 5; // cada fileira repete os cards até ter pelo menos isto, para o loop não mostrar buracos

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function collect(projects) {
  const fromProjects = (projects || [])
    .filter((p) => p.testimonial?.quote)
    .map((p) => ({
      quote: p.testimonial.quote,
      author: p.testimonial.author,
      role: p.testimonial.role,
      metric: p.result?.metric,
      label: p.result?.label,
    }));
  if (fromProjects.length >= MIN_ITEMS) return fromProjects;
  const seen = new Set(fromProjects.map((t) => t.author));
  return [...fromProjects, ...EXTRA_TESTIMONIALS.filter((t) => !seen.has(t.author))];
}

function Card({ t, n }) {
  return (
    <figure className="tcard">
      <span className="xh xh--tl" aria-hidden="true" />
      <div className="tcard__top">
        {t.metric && (
          <span className="ro tcard__metric">
            <b>{t.metric}</b> {t.label}
          </span>
        )}
      </div>
      <blockquote className="tcard__quote">“{t.quote}”</blockquote>
      <figcaption className="tcard__by">
        <span className="tcard__init" aria-hidden="true">
          {initials(t.author)}
        </span>
        <span className="tcard__who">
          <b>{t.author}</b>
          <small>{t.role}</small>
        </span>
      </figcaption>
    </figure>
  );
}

function Row({ items, offset, reverse, speed }) {
  if (!items.length) return null;
  const reps = Math.max(1, Math.ceil(PER_ROW_LOOP / items.length));
  const seq = Array.from({ length: reps }, () => items).flat();
  return (
    <div className={`tst__row ${reverse ? 'tst__row--rev' : ''}`}>
      <div className="tst__track" style={{ '--tst-dur': `${seq.length * speed}s` }}>
        <div className="tst__set">
          {seq.map((t, i) => (
            <div className="tst__cell" key={i} aria-hidden={i >= items.length ? true : undefined}>
              <Card t={t} n={offset + (i % items.length) + 1} />
            </div>
          ))}
        </div>
        {/* cópia para o loop contínuo; leitores de tela ignoram */}
        <div className="tst__set" aria-hidden="true">
          {seq.map((t, i) => (
            <div className="tst__cell" key={i}>
              <Card t={t} n={offset + (i % items.length) + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ projects }) {
  const all = collect(projects);
  const half = Math.ceil(all.length / 2);
  const top = all.slice(0, half);
  const bottom = all.slice(half);
  return (
    <section className="tst cc-inverse" id="depoimentos" aria-labelledby="tst-title">
      <div className="tst__head">
        <div className="tst__title">
          <DisplayTitle id="tst-title" size="h1" tone="muted" lines={['Quem grava', 'comigo indica']} />
        </div>
      </div>
      <div className="tst__rows" data-reveal>
        <Row items={top} offset={0} speed={9} />
        <Row items={bottom.length ? bottom : top} offset={bottom.length ? half : 0} reverse speed={10} />
      </div>
    </section>
  );
}

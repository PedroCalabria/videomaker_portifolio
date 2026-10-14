import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, DisplayTitle, FORMAT_LABEL, Icon, IconButton, MediaFrame, RATIO, fmtDur, useMediaSrc } from '../components/ui.jsx';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '9:16', label: 'Reels 9:16' },
  { id: '16:9', label: 'Horizontal 16:9' },
  { id: '4:5', label: 'Feed 4:5' },
  { id: '1:1', label: 'Quadrado 1:1' },
];

export function Work({ projects, store, onInterest }) {
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const rowRef = useRef(null);
  const [pos, setPos] = useState({ i: 1, p: 0, atStart: true, atEnd: false });

  const items = useMemo(() => {
    const list = projects || [];
    return list
      .map((p) => {
        const media = filter === 'all' ? p.media?.[0] : p.media?.find((m) => m.format === filter);
        return media ? { p, media } : null;
      })
      .filter(Boolean);
  }, [projects, filter]);

  const counts = useMemo(() => {
    const c = { all: (projects || []).length };
    (projects || []).forEach((p) => new Set((p.media || []).map((m) => m.format)).forEach((f) => (c[f] = (c[f] || 0) + 1)));
    return c;
  }, [projects]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      const p = max > 0 ? el.scrollLeft / max : 0;
      const cards = [...el.children];
      let i = 1;
      cards.forEach((c, k) => {
        if (c.offsetLeft - el.offsetLeft <= el.scrollLeft + 8) i = k + 1;
      });
      setPos({ i, p, atStart: el.scrollLeft < 4, atEnd: el.scrollLeft > max - 4 });
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [items.length]);

  const step = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.children[0];
    const w = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * Math.max(w, el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <section className="work cc-section" id="trabalhos" aria-labelledby="work-title">
      <div className="work__head">
        <DisplayTitle id="work-title" size="display-l" lines={['Trabalhos', 'recentes']} />
      </div>

      <div className="work__bar" data-line-top>
        <div className="work__filters" role="tablist" aria-label="Filtrar por formato">
          {FILTERS.filter((f) => f.id === 'all' || counts[f.id]).map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className="chip" onClick={() => setFilter(f.id)}>
              {f.label} <span className="chip__n">{String(counts[f.id] || 0).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <div className="work__nav">
          <span className="ro" aria-live="polite">
            [ {String(Math.min(pos.i, items.length)).padStart(2, '0')} / {String(items.length).padStart(2, '0')} ]
          </span>
          <IconButton icon="arrow-left" label="Projetos anteriores" onClick={() => step(-1)} disabled={pos.atStart} />
          <IconButton icon="arrow" label="Próximos projetos" variant="solid" onClick={() => step(1)} disabled={pos.atEnd} />
        </div>
      </div>

      <ul className="work__row" ref={rowRef} data-group-x>
        {projects === null && <li className="work__empty ro">Carregando projetos…</li>}
        {projects && items.length === 0 && <li className="work__empty ro">[ Nenhum projeto neste formato ainda ]</li>}
        {items.map(({ p, media }, k) => {
          const extra = (p.media || []).length - 1;
          return (
            <li key={p.id + media.format} className="card" style={{ '--ar': media.format.replace(':', '/') }}>
              <button type="button" className="card__hit" onClick={() => setOpen({ p, mediaId: media.id })} aria-label={`Abrir ${p.title}, ${p.client}`}>
                <MediaFrame media={media} src={store.mediaSrc(media.videoUrl || media.videoAsset)} posterSrc={store.mediaSrc(media.posterAsset)}>
                  <span className="card__play" aria-hidden="true">
                    <Icon name="play" size={14} />
                  </span>
                </MediaFrame>
              </button>
              <div className="card__meta">
                <div className="card__line">
                  <span className="cc-t-micro">{FORMAT_LABEL[media.format]} · {fmtDur(media.duration)}</span>
                  {extra > 0 && <span className="cc-t-micro card__more">+{extra} formato{extra > 1 ? 's' : ''}</span>}
                </div>
                <h3 className="card__title">{p.title}</h3>
                <p className="card__client">
                  {p.client} · {p.year}
                </p>
                {p.result?.metric && (
                  <p className="card__result">
                    <strong>{p.result.metric}</strong> {p.result.label}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="work__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${Math.max(0.08, pos.p)})` }} />
      </div>

      {open && <ProjectModal project={open.p} initialMedia={open.mediaId} store={store} onClose={() => setOpen(null)} onInterest={onInterest} />}
    </section>
  );
}

function ProjectModal({ project: p, initialMedia, store, onClose, onInterest }) {
  const [mid, setMid] = useState(initialMedia);
  const media = p.media.find((m) => m.id === mid) || p.media[0];
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
      prev?.focus?.();
    };
  }, [onClose]);
  const src = useMediaSrc(store, media);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pm-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__panel" ref={ref} tabIndex={-1}>
        <div className="modal__top">
          <span className="brk">[ {p.category} ]</span>
          <IconButton icon="close" label="Fechar" onClick={onClose} />
        </div>
        <div className="modal__body">
          <div className="modal__media">
            {/* Palco de tamanho fixo: o vídeo se encaixa dentro dele em qualquer formato,
                então trocar o formato não mexe no resto do modal. */}
            <div className="modal__stage" style={{ '--r': String(RATIO[media.format] || 9 / 16) }}>
              <MediaFrame key={media.id} media={media} src={src} posterSrc={store.mediaSrc(media.posterAsset)} controls chamfer="tr" className="modal__mf">
                {!src && (
                  <span className="modal__playhint">
                    {media.bunnyId ? (
                      'Carregando vídeo…'
                    ) : (
                      <>
                        <Icon name="play" size={12} /> Prévia · {fmtDur(media.duration)}
                      </>
                    )}
                  </span>
                )}
              </MediaFrame>
            </div>
            {p.media.length > 1 && (
              <div className="modal__formats" role="tablist" aria-label="Formatos deste projeto">
                {p.media.map((m) => (
                  <button key={m.id} type="button" role="tab" aria-selected={m.id === media.id} className="chip" onClick={() => setMid(m.id)}>
                    {m.format} <span className="chip__n">{fmtDur(m.duration)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="modal__info">
            <p className="cc-t-micro">{p.category} · {p.year}</p>
            <h3 id="pm-title" className="modal__title">
              <span>{p.title}</span>
              <span className="modal__title-2">{p.client}</span>
            </h3>
            <p className="modal__desc">{p.description}</p>
            {p.result?.metric && (
              <div className="modal__result">
                <span className="cc-t-micro">Resultado</span>
                <p>
                  <strong>{p.result.metric}</strong> {p.result.label}
                </p>
              </div>
            )}
            {p.testimonial?.quote && (
              <figure className="modal__quote">
                <blockquote>“{p.testimonial.quote}”</blockquote>
                <figcaption className="cc-t-micro">
                  {p.testimonial.author} · {p.testimonial.role}
                </figcaption>
              </figure>
            )}
            {p.services?.length > 0 && (
              <ul className="modal__tags">
                {p.services.map((s) => (
                  <li key={s} className="cc-tag">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <div className="modal__cta">
            <Button
              variant="primary"
              href="#agendar"
              onClick={() => {
                onInterest?.('Projeto avulso', `Vi o projeto "${p.title}" e quero algo parecido.`);
                onClose();
              }}
            >
              Quero um projeto assim
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

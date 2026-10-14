import { PACKAGES, PLANS } from '../data/content.js';
import { Button, Crosshairs, DisplayTitle, MediaFrame } from '../components/ui.jsx';

function SecMeta({ items }) {
  return (
    <dl className="sec-meta" data-reveal>
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Plans({ onInterest }) {
  return (
    <section className="plans cc-section" id="planos" aria-labelledby="plans-title">
      <div className="sec-head">
        <DisplayTitle id="plans-title" size="display-l" lines={['Planos', 'mensais']} />
      </div>
      <ol className="plans__grid" data-group>
        {PLANS.map((p, i) => (
          <li key={p.id} className={`plan ${p.featured ? 'plan--featured cc-inverse cc-chamfer--tr' : ''}`}>
            {!p.featured && <Crosshairs />}
            <div className="plan__top">
              {p.featured && <span className="plan__badge">Recomendado</span>}
            </div>
            <h3 className="plan__name">{p.name}</h3>
            <p className="offer__for">
              <span>Ideal para</span>
              {p.forWho}
            </p>
            <p className="plan__price">
              <span className="plan__amount">{p.price}</span>
              <span className="plan__cadence">{p.cadence}</span>
            </p>
            {p.why && <p className="plan__why">{p.why}</p>}
            <ul className="plan__items">
              {p.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
            <Button
              variant={p.featured ? 'accent' : 'outline'}
              href="#agendar"
              className="plan__cta"
              onClick={() => onInterest?.('Plano mensal', `Tenho interesse no plano ${p.name}.`)}
            >
              Escolher plano
            </Button>
          </li>
        ))}
      </ol>
      <p className="offers__note" data-reveal>
        Cada botão leva ao agendamento de uma conversa de 30 min, sem custo. Ainda em dúvida?{' '}
        <a href="#agendar" onClick={() => onInterest?.('Ainda não sei', '')}>
          Agende e eu indico o plano certo
        </a>
        . Precisa de um projeto pontual? <a href="#pacotes">Veja os pacotes</a>.
      </p>
    </section>
  );
}

export function Packages({ onInterest }) {
  return (
    <section className="packages cc-section cc-inverse" id="pacotes" aria-labelledby="pkg-title">
      <div className="sec-head">
        <DisplayTitle id="pkg-title" size="display-l" lines={['Pacotes', 'de projeto']} />
      </div>
      <SecMeta items={[['Pagamento', 'único, sem mensalidade'], ['Entrega', '3 a 10 dias úteis'], ['Formatos', 'todos da mesma gravação']]} />
      <ul className="pkgs" data-group>
        {PACKAGES.map((k) => (
          <li key={k.id} className="pkg">
            <Crosshairs />
            <div className="pkg__top">
              <span className="cc-t-micro">{k.code}</span>
            </div>
            <MediaFrame media={{ format: '16:9', duration: k.id === 'evento' ? 98 : k.id === 'institucional' ? 150 : 60, poster: k.still }} chamfer={k.id === 'evento' ? 'tr' : undefined} className="pkg__media" />
            <h3 className="pkg__name">{k.name}</h3>
            <p className="offer__for">
              <span>Ideal para</span>
              {k.forWho}
            </p>
            <p className="pkg__price">
              <span className="pkg__from">A partir de</span>
              <span className="pkg__amount">{k.price}</span>
            </p>
            <p className="pkg__summary">{k.summary}</p>
            <dl className="pkg__spec">
              <div>
                <dt>Gravação</dt>
                <dd>{k.duration}</dd>
              </div>
              <div>
                <dt>Entrega</dt>
                <dd>{k.delivery}</dd>
              </div>
              <div>
                <dt>Formatos</dt>
                <dd>{k.formats}</dd>
              </div>
            </dl>
            <ul className="pkg__list">
              {k.deliverables.map((d) => (
                <li key={d}>
                  <span aria-hidden="true">+</span>
                  {d}
                </li>
              ))}
            </ul>
            <Button variant="outline" href="#agendar" className="pkg__cta" onClick={() => onInterest?.('Pacote de projeto', `Tenho interesse no pacote ${k.name}.`)}>
              Pedir o pacote {k.name}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

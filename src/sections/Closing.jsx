import { useState } from 'react';
import { BRAND, FAQ, WHATSAPP } from '../data/content.js';
import { Button, DisplayTitle, Readout } from '../components/ui.jsx';

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq cc-section" id="faq" aria-labelledby="faq-title">
      <div className="faq__grid">
        <div className="faq__aside">
          <DisplayTitle id="faq-title" size="h1" lines={['Perguntas', 'frequentes']} />
          <div className="faq__ask cc-inverse cc-chamfer--tr" data-reveal>
            <span className="brk">[ Outra dúvida ]</span>
            <p>Pergunte na conversa de 30 minutos. Ela não tem custo e você sai com um orçamento.</p>
            <Button variant="outline" href="#agendar">
              Perguntar na conversa
            </Button>
          </div>
        </div>
        <ol className="faq__list" data-group>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="faq__q">
                      {f.q}
                      <span className="faq__short">{f.short}</span>
                    </span>
                    <span className="faq__icon" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>
                </h3>
                <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} aria-hidden={!isOpen} {...(isOpen ? {} : { inert: '' })}>
                  <div className="faq__a-in">
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function FinalCta({ lead, setLead }) {
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setLead({ ...lead, [k]: e.target.value });

  // O interesse vem dos botões de planos/pacotes; não aparece como campo.
  const waText = encodeURIComponent(
    [`Olá, Flávio! Sou ${lead.name || '—'}.`, lead.interest ? `Interesse: ${lead.interest}` : '', lead.message ? `\n${lead.message}` : '']
      .filter(Boolean)
      .join('\n')
  );
  const waHref = `https://wa.me/${WHATSAPP}?text=${waText}`;

  const onSend = (e) => {
    if (!lead.name?.trim()) {
      e.preventDefault();
      setErrors({ name: 'Informe seu nome' });
      requestAnimationFrame(() => document.querySelector('.final .cc-field.is-error input')?.focus());
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <section className="final cc-section" id="agendar" aria-labelledby="final-title">
      <div className="final__grid">
        <div className="final__copy">
          <DisplayTitle id="final-title" size="display-l" tone="accent" lines={['Vamos gravar', 'o próximo.']} />
          <p className="cc-lead" data-reveal>
            Me mande uma mensagem pelo WhatsApp. Numa conversa de 30 minutos entendo o objetivo, indico o plano ou pacote certo e você sai com um orçamento.
          </p>
          <dl className="final__facts" data-group>
            <div>
              <dt className="cc-t-micro">Duração</dt>
              <dd>30 min por videochamada</dd>
            </div>
            <div>
              <dt className="cc-t-micro">Resposta</dt>
              <dd>Até 1 dia útil</dd>
            </div>
            <div>
              <dt className="cc-t-micro">Custo</dt>
              <dd>Nenhum</dd>
            </div>
          </dl>
        </div>

        <div className="final__panel" data-reveal>
          {sent ? (
            <div className="final__ok" role="status">
              <p className="cc-t-label final__ok-tag">[ OK ] Mensagem pronta no WhatsApp</p>
              <h3>
                <span>Falta só enviar,</span>
                <span className="final__ok-name">{lead.name.split(' ')[0]}.</span>
              </h3>
              <p>O WhatsApp abriu em outra aba com sua mensagem já escrita. Respondo em até 1 dia útil para marcar a conversa.</p>
              <Button variant="primary" href={waHref} target="_blank" rel="noreferrer">
                Abrir o WhatsApp de novo
              </Button>
              <button type="button" className="final__reset cc-t-micro" onClick={() => setSent(false)}>
                Editar mensagem
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
              <Field label="Nome" error={errors.name}>
                <input className="cc-field__control" autoComplete="name" value={lead.name || ''} onChange={set('name')} placeholder="Seu nome" />
              </Field>
              <Field label="Mensagem (opcional)">
                <textarea className="cc-field__control cc-field__control--area" rows={5} value={lead.message || ''} onChange={set('message')} placeholder="Me conte um pouco sobre seu projeto" />
              </Field>
              <Button variant="accent" href={waHref} target="_blank" rel="noreferrer" className="form__submit" onClick={onSend}>
                Agendar pelo WhatsApp
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className={`cc-field ${error ? 'is-error' : ''}`}>
      <span className="cc-field__label">{label}</span>
      {children}
      {error && <span className="cc-field__msg cc-field__msg--error">[ Erro ] {error}</span>}
    </label>
  );
}

export function Footer({ onAdmin, canEdit }) {
  return (
    <footer className="footer cc-inverse">
      <div className="footer__grid">
        <div className="footer__brand">
          <p className="footer__name">{BRAND}</p>
          <p className="footer__tag">Captação e edição de vídeo para marcas que postam toda semana.</p>
        </div>
        <div className="footer__col">
          <p className="cc-t-micro">Navegação</p>
          <a href="#trabalhos">Trabalhos</a>
          <a href="#planos">Planos</a>
          <a href="#pacotes">Pacotes</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="footer__col">
          <p className="cc-t-micro">Contato</p>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="#agendar">Agendar conversa</a>
          <a href="mailto:contato@flaviocalabria.com.br">E-mail</a>
        </div>
        <div className="footer__col">
          <p className="cc-t-micro">Redes</p>
          <a href="#topo">IG</a>
          <a href="#topo">YT</a>
          <a href="#topo">Vimeo</a>
        </div>
      </div>
      <div className="footer__base">
        <Readout scramble={false}>© 2026 {BRAND}</Readout>
        <Readout scramble={false}>8.0476° S · 34.8770° W</Readout>
        {canEdit && (
          <button type="button" className="footer__admin ro" onClick={onAdmin}>
            [ Área do dono ]
          </button>
        )}
      </div>
    </footer>
  );
}

// Área do dono: lista, cria, edita, ordena e remove projetos.
// Só aparece para quem pode editar o artifact (dono ou editores).
import { useEffect, useMemo, useRef, useState } from 'react';
import { BRAND } from '../data/content.js';
import { Button, FORMAT_LABEL, Icon, MediaFrame, fmtDur, useMediaSrc } from '../components/ui.jsx';
import { STILLS } from '../assets/stills/index.js';

const FORMATS = ['9:16', '16:9', '4:5', '1:1'];
const DEMO_POSTERS = Object.keys(STILLS);

const slug = (s) =>
  (s || 'projeto')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'projeto';

const emptyMedia = () => ({ id: 'm' + Math.random().toString(36).slice(2, 7), format: '9:16', duration: 30, poster: 'product', videoUrl: '', videoAsset: '', bunnyId: '', posterAsset: '' });

const emptyProject = (order) => ({
  id: '',
  order,
  featured: false,
  title: '',
  client: '',
  category: '',
  year: new Date().getFullYear(),
  services: [],
  description: '',
  result: { metric: '', label: '' },
  testimonial: { quote: '', author: '', role: '' },
  media: [emptyMedia()],
});

export default function Admin({ store, projects, canEdit, onAuthChanged }) {
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    document.title = 'Área do dono · ' + BRAND;
    return () => (document.title = BRAND + ' Vídeo');
  }, []);

  // Site publicado (Supabase): pede login antes de qualquer coisa.
  if (store.auth && !store.auth.user) return <Login store={store} onDone={onAuthChanged} />;

  if (!canEdit) {
    return (
      <div className="adm adm--locked">
        <p className="brk">[ Área do dono ]</p>
        <h1 className="adm__title">Acesso restrito</h1>
        <p className="cc-lead">Só o dono do portfólio pode adicionar e editar projetos. Entre com a conta que publicou este site.</p>
        <div className="adm__actions">
          <Button variant="outline" href="#topo" arrow={false}>
            Voltar ao site
          </Button>
          {store.auth?.user && (
            <Button variant="outline" arrow={false} onClick={() => store.auth.signOut().then(onAuthChanged)}>
              Sair desta conta
            </Button>
          )}
        </div>
      </div>
    );
  }

  const sorted = [...projects].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const move = async (p, dir) => {
    const i = sorted.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const a = { ...sorted[i], order: j + 1 };
    const b = { ...sorted[j], order: i + 1 };
    await store.saveProject(a);
    await store.saveProject(b);
  };

  const remove = async (p) => {
    if (confirmDelete !== p.id) {
      setConfirmDelete(p.id);
      return;
    }
    setConfirmDelete(null);
    await store.deleteProject(p.id);
    setStatus({ ok: true, text: `“${p.title}” removido.` });
  };
  return (
    <div className="adm">
      <header className="adm__bar">
        <a href="#topo" className="adm__back">
          <Icon name="arrow-left" size={16} /> Ver o site
        </a>
        <span className="brk">[ Área do dono · {sorted.length} projetos ]</span>
        <div className="adm__baractions">
          {store.auth?.user && (
            <button type="button" className="adm__link" onClick={() => store.auth.signOut().then(onAuthChanged)}>
              Sair
            </button>
          )}
          <Button variant="primary" onClick={() => setEditing(emptyProject(sorted.length + 1))}>
            Adicionar projeto
          </Button>
        </div>
      </header>

      {status && (
        <p className={`adm__status ${status.ok ? 'is-ok' : 'is-err'}`} role="status">
          {status.ok ? '[ OK ]' : '[ ERRO ]'} {status.text}
        </p>
      )}

      {store.kind === 'local' && (
        <p className="adm__note">
          Modo local: as alterações ficam só neste navegador. No site publicado elas vão para o banco do portfólio e aparecem para todos.
        </p>
      )}

      {editing ? (
        <Editor
          key={editing.id || 'new'}
          initial={editing}
          store={store}
          existingIds={sorted.map((p) => p.id)}
          onCancel={() => setEditing(null)}
          onSaved={(p) => {
            setEditing(null);
            setStatus({ ok: true, text: `“${p.title}” salvo e publicado.` });
          }}
          onError={(msg) => setStatus({ ok: false, text: msg })}
        />
      ) : (
        <ol className="adm__list">
          {sorted.length === 0 && <li className="adm__empty">Nenhum projeto ainda. Use “Adicionar projeto” para publicar o primeiro.</li>}
          {sorted.map((p, i) => (
            <li key={p.id} className="adm__row">
              <span className="adm__n">{String(i + 1).padStart(2, '0')}</span>
              <div className="adm__thumb">
                <MediaFrame media={p.media?.[0] || { format: '9:16', duration: 0 }} posterSrc={store.mediaSrc(p.media?.[0]?.posterAsset)} />
              </div>
              <div className="adm__info">
                <p className="adm__name">
                  {p.title || 'Sem título'} {p.featured && <span className="brk">[ Destaque ]</span>}
                </p>
                <p className="adm__meta">
                  {p.client} · {p.year} · {(p.media || []).map((m) => m.format).join(' / ')}
                </p>
                {p.result?.metric && (
                  <p className="adm__meta">
                    {p.result.metric} {p.result.label}
                  </p>
                )}
              </div>
              <div className="adm__actions">
                <button type="button" className="adm__icon" aria-label="Subir" onClick={() => move(p, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button type="button" className="adm__icon" aria-label="Descer" onClick={() => move(p, 1)} disabled={i === sorted.length - 1}>
                  ↓
                </button>
                <Button variant="outline" arrow={false} onClick={() => setEditing(structuredClone(p))}>
                  Editar
                </Button>
                <Button variant="outline" arrow={false} className={confirmDelete === p.id ? 'adm__danger' : ''} onClick={() => remove(p)}>
                  {confirmDelete === p.id ? 'Confirmar remoção' : 'Remover'}
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Field({ label, hint, children, wide }) {
  return (
    <label className={`cc-field ${wide ? 'adm__wide' : ''}`}>
      <span className="cc-field__label">{label}</span>
      {children}
      {hint && <span className="cc-field__msg">{hint}</span>}
    </label>
  );
}

function Editor({ initial, store, existingIds, onCancel, onSaved, onError }) {
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(null);
  const [vstate, setVstate] = useState({}); // mediaId → { phase: 'upload'|'processing'|'ready'|'failed', pct }
  const uploaded = useRef(new Set()); // vídeos do Bunny enviados nesta edição (apaga se descartados)
  const polls = useRef({});
  useEffect(() => () => Object.values(polls.current).forEach(clearTimeout), []);
  const isNew = !initial.id;
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const setIn = (key, patch) => setP((x) => ({ ...x, [key]: { ...(x[key] || {}), ...patch } }));
  const setMedia = (id, patch) => setP((x) => ({ ...x, media: x.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  // Acompanha o processamento do Bunny até o vídeo ficar pronto.
  const watch = (mediaId, bunnyId) => {
    const tick = async () => {
      try {
        const s = await store.videoStatus(bunnyId);
        if (s.state === 'ready') {
          setVstate((v) => ({ ...v, [mediaId]: { phase: 'ready' } }));
          if (s.duration) setMedia(mediaId, { duration: s.duration });
          return;
        }
        if (s.state === 'failed') {
          setVstate((v) => ({ ...v, [mediaId]: { phase: 'failed' } }));
          return;
        }
        setVstate((v) => ({ ...v, [mediaId]: { phase: 'processing', pct: s.progress } }));
      } catch {}
      polls.current[mediaId] = setTimeout(tick, 4000);
    };
    tick();
  };

  const uploadVideo = async (mediaId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 ** 3) {
      onError('O arquivo passa de 5 GB. Exporte uma versão mais leve para o portfólio.');
      return;
    }
    setBusy(mediaId + 'video');
    setVstate((v) => ({ ...v, [mediaId]: { phase: 'upload', pct: 0 } }));
    try {
      const { bunnyId } = await store.uploadVideo(file, {
        title: `${p.client || 'Projeto'} · ${p.title || file.name}`,
        onProgress: (pct) => setVstate((v) => ({ ...v, [mediaId]: { phase: 'upload', pct } })),
      });
      uploaded.current.add(bunnyId);
      setMedia(mediaId, { bunnyId, videoUrl: '', videoAsset: '' });
      // sem capa própria? usa um quadro do próprio vídeo (feito no navegador, antes de sair do arquivo)
      if (!p.media.find((m) => m.id === mediaId)?.posterAsset) {
        frameFromVideo(file)
          .then((blob) => blob && store.uploadFile(new File([blob], 'capa.jpg', { type: 'image/jpeg' })))
          .then((r) => r && setMedia(mediaId, { posterAsset: r.id }))
          .catch(() => {});
      }
      setVstate((v) => ({ ...v, [mediaId]: { phase: 'processing', pct: 0 } }));
      watch(mediaId, bunnyId);
    } catch (e) {
      setVstate((v) => ({ ...v, [mediaId]: undefined }));
      onError('Não consegui enviar o vídeo: ' + (e?.message || 'tente de novo.'));
    } finally {
      setBusy(null);
    }
  };

  const upload = async (mediaId, kind, file) => {
    if (!file) return;
    if (kind === 'video' && store.uploadVideo) return uploadVideo(mediaId, file);
    const limit = 20 * 1024 * 1024;
    if (file.size > limit) {
      onError(`O arquivo tem ${(file.size / 1048576).toFixed(0)} MB. O limite por arquivo é 20 MB; para vídeos maiores, cole um link do YouTube, Vimeo, Instagram ou Drive.`);
      return;
    }
    setBusy(mediaId + kind);
    try {
      const r = await store.uploadFile(file);
      setMedia(mediaId, kind === 'video' ? { videoAsset: r.id, videoUrl: '' } : { posterAsset: r.id });
      if (kind === 'video') {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => v.duration && setMedia(mediaId, { duration: Math.round(v.duration) });
        v.src = store.mediaSrc(r.id) || r.url;
      }
    } catch (e) {
      onError('Não consegui enviar o arquivo: ' + (e?.message || 'tente de novo.'));
    } finally {
      setBusy(null);
    }
  };

  const errors = useMemo(() => {
    const e = {};
    if (!p.title.trim()) e.title = 'Dê um título ao projeto';
    if (!p.client.trim()) e.client = 'Informe o cliente';
    if (!p.media.length) e.media = 'Adicione pelo menos um formato';
    return e;
  }, [p]);
  const [tried, setTried] = useState(false);

  const save = async (ev) => {
    ev.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) return;
    let id = p.id || slug(p.title);
    if (isNew) {
      let n = 2;
      const base = id;
      while (existingIds.includes(id)) id = `${base}-${n++}`;
    }
    const clean = {
      ...p,
      id,
      year: Number(p.year) || new Date().getFullYear(),
      services: typeof p.services === 'string' ? p.services.split(',').map((s) => s.trim()).filter(Boolean) : p.services,
      testimonial: p.testimonial?.quote?.trim() ? p.testimonial : null,
      media: p.media.map((m) => ({ ...m, duration: Number(m.duration) || 0 })),
    };
    setBusy('save');
    try {
      await store.saveProject(clean);
      // vídeos do Bunny que saíram do projeto (trocados ou formato removido)
      if (store.deleteVideo) {
        const kept = new Set(clean.media.map((m) => m.bunnyId).filter(Boolean));
        const before = (initial.media || []).map((m) => m.bunnyId);
        [...before, ...uploaded.current].filter((id) => id && !kept.has(id)).forEach((id) => store.deleteVideo(id).catch(() => {}));
        uploaded.current.clear();
      }
      onSaved(clean);
    } catch (e) {
      onError('Não consegui salvar: ' + (e?.message || 'verifique sua conexão.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <form className="adm__form" onSubmit={save} noValidate>
      <div className="adm__formhead">
        <h1 className="adm__title">{isNew ? 'Novo projeto' : p.title || 'Editar projeto'}</h1>
        <p className="adm__help">Campos com * são obrigatórios. O projeto aparece no site assim que você salvar.</p>
      </div>

      <fieldset className="adm__set">
        <legend className="brk">[ 01 · Projeto ]</legend>
        <div className="adm__grid">
          <Field label="Título *" hint={tried && errors.title ? '[ Erro ] ' + errors.title : null}>
            <input id="f-title" className="cc-field__control" value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="Lançamento do blend Serra" />
          </Field>
          <Field label="Cliente *" hint={tried && errors.client ? '[ Erro ] ' + errors.client : null}>
            <input id="f-client" className="cc-field__control" value={p.client} onChange={(e) => set({ client: e.target.value })} placeholder="Café Moinho" />
          </Field>
          <Field label="Categoria">
            <input id="f-category" className="cc-field__control" value={p.category} onChange={(e) => set({ category: e.target.value })} placeholder="Lançamento de produto" />
          </Field>
          <Field label="Ano">
            <input id="f-year" className="cc-field__control" type="number" inputMode="numeric" value={p.year} onChange={(e) => set({ year: e.target.value })} />
          </Field>
          <Field label="Serviços" hint="Separe por vírgula" wide>
            <input
              id="f-services"
              className="cc-field__control"
              value={Array.isArray(p.services) ? p.services.join(', ') : p.services}
              onChange={(e) => set({ services: e.target.value })}
              placeholder="Captação, Edição, Color grading"
            />
          </Field>
          <Field label="Descrição" wide>
            <textarea id="f-desc" className="cc-field__control cc-field__control--area" rows={3} value={p.description} onChange={(e) => set({ description: e.target.value })} placeholder="O que foi feito e como, em duas ou três frases." />
          </Field>
          <label className="adm__check adm__wide">
            <input id="f-featured" type="checkbox" checked={!!p.featured} onChange={(e) => set({ featured: e.target.checked })} />
            <span>Destacar este projeto</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="adm__set">
        <legend className="brk">[ 02 · Vídeos e formatos ]</legend>
        {tried && errors.media && <p className="cc-field__msg cc-field__msg--error">[ Erro ] {errors.media}</p>}
        <ol className="adm__media">
          {p.media.map((m, k) => (
            <li key={m.id} className="adm__mitem">
              <div className="adm__mprev">
                <MediaPreview store={store} media={m} index={k + 1} />
              </div>
              <div className="adm__grid">
                <Field label="Formato">
                  <select id={`f-fmt-${m.id}`} className="cc-field__control" value={m.format} onChange={(e) => setMedia(m.id, { format: e.target.value })}>
                    {FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f} · {FORMAT_LABEL[f]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Duração (segundos)" hint={fmtDur(m.duration)}>
                  <input id={`f-dur-${m.id}`} className="cc-field__control" type="number" inputMode="numeric" min="0" value={m.duration} onChange={(e) => setMedia(m.id, { duration: e.target.value })} />
                </Field>
                <Field label={store.uploadVideo ? 'Enviar vídeo' : 'Enviar vídeo (até 20 MB)'} hint={videoHint(m, vstate[m.id], busy === m.id + 'video')}>
                  <input id={`f-vid-${m.id}`} className="cc-field__control adm__file" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => upload(m.id, 'video', e.target.files?.[0])} />
                </Field>
                <Field label="Ou link do vídeo" hint="YouTube, Vimeo, Instagram ou Google Drive">
                  <input
                    id={`f-url-${m.id}`}
                    className="cc-field__control"
                    type="url"
                    value={m.videoUrl}
                    onChange={(e) => setMedia(m.id, { videoUrl: e.target.value, videoAsset: e.target.value ? '' : m.videoAsset, bunnyId: e.target.value ? '' : m.bunnyId })}
                    placeholder="https://…"
                  />
                </Field>
                <Field label="Capa (imagem)" hint={m.posterAsset ? '[ OK ] Capa enviada' : busy === m.id + 'poster' ? 'Enviando…' : 'Sem capa própria, uso a de demonstração escolhida abaixo'}>
                  <input id={`f-poster-${m.id}`} className="cc-field__control adm__file" type="file" accept="image/*" onChange={(e) => upload(m.id, 'poster', e.target.files?.[0])} />
                </Field>
                <Field label="Capa de demonstração">
                  <select id={`f-demo-${m.id}`} className="cc-field__control" value={m.poster} onChange={(e) => setMedia(m.id, { poster: e.target.value })}>
                    {DEMO_POSTERS.map((k2) => (
                      <option key={k2} value={k2}>
                        {k2}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="adm__mactions">
                {m.posterAsset && (
                  <button type="button" className="adm__link" onClick={() => setMedia(m.id, { posterAsset: '' })}>
                    Remover capa enviada
                  </button>
                )}
                {p.media.length > 1 && (
                  <button type="button" className="adm__link" onClick={() => set({ media: p.media.filter((x) => x.id !== m.id) })}>
                    Remover este formato
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
        <Button variant="outline" type="button" arrow={false} onClick={() => set({ media: [...p.media, { ...emptyMedia(), format: '16:9' }] })}>
          Adicionar outro formato
        </Button>
      </fieldset>

      <fieldset className="adm__set">
        <legend className="brk">[ 03 · Resultado e depoimento ]</legend>
        <div className="adm__grid">
          <Field label="Resultado (número)" hint="Ex.: +212%, 3,4×, 10">
            <input id="f-metric" className="cc-field__control" value={p.result?.metric || ''} onChange={(e) => setIn('result', { metric: e.target.value })} />
          </Field>
          <Field label="Resultado (o que mediu)" hint="Ex.: de alcance no primeiro mês">
            <input id="f-metric-label" className="cc-field__control" value={p.result?.label || ''} onChange={(e) => setIn('result', { label: e.target.value })} />
          </Field>
          <Field label="Depoimento do cliente" wide>
            <textarea id="f-quote" className="cc-field__control cc-field__control--area" rows={3} value={p.testimonial?.quote || ''} onChange={(e) => setIn('testimonial', { quote: e.target.value })} placeholder="O que o cliente disse, com as palavras dele." />
          </Field>
          <Field label="Nome de quem disse">
            <input id="f-author" className="cc-field__control" value={p.testimonial?.author || ''} onChange={(e) => setIn('testimonial', { author: e.target.value })} />
          </Field>
          <Field label="Cargo e empresa">
            <input id="f-role" className="cc-field__control" value={p.testimonial?.role || ''} onChange={(e) => setIn('testimonial', { role: e.target.value })} />
          </Field>
        </div>
      </fieldset>

      <div className="adm__savebar">
        <Button
          variant="outline"
          type="button"
          arrow={false}
          onClick={() => {
            uploaded.current.forEach((id) => store.deleteVideo?.(id).catch(() => {}));
            onCancel();
          }}
        >
          Cancelar
        </Button>
        <Button variant="accent" type="submit" disabled={busy === 'save' || Object.values(vstate).some((v) => v?.phase === 'upload')}>
          {busy === 'save' ? 'Salvando…' : 'Salvar e publicar'}
        </Button>
      </div>
    </form>
  );
}

function videoHint(m, st, busy) {
  if (st?.phase === 'upload') return `Enviando… ${st.pct || 0}%`;
  if (st?.phase === 'processing') return `Processando no Bunny… ${st.pct || 0}% (pode salvar, ele termina sozinho)`;
  if (st?.phase === 'failed') return '[ Erro ] O Bunny não conseguiu processar este arquivo. Envie de novo.';
  if (st?.phase === 'ready' || m.bunnyId) return '[ OK ] Vídeo no Bunny Stream';
  if (m.videoAsset) return '[ OK ] Vídeo enviado';
  if (busy) return 'Enviando…';
  return null;
}

function MediaPreview({ store, media, index }) {
  const src = useMediaSrc(store, media);
  return <MediaFrame media={media} index={index} src={src} posterSrc={store.mediaSrc(media.posterAsset)} />;
}

function Login({ store, onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await store.auth.signIn(email.trim(), password);
      onDone?.();
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm adm--locked">
      <p className="brk">[ Área do dono ]</p>
      <h1 className="adm__title">Entrar</h1>
      <form className="adm__login" onSubmit={submit} noValidate>
        <Field label="E-mail">
          <input id="l-email" className="cc-field__control" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Senha">
          <input id="l-pass" className="cc-field__control" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && (
          <p className="cc-field__msg cc-field__msg--error" role="alert">
            [ Erro ] {error}
          </p>
        )}
        <div className="adm__actions">
          <Button variant="accent" type="submit" disabled={busy || !email || !password}>
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
          <Button variant="outline" href="#topo" arrow={false}>
            Voltar ao site
          </Button>
        </div>
      </form>
    </div>
  );
}

// Captura um quadro (a ~1 s) do arquivo de vídeo local e devolve um JPEG.
function frameFromVideo(file, at = 1) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    const done = (b) => {
      URL.revokeObjectURL(url);
      resolve(b);
    };
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.onloadedmetadata = () => (v.currentTime = Math.min(at, (v.duration || 2) / 2));
    v.onseeked = () => {
      const scale = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(v.videoWidth * scale);
      c.height = Math.round(v.videoHeight * scale);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(done, 'image/jpeg', 0.82);
    };
    v.onerror = () => done(null);
    setTimeout(() => done(null), 15000);
    v.src = url;
  });
}

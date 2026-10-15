// Camada de dados. O resto do site só conhece esta interface:
//   subscribeProjects(cb) -> unsubscribe
//   saveProject(project), deleteProject(id)
//   uploadFile(file) -> { id, url }
//   mediaSrc(ref) -> url para <img>/<video>
//   canEdit() -> Promise<boolean>
//
// Dentro do Claude (artifact) usa o banco e o armazenamento de arquivos do artifact.
// Publicado na Vercel com as variáveis NEXT_PUBLIC_SUPABASE_* usa Supabase + Bunny (store-supabase.js).
// Sem nada configurado (dev local) usa o conteúdo de demonstração + localStorage.

import { SEED_PROJECTS } from '../data/seed.js';

const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);

function safeStorage() {
  try {
    const k = '__t';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

function createLocalStore() {
  const ls = safeStorage();
  const KEY = 'fc-projects-v1';
  let projects;
  try {
    projects = JSON.parse(ls?.getItem(KEY) || 'null') || SEED_PROJECTS;
  } catch {
    projects = SEED_PROJECTS;
  }
  const subs = new Set();
  const emit = () => {
    const list = [...projects].sort(byOrder);
    subs.forEach((cb) => cb(list));
  };
  const persist = () => {
    try {
      ls?.setItem(KEY, JSON.stringify(projects));
    } catch {}
  };
  const objectUrls = new Map();
  return {
    kind: 'local',
    subscribeProjects(cb) {
      subs.add(cb);
      cb([...projects].sort(byOrder));
      return () => subs.delete(cb);
    },
    async saveProject(p) {
      const i = projects.findIndex((x) => x.id === p.id);
      projects = i >= 0 ? projects.map((x) => (x.id === p.id ? p : x)) : [...projects, p];
      persist();
      emit();
    },
    async deleteProject(id) {
      projects = projects.filter((x) => x.id !== id);
      persist();
      emit();
    },
    async uploadFile(file) {
      const id = 'local-' + Math.random().toString(36).slice(2);
      const url = URL.createObjectURL(file);
      objectUrls.set(id, url);
      return { id, url };
    },
    mediaSrc(ref) {
      if (!ref) return '';
      if (ref.startsWith('local-')) return objectUrls.get(ref) || '';
      return ref;
    },
    async canEdit() {
      // Dentro do Claude, mesmo sem banco, a conta diz se quem vê é dono/editor.
      try {
        const user = await window.claude?.use?.('user');
        if (user && (await user.canEdit())) return true;
      } catch {}
      return new URLSearchParams(window.location.search).has('admin') || window.location.hash.startsWith('#/admin');
    },
  };
}

async function createArtifactStore(claude) {
  const [db, user, assets] = await Promise.all([
    claude.use('db').catch(() => null),
    claude.use('user').catch(() => null),
    claude.use('assets').catch(() => null),
  ]);
  if (!db) return null;
  const col = db.collection('projects');
  return {
    kind: 'artifact',
    subscribeProjects(cb, onError) {
      return col.onSnapshot(
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder);
          cb(list);
        },
        (err) => onError?.(err)
      );
    },
    async saveProject(p) {
      const { id, ...body } = p;
      await col.doc(id).set(JSON.parse(JSON.stringify(body)));
    },
    async deleteProject(id) {
      await col.doc(id).delete();
    },
    async uploadFile(file) {
      if (!assets) throw new Error('Envio de arquivos indisponível para esta conta.');
      const r = await assets.upload(file);
      return { id: r.id, url: r.url };
    },
    mediaSrc(ref) {
      if (!ref) return '';
      if (/^[0-9a-f]{32}$/.test(ref)) return '/_blob/' + ref;
      return ref;
    },
    async canEdit() {
      try {
        return (await user?.canEdit()) ?? false;
      } catch {
        return false;
      }
    },
  };
}

// Variáveis do Vite (VITE_*). No build do artifact elas não existem.
const ENV = import.meta.env || {};

// Ordem: artifact do Claude → Supabase (site publicado na Vercel) → local (desenvolvimento).
export async function createStore() {
  if (typeof window !== 'undefined' && window.claude?.use) {
    const s = await createArtifactStore(window.claude);
    if (s) return s;
  }
  if (ENV.NEXT_PUBLIC_SUPABASE_URL && ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createSupabaseStore } = await import('./store-supabase.js');
    return createSupabaseStore({ url: ENV.NEXT_PUBLIC_SUPABASE_URL, anonKey: ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY, apiBase: ENV.VITE_API_BASE || '/api' });
  }
  return createLocalStore();
}

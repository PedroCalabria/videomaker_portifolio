// Store de produção: Supabase (projetos, login, capas) + Bunny Stream (vídeos, via /api).
// Mesma interface dos outros stores (veja src/lib/store.js), mais:
//   auth            → { user, signIn, signOut, onChange }
//   uploadVideo     → envia o arquivo direto ao Bunny e devolve { bunnyId }
//   videoStatus     → { state: 'processing'|'ready'|'failed', progress, duration }
//   embedUrl        → link assinado do player (expira em 1 h)
//   deleteVideo     → remove o vídeo do Bunny
import { createSupabase } from './supabase-lite.js';
import { tusUpload } from './tus.js';

const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);
const POSTERS = 'posters';

const fileSlug = (name) =>
  (name || 'arquivo')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .slice(-60);

export function createSupabaseStore({ url, anonKey, apiBase = '/api' }) {
  const sb = createSupabase(url, anonKey);
  const subs = new Set();
  let projects = null;

  const toProject = (row) => ({ id: row.id, ...row.doc, order: row.sort ?? row.doc?.order });

  async function refresh() {
    try {
      const rows = await sb.rest('/projects?select=id,sort,doc&order=sort.asc', { auth: false });
      projects = rows.map(toProject).sort(byOrder);
      subs.forEach(({ cb }) => cb(projects));
    } catch (e) {
      subs.forEach(({ onError }) => onError?.(e));
    }
  }

  // Atualiza quando a aba volta ao foco (o dono pode ter editado em outro aparelho).
  if (typeof window !== 'undefined') window.addEventListener('focus', () => subs.size && refresh());

  async function api(path, { method = 'GET', body, auth = true } = {}) {
    const headers = {};
    if (auth) {
      const token = await sb.accessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const r = await fetch(`${apiBase}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `Erro ${r.status}`);
    return data;
  }

  const embedCache = new Map(); // bunnyId → { url, expires }

  return {
    kind: 'supabase',

    auth: {
      get user() {
        return sb.session?.user || null;
      },
      signIn: (email, password) => sb.signIn(email, password),
      signOut: () => sb.signOut(),
      onChange: (cb) => sb.onAuthChange(cb),
    },

    subscribeProjects(cb, onError) {
      const sub = { cb, onError };
      subs.add(sub);
      if (projects) cb(projects);
      refresh();
      return () => subs.delete(sub);
    },

    async saveProject(p) {
      const { id, order, ...doc } = p;
      await sb.rest('/projects?on_conflict=id', {
        method: 'POST',
        prefer: 'resolution=merge-duplicates,return=minimal',
        body: { id, sort: order ?? 999, doc: JSON.parse(JSON.stringify({ ...doc, order })), updated_at: new Date().toISOString() },
      });
      await refresh();
    },

    async deleteProject(id) {
      const p = projects?.find((x) => x.id === id);
      await sb.rest(`/projects?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      await refresh();
      // remove do Bunny os vídeos desse projeto (se falhar, o projeto já saiu do site)
      for (const m of p?.media || []) if (m.bunnyId) this.deleteVideo(m.bunnyId).catch(() => {});
    },

    // Capas → Supabase Storage (bucket público "posters").
    async uploadFile(file) {
      const path = `${Date.now()}-${fileSlug(file.name)}`;
      const publicUrl = await sb.upload(POSTERS, path, file);
      return { id: publicUrl, url: publicUrl };
    },

    async uploadVideo(file, { title, onProgress } = {}) {
      const t = await api('/videos/create', { method: 'POST', body: { title } });
      await tusUpload(file, {
        endpoint: t.endpoint,
        headers: { AuthorizationSignature: t.signature, AuthorizationExpire: String(t.expires), VideoId: t.videoId, LibraryId: String(t.libraryId) },
        metadata: { filetype: file.type || 'video/mp4', title: title || file.name },
        onProgress,
      });
      return { bunnyId: t.videoId };
    },

    videoStatus: (bunnyId) => api(`/videos/status?id=${encodeURIComponent(bunnyId)}`),

    async embedUrl(bunnyId) {
      const hit = embedCache.get(bunnyId);
      if (hit && hit.expires - 120 > Date.now() / 1000) return hit.url;
      const r = await api(`/videos/embed?id=${encodeURIComponent(bunnyId)}`, { auth: !!sb.session });
      embedCache.set(bunnyId, r);
      return r.url;
    },

    deleteVideo: (bunnyId) => api(`/videos/delete?id=${encodeURIComponent(bunnyId)}`, { method: 'DELETE' }),

    mediaSrc(ref) {
      return ref || '';
    },

    async canEdit() {
      const uid = sb.session?.user?.id;
      if (!uid) return false;
      try {
        const rows = await sb.rest(`/admins?select=user_id&user_id=eq.${encodeURIComponent(uid)}`);
        return rows.length > 0;
      } catch {
        return false;
      }
    },
  };
}

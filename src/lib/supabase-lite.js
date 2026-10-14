// Cliente mínimo do Supabase (Auth + REST + Storage) via fetch, sem dependências.
// Cobre só o que o portfólio usa. Se preferir o SDK oficial (@supabase/supabase-js),
// a interface do store (src/lib/store.js) continua a mesma.

const SESSION_KEY = 'fc-sb-session';

function loadSession() {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}
function saveSession(s) {
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function createSupabase(url, anonKey) {
  let session = loadSession();
  const listeners = new Set();
  const emit = () => listeners.forEach((cb) => cb(session));

  async function authFetch(path, body) {
    const r = await fetch(`${url}/auth/v1${path}`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error_description || data.msg || data.message || 'Falha no login');
    return data;
  }

  function setSession(data) {
    session = data
      ? { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600), user: data.user }
      : null;
    saveSession(session);
    emit();
  }

  // Devolve um token válido, renovando se faltar menos de 1 minuto.
  async function accessToken() {
    if (!session) return null;
    if (session.expires_at - 60 > Date.now() / 1000) return session.access_token;
    try {
      setSession(await authFetch('/token?grant_type=refresh_token', { refresh_token: session.refresh_token }));
      return session.access_token;
    } catch {
      setSession(null);
      return null;
    }
  }

  async function rest(path, { method = 'GET', body, prefer, auth = true } = {}) {
    const token = auth ? await accessToken() : null;
    const headers = { apikey: anonKey, Authorization: `Bearer ${token || anonKey}` };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (prefer) headers.Prefer = prefer;
    const r = await fetch(`${url}/rest/v1${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.message || `Erro ${r.status} no banco`);
    }
    return r.status === 204 ? null : r.json().catch(() => null);
  }

  return {
    url,
    get session() {
      return session;
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async signIn(email, password) {
      setSession(await authFetch('/token?grant_type=password', { email, password }));
      return session.user;
    },
    async signOut() {
      const token = session?.access_token;
      setSession(null);
      if (token) fetch(`${url}/auth/v1/logout`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }).catch(() => {});
    },
    accessToken,
    rest,
    async upload(bucket, path, file) {
      const token = await accessToken();
      const r = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
        body: file,
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || `Erro ${r.status} ao enviar arquivo`);
      }
      return `${url}/storage/v1/object/public/${bucket}/${path}`;
    },
  };
}

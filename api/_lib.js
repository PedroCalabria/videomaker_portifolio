// Utilitários das rotas de servidor (Vercel Functions, Node 18+).
// Arquivos que começam com "_" não viram rota na Vercel.
// Sem dependências: usa fetch e crypto nativos do Node.
import { createHash } from 'node:crypto';

export const BUNNY_API = 'https://video.bunnycdn.com';
export const BUNNY_PLAYER = 'https://player.mediadelivery.net/embed';

export function env(name) {
  const v = process.env[name];
  if (!v) throw httpError(500, `Variável de ambiente ausente: ${name}`);
  return v;
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

// Assinatura do upload TUS (doc Bunny): SHA256(library_id + api_key + expiration_time + video_id)
export function tusSignature({ libraryId, apiKey, expires, videoId }) {
  return sha256(`${libraryId}${apiKey}${expires}${videoId}`);
}

// Token do player (doc Bunny): SHA256(token_security_key + video_id + expiration)
export function embedToken({ tokenKey, videoId, expires }) {
  return sha256(`${tokenKey}${videoId}${expires}`);
}

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

// Envolve um handler: trata erros e métodos permitidos.
export function route(methods, fn) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) {
        res.setHeader('Allow', methods.join(', '));
        throw httpError(405, 'Método não permitido');
      }
      await fn(req, res);
    } catch (e) {
      const status = e.status || 500;
      if (status >= 500) console.error(e);
      send(res, status, { error: e.message || 'Erro interno' });
    }
  };
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body; // a Vercel já faz o parse de JSON
  if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function query(req) {
  if (req.query) return req.query;
  return Object.fromEntries(new URL(req.url, 'http://x').searchParams);
}

// ID de vídeo do Bunny é um GUID.
export function assertVideoId(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) throw httpError(400, 'ID de vídeo inválido');
  return id;
}

// ── Supabase (REST direto, chave de serviço só no servidor) ──────────────

function sbHeaders(extra = {}) {
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

// Confere o token do usuário logado e se ele está na tabela admins.
export async function requireAdmin(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw httpError(401, 'Faça login na área do dono');
  const url = env('SUPABASE_URL');
  const u = await fetch(`${url}/auth/v1/user`, { headers: { apikey: env('SUPABASE_SERVICE_ROLE_KEY'), Authorization: `Bearer ${token}` } });
  if (!u.ok) throw httpError(401, 'Sessão expirada. Entre de novo.');
  const user = await u.json();
  const r = await fetch(`${url}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, { headers: sbHeaders() });
  if (!r.ok) throw httpError(500, 'Não consegui verificar a permissão');
  const rows = await r.json();
  if (!rows.length) throw httpError(403, 'Esta conta não pode editar o portfólio');
  return user;
}

// O vídeo está em algum projeto publicado? (evita assinar vídeos soltos da biblioteca)
export async function videoIsPublished(videoId) {
  const url = env('SUPABASE_URL');
  const filter = encodeURIComponent(JSON.stringify([{ bunnyId: videoId }]));
  const r = await fetch(`${url}/rest/v1/projects?select=id&limit=1&doc->media=cs.${filter}`, { headers: sbHeaders() });
  if (!r.ok) throw httpError(500, 'Não consegui consultar os projetos');
  return (await r.json()).length > 0;
}

// ── Bunny Stream ──────────────────────────────────────────────────────────

export async function bunny(path, init = {}) {
  const r = await fetch(`${BUNNY_API}/library/${env('BUNNY_LIBRARY_ID')}${path}`, {
    ...init,
    headers: { AccessKey: env('BUNNY_API_KEY'), Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw httpError(r.status === 404 ? 404 : 502, `Bunny respondeu ${r.status}${text ? ': ' + text.slice(0, 200) : ''}`);
  }
  return r.status === 204 ? null : r.json();
}

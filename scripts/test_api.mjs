// Testa as rotas /api/videos/* com Supabase e Bunny simulados (sem rede).
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const sha = (s) => createHash('sha256').update(s).digest('hex');

Object.assign(process.env, {
  SUPABASE_URL: 'https://sb.test', SUPABASE_SERVICE_ROLE_KEY: 'svc',
  BUNNY_LIBRARY_ID: '12345', BUNNY_API_KEY: 'bunny-api', BUNNY_TOKEN_KEY: 'bunny-token',
});
const VID = '0f8c3d2a-1b2c-4d5e-8f90-123456789abc';
const calls = [];
let published = true, adminOk = true, bunnyStatus = { status: 3, encodeProgress: 57, length: 31.6, width: 1080, height: 1920 };
globalThis.fetch = async (url, init = {}) => {
  calls.push({ url, method: init.method || 'GET', headers: init.headers || {}, body: init.body });
  const j = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });
  if (url === 'https://sb.test/auth/v1/user') return init.headers.Authorization === 'Bearer good' || init.headers.Authorization === 'Bearer notadmin' ? j({ id: init.headers.Authorization === 'Bearer good' ? 'u1' : 'u2' }) : j({ msg: 'bad' }, 401);
  if (url.startsWith('https://sb.test/rest/v1/admins')) return j(url.includes('u1') && adminOk ? [{ user_id: 'u1' }] : []);
  if (url.startsWith('https://sb.test/rest/v1/projects')) {
    assert.ok(decodeURIComponent(url).includes(`doc->media=cs.[{"bunnyId":"${VID}"}]`), 'filtro jsonb');
    return j(published ? [{ id: 'p1' }] : []);
  }
  if (url === 'https://video.bunnycdn.com/library/12345/videos' && init.method === 'POST') { assert.equal(init.headers.AccessKey, 'bunny-api'); return j({ guid: VID }); }
  if (url === `https://video.bunnycdn.com/library/12345/videos/${VID}` && (init.method || 'GET') === 'GET') return j(bunnyStatus);
  if (url === `https://video.bunnycdn.com/library/12345/videos/${VID}` && init.method === 'DELETE') return j({ success: true });
  throw new Error('fetch inesperado ' + url);
};

function call(handler, { method = 'GET', url = '/', headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const res = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { resolve({ status: this.statusCode, body: JSON.parse(b), headers: this.headers }); } };
    const q = Object.fromEntries(new URL(url, 'http://x').searchParams);
    handler({ method, url, headers, body, query: q }, res);
  });
}
const create = (await import('../api/videos/create.js')).default;
const embed = (await import('../api/videos/embed.js')).default;
const status = (await import('../api/videos/status.js')).default;
const del = (await import('../api/videos/delete.js')).default;

let r;
// create
r = await call(create, { method: 'POST', body: { title: 'Teste' } });
assert.equal(r.status, 401, 'create sem login');
r = await call(create, { method: 'POST', headers: { authorization: 'Bearer notadmin' }, body: { title: 'x' } });
assert.equal(r.status, 403, 'create sem ser admin');
r = await call(create, { method: 'GET', headers: { authorization: 'Bearer good' } });
assert.equal(r.status, 405, 'create com GET');
r = await call(create, { method: 'POST', headers: { authorization: 'Bearer good' }, body: { title: 'Teste' } });
assert.equal(r.status, 200);
assert.equal(r.body.videoId, VID);
assert.equal(r.body.signature, sha('12345' + 'bunny-api' + r.body.expires + VID), 'assinatura TUS conforme a doc');
assert.ok(r.body.expires - Date.now() / 1000 > 3600, 'janela de upload > 1h');
assert.ok(!JSON.stringify(r.body).includes('bunny-api'), 'API key não vaza');
console.log('create OK');

// embed
r = await call(embed, { url: `/api/videos/embed?id=${VID}` });
assert.equal(r.status, 200);
const u = new URL(r.body.url);
assert.equal(u.origin + u.pathname, `https://player.mediadelivery.net/embed/12345/${VID}`);
assert.equal(u.searchParams.get('token'), sha('bunny-token' + VID + u.searchParams.get('expires')), 'token do player conforme a doc');
assert.equal(r.headers['Cache-Control'], 'no-store');
r = await call(embed, { url: `/api/videos/embed?id=nao-e-guid` });
assert.equal(r.status, 400, 'id inválido');
published = false;
r = await call(embed, { url: `/api/videos/embed?id=${VID}` });
assert.equal(r.status, 404, 'vídeo não publicado, visitante');
r = await call(embed, { url: `/api/videos/embed?id=${VID}`, headers: { authorization: 'Bearer good' } });
assert.equal(r.status, 200, 'vídeo não publicado, dono vê prévia');
published = true;
console.log('embed OK');

// status
r = await call(status, { url: `/api/videos/status?id=${VID}`, headers: { authorization: 'Bearer good' } });
assert.deepEqual([r.status, r.body.state, r.body.progress, r.body.duration], [200, 'processing', 57, 32]);
bunnyStatus = { status: 4, encodeProgress: 100, length: 31 };
r = await call(status, { url: `/api/videos/status?id=${VID}`, headers: { authorization: 'Bearer good' } });
assert.equal(r.body.state, 'ready');
bunnyStatus = { status: 5, encodeProgress: 10 };
r = await call(status, { url: `/api/videos/status?id=${VID}`, headers: { authorization: 'Bearer good' } });
assert.equal(r.body.state, 'failed');
r = await call(status, { url: `/api/videos/status?id=${VID}` });
assert.equal(r.status, 401);
console.log('status OK');

// delete
r = await call(del, { method: 'DELETE', url: `/api/videos/delete?id=${VID}`, headers: { authorization: 'Bearer good' } });
assert.equal(r.status, 200);
r = await call(del, { method: 'DELETE', url: `/api/videos/delete?id=${VID}`, headers: { authorization: 'Bearer notadmin' } });
assert.equal(r.status, 403);
console.log('delete OK');

// faltando variável de ambiente
delete process.env.BUNNY_TOKEN_KEY;
r = await call(embed, { url: `/api/videos/embed?id=${VID}` });
assert.equal(r.status, 500); assert.match(r.body.error, /BUNNY_TOKEN_KEY/);
console.log('\nTodas as rotas passaram.');

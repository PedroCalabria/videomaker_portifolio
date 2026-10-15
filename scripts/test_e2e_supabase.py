"""Ponta a ponta do modo produção (Supabase + rotas /api + Bunny) com tudo simulado no navegador.
uso: python3 scripts/test_e2e_supabase.py <index.html construído com NEXT_PUBLIC_SUPABASE_URL=https://sb.test VITE_API_BASE=https://api.test/api> <video.webm>
"""
import json, sys, pathlib, re
from urllib.parse import urlparse, parse_qs, unquote
from playwright.sync_api import sync_playwright

PAGE = pathlib.Path(sys.argv[1]).resolve().as_uri()
VIDEO = sys.argv[2]
VID = '0f8c3d2a-1b2c-4d5e-8f90-123456789abc'
CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*',
        'Access-Control-Expose-Headers': 'Location, Upload-Offset, Tus-Resumable'}
db = {'p1': {'id': 'p1', 'sort': 1, 'doc': {'title': 'Projeto existente', 'client': 'Cliente A', 'category': 'Teste', 'year': 2026,
       'services': [], 'description': 'x', 'result': {'metric': '+10%', 'label': 'teste'}, 'testimonial': None,
       'media': [{'id': 'm1', 'format': '9:16', 'duration': 20, 'poster': 'product', 'videoUrl': ''}]}}}
log = {'tus_bytes': 0, 'tus_patches': 0, 'status_calls': 0, 'deleted': [], 'posters': 0, 'embed_auth': [], 'create_auth': None}
TOKEN = 'user-jwt'

def j(route, body, status=200, headers=None):
    route.fulfill(status=status, body=json.dumps(body), headers={**CORS, 'Content-Type': 'application/json', **(headers or {})})

def handler(route):
    req = route.request; u = urlparse(req.url); m = req.method; h = req.headers
    if m == 'OPTIONS': return route.fulfill(status=204, headers=CORS)
    if u.netloc == 'sb.test':
        if u.path == '/auth/v1/token':
            b = json.loads(req.post_data or '{}')
            if b.get('password') == 'certa': return j(route, {'access_token': TOKEN, 'refresh_token': 'r', 'expires_in': 3600, 'user': {'id': 'u1', 'email': b.get('email')}})
            return j(route, {'error_description': 'Invalid login credentials'}, 400)
        if u.path == '/auth/v1/logout': return route.fulfill(status=204, headers=CORS)
        if u.path == '/rest/v1/admins':
            return j(route, [{'user_id': 'u1'}] if h.get('authorization') == f'Bearer {TOKEN}' else [])
        if u.path == '/rest/v1/projects':
            if m == 'GET': return j(route, sorted(db.values(), key=lambda r: r['sort']))
            if h.get('authorization') != f'Bearer {TOKEN}': return j(route, {'message': 'RLS'}, 401)
            if m == 'POST':
                row = json.loads(req.post_data); db[row['id']] = row; return route.fulfill(status=201, headers=CORS)
            if m == 'DELETE':
                pid = parse_qs(u.query)['id'][0].replace('eq.', ''); db.pop(pid, None); return route.fulfill(status=204, headers=CORS)
        if u.path.startswith('/storage/v1/object/posters/'):
            log['posters'] += 1; return j(route, {'Key': u.path})
    if u.netloc == 'api.test':
        auth = h.get('authorization')
        if u.path == '/api/videos/create':
            log['create_auth'] = auth
            return j(route, {'videoId': VID, 'libraryId': '777', 'expires': 9999999999, 'signature': 'sig', 'endpoint': 'https://tus.test/tusupload'})
        if u.path == '/api/videos/status':
            log['status_calls'] += 1
            return j(route, {'state': 'processing', 'progress': 40} if log['status_calls'] < 2 else {'state': 'ready', 'progress': 100, 'duration': 33})
        if u.path == '/api/videos/embed':
            log['embed_auth'].append(auth)
            return j(route, {'url': f'https://player.mediadelivery.net/embed/777/{VID}?token=tok&expires=9999999999', 'expires': 9999999999})
        if u.path == '/api/videos/delete':
            log['deleted'].append(parse_qs(u.query)['id'][0]); return j(route, {'ok': True})
    if u.netloc == 'tus.test':
        assert h.get('authorizationsignature') == 'sig' and h.get('videoid') == VID and h.get('libraryid') == '777', h
        if m == 'POST':
            assert int(h['upload-length']) > 0 and 'filetype' in h['upload-metadata']
            return route.fulfill(status=201, headers={**CORS, 'Location': 'https://tus.test/tusupload/abc', 'Tus-Resumable': '1.0.0'})
        if m == 'PATCH':
            n = len(req.post_data_buffer or b''); log['tus_bytes'] += n; log['tus_patches'] += 1
            return route.fulfill(status=204, headers={**CORS, 'Upload-Offset': str(int(h['upload-offset']) + n)})
    if u.netloc == 'player.mediadelivery.net':
        return route.fulfill(status=200, body='<html><body style="background:#111;color:#fff">player bunny</body></html>', headers={'Content-Type': 'text/html'})
    if u.scheme in ('file', 'data', 'blob'): return route.continue_()
    return route.abort()

ok = lambda c, msg: print(('  OK  ' if c else '  FALHOU  ') + msg) or (c or sys.exit(1))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1280, 'height': 900}); pg = ctx.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    ctx.route('**/*', handler)
    pg.goto(PAGE + '?nomotion'); pg.wait_for_timeout(1200)
    ok('Projeto existente' in pg.text_content('#trabalhos'), 'site carrega projetos do Supabase')
    ok(pg.locator('.owner-fab').count() == 0, 'visitante não vê o botão de editar')

    pg.goto(PAGE + '#/admin'); pg.wait_for_timeout(600)
    ok(pg.locator('#l-email').count() == 1, 'área do dono pede login')
    pg.fill('#l-email', 'flavio@teste.com'); pg.fill('#l-pass', 'errada'); pg.click('button[type=submit]'); pg.wait_for_timeout(400)
    ok('incorretos' in pg.text_content('.adm'), 'senha errada mostra erro')
    pg.fill('#l-pass', 'certa'); pg.click('button[type=submit]'); pg.wait_for_timeout(800)
    ok(pg.locator('text=Adicionar projeto').count() >= 1 and pg.locator('.adm__row').count() == 1, 'login certo abre a lista')
    ok(pg.locator('.adm__note').count() == 0, 'sem aviso de "modo local"')

    pg.click('text=Adicionar projeto'); pg.wait_for_timeout(300)
    pg.fill('#f-title', 'Reel novo'); pg.fill('#f-client', 'Cliente B')
    pg.locator('input[id^=f-vid-]').set_input_files(VIDEO)
    pg.wait_for_function("document.querySelector('.adm__form').textContent.includes('Processando no Bunny')", timeout=15000)
    ok(log['tus_bytes'] == pathlib.Path(VIDEO).stat().st_size, f"arquivo enviado inteiro por TUS ({log['tus_bytes']} bytes, {log['tus_patches']} bloco(s))")
    ok(log['create_auth'] == f'Bearer {TOKEN}', 'rota create recebe o login')
    pg.wait_for_function("document.querySelector('.adm__form').textContent.includes('[ OK ] Vídeo no Bunny Stream')", timeout=15000)
    ok(pg.input_value('input[id^=f-dur-]') == '33', 'duração preenchida pelo Bunny (33 s)')
    pg.wait_for_timeout(1500)
    ok(log['posters'] >= 1, 'capa gerada de um quadro do vídeo e enviada ao Storage')
    ok(pg.locator('.adm__mprev img[src^="https://sb.test/storage/v1/object/public/posters/"]').count() == 1, 'prévia na área do dono mostra a capa gerada')
    pg.click('text=Salvar e publicar'); pg.wait_for_timeout(800)
    saved = [r for r in db.values() if r['doc'].get('title') == 'Reel novo']
    ok(len(saved) == 1 and saved[0]['doc']['media'][0]['bunnyId'] == VID and saved[0]['doc']['media'][0]['posterAsset'].startswith('https://sb.test/storage/v1/object/public/posters/'), 'projeto salvo com bunnyId e capa')
    ok(log['deleted'] == [], 'nada apagado do Bunny ao salvar')

    pg.click('text=Ver o site'); pg.wait_for_timeout(800)
    ok(pg.locator('.owner-fab').count() == 1, 'dono logado vê "Editar projetos" no site')
    pg.locator('button[aria-label^="Abrir Reel novo"]').first.dispatch_event('click'); pg.wait_for_timeout(800)
    src = pg.get_attribute('.modal iframe', 'src') or ''
    ok('player.mediadelivery.net/embed/777/' + VID in src and 'token=' in src, 'modal toca o vídeo pelo link assinado')
    pg.keyboard.press('Escape')

    pg.goto(PAGE + '#/admin'); pg.wait_for_timeout(800)
    row = pg.locator('.adm__row', has_text='Reel novo')
    row.locator('text=Remover').click(); row.locator('text=Confirmar remoção').click(); pg.wait_for_timeout(800)
    ok(not any(r['doc'].get('title') == 'Reel novo' for r in db.values()), 'projeto removido do banco')
    ok(log['deleted'] == [VID], 'vídeo removido do Bunny junto com o projeto')

    pg.click('text=Sair'); pg.wait_for_timeout(600)
    ok(pg.locator('#l-email').count() == 1, 'sair volta para o login')
    ok(not errs, 'sem erros de JavaScript' + (': ' + '; '.join(errs) if errs else ''))
    b.close()
print('\nFluxo completo passou.')

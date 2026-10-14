"""Teste ponta a ponta da área do dono no modo local (sem banco do artifact)."""
from playwright.sync_api import sync_playwright
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
u = (ROOT / 'dist/index.html').as_uri() + '#/admin'
CSS = "@font-face{font-family:'Inter';src:url(https://fonts.local/Inter.ttf)}@font-face{font-family:'Inter Tight';src:url(https://fonts.local/InterTight.ttf)}@font-face{font-family:'JetBrains Mono';src:url(https://fonts.local/JetBrainsMono.ttf)}"
F = ROOT / 'fonts'


def route(r):
    x = r.request.url
    if 'fonts.googleapis' in x:
        return r.fulfill(body=CSS, content_type='text/css')
    if 'fonts.local' in x:
        return r.fulfill(path=str(F / x.rsplit('/', 1)[1]))
    if x.startswith(('file:', 'data:', 'blob:')):
        return r.continue_()
    return r.abort()


out = pathlib.Path('/home/claude/flavio/renders/admin')
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, (w, h) in {'desktop': (1440, 900), 'mobile': (375, 812)}.items():
        ctx = b.new_context(viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        pg.route('**/*', route)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(u)
        pg.wait_for_timeout(600)
        pg.screenshot(path=str(out / f'{name}-list.png'))
        pg.click('text=Adicionar projeto')
        pg.wait_for_timeout(300)
        pg.click('text=Salvar e publicar')
        pg.wait_for_timeout(200)
        pg.screenshot(path=str(out / f'{name}-form.png'), full_page=True)
        pg.fill('#f-title', 'Teste de projeto')
        pg.fill('#f-client', 'Cliente X')
        pg.fill('#f-metric', '+50%')
        pg.fill('#f-metric-label', 'de vendas')
        pg.click('text=Salvar e publicar')
        pg.wait_for_timeout(300)
        rows = pg.evaluate("document.querySelectorAll('.adm__row').length")
        pg.goto(u.replace('#/admin', '?nomotion'))
        pg.wait_for_timeout(500)
        cards = pg.evaluate("[...document.querySelectorAll('.card__title')].map(e=>e.textContent)")
        print(name, 'rows after save:', rows, '| site shows new card:', 'Teste de projeto' in cards, '| errors:', errs or 'none')
        ctx.close()
    b.close()

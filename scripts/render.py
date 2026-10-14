"""Render do site para os críticos.
uso: python3 render.py OUT_DIR [--section SELECTOR] [--film]
"""
import sys, os, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = (ROOT / 'dist/index.html').as_uri()
FONTS = ROOT / 'fonts'
CSS = """
@font-face{font-family:'Inter';src:url(https://fonts.local/Inter.ttf);font-weight:100 900}
@font-face{font-family:'Inter Tight';src:url(https://fonts.local/InterTight.ttf);font-weight:100 900}
@font-face{font-family:'JetBrains Mono';src:url(https://fonts.local/JetBrainsMono.ttf);font-weight:100 900}
"""
VP = {'desktop': (1440, 900), 'tablet': (768, 1024), 'mobile': (375, 812)}

def route(r):
    u = r.request.url
    if 'fonts.googleapis.com' in u: return r.fulfill(body=CSS, content_type='text/css')
    if 'fonts.local' in u: return r.fulfill(path=str(FONTS / u.rsplit('/',1)[1]), content_type='font/ttf')
    if u.startswith('file:') or u.startswith('data:') or u.startswith('blob:'): return r.continue_()
    return r.abort()

def page_for(b, vp, motion=False, extra=''):
    w, h = VP[vp]
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=(vp=='mobile'), has_touch=(vp=='mobile'))
    pg = ctx.new_page(); pg.route('**/*', route)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.goto(DIST + ('' if motion else '?nomotion') + extra); pg.wait_for_timeout(700)
    pg.evaluate('document.fonts.ready')
    return pg, errs

def main():
    out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    sel = sys.argv[sys.argv.index('--section')+1] if '--section' in sys.argv else None
    film = '--film' in sys.argv
    with sync_playwright() as p:
        b = p.chromium.launch()
        allerr = []
        for vp in VP:
            pg, errs = page_for(b, vp)
            if sel:
                pg.add_style_tag(content='.nav,.mcta{visibility:hidden!important}')
                el = pg.locator(sel).first
                el.scroll_into_view_if_needed(); pg.wait_for_timeout(400)
                el.screenshot(path=str(out / f'{vp}-section.png'))
            else:
                pg.screenshot(path=str(out / f'{vp}-fold.png'))
                pg.screenshot(path=str(out / f'{vp}-full.png'), full_page=True)
            allerr += [f'{vp}: {e}' for e in errs]
            pg.context.close()
        if film:
            for vp in ('desktop', 'mobile'):
                pg, errs = page_for(b, vp, motion=True)
                if sel and sel not in ('.hero', '#topo'):
                    pg.evaluate(f"window.scrollTo(0, document.querySelector('{sel}').getBoundingClientRect().top + scrollY - innerHeight*0.6)")
                    t0 = 0
                else:
                    pg.reload(); t0 = 0
                for i, t in enumerate([0, 150, 350, 600, 900, 1500]):
                    pg.wait_for_timeout(t - (0 if i == 0 else [0,150,350,600,900,1500][i-1]))
                    pg.screenshot(path=str(out / f'film-{vp}-{i}-{t}ms.png'))
                allerr += [f'film {vp}: {e}' for e in errs]
                pg.context.close()
        b.close()
    print('errors:', allerr or 'none')
    print('\n'.join(sorted(os.listdir(out))))
main()

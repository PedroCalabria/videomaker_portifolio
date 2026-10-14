import sys, pathlib
from playwright.sync_api import sync_playwright
out=pathlib.Path(sys.argv[1])
u=pathlib.Path('dist/index.html').resolve().as_uri()+'?nomotion'
CSS="@font-face{font-family:'Inter';src:url(https://fonts.local/Inter.ttf)}@font-face{font-family:'Inter Tight';src:url(https://fonts.local/InterTight.ttf)}@font-face{font-family:'JetBrains Mono';src:url(https://fonts.local/JetBrainsMono.ttf)}"
F=pathlib.Path('fonts')
def route(r):
    x=r.request.url
    if 'fonts.googleapis' in x: return r.fulfill(body=CSS,content_type='text/css')
    if 'fonts.local' in x: return r.fulfill(path=str(F/x.rsplit('/',1)[1]))
    if x.startswith(('file:','data:','blob:')): return r.continue_()
    return r.abort()
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,(w,h) in {'desktop':(1440,900),'mobile':(375,812)}.items():
        pg=b.new_page(viewport={'width':w,'height':h}); pg.route('**/*',route); pg.goto(u); pg.wait_for_timeout(400)
        pg.click('.card__hit >> nth=2'); pg.wait_for_timeout(300)
        pg.screenshot(path=str(out/f'{name}-modal.png'))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
        pg.click('.work__filters .chip >> nth=1'); pg.wait_for_timeout(300)
        bb=pg.evaluate("(()=>{const r=document.querySelector('#trabalhos').getBoundingClientRect();return [r.top+scrollY,r.height]})()")
        pg.screenshot(path=str(out/f'{name}-filter-reels.png'),full_page=True,clip={'x':0,'y':bb[0],'width':w,'height':bb[1]})
        pg.close()
    b.close()
print('ok')

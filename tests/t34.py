import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1500,"height":1000}); pg.set_default_timeout(10000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1200)
        inn = await pg.evaluate("Object.keys(POIS).find(k => sceneTpl(k) === 'inn')"); print("inn", inn)
        js = """(args) => { const [mode, list] = args; const box = document.createElement('div'); box.id = 'grid'; box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;overflow:hidden'; document.getElementById('grid')?.remove(); document.body.append(box);
          const id0 = WD.id, st0 = WD.setting, out = [];
          list.forEach((v, i) => { if (mode === 'var') { WD.id = 'innv' + v; } else { WD.setting = v; WD.id = 'set_' + v; applySkin(WD, true); }
            sceneCache.clear(); const sc = sceneOf(window.__inn); out.push((sc.innV ?? '-') + ':' + SC_NAMES.inn + ':' + sc.objs.filter(o => o.act && o.label).slice(0, 3).map(o => o.label).join('/'));
            const d = document.createElement('div'); d.innerHTML = sceneSVG(window.__inn, false); d.firstChild.style.width = '100%'; box.append(d); });
          WD.id = id0; WD.setting = st0; applySkin(WD, true); sceneCache.clear(); return out; }"""
        await pg.evaluate(f"window.__inn = '{inn}'")
        print(await pg.evaluate(js, ["var", list(range(12))])); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/i_inns.png")
        print(await pg.evaluate(js, ["set", ["steampunk","cyberpunk","space","postapoc","western","pirates","modern","east","myth","fantasy"]])); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/i_sets.png")
        # другие места в киберпанке
        print(await pg.evaluate("""() => { const box = document.getElementById('grid'); box.innerHTML = ''; WD.setting = 'cyberpunk'; WD.biome = 'city'; WD.id = 'cyb2'; applySkin(WD, true); sceneCache.clear(); const out = [];
           Object.keys(POIS).filter(k => !POIS[k].inner).slice(0, 8).forEach(k => { const sc = sceneOf(k); out.push(sc.tpl); const d = document.createElement('div'); d.innerHTML = sceneSVG(k, false); d.firstChild.style.width = '100%'; box.append(d); }); return out; }"""))
        await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/i_cyber.png")
        print("music", await pg.evaluate("[(S.wd.setting='fantasy', musicList('tavern').length), (S.wd.setting='cyberpunk', musicList('battle').join(',')), musicList('forest').join(','), (S.wd.setting='east', musicList('sacred').join(','))]"))
        await pg.evaluate("window.__src=[]; HTMLMediaElement.prototype.play = function(){ window.__src.push(this.src.split('/').pop()); return Promise.resolve(); }; AU.unlocked = true; AU.cfg.on = true; AU.cfg.music = .5; S.wd.setting = 'western'; AU.cur = null; for (let i = 0; i < 8; i++) { AU.mood = null; setMood('tavern'); AU.cur = null; }")
        print("played", await pg.evaluate("window.__src.join(' ')"))
        print("ERRS", errs); await b.close()
asyncio.run(main())

import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await pg.click("#h-new"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/l_settings.png", full_page=True)
        await pg.click("#btn-home") if False else None
        await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Жрец')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Тест"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(2500)
        # schedules over a day
        sched = await pg.evaluate("""() => { const out = []; for (let part = 0; part < 4; part++) { worldTime().part = part; refreshPeople(); out.push(DAY_PARTS[part] + ': ' + Object.entries(POIS).filter(([,p])=>!p.inner).map(([id,p]) => id + '=' + p.npcs.map(n=>NPCS[n].name).join('/')).join('  ')); } worldTime().part = 0; refreshPeople(); return out; }""")
        print("\n".join(sched))
        # animation persistence
        node1 = await pg.evaluate("() => { window.__svg = document.querySelector('#scene-view svg.sc-svg'); return !!window.__svg }")
        box = await pg.locator("#scene-view svg.sc-svg").bounding_box()
        await pg.mouse.click(box["x"]+box["width"]*0.3, box["y"]+box["height"]*0.75); await pg.wait_for_timeout(600)
        print("same static svg after walk:", await pg.evaluate("document.querySelector('#scene-view svg.sc-svg') === window.__svg"), await pg.evaluate("document.querySelector('#scene-view .sc-tok.hero').getAttribute('style')"))
        # popover near bottom
        hits = pg.locator("#scene-view .sc-hit"); n = await hits.count(); best=None; by=0
        for i in range(n):
            bb = await hits.nth(i).bounding_box()
            if bb and bb["y"] > by: by = bb["y"]; best = i
        await hits.nth(best).click(); await pg.wait_for_timeout(200)
        r = await pg.evaluate("(() => { const p = document.querySelector('.sc-pop.g'); const r = p.getBoundingClientRect(); return [r.top, r.bottom, r.left, r.right, innerHeight, innerWidth, p.hidden]; })()")
        print("pop rect", r); await pg.screenshot(path=SP+"/l_pop.png")
        await pg.keyboard.press("Escape")
        # wait button
        await pg.click("#sc-wait"); await pg.wait_for_timeout(300); await pg.click("#sc-wait"); await pg.wait_for_timeout(300)
        print("after wait:", await pg.evaluate("[DAY_PARTS[worldTime().part], S.feed.slice(-1)[0].html, POIS.tavern.npcs.map(n=>NPCS[n].name)]"))
        await pg.click("#scene-big"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/l_evening_tavern.png"); await pg.click("#sb-close")
        # weather visuals on street
        await pg.evaluate("() => { moveTo('street'); const t = worldTime(); S.world.wx = { slot: t.day*2 + (t.part>=2?1:0), k: 'rain' }; renderAll(); }"); await pg.wait_for_timeout(400)
        await pg.locator("#scene-card").screenshot(path=SP+"/l_rain.png")
        await pg.evaluate("() => { WD.season = 'winter'; const t = worldTime(); S.world.wx.k = 'snow'; worldTime().part = 0; S.world.wx.slot = t.day*2; renderAll(); }"); await pg.wait_for_timeout(400)
        await pg.click("#scene-big"); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+"/l_snow.png"); await pg.click("#sb-close")
        await pg.evaluate("() => { WD.season = 'autumn'; const t = worldTime(); S.world.wx = { slot: t.day*2 + (t.part>=2?1:0), k: 'fog' }; moveTo('pier'); renderAll(); }"); await pg.wait_for_timeout(400)
        await pg.locator("#scene-card").screenshot(path=SP+"/l_fog.png")
        # stash search
        st = await pg.evaluate("() => { for (const id of Object.keys(POIS)) { const s = sceneStash(id); if (s) return [id, s.obj, JSON.stringify(s.loot)]; } return null; }")
        print("stash:", st)
        await pg.evaluate(f"() => {{ C().scores.int = 40; const id = '{st[0]}'; S.world.loc = id; if (POIS[id].inner) bstate(id).how = 'впустили хозяева'; renderAll(); const o = sceneObjects(id).find(o => o.id === '{st[1]}'); searchObj(id, o); }}")
        await pg.wait_for_timeout(700)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
        await pg.wait_for_timeout(2500)
        print("search feed:", await pg.evaluate("S.feed.slice(-5).map(e => e.html || (e.items||[]).map(i=>i.x).join(',') || e.t)"), await pg.evaluate("C().gold"), await pg.evaluate("C().items.map(i=>i.name).slice(-2)"))
        print("ERRS", errs[:5]); await b.close()
asyncio.run(main())

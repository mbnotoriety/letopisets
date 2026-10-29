import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(500)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Плут')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Преступник')")
        for i in range(4):
            if await pg.locator(".skill-opt:not(.locked)[aria-pressed=false]").count(): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Ида"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        info = await pg.evaluate("""() => { const st = POIS.street; return { street: st && {x:st.x,y:st.y,blds:st.blds}, bl: Object.values(POIS).filter(p=>p.inner).map(p=>p.parent+': '+p.name+' ['+p.bk+'] occ '+p.occ.map(i=>NPCS[i].name+' ('+NPCS[i].role+')').join(', ')) } }""")
        print(json.dumps(info, ensure_ascii=False, indent=0)[:2500])
        await pg.screenshot(path=SP+"/b_map.png")
        await pg.evaluate("() => { moveTo('street'); renderAll(); }"); await pg.wait_for_timeout(300)
        await pg.click("#scene-big"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/b_street.png")
        roof = pg.locator("#scene-view-big .sc-hit[data-hit*='obj']")
        # find first building hit
        n = await roof.count(); idx=None
        for i in range(n):
            t = await roof.nth(i).text_content()
            if t.startswith("Дом") or t.startswith("Лачуга"): idx=i; break
        await roof.nth(idx).click(); await pg.wait_for_timeout(200)
        print("pop:", (await pg.inner_text(".sc-pop.g")).replace("\n"," | "))
        await pg.screenshot(path=SP+"/b_pop.png")
        await pg.click(".sc-pop.g button:has-text('Открыть дверь')"); await pg.wait_for_timeout(2500)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll"); await pg.wait_for_timeout(2500)
        print("loc after open:", await pg.evaluate("S.world.loc"), await pg.evaluate("S.feed.slice(-3).map(e=>e.html||e.t)"))
        if not (await pg.evaluate("POIS[S.world.loc].inner")):
            bid = await pg.evaluate("POIS.street.blds.find(b=>/Дом|Лачуга/.test(POIS[b].name))")
            print("locked? ", await pg.evaluate(f"bldLocked('{bid}')"))
            await pg.evaluate(f"bldAction('{bid}','pick')"); await pg.wait_for_timeout(800)
            if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
            await pg.wait_for_timeout(2500)
            print("after pick:", await pg.evaluate(f"[bldLocked('{bid}'), JSON.stringify(bstate('{bid}'))]"), await pg.evaluate("S.feed.slice(-4).map(e=>e.html||e.t)"))
            await pg.evaluate(f"bstate('{bid}').unlocked = tkey()"); await pg.evaluate(f"bldAction('{bid}','enter')"); await pg.wait_for_timeout(2500)
        print("now in", await pg.evaluate("[S.world.loc, POIS[S.world.loc].name, POIS[S.world.loc].npcs]"))
        await pg.screenshot(path=SP+"/b_inside.png")
        await pg.locator("#scene-card").screenshot(path=SP+"/b_inside_card.png")
        print("brief:", await pg.evaluate("bldBrief()"))
        await pg.evaluate("exitBuilding()"); await pg.wait_for_timeout(300); print("exit ->", await pg.evaluate("S.world.loc"), await pg.evaluate("S.scenes.street.player"))
        # gallery interiors
        await pg.evaluate("""() => { const g = document.createElement('div'); g.id='gal'; g.style.cssText='position:fixed;inset:0;z-index:99;background:#000;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;overflow:auto;padding:6px';
          const seen = new Set(); for (const [id,p] of Object.entries(POIS)) { if (!p.inner || seen.has(p.btpl+p.prop)) continue; seen.add(p.btpl+p.prop); const d=document.createElement('div'); d.className='scene-view'; d.innerHTML=sceneSVG(id,true)+`<div style="position:absolute;top:4px;left:6px;color:#fff;font:12px sans-serif;line-height:1">${p.name} · ${p.btpl}</div>`; g.append(d); }
          worldTime().part = 3; for (const id of ['street']) { const d=document.createElement('div'); d.className='scene-view'; d.innerHTML=sceneSVG(id,true)+'<div style="position:absolute;top:4px;left:6px;color:#fff;font:12px sans-serif">street night</div>'; g.append(d); }
          document.body.append(g); }""")
        await pg.set_viewport_size({"width":1500,"height":1400}); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/b_gal.png")
        print("ERRS", errs[:5]); await b.close()
asyncio.run(main())

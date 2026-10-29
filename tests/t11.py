import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(500)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Волшебник')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Ида"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1800)
        await pg.screenshot(path=SP+"/sc_game.png")
        await pg.locator("#scene-card").screenshot(path=SP+"/sc_card.png")
        # gallery of all templates
        await pg.evaluate("""() => {
          const kinds = {inn:'inn',house:'house',hut:'hut',chapel:'chapel',shrine:'shrine',tower:'tower',cave:'cave',mine:'mine',ruin:'ruin',camp:'camp',farm:'farm',pier:'pier',wreck:'wreck',forest:'grove',bridge:'bridge',square:'well',gate:'gate'};
          const g = document.createElement('div'); g.id='gal'; g.style.cssText='position:fixed;inset:0;z-index:99;background:#000;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;overflow:auto;padding:6px';
          for (const [t,k] of Object.entries(kinds)) { const id='zz_'+t; POIS[id] = {name:'Тест', short:'', kind:k, npcs: t==='inn'?['marta']:[], enemies:[], x:1,y:1, desc:''}; const d=document.createElement('div'); d.className='scene-view'; d.innerHTML=sceneSVG(id,true)+`<div style="position:absolute;top:4px;left:6px;color:#fff;font:12px sans-serif;line-height:1">${t}</div>`; g.append(d); }
          document.body.append(g);
        }""")
        await pg.wait_for_timeout(400)
        await pg.set_viewport_size({"width":1500,"height":1400})
        await pg.screenshot(path=SP+"/sc_gal1.png")
        await pg.evaluate("document.getElementById('gal').scrollTop = 99999")
        await pg.screenshot(path=SP+"/sc_gal2.png")
        await pg.evaluate("document.getElementById('gal').remove()")
        await pg.set_viewport_size({"width":1440,"height":900})
        # interact: click NPC token in card
        await pg.click("#scene-view .sc-tok.npc"); await pg.wait_for_timeout(200)
        print("pop:", await pg.inner_text(".sc-pop.g"))
        await pg.locator("#scene-card").screenshot(path=SP+"/sc_pop.png")
        await pg.click("#scene-big"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SP+"/sc_big.png")
        # click object (bar)
        hit = pg.locator("#scene-view-big .sc-hit").first
        await hit.click(); await pg.wait_for_timeout(200); print("objpop:", await pg.inner_text(".sc-pop.g"))
        await pg.click(".sc-pop.g button:has-text('Подойти')"); await pg.wait_for_timeout(300)
        print("player", await pg.evaluate("S.scenes[S.world.loc].player"))
        print("brief:", await pg.evaluate("sceneBriefLine()"))
        await pg.click("#sb-close")
        print("AU", await pg.evaluate("({unlocked:AU.unlocked, mood:AU.mood, track:AU.track, amb:AU.ambKey, cur: !!AU.cur, err: AU.cur && AU.cur.error && AU.cur.error.code})"))
        print("ERRS", errs[:8])
        await b.close()
asyncio.run(main())

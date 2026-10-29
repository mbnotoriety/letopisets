import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append("console:"+m.text))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Воин"); await pg.wait_for_timeout(1500)
        print("quests", await pg.evaluate("Object.keys(WD.quests)"), "marks", await pg.evaluate("POIS[S.world.loc].npcs.map(n=>NPCS[n].name+':'+questMark(n))"))
        await pg.screenshot(path=SP+"/q_game.png")
        # offer from Марта via 'Здесь' list
        await pg.click(".npc-row:has-text('Марта')"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/q_offer.png")
        await pg.click("#qo-hag"); await pg.wait_for_timeout(200); print("hag", await pg.inner_text("#qo-h"))
        await pg.click("#qo-yes"); await pg.wait_for_timeout(2500)
        print("st", await pg.evaluate("JSON.stringify(S.world.quests)"), "foes at grove", await pg.evaluate("POIS.grove.enemies"))
        # open big map and route to grove
        await pg.click("#map-big"); await pg.wait_for_timeout(800)
        await pg.click(".tr-dest:has-text('Сосновая')"); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+"/q_route.png")
        # click on terrain tile to test wild route
        box = await pg.evaluate("(()=>{const r=document.getElementById('bigbox').getBoundingClientRect(); return [r.x,r.y,r.width,r.height]})()")
        await pg.mouse.click(box[0]+box[2]*(15.5/20), box[1]+box[3]*(6.5/14)); await pg.wait_for_timeout(400)
        print("wild panel", (await pg.inner_text("#bm-info"))[:160].replace("\n"," | "))
        await pg.screenshot(path=SP+"/q_route_wild.png")
        # travel to grove with encounters disabled
        await pg.evaluate("window._ec = encChance; encChance = () => 0")
        await pg.click(".tr-dest:has-text('Сосновая')") if await pg.locator(".tr-dest").count() else None
        await pg.evaluate("1")
        await pg.click("#bm-close"); await pg.wait_for_timeout(200)
        await pg.click("#map-big"); await pg.wait_for_timeout(600); await pg.click(".tr-dest:has-text('Сосновая')"); await pg.wait_for_timeout(300)
        t0 = await pg.evaluate("JSON.stringify(worldTime())")
        await pg.click("#tr-go"); await pg.wait_for_timeout(1200); await pg.screenshot(path=SP+"/q_travel.png")
        await pg.wait_for_timeout(5000)
        print("arrived", await pg.evaluate("S.world.loc"), t0, "->", await pg.evaluate("JSON.stringify(worldTime())"), "combat", await pg.evaluate("S.world.combat"))
        # kill quest foes
        await pg.evaluate("Object.keys(S.world.quests).forEach(q=>(S.world.quests[q].foes||[]).forEach(id=>{S.world.enemies[id].alive=false; S.world.enemies[id].hp=0})); S.world.combat=false; after()")
        print("ready", await pg.evaluate("JSON.stringify(S.world.quests)"))
        # typed travel interception -> back to tavern
        await pg.evaluate("takeTurn('Иду в таверну', {checks:[], move_to:'tavern'})"); await pg.wait_for_timeout(600)
        print("bigmap open", await pg.locator("#bigbox").count()); await pg.wait_for_timeout(6000)
        print("loc", await pg.evaluate("S.world.loc"))
        await pg.screenshot(path=SP+"/q_back.png")
        acts = await pg.evaluate("questNpcActs('marta').map(a=>a.t)"); print("marta acts", acts)
        g0 = await pg.evaluate("C().gold"); await pg.evaluate("questNpcActs('marta')[0].fn()"); await pg.wait_for_timeout(2500)
        print("gold", g0, "->", await pg.evaluate("C().gold"), await pg.evaluate("S.world.quests.q_wolves.st"), "rumor cave", await pg.evaluate("S.world.rumors.includes('cave')"))
        # encounters: force each kind
        await pg.evaluate("encChance = window._ec")
        for kind in ["ambush","traveler","discovery","hazard","omen"]:
            await pg.evaluate(f"""(() => {{ S.world.enc=null; S.world.combat=false; const R0=Math.random; const want='{kind}'; const order=['ambush','traveler','discovery','hazard','omen']; let first=true;
              Math.random = () => {{ if(first){{first=false; const W=[34,24,18,14,9]; const tot=W.reduce((a,b)=>a+b); let s=0; for(let i=0;i<order.indexOf(want);i++) s+=W[i]; return (s+0.5)/tot; }} return R0(); }};
              const wid = wildAt(4,4); tripTimeDone=true; moveTo(wid); S.world.trip={{dest:'grove'}}; startEncounter(4,4,PACES.normal); Math.random=R0; }})()""")
            await pg.wait_for_timeout(400)
            k = await pg.evaluate("S.world.enc && S.world.enc.kind"); print("enc", kind, "->", k, await pg.evaluate("S.world.enc.title"))
            await pg.screenshot(path=SP+f"/e_{kind}.png")
            # pick 2nd choice (non-combat usually)
            btns = await pg.locator(".enc-btn:not([disabled])").count(); await pg.click(f".enc-btn:not([disabled]) >> nth={1 if btns>1 else 0}"); await pg.wait_for_timeout(700)
            if await pg.locator("#btn-roll").count(): await pg.click("#btn-roll")
            await pg.wait_for_timeout(2400)
            print("  done", await pg.evaluate("encDone()"), "combat", await pg.evaluate("S.world.combat"), "hp", await pg.evaluate("C().hp"))
            if await pg.locator(".qo").count(): await pg.click("#qo-yes"); await pg.wait_for_timeout(2500); print("  roadquest", await pg.evaluate("Object.keys(WD.quests).filter(k=>k.startsWith('rq_'))"))
            if await pg.locator("#shop-x").count(): await pg.click("#shop-x")
        await pg.screenshot(path=SP+"/e_after.png")
        await pg.evaluate("journalTab='side'; openJournal()"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/q_journal.png")
        await pg.evaluate("closeModal(); S.world.enc=null; S.world.combat=false; renderAll(); showTab && 0")
        await pg.click("#map-big"); await pg.wait_for_timeout(800); await pg.screenshot(path=SP+"/q_bigmap_after.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

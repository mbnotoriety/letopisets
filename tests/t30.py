import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 1300
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def idle(pg): await pg.wait_for_function("!busy", timeout=20000); await pg.wait_for_timeout(300)
async def roll(pg):
    try: await pg.wait_for_selector("#btn-roll", timeout=4000); await pg.click("#btn-roll")
    except Exception: pass
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":W,"height":880}); pg.set_default_timeout(10000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
        await pg.evaluate("C().hp=C().maxHp=80; after()"); await pg.wait_for_function("S.world.comps && typeof S.world.comps === 'object'", timeout=10000)
        print("comps", await pg.evaluate("JSON.stringify(Object.entries(S.world.comps).map(([k,d])=>[k,NPCS[k].name,NPCS[k].role,d.arch,npcWhere(k)]))"))
        ids = await pg.evaluate("Object.keys(S.world.comps)")
        a = ids[0]
        await pg.evaluate(f"() => {{ const id='{a}'; const w=npcWhere(id); if (w && w!==S.world.loc) moveTo(w); (S.world.met=S.world.met||[]).push(id); ensureNpcState(id); S.world.npcs[id].att=12; after(); }}")
        print("here", await pg.evaluate("POIS[S.world.loc].npcs"), "loc", await pg.evaluate("S.world.loc"))
        await pg.evaluate(f"openRecruit('{a}')"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+f"/c{W}_recruit.png")
        await pg.click("#cr-yes"); await idle(pg)
        print("party", await pg.evaluate("JSON.stringify(S.party)"))
        dest = await pg.evaluate("Object.keys(POIS).find(k => !POIS[k].inner && k!==S.world.loc && POIS[k].where==='village') || Object.keys(POIS).find(k=>!POIS[k].inner && k!==S.world.loc)")
        await pg.evaluate(f"() => {{ tripTimeDone=true; moveTo('{dest}'); after(); }}")
        print("follows", await pg.evaluate(f"POIS[S.world.loc].npcs.includes('{a}')"), dest)
        await pg.evaluate("compReact('assault'); compReact('quest'); compReact('deceive')"); await pg.wait_for_timeout(300)
        print("approval", await pg.evaluate("S.party[0].approval"), await pg.evaluate("JSON.stringify(S.party[0].log)"))
        if W < 700: await pg.click("#mtabs [data-t=sheet]")
        await pg.wait_for_timeout(300); await pg.screenshot(path=SP+f"/c{W}_sheet.png")
        if W < 700: await pg.click("#mtabs [data-t=story]")
        # combat
        await pg.evaluate("() => { spawnFoes('wolf','Волк',3,S.world.loc); S.world.combat=true; S.world.fightId=uid(); S.world.round=1; renderAll(); }"); await pg.wait_for_timeout(2600)
        await pg.screenshot(path=SP+f"/c{W}_combat.png")
        print("intents", await pg.evaluate("aliveEnemiesHere().map(id=>intentInfo(id).t)"))
        for i in range(3):
            if not await pg.evaluate("S.world.combat"): break
            await pg.evaluate("C().hp=C().maxHp; renderAll()")
            await pg.click("#combat-hud .cb-act >> nth=0"); await roll(pg); await idle(pg); await pg.wait_for_timeout(500)
        print("feed rolls", await pg.evaluate("S.feed.filter(e=>e.t==='roll' && (e.r.comp||e.r.vsComp)).slice(-6).map(e=>e.r.title+' | '+(e.r.verdict||'')+' | '+e.r.formula.slice(0,80))"))
        await pg.screenshot(path=SP+f"/c{W}_combat2.png")
        await pg.evaluate("aliveEnemiesHere().forEach(id=>{S.world.enemies[id].alive=false;S.world.enemies[id].hp=0}); S.world.combat=false; after()")
        # camp
        await pg.evaluate("S.party[0].approval=35; S.party[0].joined=-20; longRest()"); await pg.wait_for_selector(".cf", timeout=8000); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SP+f"/c{W}_camp.png")
        await pg.click("[data-past]"); await pg.wait_for_selector(".qo", timeout=15000); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+f"/c{W}_pq.png")
        await pg.click("#qo-yes"); await idle(pg)
        print("pq", await pg.evaluate("JSON.stringify(WD.quests['cq_'+S.party[0].id] && {t:WD.quests['cq_'+S.party[0].id].title, st:qSt('cq_'+S.party[0].id).st, type:WD.quests['cq_'+S.party[0].id].type})"))
        await pg.evaluate("openComp(S.party[0].id)"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+f"/c{W}_comp.png")
        await pg.evaluate("closeModal(); openParty()"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+f"/c{W}_party.png")
        await pg.evaluate("closeModal()")
        # help in checks
        print("help", await pg.evaluate("JSON.stringify(validatePlan({checks:[{kind:'skill',skill:COMP_ARCH[S.party[0].arch].skills[0],dc:12}]}).checks)"))
        # leave
        await pg.evaluate("S.party[0].approval=-45; compApprove(S.party[0].id,-8,'тест')"); await pg.wait_for_timeout(300)
        print("after leave", await pg.evaluate("S.party.length"), await pg.evaluate("JSON.stringify(S.world.compGone)"))
        print("ERRS", errs); await b.close()
asyncio.run(main())

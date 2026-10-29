import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def roll(pg, n=3):
    for _ in range(n):
        await pg.wait_for_timeout(450)
        if await pg.locator("#btn-roll").count(): await pg.click("#btn-roll")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); pg.set_default_timeout(8000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Воин"); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { S.settings.fight='fast'; C().maxHp=200; C().hp=200; renderAll(); }")
        # open confirm via function (as from popover)
        await pg.evaluate("confirmAttack('marta')"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/n_confirm.png")
        await pg.click("#nf-kill"); await roll(pg); await pg.wait_for_timeout(1500)
        print("combat", await pg.evaluate("S.world.combat"), "hostile", await pg.evaluate("JSON.stringify(S.world.hostile)"), "rep", await pg.evaluate("S.world.rep"), "wanted", await pg.evaluate("S.world.wanted"))
        print("tavern npcs", await pg.evaluate("POIS.tavern.npcs"))
        await pg.screenshot(path=SP+"/n_fight.png")
        # kill marta
        for i in range(6):
            if not await pg.evaluate("S.world.combat"): break
            await pg.evaluate("rnd = (n => n===20 ? 18 : Math.floor(Math.random()*n)+1)")
            await pg.click(".cb-act.atk >> nth=0"); await roll(pg); await pg.wait_for_timeout(1600)
        print("dead", await pg.evaluate("JSON.stringify(S.world.deadNpcs)"), "quests", await pg.evaluate("S.world.quests?.q_wolves?.st"), "facts", await pg.evaluate("S.world.facts.slice(-2)"))
        await pg.screenshot(path=SP+"/n_dead.png")
        # search body
        eid = await pg.evaluate("Object.keys(ENEMIES).find(k=>ENEMIES[k].npc==='marta')")
        await pg.evaluate(f"searchBody('{eid}')"); await pg.wait_for_timeout(2000)
        print("items", await pg.evaluate("C().items.slice(-2).map(i=>i.name)"), "purse", await pg.evaluate("purse(C())"))
        print("brief", (await pg.evaluate("npcBrief()"))[:300])
        print("refuse", await pg.evaluate("merchantsHere().map(m=>m.name+':'+refusesTrade(m))"))
        # KO path on Ost at pier
        await pg.evaluate("() => { tripTimeDone=true; moveTo('pier'); renderAll(); }"); await pg.wait_for_timeout(500)
        await pg.evaluate("() => { takeTurn('Оглушаю Оста', {checks:[], npcAttack:'ost', nonLethal:true, combat:true}); }"); await roll(pg); await pg.wait_for_timeout(1500)
        for i in range(8):
            if not await pg.evaluate("S.world.combat"): break
            await pg.click(".cb-act.atk >> nth=0"); await roll(pg); await pg.wait_for_timeout(1600)
        print("ko", await pg.evaluate("JSON.stringify(S.world.ko)"), "ost dead", await pg.evaluate("!!NPCS.ost.dead"), "hostile", await pg.evaluate("JSON.stringify(S.world.hostile)"))
        await pg.screenshot(path=SP+"/n_ko.png")
        eid2 = await pg.evaluate("S.world.hostile?.ost")
        if eid2:
            await pg.evaluate(f"koAct('{eid2}','wake')"); await pg.wait_for_timeout(2000)
            print("after wake", await pg.evaluate("[POIS.pier.npcs, S.world.npcs.ost.att]"))
        # npc_attack effect from narrator
        await pg.evaluate("() => { tripTimeDone=true; moveTo('chapel'); npcAttackEffects(['ilva']); renderAll(); }"); await pg.wait_for_timeout(1200)
        print("ilva fight", await pg.evaluate("[S.world.combat, aliveEnemiesHere().map(id=>ENEMIES[id].name)]"))
        await pg.screenshot(path=SP+"/n_ilva.png")
        await pg.click(".cb-act:has-text('Опустить оружие')"); await roll(pg); await pg.wait_for_timeout(2000)
        print("standdown", await pg.evaluate("[S.world.combat, POIS.chapel.npcs]"))
        # offline adjudicate parse
        print("parse", await pg.evaluate("JSON.stringify(offlineAdjudicate('бью Брена кулаком'))"), await pg.evaluate("JSON.stringify(validatePlan({attack_npc:'brenn', nonlethal:true}))"))
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

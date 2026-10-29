import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def roll(pg):
    for _ in range(3):
        await pg.wait_for_timeout(500)
        if await pg.locator("#btn-roll").count(): await pg.click("#btn-roll")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Воин"); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { S.settings.fight='fast'; C().maxHp=300; C().hp=300; tripTimeDone=true; moveTo('cave'); S.world.combat = true; renderAll(); }"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=SP+"/c_start.png")
        print("intents", await pg.evaluate("aliveEnemiesHere().map(id=>ENEMIES[id].name+':'+(intentInfo(id)||{}).t)"))
        print("acts", await pg.evaluate("[...document.querySelectorAll('.cb-act b')].map(b=>b.textContent)"))
        # target second foe
        await pg.click(".cb-foe >> nth=2"); print("tgt", await pg.evaluate("S.world.tgt"))
        # attack
        await pg.click(".cb-act.atk >> nth=0"); await roll(pg); await pg.wait_for_timeout(900); await pg.screenshot(path=SP+"/c_hit.png")
        await pg.wait_for_timeout(1500)
        print("round", await pg.evaluate("S.world.round"), "hp", await pg.evaluate("C().hp"), "feed", await pg.evaluate("S.feed.slice(-3).map(e=>e.t+':'+(e.text||e.r?.title||'').slice(0,60))"))
        # force crush intent on thug and dodge
        await pg.evaluate("() => { const id = aliveEnemiesHere().find(i=>ENEMIES[i].boss); if(id) S.world.enemies[id].intent={k:'crush',t:'Заносит сокрушительный удар',warn:'x'}; renderAll(); }")
        await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/c_intent.png")
        await pg.click(".cb-act:has-text('Уклонение')"); await pg.wait_for_timeout(2500)
        print("after dodge hp", await pg.evaluate("C().hp"), await pg.evaluate("S.feed.filter(e=>e.t==='roll').slice(-3).map(e=>e.r.title+' | '+e.r.formula.slice(0,80))"))
        # shove
        await pg.evaluate("C().hp = C().maxHp; renderAll()")
        await pg.click(".cb-act:has-text('Толкнуть')"); await roll(pg); await pg.wait_for_timeout(2000)
        print("shove", await pg.evaluate("JSON.stringify(aliveEnemiesHere().map(id=>[ENEMIES[id].name, S.world.enemies[id].cond]))"))
        # assess
        await pg.evaluate("C().hp = C().maxHp; renderAll()")
        if await pg.locator(".cb-act:has-text('Оценить')").count(): await pg.click(".cb-act:has-text('Оценить')"); await roll(pg); await pg.wait_for_timeout(2000)
        print("known", await pg.evaluate("aliveEnemiesHere().map(id=>S.world.enemies[id].known)"))
        # web on hero -> breakfree button
        await pg.evaluate("hcond().restrained=true; hcond().rTurns=0; hcond().poisoned=2; C().hp = 3; renderAll()"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/c_cond.png")
        print("breakfree", await pg.locator(".cb-act:has-text('Вырваться')").count(), "lowhp", await pg.evaluate("document.body.classList.contains('low-hp')"))
        await pg.evaluate("C().hp = C().maxHp; delete hcond().restrained; renderAll()")
        # kill all but one, one surrenders
        await pg.evaluate("() => { const al = aliveEnemiesHere(); al.slice(1).forEach(id=>{S.world.enemies[id].hp=1}); S.world.enemies[al[0]].intent={k:'surrender'}; al.slice(1).forEach(id=>hurtEnemy(id, 5)); renderAll(); }")
        await pg.wait_for_timeout(300)
        await pg.click(".cb-act:has-text('Уклонение')"); await pg.wait_for_timeout(3500); await pg.screenshot(path=SP+"/c_victory.png")
        print("combat", await pg.evaluate("S.world.combat"), "vic", await pg.evaluate("S.feed.filter(e=>e.t==='victory').map(e=>JSON.stringify(e)).slice(-1)"))
        # wolves pack test + escape
        await pg.evaluate("() => { const ids = spawnFoes('wolf','Волк',2,S.world.loc); S.world.combat=true; renderAll(); }"); await pg.wait_for_timeout(1500)
        r = await pg.evaluate("(() => { const out=[]; for (let i=0;i<4;i++){ C().hp=C().maxHp; out.push(...enemyTurn().map(r=>r.title+' | '+r.formula.slice(0,90))); } return out; })()")
        for x in r[:6]: print("  ", x)
        await pg.evaluate("C().hp=C().maxHp; delete hcond().prone; renderAll()")
        await pg.click(".cb-act:has-text('Отступить')"); await roll(pg); await pg.wait_for_timeout(2500)
        print("after escape", await pg.evaluate("[S.world.combat, S.world.loc]"))
        await pg.set_viewport_size({"width":400,"height":860}); await pg.evaluate("() => { tripTimeDone=true; moveTo('lighthouse'); S.world.combat=true; renderAll(); showTab('story'); }"); await pg.wait_for_timeout(1500); await pg.screenshot(path=SP+"/c_mobile.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

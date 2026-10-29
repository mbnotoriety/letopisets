import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and "Failed to load" not in m.text and errs.append(m.text[:150]))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(200); await pg.click("#btn-next")
        await pg.click(".choice:has-text('Тифлинг')"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/h_race.png", full_page=True); await pg.click("#btn-next")
        await pg.click(".choice:has-text('Варвар')"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/h_class.png", full_page=True); await pg.click("#btn-next")
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Моряк')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.screenshot(path=SP+"/h_bg.png", full_page=True); await pg.click("#btn-next")
        await pg.click(".kit-head >> nth=2"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/h_gear.png", full_page=True)
        names=[]
        for i in range(4):
            await pg.click("#kit-reroll"); await pg.wait_for_timeout(100); names.append(await pg.evaluate("D.kitW.list.map(d=>d.name).join(' / ')"))
        print("rerolls:", names)
        await pg.click("#btn-next"); await pg.fill("#f-name","Кора")
        await pg.evaluate("() => { const set = (k,v) => { const i = document.querySelector(`input[data-k=${k}]`); i.value = v; i.dispatchEvent(new Event('input')); }; set('sl3', 90); set('sl7', 85); set('sl6', 10); set('sl2', 80); }")
        await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/h_look.png", full_page=True)
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1800)
        print("char:", await pg.evaluate("[C().ac, C().weapons.map(w=>WEAPONS[w].name).join(', '), JSON.stringify(C().res), fmtMoney(purse(C())), S.world.rep, Object.entries(S.world.npcs).map(([k,v])=>k+':'+v.att).join(' ')]"))
        await pg.screenshot(path=SP+"/h_game.png")
        await pg.evaluate("() => { moveTo('cave'); S.world.combat = true; renderAll(); }"); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SP+"/h_combat.png")
        await pg.evaluate("typeof sheetOpen === 'function' && sheetOpen(true)"); await pg.wait_for_timeout(350)
        await pg.click(".act:has-text('Ярость')"); await pg.wait_for_timeout(200)
        await pg.click(".act.w-act >> nth=0"); await pg.wait_for_timeout(600)
        await pg.evaluate("typeof sheetOpen === 'function' && sheetOpen(false)"); await pg.wait_for_timeout(350)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
        await pg.wait_for_timeout(2500)
        print("rolls:", await pg.evaluate("S.feed.filter(e=>e.t==='roll').slice(-3).map(e=>e.r.title+' | '+e.r.formula)"))
        print("ERRS", errs[:6]); await b.close()
asyncio.run(main())

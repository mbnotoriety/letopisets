import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def roll_if(pg):
    if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll"); await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor-v21.html"); await pg.wait_for_timeout(500)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Волшебник')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Ида"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        print("hf calls after start:", len(await pg.evaluate("window.__hfCalls")))
        for i in range(5):
            await pg.fill("#act-input", f"Осматриваюсь {i}"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(450); await roll_if(pg); await pg.wait_for_timeout(450)
        await pg.click(".sugg .cont"); await pg.wait_for_timeout(900)
        st = await pg.evaluate("({threat:S.world.threat, time:S.world.time, met:S.world.met, jon: !!NPCS.old_jon, jonMinor: NPCS.old_jon?.minor, loc:S.world.loc, calls: window.__hfCalls.length, archKeys: Object.keys(imgCache).filter(k=>k.includes(':type:'))})")
        print("STATE", st)
        print("undo visible", bool(await pg.query_selector(".sugg .undo")))
        before = await pg.evaluate("S.feed.length"); await pg.click(".sugg .undo"); await pg.wait_for_timeout(300); after = await pg.evaluate("S.feed.length"); print("undo feed", before, "->", after)
        await pg.screenshot(path=SP+"/v6_game.png")
        await pg.evaluate("S.char.xp = 6600; after();"); await pg.wait_for_timeout(200)
        for lv in range(4):
            await pg.click("#btn-lvl"); await pg.wait_for_timeout(150); await pg.click("#lv-avg"); await pg.wait_for_timeout(150)
            if await pg.query_selector(".asi-grid"): await pg.click(".asi-grid [data-a=int]"); await pg.wait_for_timeout(150)
        print("LEVEL", await pg.evaluate("({lvl:S.char.level, hp:S.char.maxHp, slots:S.char.slots, spells:S.char.spells, int:S.char.scores.int})"))
        await pg.screenshot(path=SP+"/v6_sheet.png")
        await pg.click("#btn-journal"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/v6_journal.png")
        await pg.click("[data-j=people]"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/v6_journal_people.png")
        await pg.click("#j-close"); await pg.click("#btn-settings"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/v6_settings.png"); await pg.click("#set-len [data-v=short]"); await pg.click("#set-ok")
        # recap: make old and reopen
        await pg.evaluate("S.updated = Date.now() - 3600e3; lsSet(C_KEY(S.id), S);")
        await pg.evaluate("S=null; renderHome();"); await pg.wait_for_timeout(300)
        await pg.evaluate("const s=lsGet(C_KEY(campIndex()[0].id)); s.updated=Date.now()-3600e3; lsSet(C_KEY(s.id), s);")
        await pg.click("[data-a=play]"); await pg.wait_for_timeout(1200)
        print("recap", await pg.evaluate("S.feed.filter(e=>e.t==='recap').length"))
        await pg.screenshot(path=SP+"/v6_recap.png")
        print("ERRS", errs); await b.close()
asyncio.run(main())

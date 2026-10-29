import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; fails=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("requestfailed", lambda r: fails.append(r.url[:90]))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(500)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Волшебник')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Ида"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        await pg.evaluate("""() => { moveTo('cave'); S.world.combat = true; hurtEnemy('smug_a', 4); sceneEffects({add:[{label:'колокол под мешковиной', acc:'колокол под мешковиной', kind:'bell'}, {label:'записка', acc:'записку', kind:'item'}], crowd: 0}); renderAll(); }""")
        await pg.wait_for_timeout(300)
        await pg.locator("#scene-card").screenshot(path=SP+"/sc_cave_card.png")
        await pg.click("#scene-big"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=SP+"/sc_cave_big.png")
        await pg.click("#scene-view-big .sc-tok.foe"); await pg.wait_for_timeout(200)
        print("foe pop:", (await pg.inner_text(".sc-pop.g")).replace("\n"," | "))
        await pg.click("#sb-close")
        print("mood", await pg.evaluate("[AU.mood, AU.track, AU.ambKey]"))
        # play a turn: attack via text -> mock
        await pg.fill("#act-input", "Атакую контрабандиста"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(800)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
        await pg.wait_for_timeout(2500)
        print("feed tail:", await pg.evaluate("S.feed.slice(-4).map(e=>e.t)"))
        print("night:"); await pg.evaluate("() => { S.world.combat=false; moveTo('grove'); worldTime().part=3; renderAll(); }"); await pg.wait_for_timeout(300)
        await pg.locator("#scene-card").screenshot(path=SP+"/sc_night.png"); print("mood", await pg.evaluate("[AU.mood, AU.ambKey]"))
        await pg.evaluate("openSettings()"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/sc_settings.png")
        print("FAILS", sorted(set(fails))[:12]); print("ERRS", errs[:6])
        await b.close()
asyncio.run(main())

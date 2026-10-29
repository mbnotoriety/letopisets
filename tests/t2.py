import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def roll_if(pg):
    if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll"); await pg.wait_for_timeout(400)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1400,"height":900})
        errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:"+m.text) if m.type=="error" and "ERR_TUNNEL" not in m.text and "Failed to load" not in m.text else None)
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(400)
        await pg.click(".opts button:has-text('Болота')")
        await pg.click("#f-forge"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=SP+"/v2_world.png")
        for sel in [".choice:has-text('Дварф')"]: await pg.click("#btn-next"); await pg.click(sel)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Плут')"); await pg.screenshot(path=SP+"/v2_class.png")
        await pg.click("#btn-next"); await pg.click("#btn-next")
        await pg.click(".choice:has-text('Солдат')")
        for i in range(4): await pg.click(f".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.fill("#f-name","Борин"); await pg.click("#f-story"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Хроника')"); await pg.click("#btn-next")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path=SP+"/v2_game1.png")
        for i in range(10):
            await pg.fill("#act-input", f"Осматриваю всё вокруг {i}"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500); await roll_if(pg); await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(800)
        await pg.fill("#act-input","Иду в сердце топи"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(1500)
        for i in range(5):
            await roll_if(pg)
            btn = await pg.query_selector("#sheet .act:not([disabled])")
            if await pg.query_selector("#btn-ds"): await pg.click("#btn-ds"); await pg.wait_for_timeout(300); continue
            if btn: await btn.click(); await pg.wait_for_timeout(500); await roll_if(pg); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SP+"/v2_game2.png")
        st = await pg.evaluate("S ? {log:S.log.length, summary:S.summary, facts:S.world.facts.length, loc:S.world.loc, combat:S.world.combat, hp:S.char.hp, dead:S.dead} : null")
        print("STATE", st)
        if await pg.query_selector("#dead-home"): await pg.click("#dead-home")
        else: await pg.click("#btn-home")
        await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/v2_home.png")
        print("CAMPS", await pg.evaluate("campIndex().map(e=>[e.hero,e.world,e.dead])"))
        await pg.set_viewport_size({"width":400,"height":820}); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/v2_home_m.png")
        print("scrollW", await pg.evaluate("document.documentElement.scrollWidth"))
        # reload: home shows; open default world quick start
        await pg.set_viewport_size({"width":1400,"height":900})
        await pg.reload(); await pg.wait_for_timeout(400)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=SP+"/v2_pick.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

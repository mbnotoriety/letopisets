import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def roll_if(pg):
    if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll"); await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:"+m.text) if m.type=="error" and "Failed to load" not in m.text else None)
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=SP+"/v3_land.png")
        await pg.screenshot(path=SP+"/v3_land_full.png", full_page=False)
        await pg.click("#h-new"); await pg.wait_for_timeout(200)
        await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=SP+"/v3_world_sh.png")
        await pg.click(".opts button:has-text('Болота')"); await pg.click("#f-forge"); await pg.wait_for_timeout(3000)
        await pg.screenshot(path=SP+"/v3_world.png")
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Дварф')")
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Плут')")
        await pg.click("#btn-next"); await pg.click("#btn-next")
        await pg.click(".choice:has-text('Солдат')")
        for i in range(4): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Борин"); await pg.fill("#f-look","рыжая борода, шрам, капюшон")
        await pg.click("#f-photo"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=SP+"/v3_look.png")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        for i in range(3):
            await pg.fill("#act-input", f"Осматриваю всё вокруг {i}"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500); await roll_if(pg); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SP+"/v3_game.png")
        print("hfCalls", len(await pg.evaluate("window.__hfCalls")), (await pg.evaluate("window.__hfCalls"))[:2])
        print("charImg", bool(await pg.evaluate("S.char.img")), "npcImgs", await pg.evaluate("Object.values(S.wd.npcs).filter(n=>n.img).length"), "/", await pg.evaluate("Object.keys(S.wd.npcs).length"))
        await pg.set_viewport_size({"width":400,"height":820}); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/v3_game_m.png")
        print("scrollW game", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.click("#btn-home"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/v3_land_m.png")
        print("scrollW home", await pg.evaluate("document.documentElement.scrollWidth"))
        await pg.set_viewport_size({"width":1440,"height":900}); await pg.wait_for_timeout(300)
        await pg.evaluate("document.getElementById('camps-band').scrollIntoView()"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/v3_camps.png")
        print("ERRS", errs); await b.close()
asyncio.run(main())

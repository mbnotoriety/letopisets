import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(400)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Эльф')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Воин')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Тал"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1300)
        await pg.evaluate("S.world.threat=4; renderScene(); document.getElementById('feed').scrollTop=0;"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=SP+"/v6_scene.png", clip={"x":318,"y":64,"width":736,"height":260})
        await pg.set_viewport_size({"width":400,"height":820}); await pg.wait_for_timeout(200)
        await pg.screenshot(path=SP+"/v6_m_game.png")
        await pg.click("#btn-journal"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/v6_m_journal.png")
        print("scrollW", await pg.evaluate("document.documentElement.scrollWidth"), "ERRS", errs); await b.close()
asyncio.run(main())

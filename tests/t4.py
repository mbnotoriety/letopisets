import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1400,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(300)
        await pg.click(".world-pick:has-text('Солёная Гавань')")
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Воин')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.fill("#f-name","Тест"); await pg.click("#btn-next"); await pg.click("#btn-next")
        await pg.wait_for_timeout(800)
        await pg.evaluate("S.char.hp=1; moveTo('lighthouse'); S.world.combat=true; after();")
        for i in range(8):
            st = await pg.evaluate("({busy, dying: !!S?.dying, dead: S?.dead})")
            if st["dying"] or st["dead"]: break
            btn = await pg.query_selector("#sheet .act:not([disabled])")
            if btn: await btn.click(); await pg.wait_for_timeout(300)
            if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
            await pg.wait_for_timeout(700)
        print("state", await pg.evaluate("({busy, ctl: !!ctl, dying: S.dying, stopHidden: document.getElementById('btn-stop').hidden, homeDis: document.getElementById('btn-home').disabled})"))
        await pg.click("#btn-home", timeout=5000); await pg.wait_for_timeout(300)
        print("screens", await pg.evaluate("['screen-home','screen-create','screen-game'].map(id=>document.getElementById(id).hidden)"))
        print("ERRS", errs); await b.close()
asyncio.run(main())

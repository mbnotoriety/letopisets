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
        print("after intro", await pg.evaluate("({busy, ctl: !!ctl, stopHidden: document.getElementById('btn-stop').hidden, homeDis: document.getElementById('btn-home').disabled})"))
        await pg.fill("#act-input","Осматриваюсь"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
        await pg.wait_for_timeout(800)
        print("after turn", await pg.evaluate("({busy, ctl: !!ctl, stopHidden: document.getElementById('btn-stop').hidden, homeDis: document.getElementById('btn-home').disabled})"))
        await pg.click("#btn-home"); await pg.wait_for_timeout(300)
        print("screens", await pg.evaluate("['screen-home','screen-create','screen-game'].map(id=>document.getElementById(id).hidden)"))
        await pg.screenshot(path=SP+"/v2_home.png"); await pg.set_viewport_size({"width":400,"height":820}); await pg.screenshot(path=SP+"/v2_home_m.png"); await pg.set_viewport_size({"width":1400,"height":900})
        await pg.click("[data-a=play]"); await pg.wait_for_timeout(500)
        print("reopened", await pg.evaluate("[S.char.name, WD.name, S.feed.length, document.getElementById('screen-game').hidden]"))
        print("ERRS", errs); await b.close()
asyncio.run(main())

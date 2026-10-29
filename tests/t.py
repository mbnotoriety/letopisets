import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1400,"height":900})
        errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append("console:"+m.text) if m.type=="error" else None)
        await pg.goto("file:///home/claude/salt-harbor.html")
        await pg.wait_for_timeout(500)
        await pg.click(".choice:has-text(\"Эльф\")"); await pg.click("#btn-next")
        await pg.click(".choice:has-text(\"Жрец\")"); await pg.screenshot(path=SP+"/c2.png"); await pg.click("#btn-next")
        await pg.click("text=Покупка очков"); await pg.click("text=Бросить 4d6"); await pg.click("text=Стандартный набор")
        await pg.click("#btn-next")
        await pg.click(".choice:has-text(\"Прислужник\")")
        await pg.click(".skill-opt:not(.locked) >> nth=0"); await pg.click(".skill-opt:not(.locked) >> nth=1")
        await pg.click("#btn-next")
        await pg.fill("#f-name","Эйрин Тёрн"); await pg.click("#f-story")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=SP+"/c5.png")
        await pg.click("#btn-next"); await pg.click("#btn-next")
        await pg.wait_for_timeout(11500)  # sample null after ~10s? (no window.claude -> immediate)
        await pg.screenshot(path=SP+"/g1.png")
        await pg.fill("#act-input","Иду к месту крушения и осматриваю обломки")
        await pg.keyboard.press("Enter")
        await pg.wait_for_timeout(800)
        if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll")
        await pg.wait_for_timeout(1200)
        await pg.fill("#act-input","Иду к маяку")
        await pg.keyboard.press("Enter")
        await pg.wait_for_timeout(1500)
        for i in range(6):
            btn = await pg.query_selector("#sheet .act:not([disabled])")
            if await pg.query_selector("#btn-roll"): await pg.click("#btn-roll"); await pg.wait_for_timeout(800); continue
            if await pg.query_selector("#btn-ds"): await pg.click("#btn-ds"); await pg.wait_for_timeout(400); continue
            if btn: await btn.click(); await pg.wait_for_timeout(700)
        await pg.screenshot(path=SP+"/g2.png")
        await pg.set_viewport_size({"width":400,"height":800}); await pg.wait_for_timeout(300)
        await pg.screenshot(path=SP+"/m1.png")
        await pg.click("#mtabs [data-t=world]"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/m2.png")
        sw = await pg.evaluate("document.documentElement.scrollWidth")
        print("scrollWidth", sw)
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

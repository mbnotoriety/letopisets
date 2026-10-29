import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def make(pg, world, cls="Жрец"):
    await pg.click("#h-new"); await pg.wait_for_timeout(200)
    if world == "forge":
        await pg.click(".opts button:has-text('Болота')"); await pg.click("#f-forge"); await pg.wait_for_timeout(2500)
    else:
        await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
    await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(f".choice:has-text('{cls}')")
    await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
    for i in range(4 if cls=="Плут" else 2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
    await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Тест"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1200)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
        await pg.screenshot(path=SP+"/v4_land.png")
        await make(pg, "sh")
        await pg.evaluate("""moveTo('wreck'); moveTo('pier'); S.world.flags.clue_wreck=true; S.world.notes={wreck:'следы ломов на ящиках'}; S.world.rumors=['cave']; moveTo('lighthouse'); S.world.enemies.drowned_a.alive=false; moveTo('chapel'); after();""")
        t = await pg.evaluate("(() => { mapCache.clear(); const a=performance.now(); drawMap(); return performance.now()-a; })()")
        print("paint ms", round(t))
        print("bigpaint", await pg.evaluate("(() => { const a=performance.now(); const c=document.createElement('canvas'); paintMap(c,{width:1060,fog:true,hires:true}); return Math.round(performance.now()-a); })()"))
        await pg.wait_for_timeout(300)
        print("A", flush=True); await pg.wait_for_timeout(3000); await pg.locator(".mapwrap").screenshot(path=SP+"/v4_map_sh.png"); print("A ok", flush=True)
        await pg.click("#map-big"); await pg.wait_for_timeout(1200)
        await pg.mouse.click(0,0) if False else None
        await pg.screenshot(path=SP+"/v4_big.png")
        await pg.click("#bm-in"); await pg.click("#bm-in"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/v4_big_zoom.png")
        await pg.click(".bm-view .mk.visited >> nth=0", force=True); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+"/v4_big_pick.png")
        await pg.click("#bm-close"); await pg.click("#btn-home"); await pg.wait_for_timeout(300)
        await make(pg, "forge", "Плут")
        await pg.evaluate("S.world.seen=[]; for (const id in POIS) reveal(POIS[id].x, POIS[id].y, 2); after();")
        await pg.wait_for_timeout(300)
        print("B", await pg.evaluate("window.__n||0"), flush=True); await pg.wait_for_timeout(3000); await pg.locator(".mapwrap").screenshot(path=SP+"/v4_map_marsh.png")
        print("ERRS", errs); await b.close()
asyncio.run(main())

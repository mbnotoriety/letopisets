import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh")
        print(await pg.evaluate("Object.keys(POIS).join(',')")); print(await pg.evaluate("() => { try { moveTo('street'); const b = POIS.street.blds.find(x => ['house','poor','rich'].includes(POIS[x].bk)); worldTime().part = 3; bstate(b).unlocked = tkey(); moveTo(b); renderAll(); return 'ok' } catch(e) { return e.stack } }"))
        await pg.wait_for_timeout(2500); await pg.click("#scene-big"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/b_night_in.png")
        await pg.click("#sb-close"); await pg.click("#map-big"); await pg.wait_for_timeout(1200); await pg.screenshot(path=SP+"/b_bigmap.png")
        print("ERRS", errs); await b.close()
asyncio.run(main())

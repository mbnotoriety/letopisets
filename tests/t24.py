import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def roll(pg):
    for _ in range(3):
        await pg.wait_for_timeout(450)
        if await pg.locator("#btn-roll").count(): await pg.click("#btn-roll")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Воин"); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { window._rnd = rnd; rnd = n => n === 20 ? 17 : window._rnd(n); S.settings.fight='fast'; C().maxHp=200; C().hp=200; tripTimeDone=true; moveTo('cave'); S.world.combat = true; renderAll(); }"); await pg.wait_for_timeout(1200)
        await pg.click(".cb-act:has-text('Толкнуть')"); await roll(pg); await pg.wait_for_timeout(1800)
        print("busy", await pg.evaluate("[busy, !!document.getElementById('btn-roll'), document.querySelector('.thinking')?.textContent, S.dying]"))
        print("shove", await pg.evaluate("JSON.stringify(Object.fromEntries(Object.keys(S.world.enemies).map(id=>[id,S.world.enemies[id].cond])))"))
        await pg.click(".cb-act:has-text('Оценить')"); await roll(pg); await pg.wait_for_timeout(1800)
        print("known", await pg.evaluate("Object.keys(S.world.enemies).map(id=>S.world.enemies[id].known)"))
        await pg.screenshot(path=SP+"/c_known.png")
        await pg.click(".cb-act.atk >> nth=0"); await roll(pg); await pg.wait_for_timeout(700); await pg.screenshot(path=SP+"/c_crit.png"); await pg.wait_for_timeout(1500)
        await pg.click(".cb-act:has-text('Отступить')"); await roll(pg); await pg.wait_for_timeout(2200)
        print("after escape", await pg.evaluate("[S.world.combat, S.world.loc]"))
        await pg.screenshot(path=SP+"/c_escape.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

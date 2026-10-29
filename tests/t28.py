import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def lvl(pg, shots=None):
    await pg.evaluate("() => { C().xp = Math.max(C().xp, XP_LEVELS[C().level]); levelUp(); }"); await pg.wait_for_timeout(700)
    if shots: await pg.screenshot(path=shots+"_burst.png")
    await pg.click(".lvl-burst"); await pg.wait_for_timeout(500)
    await pg.click("#lv-roll"); await pg.wait_for_timeout(1700)
    if shots: await pg.screenshot(path=shots+"_hp.png")
    await pg.click("#lv-next"); await pg.wait_for_timeout(300)
    n = await pg.evaluate("lvlSkillPicks(C(), lvlFlow.nl)")
    for i in range(n): await pg.click(f".lv-sk:not([disabled]):not(.sel) >> nth={i}")
    if shots: await pg.screenshot(path=shots+"_skill.png")
    await pg.click("#lv-next"); await pg.wait_for_timeout(300)
    if await pg.locator(".lv-tabs").count():
        if await pg.evaluate("lvlFlow.nl === 8"):
            await pg.click("[data-tab=feat]"); await pg.click(".lv-ft >> nth=0")
        else:
            await pg.click("[data-ad=str][data-v='1']"); await pg.click("[data-ad=con][data-v='1']")
        if shots: await pg.screenshot(path=shots+"_asi.png")
        await pg.click("#lv-next"); await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(600)
    if shots: await pg.screenshot(path=shots+"_powers.png")
    await pg.click("#lv-done"); await pg.wait_for_timeout(300)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":400,"height":860}); pg.set_default_timeout(8000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
        for L in range(2, 11): await lvl(pg, SP+"/m_lv"+str(L) if L == 6 else None)
        print("rogue", await pg.evaluate("JSON.stringify([C().level, C().expert, skillBonus('stealth'), heroSave ? 1:0, aliveEnemiesHere().length])"))
        print("sneak dice", await pg.evaluate("Math.ceil(C().level/2)+'d6'"), "skillAdv stealth", await pg.evaluate("skillAdv('stealth')"))
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

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
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); pg.set_default_timeout(8000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Волшебник"); await pg.wait_for_timeout(1500)
        for L in range(2, 11):
            await lvl(pg, SP+"/lv"+str(L) if L in (4, 7) else None)
            print(L, await pg.evaluate("JSON.stringify([C().level, C().maxHp, JSON.stringify(C().slots), C().spells.length, (C().expert||[]).length, C().skills.length, C().feats||[], prof(C().level)])"))
        print("spells", await pg.evaluate("C().spells.map(s=>SPELLS[s].name).join(', ')"))
        print("cantrip dice", await pg.evaluate("spellDiceFor(SPELLS.firebolt)"), "bonus", await pg.evaluate("spellDmgBonus(SPELLS.firebolt)"))
        # aoe cast test
        await pg.evaluate("() => { tripTimeDone=true; moveTo('cave'); S.world.combat=true; renderAll(); }"); await pg.wait_for_timeout(800)
        r = await pg.evaluate("(() => { const t = aliveEnemiesHere()[0]; const res = castSpell({kind:'spell', spell:'cone_of_cold', target:t}); return res.formula; })()")
        print("aoe", r[:200])
        await pg.screenshot(path=SP+"/lv_final.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

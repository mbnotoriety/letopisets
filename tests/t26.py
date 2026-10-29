import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); pg.set_default_timeout(10000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html#tips"); await pg.wait_for_timeout(600)
        await pg.evaluate("localStorage.removeItem('sh-tips')")
        await pg.screenshot(path=SP+"/p_home.png")
        # random hero
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300); await pg.click("#btn-next"); await pg.wait_for_timeout(200)
        await pg.click(".rnd-hero"); await pg.wait_for_timeout(400)
        print("rnd", await pg.evaluate("[D.step, D.race, D.cls, D.bg, D.name, D.skills.join(','), [0,1,2,3,4,5,6].map(stepValid).join()]"))
        await pg.screenshot(path=SP+"/p_rnd.png")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=SP+"/p_welcome.png")
        print("tip", await pg.locator(".tip-toast").count())
        await pg.click(".tip-toast [data-t=ok]")
        # pins
        await pg.keyboard.press("j"); await pg.wait_for_timeout(300); await pg.click("[data-j=chron]"); await pg.wait_for_timeout(200)
        await pg.fill("#pin-t", "Я пообещал Марте найти её сына"); await pg.click("#pin-add button"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=SP+"/p_pins.png")
        print("pins", await pg.evaluate("JSON.stringify(S.world.pins)"), "brief", await pg.evaluate("pinsBrief().slice(0,80)"))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200); print("modal closed", await pg.evaluate("!document.getElementById('modal-root').innerHTML.trim()"))
        # fix
        await pg.evaluate("openFix('Текст рассказчика для проверки')"); await pg.fill("#fix-t", "Марта рыжая"); await pg.click("#fix-ok"); await pg.wait_for_timeout(200)
        print("pins2", await pg.evaluate("S.world.pins.map(p=>p.k+':'+p.t)"))
        print("fixbtn", await pg.locator(".narr-fix").count())
        # hotkey map
        await pg.keyboard.press("m"); await pg.wait_for_timeout(600); print("map open", await pg.locator("#bigbox").count()); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
        print("map closed", await pg.locator("#bigbox").count())
        # font size
        await pg.evaluate("lsSet(FS_KEY,'xl'); applyFs()"); print("fs", await pg.evaluate("getComputedStyle(document.querySelector('.e-narr')).fontSize"))
        await pg.evaluate("lsSet(FS_KEY,'m'); applyFs()")
        # epilogue
        await pg.evaluate("openEpilogue(true)"); await pg.wait_for_timeout(2500); await pg.screenshot(path=SP+"/p_epi.png")
        print("epi", (await pg.inner_text("#epi-text"))[:120].replace("\n"," "), "ended", await pg.evaluate("S.ended"))
        await pg.click("#epi-go")
        # save rescue: fill storage
        r = await pg.evaluate("""(() => { let big = 'x'.repeat(1024*1024); let i=0; try { while(i<12){ localStorage.setItem('junk'+i, big); i++; } } catch(e){} const before = lsUsage(); S.feed.push(...Array.from({length:60},(_,k)=>({t:'sys',html:'a'.repeat(200)}))); save(); const ok = !!localStorage.getItem(C_KEY(S.id)); for(let k=0;k<12;k++) localStorage.removeItem('junk'+k); return [i, Math.round(before/1048576), ok, !!document.querySelector('#sw-ok')]; })()""")
        print("rescue", r)
        await pg.evaluate("closeModal()")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

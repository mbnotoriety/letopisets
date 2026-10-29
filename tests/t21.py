import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Воин"); await pg.wait_for_timeout(1500)
        for choice in ["Обойти стороной", "Напасть первым", "Защищаться"]:
            await pg.evaluate("""(() => { S.world.enc=null; S.world.combat=false; C().hp=C().maxHp; const R0=Math.random; Math.random=()=>0.01; const wid = wildAt(12,3); tripTimeDone=true; moveTo(wid); S.world.trip={dest:'lighthouse'}; startEncounter(12,3,PACES.normal); Math.random=R0; })()""")
            await pg.wait_for_timeout(400)
            if choice == "Защищаться": await pg.evaluate("closeModal(); S.world.enc.noticed=false; openEncounter()"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=SP+f"/a_{choice[:4]}.png")
            print(choice, await pg.evaluate("[S.world.enc.title, S.world.enc.foes.map(f=>ENEMIES[f].name).join(',')]"))
            await pg.click(f".enc-btn:has-text('{choice}')"); await pg.wait_for_timeout(700)
            if await pg.locator("#btn-roll").count(): await pg.click("#btn-roll")
            await pg.wait_for_timeout(3000)
            print("  combat", await pg.evaluate("S.world.combat"), "done", await pg.evaluate("encDone()"), "foes alive", await pg.evaluate("aliveEnemiesHere().length"), "hp", await pg.evaluate("C().hp"))
            await pg.screenshot(path=SP+f"/a_{choice[:4]}_after.png")
            # finish combat
            await pg.evaluate("aliveEnemiesHere().forEach(id=>{S.world.enemies[id].alive=false;S.world.enemies[id].hp=0}); S.world.combat=false; after()")
            print("  done after kill", await pg.evaluate("encDone()"), "sugg", await pg.evaluate("[...document.querySelectorAll('#sugg button')].map(b=>b.textContent).slice(0,2)"))
        # resume trip
        await pg.click("#sugg .cont.trip"); await pg.wait_for_timeout(600); await pg.screenshot(path=SP+"/a_resume.png"); await pg.wait_for_timeout(6000)
        print("after resume loc", await pg.evaluate("S.world.loc"), await pg.evaluate("S.world.enc && S.world.enc.kind"))
        # camp rest in wild
        await pg.evaluate("const wid=wildAt(13,9); tripTimeDone=true; moveTo(wid); S.world.enc=null; renderAll()")
        print("camp btn", await pg.locator("text=Разбить лагерь").count())
        # mobile big map
        await pg.set_viewport_size({"width":400,"height":860}); await pg.evaluate("closeModal(); openBigMap({target:'pier'})"); await pg.wait_for_timeout(800); await pg.screenshot(path=SP+"/a_mobile_map.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

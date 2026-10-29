import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
        print("merchants:", await pg.evaluate("merchantsHere().map(m=>m.name+':'+m.type)"))
        await pg.evaluate("setPurse(C(), 400)"); await pg.evaluate("renderAll()")
        await pg.click(".trade-chip >> nth=0"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SP+"/s_tavern.png")
        await pg.click(".ware[data-buy='meal']"); await pg.click(".ware[data-buy='rations']"); await pg.click(".ware[data-buy='rations']")
        pass
        await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/s_deal.png")
        await pg.click("[data-hag='persuasion']"); await pg.wait_for_timeout(600)
        print("hag:", await pg.inner_text(".hag-res"))
        before = await pg.evaluate("purse(C())")
        await pg.click("#deal-go"); await pg.wait_for_timeout(500)
        print("purse", before, "->", await pg.evaluate("purse(C())"), await pg.evaluate("C().items.map(i=>i.name).join(', ')"))
        await pg.screenshot(path=SP+"/s_after.png")
        await pg.click("#shop-x"); await pg.wait_for_timeout(300)
        # smith
        await pg.evaluate("() => { moveTo('street'); const sm = POIS.street.blds.find(b => POIS[b].bk==='smithy') || POIS.street.blds.find(b => POIS[b].bk==='shop'); worldTime().part = 1; moveTo(sm); renderAll(); }"); await pg.wait_for_timeout(500)
        print("here:", await pg.evaluate("[POIS[S.world.loc].name, merchantsHere().map(m=>m.name+':'+m.type)]"))
        ms = await pg.evaluate("merchantsHere().length")
        if ms:
            await pg.evaluate("openShop(merchantsHere()[0])"); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+"/s_smith.png")
            ware = await pg.evaluate("[...document.querySelectorAll('.ware')].map(w=>w.dataset.buy)")
            print("wares", ware)
            await pg.evaluate("setPurse(C(), 2000)"); await pg.evaluate("renderShop()")
            for w in ["studded", ware[0]]:
                if w in ware: await pg.click(f".ware[data-buy='{w}']")
            await pg.click("#deal-go"); await pg.wait_for_timeout(400)
            print("AC", await pg.evaluate("[C().ac, JSON.stringify(C().gear), C().weapons.join(',')]"))
            await pg.click("#shop-x")
        # typed intent
        await pg.evaluate("() => { moveTo('tavern'); worldTime().part = 1; renderAll(); }")
        await pg.fill("#act-input", "Хочу купить эль"); await pg.keyboard.press("Enter"); await pg.wait_for_timeout(500)
        print("shop opened by text:", await pg.evaluate("!!document.getElementById('shop')"))
        await pg.click("#shop-x")
        await pg.click("#mtabs button[data-t='sheet']") if False else None
        await pg.click(".sheet-tabs button:has-text('Инвентарь')") if await pg.query_selector(".sheet-tabs") else None
        await pg.evaluate("sheetTab='inv'; renderSheet()"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/s_inv.png")
        await pg.set_viewport_size({"width":400,"height":860}); await pg.evaluate("openShop(merchantsHere()[0])"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+"/s_mobile.png")
        print("ERRS", errs[:5]); await b.close()
asyncio.run(main())

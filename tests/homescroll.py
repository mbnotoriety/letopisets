import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":375,"height":740}, has_touch=True, is_mobile=True); pg = await ctx.new_page()
        await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script(path=SP+"/audit.js"); await pg.add_init_script("window.__W=375")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
        sc = await pg.evaluate("(() => { const s=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+50 && /auto|scroll/.test(getComputedStyle(e).overflowY)); return s.map(e=>e.tagName+'#'+e.id+'.'+e.className+' '+e.scrollHeight); })()")
        print(sc)
        for i in range(6):
            await pg.evaluate(f"(() => {{ const s=[...document.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+50 && /auto|scroll/.test(getComputedStyle(e).overflowY)) || document.scrollingElement; s.scrollTop={i}*650; }})()")
            await pg.wait_for_timeout(300); r = await pg.evaluate("__audit()"); print(i, r.get('overlaps'), r.get('wide'))
            await pg.screenshot(path=SP+f"/mob/home_{i}.png")
        await b.close()
asyncio.run(main())

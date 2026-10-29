import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        r = await pg.evaluate("""async () => {
          const log = []; const img = window.__IMG0;
          getMcp = async () => ({ callTool: async (server, tool, input) => {
            const sp = input.space_name || ''; log.push(tool + '|' + sp);
            if (/krea/i.test(tool + sp)) return { content: [{ type: 'text', text: 'You have exceeded your GPU quota (25s requested vs 0s left)' }] };
            return { content: [{ type: 'image', data: img, mimeType: 'image/jpeg' }] };
          }});
          lsSet(MODEL_KEY, 'auto'); localStorage.removeItem(KREA_COOLDOWN_KEY);
          const a = await hfImage('test', 1); const n1 = log.length;
          const b = await hfImage('test', 2);
          const before = (await createImageBitmap(a.blob)).height;
          const cropped = await cropWatermark(a.blob); const after = (await createImageBitmap(cropped)).height;
          setImgModel('krea'); let q = null; try { await hfImage('x', 3); } catch (e) { q = e.code; }
          setImgModel('pollinations'); log.length = 0; const c = await hfImage('x', 4);
          return { wm: a.wm, calls1: log, n1, cool: lsGet(KREA_COOLDOWN_KEY) > Date.now(), before, after, kreaErr: q, model: imgModel(), pollOnlyCalls: log.slice() };
        }""")
        print(r)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        await pg.click("#btn-next"); await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Волшебник')")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.click(".choice:has-text('Мудрец')")
        for i in range(2): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Ида")
        print("look picker", await pg.locator("#look-model button").count())
        await pg.click("#look-model [data-m=krea]"); print("model now", await pg.evaluate("imgModel()"))
        await pg.screenshot(path=SP+"/v7_look.png", full_page=True); await pg.click("#btn-next")
        await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        await pg.evaluate("openSettings()"); await pg.wait_for_timeout(300)
        await pg.click("#set-model [data-m=auto]"); print("model now", await pg.evaluate("imgModel()"))
        await pg.click("#set-redraw"); await pg.wait_for_timeout(300)
        print("redraw btn", await pg.inner_text("#set-redraw"))
        await pg.screenshot(path=SP+"/v7_settings.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

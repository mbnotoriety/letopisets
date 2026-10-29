import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]; TAG=sys.argv[2] if len(sys.argv)>2 else "before"
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
F=SP+"/fonts/"
FONTS=f"@font-face{{font-family:'Geologica';src:url('file://{F}Geologica.ttf')}}@font-face{{font-family:'Golos Text';src:url('file://{F}GolosText.ttf')}}@font-face{{font-family:'Unbounded';src:url('file://{F}Unbounded.ttf')}}@font-face{{font-family:'Onest';src:url('file://{F}Onest.ttf')}}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vw, vh, tag in [(1440, 860, "d"), (1280, 720, "s"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width":vw,"height":vh}, device_scale_factor=2 if tag=="m" else 1); pg.set_default_timeout(15000)
            errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.append(s);});" % FONTS)
            await pg.add_init_script("window.__mockDlg={speaker:'marta', dialogue:[{text:'Расскажи про маяк. Кто там зажигает огонь?',skill:null,dc:0,tag:null},{text:'(Подвинуть монету по столу) Может, это освежит твою память?',skill:'persuasion',dc:13,tag:'Плут'},{text:'Я видел такие огни раньше — это сигнал контрабандистов.',skill:'insight',dc:15,tag:'Мудрец'},{text:'Ладно, налей мне эля и забудем.',skill:null,dc:0,tag:null}]}")
            await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(700)
            await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
            await pg.evaluate("dlgStart('marta')"); await pg.wait_for_function("!busy"); await pg.wait_for_timeout(900)
            await pg.screenshot(path=SP+f"/dlg_{TAG}_{tag}.png")
            print(tag, await pg.evaluate("(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.height)]; }; return JSON.stringify({dlg: r('#dlg'), comp: r('.composer') || r('#composer') || r('.input-row'), feed: r('#feed'), vh: innerHeight}); })()"), errs)
            await pg.close()
        await b.close()
asyncio.run(main())

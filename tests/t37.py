import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
F=SP+"/fonts/"
FONTS=f"@font-face{{font-family:'Geologica';src:url('file://{F}Geologica.ttf')}}@font-face{{font-family:'Golos Text';src:url('file://{F}GolosText.ttf')}}@font-face{{font-family:'Onest';src:url('file://{F}Onest.ttf')}}"
DLG="window.__mockDlg={speaker:'marta', dialogue:[{text:'Расскажи про маяк. Кто там зажигает огонь?',skill:null,dc:0,tag:null},{text:'(Подвинуть монету по столу) Может, это освежит твою память?',skill:'persuasion',dc:13,tag:'Плут'},{text:'Я видел такие огни раньше — это сигнал контрабандистов.',skill:'insight',dc:15,tag:'Мудрец'},{text:'Ладно, налей мне эля и забудем.',skill:null,dc:0,tag:null}]}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vw, vh, tag in [(1440, 900, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width":vw,"height":vh}, device_scale_factor=2 if tag=="m" else 1); pg.set_default_timeout(15000)
            errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.append(s);});" % FONTS); await pg.add_init_script(DLG)
            await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
            await pg.screenshot(path=SP+f"/u_home_{tag}.png", full_page=False)
            await pg.click("#h-new"); await pg.wait_for_timeout(400); await pg.screenshot(path=SP+f"/u_create_{tag}.png")
            await pg.click("#logo"); await pg.wait_for_timeout(300)
            await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
            await pg.evaluate("""() => { pushFeed({t:'player', text:'Подсаживаюсь к Марте и спрашиваю про маяк'}); pushFeed({t:'narr', speaker:'marta', text:'Марта вытирает руки о фартук и долго смотрит на тебя. Бренн у очага делает вид, что не слушает.\\n\\n«Маяк? Не к добру ты про него спрашиваешь. Третью ночь там огонь горит, а смотритель-то мёртв», — Марта понижает голос.\\n\\nЗа соседним столом замолкают рыбаки.'}); }""")
            await pg.wait_for_timeout(500); await pg.screenshot(path=SP+f"/u_game_{tag}.png")
            if tag == "d":
                await pg.click("#btn-hero"); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+f"/u_sheet_{tag}.png")
                print("sheet open", await pg.evaluate("document.body.classList.contains('sheet-open')"))
                await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400); print("closed", not await pg.evaluate("document.body.classList.contains('sheet-open')"))
            await pg.evaluate("dlgStart('marta')"); await pg.wait_for_function("!busy"); await pg.wait_for_timeout(900); await pg.screenshot(path=SP+f"/u_dlg_{tag}.png")
            print(tag, "ERRS", errs); await pg.close()
        await b.close()
asyncio.run(main())

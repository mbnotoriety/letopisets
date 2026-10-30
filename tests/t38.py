import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
F=SP+"/fonts/"
FONTS=f"@font-face{{font-family:'Geologica';src:url('file://{F}Geologica.ttf')}}@font-face{{font-family:'Golos Text';src:url('file://{F}GolosText.ttf')}}@font-face{{font-family:'Onest';src:url('file://{F}Onest.ttf')}}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vw, vh, tag in [(1440, 900, "d"), (1280, 760, "s"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width":vw,"height":vh}, device_scale_factor=2 if tag=="m" else 1); pg.set_default_timeout(15000)
            errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.append(s);});" % FONTS)
            await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(700)
            await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
            await pg.evaluate("""() => { pushFeed({t:'player', text:'Подсаживаюсь к Марте и спрашиваю про маяк'});
              pushFeed({t:'narr', speaker:'marta', text:'Марта вытирает руки о фартук и долго смотрит на тебя. Бренн у очага делает вид, что не слушает, но кружку держит слишком крепко.\\n\\n«Маяк? Не к добру ты про него спрашиваешь. Третью ночь там огонь горит, а смотритель-то мёртв», — Марта понижает голос.\\n\\nЗа соседним столом замолкают рыбаки. Кто-то торопливо расплачивается и уходит, не допив.'});
              pushFeed({t:'chips', items:[{c:'xp', x:'+25 опыта'}, {c:'item', x:'+ Ключ от маяка'}, {c:'appr-up', x:'▲ Марта одобряет'}]}); pushFeed({t:'chips', items:[{c:'dmg', x:'Угроза +1'}]}); }""")
            await pg.wait_for_timeout(700); await pg.screenshot(path=SP+f"/n_{tag}.png")
            print(tag, await pg.evaluate("[document.querySelectorAll('.e-notes .nt').length, document.querySelectorAll('.chips.moved').length, getComputedStyle(document.querySelector('.e-narr.v2 .tx')).fontSize]"), errs)
            await pg.close()
        await b.close()
asyncio.run(main())

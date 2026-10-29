import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
F=SP+"/fonts/"
FONTS=f"@font-face{{font-family:'Geologica';src:url('file://{F}Geologica.ttf')}}@font-face{{font-family:'Golos Text';src:url('file://{F}GolosText.ttf')}}@font-face{{font-family:'Unbounded';src:url('file://{F}Unbounded.ttf')}}@font-face{{font-family:'Onest';src:url('file://{F}Onest.ttf')}}"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vw, vh, tag in [(1300, 860, "d"), (390, 844, "m")]:
            pg = await b.new_page(viewport={"width":vw,"height":vh}, device_scale_factor=2 if tag=="m" else 1); pg.set_default_timeout(10000)
            errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script("(() => { window.__prompts = []; const _use = window.claude.use; window.claude.use = async n => { const f = await _use(n); if (n !== 'sample') return f; const g = async (p, o) => { window.__prompts.push(String(p)); return f(p, o); }; g.json = async (p, o) => { window.__prompts.push(String(p)); return f.json(p, o); }; return g; }; })();"); await pg.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=%r;document.head.append(s);});" % FONTS)
            await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(700)
            if tag == "d": await pg.screenshot(path=SP+"/v_home.png")
            await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
            await pg.evaluate("""() => { pushFeed({t:'player', text:'Подсаживаюсь к Марте и спрашиваю про маяк'});
              pushFeed({t:'narr', speaker:'marta', text:'Марта вытирает руки о фартук и долго смотрит на тебя. Бренн у очага делает вид, что не слушает.\\n\\n«Маяк? Не к добру ты про него спрашиваешь. Третью ночь там огонь горит, а смотритель-то мёртв», — Марта понижает голос.\\n\\nБренн хмыкает: «Бабьи сказки. Огонь — это контрабандисты».\\n\\nЗа соседним столом замолкают рыбаки.'});
              pushFeed({t:'player', text:'Залезаю на стол и начинаю петь похабную песню про старосту'}); after(); }""")
            await pg.wait_for_timeout(900); await pg.screenshot(path=SP+f"/v_feed_{tag}.png")
            if tag == "d":
                print("lines", await pg.locator(".sp-line").count(), "ents", await pg.locator(".ent.npc").count(), "banner", await pg.locator(".scene-banner").count())
                await pg.locator(".ent.npc >> nth=0").click(); await pg.wait_for_timeout(300); print("pop", await pg.evaluate("!!document.querySelector('#npc-pop') && document.querySelector('#npc-pop').innerText.slice(0,30)"))
                print("deed", await pg.evaluate("(() => { const o = validatePlan({checks:[], deed:'спел похабную песню на столе в таверне'}); S.turn++; return [o.deed, deedsBrief().slice(0,120)]; })()"))
                await pg.evaluate("takeTurn('Поджигаю скатерть на столе старосты', {checks: [], talk_to: null})"); await pg.wait_for_timeout(500); await pg.wait_for_function("!busy", timeout=15000)
                pr = await pg.evaluate("window.__prompts")
                nar = [x for x in pr if 'мастер (рассказчик)' in x]; print("narr rule", bool(nar) and 'никогда не проходят бесследно' in nar[-1], 'ПОСТУПКИ ГЕРОЯ' in (nar[-1] if nar else ''))
                print("font", await pg.evaluate("getComputedStyle(document.querySelector('.e-narr .tx')).fontFamily"), await pg.evaluate("getComputedStyle(document.querySelector('.logo b')).fontFamily"))
            print(tag, "ERRS", errs); await pg.close()
        await b.close()
asyncio.run(main())

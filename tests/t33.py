import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]
U = {"classes":[{"name":"Нейроход","base":"rogue","role":"Тень в сети","blurb":"Крадёт данные прямо из чужих имплантов.","features":["Удар по уязвимому узлу: +1d6 урона при преимуществе","Жаргон сети"],"skills":["stealth","sleight","investigation","deception","perception","acrobatics"],"color":"#5ce8ff"},
               {"name":"Литейщик душ","base":"wizard","role":"Код и пламя","blurb":"Переплавляет память в оружие.","features":["Перегрузка (ИНТ)","Восстановление кэша"],"skills":["arcana","investigation","history","insight"]}],
     "races":[{"name":"Неоновый подкидыш","base":"elf","sub":"Дети башен, светятся в темноте","traits":["Ночное зрение","Сканер в зрачках","Помнит чужие сны"],"bonus":{"dex":2,"cha":1},"skill":"stealth","social":"считают дурным знаком","att":-4,"look":"pale slender youth with glowing cyan veins"},
              {"name":"Ржавник","base":"dwarf","sub":"Шахтёры нижних уровней","traits":["Видит в темноте","Фильтры в лёгких","Знает тоннели"],"bonus":{"con":2,"str":1},"skill":"survival","social":"уважают и сторонятся","att":0}],
     "backgrounds":[{"name":"Курьер Синдиката","skills":["athletics","stealth"],"hook":"возили посылки, которые нельзя открывать","item":"Пустой кейс с биозамком","gold":15,"feat":"Курьеры узнают своих и помогают с дорогой."},
                    {"name":"Стёртый","skills":["insight","deception"],"hook":"не помните последние три года","item":"Чип с чужим именем","gold":8,"feat":"Иногда вспоминаете то, чего не знали."}]}
L = {"money":["эдди","ц","эдди"],"classes":{"fighter":["Соло","Пули и хром"]},"weapons":{"longsword":["Термоклинок","m"]},"foes":{"wolf":"Стальной пёс"},"words":{"Кузница":"Риперская"}}
INIT = """(() => { const U = %s, L = %s; window.__prompts = []; const _use = window.claude.use; window.claude.use = async n => { const f = await _use(n); if (n !== "sample") return f;
  const j = f.json.bind(f); const g = async (p, o) => { window.__prompts.push(typeof p === "string" ? p : JSON.stringify(p)); return f(p, o); }; g.json = async (p, o) => { window.__prompts.push(p); if (p.includes("2 особых класса")) return U; if (p.includes("Переименуй стандартные")) return L; return j(p, o); }; return g; }; })();""" % (json.dumps(U, ensure_ascii=False), json.dumps(L, ensure_ascii=False))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900}); pg.set_default_timeout(10000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script(INIT)
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
        await pg.click("#h-new"); await pg.wait_for_timeout(300)
        print("setting cards", await pg.locator(".set-card").count())
        await pg.click(".set-card[data-set=cyberpunk]"); print("biome", await pg.evaluate("D.forge.biome"))
        await pg.screenshot(path=SP+"/w_forge.png")
        await pg.click("#f-forge"); await pg.wait_for_function("D.forge.stage === -1 && D.world && D.world.setting", timeout=20000); await pg.wait_for_timeout(1500)
        print("world", await pg.evaluate("JSON.stringify({s:D.world.setting, b:D.world.biome, u:D.world.uniq&&D.world.uniq.classes.length, lex:!!D.world.lex, photo:D.world.photo_style.slice(0,40)})"))
        await pg.screenshot(path=SP+"/w_world.png")
        await pg.click("#btn-next"); await pg.wait_for_timeout(300)
        print("race badges", await pg.locator(".pick-card.uniq").count(), await pg.evaluate("RACES.elf.name + ' / ' + RACES.u_r1.name"))
        await pg.screenshot(path=SP+"/w_race.png")
        await pg.click(".pick-card.uniq >> nth=0"); await pg.click("#btn-next"); await pg.wait_for_timeout(300)
        print("class names", await pg.evaluate("[CLASSES.fighter.name, CLASSES.wizard.name, CLASSES.u_c1 && CLASSES.u_c1.name, CLASSES.u_c1.skillCount]"))
        await pg.click(".cls-card.uniq >> nth=0"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/w_class.png")
        print("D.cls", await pg.evaluate("D.cls"))
        await pg.click("#btn-next"); await pg.wait_for_timeout(300); await pg.screenshot(path=SP+"/w_kit.png"); print("kits", await pg.evaluate("KITS.u_c1.map(k=>k.n).join(' | ')"))
        await pg.click("#btn-next"); await pg.wait_for_timeout(300)
        await pg.click(".bg-row.uniq >> nth=0"); await pg.wait_for_timeout(200); await pg.screenshot(path=SP+"/w_bg.png")
        n = await pg.evaluate("CLASSES[D.cls].skillCount")
        for i in range(n):
            await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.fill("#f-name","Тест"); await pg.click("#btn-next"); await pg.click("#btn-next"); await pg.wait_for_timeout(1500)
        print("hero", await pg.evaluate("JSON.stringify({cls:S.char.cls, race:S.char.race, bg:S.char.bg, name:CLASSES[S.char.cls].name, base:bcls(S.char), money:fmtMoney(123), w:S.char.weapons.map(w=>w.name||w), sneak: typeof sneakDice==='function' ? sneakDice(S.char) : null})"))
        try:
            await pg.wait_for_function("!busy", timeout=15000)
        except Exception as e:
            print("BUSY STUCK", errs, await pg.evaluate("JSON.stringify(S.feed.slice(-3).map(e=>[e.t,(e.text||e.html||'').slice(0,80)]))")); raise
        await pg.wait_for_timeout(500)
        pr = await pg.evaluate("window.__prompts.filter(p => p.includes('мастер (рассказчик)')).slice(-1)[0] || ''")
        i = pr.find("СЕТТИНГ"); print("narr setting:", pr[i:i+160].replace("\n"," "))
        j = pr.find("КЛАСС ГЕРОЯ"); print("narr class:", pr[j:j+120].replace("\n"," "))
        print("forge prompt setting:", any("Сеттинг: Киберпанк" in p for p in await pg.evaluate("window.__prompts")))
        await pg.screenshot(path=SP+"/w_game.png")
        print("buildings", await pg.evaluate("JSON.stringify(Object.values(WD.places).filter(p=>p.inner).map(p=>p.name).slice(0,12))"))
        print("names", await pg.evaluate("JSON.stringify(Object.values(WD.npcs).filter(n=>n.minor).slice(0,6).map(n=>n.name+':'+n.role+':'+n.look))"))
        # домой и обратно в готовый мир
        await pg.evaluate("save()"); idx = await pg.evaluate("JSON.stringify(campIndex()[0])"); print("index", idx[:200])
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
        await pg.click("#h-new"); await pg.wait_for_timeout(300)
        print("after reload errs", errs, await pg.locator(".world-pick").count(), await pg.evaluate("D && D.worlds.map(w=>w.name).join(',')"))
        await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(300)
        print("fantasy restore", await pg.evaluate("[CLASSES.fighter.name, !!CLASSES.u_c1, WT.longsword.n, fmtMoney(123), BESTIARY.wolf.label]"))
        # все биомы
        res = await pg.evaluate("""(() => { const out = {}; const base = D.worlds[D.worlds.length - 1]; const box = document.createElement('div'); box.id='bio'; box.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;display:grid;grid-template-columns:repeat(4,1fr);gap:4px'; document.body.append(box);
          for (const bio of ['desert','tundra','jungle','islands','steppe','wasteland','city','alien']) { const st = {desert:'western',islands:'pirates',city:'cyberpunk',wasteland:'postapoc',alien:'space',tundra:'fantasy',jungle:'fantasy',steppe:'east'}[bio];
            const wd = structuredClone(base); wd.id = 'b_' + bio; wd.biome = bio; wd.setting = st; delete wd.bver; Object.values(wd.places).forEach(p => delete p.blds);
            const pl = Object.entries(wd.places).filter(([, p]) => !p.inner).map(([id, p]) => ({ id, ...p })); const m = buildMap(bio, 77, pl); wd.tiles = m.tiles; wd.roads = m.roads; wd.houses = m.houses; pl.forEach(p => { if (m.pos[p.id]) { wd.places[p.id].x = m.pos[p.id][0]; wd.places[p.id].y = m.pos[p.id][1]; } });
            D.world = wd; setWorld(wd); applySkin(wd, true); const c = document.createElement('canvas'); paintMap(c, { width: 340, fog: false }); c.style.width='100%'; box.append(c); out[bio] = m.tiles.join('').split('').filter(t => t !== 'S' && t !== 'W').length; }
          return out; })()""")
        print("land tiles", res); await pg.wait_for_timeout(500); await pg.screenshot(path=SP+"/w_biomes.png")
        print("ERRS", errs); await b.close()
asyncio.run(main())

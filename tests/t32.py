import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1300,"height":860}); pg.set_default_timeout(10000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.add_init_script("window.__plays=[]; HTMLMediaElement.prototype.play = function(){ window.__plays.push([this.src.split('/').pop(), this.playbackRate, +this.volume.toFixed(2)]); return Promise.resolve(); };")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
        await pg.evaluate("AU.unlocked = true; AU.cfg.on = true; C().hp=C().maxHp=80")
        print("manifest", await pg.evaluate("JSON.stringify(Object.fromEntries(Object.entries(VOX).map(([g,d])=>[g,Object.keys(d).length])))"))
        print("voices", await pg.evaluate("Object.keys(NPCS).slice(0,5).map(id => [NPCS[id].name, voxOf(id).g, voxOf(id).rate.toFixed(2)])"))
        print("text cues", await pg.evaluate("['Марта тяжело вздыхает и отводит глаза.', 'Бренн фыркает: «Ещё чего».', 'Она смеётся и машет рукой.', 'Старик ахает, роняя кружку.', 'Он задумчиво чешет бороду.', 'Ничего особенного.'].map(voxFromText)"))
        # dialogue start -> greet
        await pg.evaluate("window.__plays.length=0; S.world.npcs.marta = S.world.npcs.marta || {att:0, mem:[]}; S.world.npcs.marta.att = 30; dlgStart('marta')"); await pg.wait_for_timeout(400)
        print("greet friendly:", await pg.evaluate("window.__plays"))
        await pg.wait_for_function("!busy", timeout=15000)
        # narration with emotion text
        await pg.evaluate("() => { voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; S.feed.push({t:'narr', text:'Марта тяжело вздыхает и долго молчит.'}); applyEffects({speaker:'marta', suggestions:[]}); }"); await pg.wait_for_timeout(500)
        print("narr sigh:", await pg.evaluate("window.__plays"))
        # narrator-chosen voice, no cue in text
        await pg.evaluate("() => { voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; S.feed.push({t:'narr', text:'Марта отвечает на вопрос.'}); applyEffects({speaker:'marta', voice:'gasp', suggestions:[]}); }"); await pg.wait_for_timeout(500)
        print("voice field gasp:", await pg.evaluate("window.__plays"))
        # no voice, no cue -> fallback still plays
        await pg.evaluate("() => { voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; S.feed.push({t:'narr', text:'Марта отвечает на вопрос.'}); applyEffects({speaker:'marta', suggestions:[]}); }"); await pg.wait_for_timeout(500)
        print("fallback plays:", await pg.evaluate("window.__plays.length"))
        # conversation started not through dlgStart (quest act / typed): streaming entry greets
        await pg.evaluate("() => { voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; S.dialogue=null; const e = pushFeed({t:'narr', text:'', streaming:true, speaker:'marta'}); e.streaming=false; }"); await pg.wait_for_timeout(300)
        print("stream greet:", await pg.evaluate("window.__plays"))
        # full turn via typed talk
        await pg.evaluate("() => { voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; S.dialogue=null; takeTurn('Заговариваю с Мартой', {checks:[], talk_to:'marta'}); }"); await pg.wait_for_function("!busy", timeout=15000); await pg.wait_for_timeout(500)
        print("typed turn plays:", await pg.evaluate("window.__plays.length"))
        # male hostile greet
        mid = await pg.evaluate("Object.keys(NPCS).find(id => !isFem(NPCS[id]))")
        await pg.evaluate(f"() => {{ voxLast=0; window.__plays.length=0; (S.world.npcs['{mid}'] = S.world.npcs['{mid}'] || {{att:0,mem:[]}}).att = -40; vox('{mid}', voxGreet('{mid}')); }}"); await pg.wait_for_timeout(200)
        print("male hostile:", mid, await pg.evaluate("window.__plays"))
        # cooldown
        await pg.evaluate(f"() => {{ window.__plays.length=0; vox('{mid}','laugh'); vox('{mid}','laugh'); }}"); print("cooldown blocks:", await pg.evaluate("window.__plays.length"))
        # volume off
        await pg.evaluate(f"() => {{ AU.cfg.vox = 0; voxLast=0; for (const k in voxNpcLast) delete voxNpcLast[k]; window.__plays.length=0; vox('{mid}','laugh'); }}"); print("muted plays:", await pg.evaluate("window.__plays.length"))
        await pg.evaluate("AU.cfg.vox = .8; closeModal(); openSettings()"); await pg.wait_for_timeout(300); print("vox slider:", await pg.locator("[data-au=vox]").count())
        print("ERRS", errs); await b.close()
asyncio.run(main())

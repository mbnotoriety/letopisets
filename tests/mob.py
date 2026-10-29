import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 375; H=int(sys.argv[3]) if len(sys.argv)>3 else 740
OUT=SP+"/mob/"
async def A(pg, name, sel=None, full=False):
    await pg.wait_for_timeout(350)
    r = await pg.evaluate("s => __audit(s)", sel)
    await pg.screenshot(path=f"{OUT}{W}_{name}.png", full_page=full)
    bad = {k:v for k,v in r.items() if v and k!="docOverflow"}
    iw = await pg.evaluate("innerWidth"); print(f"## {name}: iw={iw} docOverflow={r.get('docOverflow')}", json.dumps(bad, ensure_ascii=False) if bad else "")
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width":W,"height":H}, device_scale_factor=1, has_touch=True, is_mobile=True); pg = await ctx.new_page(); pg.set_default_timeout(8000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script(path=SP+"/audit.js"); await pg.add_init_script(f"window.__W={W}")
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(800)
        await A(pg, "00_home", full=True)
        await pg.click("#h-new"); await pg.wait_for_timeout(300); await A(pg, "01_world", full=True)
        await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(200); await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "02_race", full=True)
        await pg.click(".choice:has-text('Человек')"); await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "03_class", full=True)
        await pg.click(".choice:has-text('Плут')"); await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "04_abil", full=True)
        await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "05_bg", full=True)
        await pg.click(".choice:has-text('Мудрец')"); await pg.wait_for_timeout(300); await A(pg, "05b_bg_sel", full=True)
        for i in range(4): await pg.click(".skill-opt:not(.locked)[aria-pressed=false] >> nth=0")
        await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "06_look", full=True)
        await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "07_name", full=True)
        await pg.fill("#f-name","Тест"); await pg.click("#btn-next"); await pg.wait_for_timeout(300); await A(pg, "08_mode", full=True)
        await pg.click("#btn-next"); await pg.wait_for_timeout(2500)
        await pg.evaluate("C().hp=C().maxHp=150; renderAll()")
        await A(pg, "10_story")
        await pg.click("#mtabs [data-t=sheet]"); await A(pg, "11_sheet", full=True)
        for t in ["Навыки","Инвентарь"]:
            try: await pg.click(f"#sheet button:has-text('{t}') >> nth=0"); await A(pg, "11_sheet_"+t, full=True)
            except Exception as e: print("tab", t, e)
        await pg.click("#mtabs [data-t=world]"); await A(pg, "12_world", full=True)
        await pg.click("#mtabs [data-t=story]")
        # scene popover
        try:
            await pg.evaluate("() => { const t = document.querySelector('#scene [data-hit]'); t && t.dispatchEvent(new MouseEvent('click',{bubbles:true})); }"); await A(pg, "13_scene_pop")
            await pg.keyboard.press("Escape")
        except Exception as e: print("pop", e)
        mods = [("20_journal","openJournal()"),("21_settings","openSettings()"),("22_bigmap","openBigMap()"),("23_shop","openShop(merchantsHere()[0])"),("24_item","openItem(C().items[0])"),
                ("25_quest","openQuestOffer(Object.keys(S.world.qs||{})[0] || Object.keys(WD.quests||{})[0])"),("26_attack","confirmAttack('marta')"),("27_campaign","openCampaign && openCampaign()")]
        for n, js in mods:
            try:
                await pg.evaluate("() => { closeModal && closeModal(); " + js + " }"); await A(pg, n, "#modal-root"); await A(pg, n+"_full", None, True)
            except Exception as e: print("ERR", n, str(e)[:200])
        await pg.evaluate("closeModal()")
        try:
            await pg.evaluate("() => { startEncounter(12,3,PACES.normal); }"); await pg.wait_for_timeout(300); await pg.evaluate("openEncounter()"); await A(pg, "28_enc", "#modal-root")
        except Exception as e: print("ERR enc", str(e)[:200])
        await pg.evaluate("closeModal(); S.world.enc=null; renderAll()")
        # dialogue
        await pg.evaluate("""() => { window.__mockDlg = {speaker:'marta', dialogue:[{text:'Что тут творится по ночам у старого маяка?',skill:null},{text:'Мне можно доверять. Я помогу, клянусь честью.',skill:'persuasion',dc:13,tag:'Плут'},{text:'(Присмотреться: почему у неё дрожат руки?)',skill:'insight',dc:12},{text:'Говорят, ты ходишь к гати по ночам.',skill:'intimidation',dc:16}]}; dlgStart('marta'); }""")
        await pg.wait_for_function("!busy"); await A(pg, "30_dialogue")
        await pg.evaluate("window.__mockDlg=null; dlgEnd(true)")
        # combat
        await pg.evaluate("() => { spawnFoes('wolf','Волк',3,S.world.loc); S.world.combat=true; renderAll(); }"); await pg.wait_for_timeout(1200); await A(pg, "31_combat")
        await pg.evaluate("C().hp=5; renderAll()"); await A(pg, "32_combat_lowhp")
        await pg.evaluate("C().hp=C().maxHp; for (const id of aliveEnemiesHere()) S.world.enemies[id].alive=false; S.world.combat=false; renderAll()")
        # level up
        try:
            await pg.evaluate("() => { C().xp = XP_LEVELS[C().level]; levelUp(); }"); await pg.wait_for_timeout(900); await A(pg, "40_lv_burst")
            await pg.click(".lvl-burst"); await pg.wait_for_timeout(500); await A(pg, "41_lv_hp", "#modal-root")
            await pg.click("#lv-roll"); await pg.wait_for_timeout(1700); await pg.click("#lv-next"); await pg.wait_for_timeout(300); await A(pg, "42_lv_skill", "#modal-root")
        except Exception as e: print("ERR lv", str(e)[:200])
        await pg.evaluate("closeModal()")
        try:
            await pg.evaluate("openEpilogue(true)"); await pg.wait_for_timeout(1500); await A(pg, "50_epilogue", "#modal-root")
        except Exception as e: print("ERR epi", str(e)[:200])
        await pg.evaluate("closeModal()")
        await pg.evaluate("tipOnce && (localStorage.removeItem('sh-tips'), 0)")
        print("ERRS", errs); await b.close()
asyncio.run(main())

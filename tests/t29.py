import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
DLG = '{speaker:"marta", dialogue:[{text:"Что тут творится по ночам?",skill:null,dc:0,tag:null},{text:"Мне можно доверять. Я верну их домой, клянусь.",skill:"persuasion",dc:13,tag:"Плут"},{text:"(Присмотреться: почему у неё дрожат руки?)",skill:"insight",dc:12,tag:null},{text:"Говорят, ты ходишь к гати по ночам.",skill:"intimidation",dc:16,tag:"null"}]}'
async def run(W, H, tag):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":W,"height":H}); pg.set_default_timeout(8000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Плут"); await pg.wait_for_timeout(1500)
        await pg.evaluate("() => { C().hp = C().maxHp = 200; window.__mockDlg = " + DLG + "; dlgStart('marta'); }")
        await pg.wait_for_selector("#dlg:not([hidden]) .dlg-o", timeout=8000); await pg.wait_for_timeout(500)
        print(tag, "opts", await pg.locator("#dlg .dlg-o").count(), "sugg hidden chips", await pg.evaluate("[...document.querySelectorAll('#sugg button')].filter(b=>getComputedStyle(b).display!=='none').map(b=>b.textContent)"))
        print(tag, "checks", await pg.evaluate("[...document.querySelectorAll('#dlg .dlg-ck')].map(x=>x.textContent)"), "tags", await pg.evaluate("[...document.querySelectorAll('#dlg .dlg-tag')].map(x=>x.textContent)"))
        await pg.screenshot(path=SP+f"/d_{tag}_1.png")
        await pg.click("#dlg .dlg-o[data-i='1']"); await pg.wait_for_selector("#btn-roll"); await pg.click("#btn-roll")
        await pg.wait_for_function("!busy", timeout=15000); await pg.wait_for_timeout(600)
        print(tag, "after pick", await pg.evaluate("JSON.stringify({d: !!S.dialogue, n: S.dialogue?.n, roll: [...document.querySelectorAll('.e-roll, .roll')].length, fail: S.world.npcs.marta?.dlgFail||null, last: S.log.slice(-2).map(x=>x.text.slice(0,40))})"))
        await pg.screenshot(path=SP+f"/d_{tag}_2.png")
        await pg.keyboard.press("0"); await pg.wait_for_timeout(300)
        print(tag, "ended", await pg.evaluate("[!!S.dialogue, document.getElementById('dlg').hidden]"))
        await pg.evaluate("() => { window.__mockDlg = {speaker:'marta'}; dlgStart('marta'); }"); await pg.wait_for_selector("#dlg:not([hidden]) .dlg-o"); await pg.wait_for_timeout(400)
        print(tag, "fallback", await pg.evaluate("S.dialogue.opts.map(o=>o.text+' ['+o.skill+']')"))
        await pg.screenshot(path=SP+f"/d_{tag}_3.png")
        await pg.keyboard.press("1"); await pg.wait_for_function("!busy", timeout=15000); await pg.wait_for_timeout(300)
        await pg.evaluate("() => { window.__mockDlg = null; takeTurn('Осматриваюсь', {checks:[]}); }"); await pg.wait_for_function("!busy", timeout=15000); await pg.wait_for_timeout(300)
        print(tag, "cleared by no-speaker", await pg.evaluate("!!S.dialogue"))
        print("ERRS", errs); await b.close()
async def main():
    await run(400, 860, "m"); await run(1300, 860, "d")
asyncio.run(main())

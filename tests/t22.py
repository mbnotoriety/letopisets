import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "forge", "Воин"); await pg.wait_for_timeout(1500)
        qs = await pg.evaluate("Object.values(WD.quests).map(q=>[q.id,q.type,NPCS[q.giver]?.name,q.title,q.target&&POIS[q.target]?.name,q.to||'',q.brief.slice(0,70)])")
        for q in qs: print(q)
        print("marks", await pg.evaluate("Object.keys(NPCS).filter(n=>questMark(n)).map(n=>NPCS[n].name)"))
        # accept every quest programmatically and check objects/foes
        for q in qs:
            await pg.evaluate(f"(()=>{{ const q=WD.quests['{q[0]}']; qSt(q.id).st='new'; }})()")
        r = await pg.evaluate("""(()=>{ const out=[]; Object.values(WD.quests).forEach(q=>{ const st=qSt(q.id); st.st='active'; if (q.foe) st.foes=spawnFoes(q.foe.type,q.foe.name,q.foe.n,q.target); if(q.type==='fetch'||q.type==='investigate') placeQuestObj(q); out.push([q.id, (st.foes||[]).length, q.target? scState(q.target).add.filter(a=>a.q===q.id).length:0]); }); return out; })()""")
        print(r)
        await pg.screenshot(path=SP+"/f_game.png")
        print("ERRS", errs)
        await b.close()
asyncio.run(main())

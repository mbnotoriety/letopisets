import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(600)
        await make(pg, "sh", "Жрец"); await pg.wait_for_timeout(1500)
        r = await pg.evaluate("""() => { const out = []; moveTo('cave'); S.world.combat = true;
          const c = C(); const t = aliveEnemiesHere()[0];
          for (const [cls, sp] of [['bard','vicious_mockery'],['bard','healing_word'],['warlock','eldritch_blast'],['warlock','hex'],['druid','thunderwave'],['paladin','divine_smite'],['ranger','hunters_mark'],['paladin','bless']]) {
            c.cls = cls; c.spells = [sp]; c.slots = slotsFor(cls, 2); Object.keys(c.slots).forEach(l => c.slots[l] = [c.slots[l], c.slots[l]]); c.level = 2;
            const plan = validatePlan({ checks: [{ kind: 'spell', spell: sp, target: t }] }); const res = plan.checks.map(ch => resolveCheck(ch));
            out.push(cls + ':' + sp + ' → ' + res.map(x => x && (x.title + ' | ' + x.formula)).join(' ; ') + (plan.notes.length ? ' NOTES ' + plan.notes : ''));
          }
          c.cls = 'paladin'; c.smite = true; c.mark = { target: t, dice: '1d6', name: 'Метка охотника' }; c.weapons = c.weapons.slice(0,1);
          for (let i = 0; i < 3; i++) { const r = resolveCheck({ kind: 'attack', target: aliveEnemiesHere()[0] || t, weapon: c.weapons[0] }); out.push('atk: ' + r.formula); }
          c.race = 'dragonborn'; c.res = resMax(c); const pb = validatePlan({ checks: [{ kind: 'breath' }] }); out.push('breath: ' + pb.checks.map(ch => resolveCheck(ch).formula).join());
          c.race = 'halforc'; c.res = resMax(c); c.hp = 3; hurtHero(10); out.push('relentless hp=' + c.hp);
          c.cls = 'barbarian'; c.gear = { armor: null, shield: false }; out.push('barb AC ' + acNow(c));
          out.push('lvl slots pal3 ' + JSON.stringify(slotsFor('paladin',3)) + ' war5 ' + JSON.stringify(slotsFor('warlock',5)));
          return out; }""")
        print("\n".join(r)); print("ERRS", errs[:5]); await b.close()
asyncio.run(main())

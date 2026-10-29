import re
P='/home/claude/salt-harbor.html'; h=open(P).read()
def cut_fn(h,name):
    a=h.find('\nfunction '+name+'('); assert a>=0,name
    m=re.compile(r'\n(?=function |/\*|const |let |async function |document\.)').search(h,a+10)
    return h[:a]+h[m.start():]
for f in ['levelUp','chooseASI']: h=cut_fn(h,f)
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
R("const XP_LEVELS = [0, 300, 900, 2700, 6500];","const XP_LEVELS = [0, 300, 900, 2700, 6500, 9500, 13000, 17000, 21500, 26500];")
R("const MAX_LEVEL = 5;","const MAX_LEVEL = 10;")
R("lvl = clamp(lvl, 1, 5); if (C0.half)","lvl = clamp(lvl, 1, MAX_LEVEL); if (C0.half)")
R("function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0) + (traitFx(c.traits || { sl1: c.sl1, sl2: c.sl2 }).skills[key] || 0); }",
  "function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0) + (traitFx(c.traits || { sl1: c.sl1, sl2: c.sl2 }).skills[key] || 0) + heroSkillExtra(c, key); }")
R("function saveBonus(ab) { const c = C(); return mod(c.scores[ab]) + (CLASSES[c.cls].saves.includes(ab) ? prof(c.level) : 0); }","function saveBonus(ab) { const c = C(); return mod(c.scores[ab]) + (CLASSES[c.cls].saves.includes(ab) ? prof(c.level) : 0) + heroSaveExtra(c, ab); }")
R("const r = d20(ch.adv); const ins = useInsp(c); const b = skillBonus(ch.skill)","const r = d20(clamp((ch.adv || 0) + skillAdv(ch.skill), -1, 1)); const ins = useInsp(c); const b = skillBonus(ch.skill)")
R("return { w, ab, bonus: mod(c.scores[ab]) + (weaponProf(c, wid) ? prof(c.level) : 0) + (w.hit || 0), dmgMod: mod(c.scores[ab]) + (w.dmg || 0) };","const wm = hasFeat(c, \"weapon_master\") ? 1 : 0; return { w, ab, bonus: mod(c.scores[ab]) + (weaponProf(c, wid) ? prof(c.level) : 0) + (w.hit || 0) + wm, dmgMod: mod(c.scores[ab]) + (w.dmg || 0) + wm };")
R("function spellAtk() { return castMod() + prof(C().level); }","function spellAtk() { return castMod() + prof(C().level) + (hasFeat(C(), \"war_caster\") ? 1 : 0); }")
R("function spellDC() { return 8 + castMod() + prof(C().level); }","function spellDC() { return 8 + castMod() + prof(C().level) + (hasFeat(C(), \"war_caster\") ? 1 : 0); }")
R("rage: c.cls === \"barbarian\" ? (c.level >= 3 ? 3 : 2) : 0,","rage: c.cls === \"barbarian\" ? (c.level >= 6 ? 4 : c.level >= 3 ? 3 : 2) : 0, indom: c.cls === \"fighter\" && c.level >= 9 ? 1 : 0,")
R('c.level >= 5 ? "1d8" : "1d6"','bardDie(c)',2)
# заклинания
R("let d = null; if (hit) { d = rollDice(sp.dice, r.nat === 20);","let d = null; if (hit) { d = rollDice(spellDiceFor(sp), r.nat === 20); d.total += spellDmgBonus(sp);")
R("const sv = rnd(20); const tot = sv + E.dex; const dc = spellDC(); const failed = tot < dc; let d = null; if (failed) { d = rollDice(sp.dice); hurtEnemy(ch.target, d.total); }",
  "const sv = rnd(20); const tot = sv + E.dex; const dc = spellDC(); const failed = tot < dc; let d = null; if (failed) { d = rollDice(spellDiceFor(sp)); d.total += spellDmgBonus(sp); hurtEnemy(ch.target, d.total); } const aoe = sp.aoe ? aoeHit(sp, ch.target) : \"\";")
R('+ (failed ? ` · урон ${d.text} ${sp.type}` : " · увернулась"), enemyAfter: enemyStatus(ch.target) };','+ (failed ? ` · урон ${d.text} ${sp.type}` : " · увернулась") + aoe, enemyAfter: enemyStatus(ch.target) };')
# бой
R('const K = kitOf(target); const fc = fcond(target); const dt = String(d?.dt || ""); let txt = ""; const c = C();','const K = kitOf(target); const fc = fcond(target); const dt = String(d?.dt || ""); let txt = ""; const c = C(); txt += heroLevelDmg(target, d, dmg, crit);')
R("function heroSave(ab, dc) { const hc = hcond(); let adv = 0; if (ab === \"dex\") { if (hc.dodge) adv++; if (hc.restrained) adv--; } const r = d20(clamp(adv, -1, 1)); const b = saveBonus(ab); const tot = r.nat + b;",
  "function heroSave(ab, dc) { const hc = hcond(); const c0 = C(); let adv = 0; if (ab === \"dex\") { if (hc.dodge) adv++; if (hc.restrained) adv--; if (c0.cls === \"rogue\" && c0.level >= 7) adv++; } let r = d20(clamp(adv, -1, 1)); const b = saveBonus(ab); if (r.nat + b < dc && c0.cls === \"fighter\" && c0.level >= 9 && resOf(c0).indom > 0) { resOf(c0).indom--; const r2 = d20(clamp(adv, -1, 1)); pushFeed({ t: \"chips\", items: [{ c: \"xp\", x: `Несгибаемость: переброс ${r.nat} → ${r2.nat}` }] }); r = r2; } const tot = r.nat + b;")
R("if (!s.ok && oh.cond) { hc[oh.cond] = oh.rounds || 1; cond = oh.cond; }","if (!s.ok && oh.cond && !condImmune(oh.cond)) { hc[oh.cond] = oh.rounds || 1; cond = oh.cond; }")
R("const fail = !s.ok; if (fail) { hcond().restrained = true; hcond().rTurns = 0; }","const fail = !s.ok && !condImmune(\"restrained\"); if (fail) { hcond().restrained = true; hcond().rTurns = 0; }")
R("if (K.pack && aliveEnemiesHere().some(x => x !== id && ENEMIES[x].type === E.type)) { adv++; notes.push(\"стая\"); }","if (K.pack && !hasFeat(c, \"sentinel\") && aliveEnemiesHere().some(x => x !== id && ENEMIES[x].type === E.type)) { adv++; notes.push(\"стая\"); }")
R('dc: 9 + n * 2 + (hc.restrained ? 4 : 0), adv: 0, reason: "Вырваться из боя и уйти"','dc: 9 + n * 2 + (hc.restrained ? 4 : 0), adv: c.cls === "ranger" && c.level >= 7 ? 1 : 0, reason: "Вырваться из боя и уйти"')
R("const c = C(); S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex) + traitFx(c.traits || {}).init + (first ? 5 : 0);\n  pushFeed({ t: \"roll\", r: { kind: \"init\", title: \"Инициатива\", nat: ini, total: tot, ok: true, formula: `d20 (${ini}) ${fmt(mod(c.scores.dex))}${first ? \" +5 внезапность\" : \"\"} = ${tot}`,",
  "const c = C(); S.world.combat = true; const IR = heroInitRoll(first); const ini = IR.nat; const tot = IR.tot;\n  pushFeed({ t: \"roll\", r: { kind: \"init\", title: \"Инициатива\", nat: ini, total: tot, ok: true, formula: `${IR.txt} = ${tot}`,")
R("if (sc.length && !S.world.combat) { S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex) + traitFx(c.traits || {}).init;","if (sc.length && !S.world.combat) { S.world.combat = true; const IR = heroInitRoll(false); const ini = IR.nat; const tot = IR.tot;")
R("enc.noticed = pp >= dc + Math.floor(R() * 5) - 2;","enc.noticed = hasFeat(C(), \"alert\") || pp >= dc + Math.floor(R() * 5) - 2;")
# создание: рост до 10
R("<h4>Рост до 5 уровня</h4><ol class=\"cd-levels\">${[2, 3, 4, 5].map(","<h4>Рост до 10 уровня</h4><ol class=\"cd-levels\">${[2, 3, 4, 5, 6, 7, 8, 9, 10].map(")
# лента и проверка уровня
R('  } else if (e.t === "victory") {','  } else if (e.t === "levelup") { d.className = "e-levelup"; d.innerHTML = levelupHTML(e);\n  } else if (e.t === "victory") {')
R("function after() { questTick(); renderAll(); save(); }","function after() { questTick(); renderAll(); save(); checkLevelReady(); }")
R('  bite: ["s-bite"],','  holy3: ["s-magic-holy-3"], horn1: ["s-horn-1"],\n  bite: ["s-bite"],')
R("const bestiary = Object.entries(BESTIARY).filter(([, b]) => !b.npcOnly).map(","const bestiary = Object.entries(BESTIARY).filter(([, b]) => !b.npcOnly && !b.hi).map(")
open(P,'w').write(h); print('ok')
